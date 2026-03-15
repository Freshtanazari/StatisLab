import pandas as pd
from pandas.api.types import is_numeric_dtype, is_categorical_dtype, is_object_dtype, is_bool_dtype
from app.validators.columnValidator import columnExists
from app.storage.DatasetStore import DatasetStore
import io
from datetime import datetime
from fastapi.responses import StreamingResponse

class preprocessor:

    def __init__(self, sessionId: str, store: DatasetStore):
        self.sessionID = sessionId
        self.store = store
        self.dataset = store.getDataset(self.sessionID)  # get the dataset object
        self.df = self.dataset.df_current
        # to store the audits
        self.audit_log = self.dataset.audit_log

    def log_changes(self, details):
        record = {
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.audit_log.append(record)

    def display_audit_log(self):
        return self.audit_log
    
    # def convert_audit_log_to_excel(self):
    #     df = pd.DataFrame(self.audit_log)
    #     file_path = r"C:\Users\lz\Desktop\StatisLab\statisLab-backend\reports\audits"
    #     df.to_excel(file_path, index = False)
    #     return file_path

    def convert_audit_log_to_excel(self):
        df = pd.DataFrame(self.audit_log)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="AuditLogs")
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=audit_logs.xlsx"}
        )

    def tableData(self):
        result = {}
        actions = ["changeDtype", "dropCol", "displayUnique", "renameCol"]
        for col in self.df.columns:
            result[col] = {
                "name": col,
                "type": str(self.df[col].dtype),
                "nUnique": self.df[col].nunique(),
                "missing": self.df[col].isna().mean() * 100,
                "describe": "describe_numeric" if pd.api.types.is_numeric_dtype(self.df[col]) 
                    else "describe_categorical",
                "actions": actions
            }
        return result
    
    # display uniques
    def displayUnique(self, colName):
        return self.df[colName].unique().tolist()
    
    # rename the column name (transfomer)
    def renameCol(self, colName, newName):
        self.df.rename(columns ={colName : newName}, inplace=True)
        self.log_changes(f"Column {colName} renamed to {newName}.");
        return f"Column '{colName}' renamed to {newName}."
    
    # change type of a column (transfomer)
    def changeDtype(self, colName, dType):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        try:
            self.df[colName] = self.df[colName].astype(dType)
            self.log_changes(f"Column '{colName}' converted to {dType}")
            return f"Column '{colName}' converted to {dType}"
        except (ValueError, TypeError):
            return f"Invalid conversion: column '{colName}' cannot be converted to {dType}"
        
    #convert to numeric all possible columns (transfomer)
    def allToNumeric(self):
        self.df = self.df.apply(pd.to_numeric, errors="ignore")
        self.log_changes("all possible columns changed to numeric data type")
        return "all possible columns changed to numeric data type"

    # display information about the data 
    def displayInfo(self):
        buffer = io.StringIO()
        self.df.info(buf=buffer)
        s = buffer.getvalue()
        buffer.close()
        return s

    # drop a column (transformer)
    def dropCol(self, colName):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        self.df.drop(columns= colName, inplace=True)
        self.log_changes(f"the column/s were dropped: { colName}.")
        return "the column/s were dropped: "+ colName
    
    # drop duplicate data rows (transformer)
    def dropDuplicates(self):
        self.df.drop_duplicates(inplace=True)
        self.log_changes("Duplicate data were dropped from the entire DataFrame.");
        return "Duplicate data were dropped from the entire DataFrame."

    # handle missing values (transformer)
    def dropAllNulls(self):
        # drops all null values from dataset
        self.df.dropna(inplace=True)
        self.log_changes("All null values have been dropped from dataset.")
        return "All null values have been dropped from dataset."
    
    # drop null values from columns (transfomer)
    def dropNullsFromCol(self, colName: str):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        #drops rows with missing values in a specific column
        self.df.dropna(subset = [colName], inplace=True)
        self.log_changes("All null values of column "+ colName + " have been dropped from dataset.")
        return "All null values of column "+ colName + " have been dropped from dataset."
    
    #transformer
    def imputeByffill(self, colName):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        # fills the rows with missing values in a specific column using forward fill method
        self.df[colName].fillna(method ="ffill", inplace=True)
        self.log_changes("Imputted Null values of column "+colName+" using the forward fill method")
        return "Imputted Null values of column "+colName+" using the forward fill method";
    #transforemer
    def imputeBybfill(self, colName):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        # fills the rows with missing values in a specific column using the backward fill method
        self.df[colName].fillna(method="bfill", inplace=True)
        self.log_changes("Imputted Null values of column "+colName+" using the backward fill method")
        return "Imputted Null values of column "+colName+" using the backward fill method";
    #transfomer
    def imputeByMode(self, colName):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        # fills the rows with missing values in a specific column using its most frequent value
        modeValue = self.df[colName].mode()[0]
        self.df[colName].fillna(modeValue, inplace=True)
        self.log_changes("Imputed Null values of the column "+ colName+" using its mode.")
        return "Imputed Null values of the column "+ colName+" using its mode."

    #transfoermer
    def imputeByConstant(self, colName, value):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        #fills the rows with missing values in a specific column using a value provided by user.
        self.df[colName].fillna(value, inplace=True)
        self.log_changes( f"Imputed Null values of the column {colName} with the value {value}.")
        return f"Imputed Null values of the column {colName} with the value {value}."

  

    def flagMissing(self, colName:str):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        # create a column with flagging of the missing values with a new name
        self.df["isMissing"+ colName] = self.df[colName].isna()
        return "Added a new column to trace pattern of the missing values at" + colName
    
    #transfomer
    def interpolateMissing(self, method: str, axis=0):
        # methods should only include: 
        interpolationMethods = [
        "linear",     # default, most common
        "time",       # time-series data with datetime index
        "index",      # numeric index-based interpolation
        "nearest",    # nearest non-null value
        "ffill",      # forward fill (very common)
        "bfill",      # backward fill (very common)
        "cubic",      # smooth curves (used sometimes)
        "polynomial"  # when you explicitly control degree
        ] 
        if method not in interpolationMethods:
            return "the method specified is not valid"
        if method == "time" and not pd.api.types.is_datetime64_any_dtype(self.df.index):
            return "Method 'time' requires a datetime index"
        # Numeric-only methods
        numericMethods = ["linear", "time", "index", "cubic", "polynomial"]
        
        if method in numericMethods:
            numericColumns = [col for col in self.df.columns if is_numeric_dtype(self.df[col]) and self.df[col].count() >=3]
            if len(numericColumns) == 0:
                return "No Numeric column detected for this interpolaton method or existent numeric column had less than 3 points."
            else:
                self.df[numericColumns] = self.df[numericColumns].interpolate(method = method, axis=axis)
                self.log_changes("The missing values were interpolated only for numeric data types.")
                return "The missing values were interpolated only for numeric data types."
            
        self.df = self.df.interpolate(axis = axis, method = method)
        self.log_changes("The missing values were interpolated across all columns")
        return "The missing values were interpolated across all columns"
    #transfomer
    def imputeMeanNumeric(self, colName):
        # check if the column is numeric
        if not is_numeric_dtype(self.df[colName]):
            return "numeric data type is required" 
        meanValue= self.df[colName].mean()
        self.df[colName].fillna(meanValue, inplace=True)
        self.log_changes(f"Imputed Null values of the column {colName} with the mean of {meanValue}.")
        return f"Imputed Null values of the column {colName} with the mean of {meanValue}."

    #transfomer
    def imputeMedianNumeric(self, colName):
        if not is_numeric_dtype(self.df[colName]):
            return "numeric data type is required" 
        medianValue = self.df[colName].median()
        self.df[colName].fillna(medianValue, inplace=True)  
        self.log_changes(f"Imputed Null values of the column {colName} with the median of {medianValue}.") 
        return f"Imputed Null values of the column {colName} with the median of {medianValue}."

    # Categorical column description
    def describe_categorical(self, colName) -> dict:
        if colName not in self.df.columns:
            raise ValueError(f"column {colName} not found in DataFrame")

        if not (is_categorical_dtype(self.df[colName]) or 
                is_object_dtype(self.df[colName]) or 
                is_bool_dtype(self.df[colName])):
            raise TypeError(f"column {colName} should be categorical-like")
        
        series = self.df[colName].dropna()
        value_counts = series.value_counts()
        percentage = (series.value_counts(normalize=True) * 100).round(2)
        
        return {
            "unique_values": int(series.nunique()),
            "top": series.mode()[0] if not series.empty else None,
            "top_freq": int(value_counts.iloc[0]) if not value_counts.empty else None,
            "value_counts": {str(k): int(v) for k, v in value_counts.items()},
            "percentage": {str(k): float(v) for k, v in percentage.items()}
        }


    # Numeric column description
    def describe_numeric(self, colName) -> dict:
        if colName not in self.df.columns:
            raise ValueError(f"column {colName} not found in DataFrame")
        
        if not is_numeric_dtype(self.df[colName]):
            raise TypeError(f"column {colName} should be numeric")

        series = self.df[colName].dropna()
        
        return {
            "count": int(series.count()),
            "mean": float(series.mean()),
            "std": float(series.std()),
            "min": float(series.min()),
            "25%": float(series.quantile(0.25)),
            "50%": float(series.median()),
            "75%": float(series.quantile(0.75)),
            "max": float(series.max())
        }