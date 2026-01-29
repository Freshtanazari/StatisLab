import pandas as pd
from pandas.api.types import is_numeric_dtype, is_categorical_dtype, is_object_dtype, is_bool_dtype
from app.validators.columnValidator import columnExists
from app.storage.DatasetStore import DatasetStore

class preprocessor:

    def __init__(self, sessionID: str, store: DatasetStore):
        self.sessionID = sessionID
        self.store = store
        self.dataset = store.getDataset(sessionID)  # get the dataset object
        self.df = self.dataset.df_current
    
    # change type of a column
    def changeDtype(self, colName, dType):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        try:
            self.df[colName] = self.df[colName].astype(dType)
            return f"Column '{colName}' converted to {dType}"
        except (ValueError, TypeError):
            return f"Invalid conversion: column '{colName}' cannot be converted to {dType}"
    
    # drop a column
    def dropCol(self, colName):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        self.df.drop(columns= colName, inplace=True)
        return "the column/s were dropped: "+ colName
    
    # drop duplicate data rows 
    def dropDuplicates(self):
        self.df.drop_duplicates(inplace=True)
        return "Duplicate data were dropped from the entire DataFrame."

    # handle missing values
    def dropAllNulls(self):
        # drops all null values from dataset
        self.df.dropna(inplace=True)
        return "All null values have been dropped from dataset."
    
    def dropNullsFromCol(self, colName: str):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        #drops rows with missing values in a specific column
        self.df.dropna(subset = [colName], inplace=True)
        return "All null values of column "+ colName + " have been dropped from dataset."
    
    def imputeByffill(self, colName):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        # fills the rows with missing values in a specific column using forward fill method
        self.df[colName].fillna(method ="ffill", inplace=True)
        return "Imputted Null values of column "+colName+" using the forward fill method";

    def imputeBybfill(self, colName):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        # fills the rows with missing values in a specific column using the backward fill method
        self.df[colName].fillna(method="bfill", inplace=True)
        return "Imputted Null values of column "+colName+" using the backward fill method";

    def imputeByMode(self, colName):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        # fills the rows with missing values in a specific column using its most frequent value
        modeValue = self.df[colName].mode()[0]
        self.df[colName].fillna(modeValue, inplace=True)
        return "Imputed Null values of the column "+ colName+" using its mode."

    def imputeByConstant(self, colName, value):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        #fills the rows with missing values in a specific column using a value provided by user.
        self.df[colName].fillna(value, inplace=True)
        return f"Imputed Null values of the column {colName} with the value {value}."

  

    def flagMissing(self, colName:str):
        if not columnExists(self.df, colName):
            raise KeyError(f"Column '{colName}' does not exist")
        # create a column with flagging of the missing values with a new name
        self.df["isMissing"+ colName] = self.df[colName].isna()
        return "Added a new column to trace pattern of the missing values at" + colName
    
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
                return "The missing values were interpolated only for numeric data types."
            
        self.df = self.df.interpolate(axis = axis, method = method)
        return "The missing values were interpolated across all columns"

    def imputeMeanNumeric(self, colName):
        # check if the column is numeric
        if not is_numeric_dtype(self.df[colName]):
            return "numeric data type is required" 
        meanValue= self.df[colName].mean()
        self.df[colName].fillna(meanValue, inplace=True)
        return f"Imputed Null values of the column {colName} with the mean of {meanValue}."


    def imputeMedianNumeric(self, colName):
        if not is_numeric_dtype(self.df[colName]):
            return "numeric data type is required" 
        medianValue = self.df[colName].median()
        self.df[colName].fillna(medianValue, inplace=True)   
        return f"Imputed Null values of the column {colName} with the median of {medianValue}."


    def displayUnique(self, colName):
        return self.df[colName].unique()
    
    def describe_numeric(self, colName) -> dict:
        """return basic descriptive statistics for a numeric column."""
        if not is_numeric_dtype(self.df[colName]):
            raise TypeError(f"column {colName} should be Numeric type")

        if colName not in self.df.columns: 
            raise ValueError(f"column {colName} not found in DataFrame")
        series = self.df[colName].dropna()
        return {
            "count": series.count(),
            "mean": series.mean(),
            "median": series.median(),
            "std": series.std(),
            "variance": series.var(),
            "min": series.min(),
            "max": series.max(),
            "q1": series.quantile(0.25),
            "q3": series.quantile(0.75),
            "iqr": series.quantile(0.75) - series.quantile(0.25),
            "missing_percent": self.df[colName].isna().mean() * 100
        }
    # categorical
    def describe_categorical(self, colName) -> dict: 
        if not (is_categorical_dtype(self.df[colName]) or 
            is_object_dtype(self.df[colName]) or 
            is_bool_dtype(self.df[colName])):
            raise TypeError(f"column {colName} should be categorical-like")
        
        if colName not in self.df.columns:
            raise ValueError(f"column {colName} not found in DataFrame")
        series = self.df[colName].dropna()

        return {
            "unique_values": series.nunique(), 
            "top" : series.mode()[0] if not series.empty else None,
            "top_freq" : series.value_counts().iloc[0],
            "value_counts" : series.value_counts().to_dict(),
            "percentage" : (series.value_counts(normalize = True) * 100).round(2).to_dict()
        }




