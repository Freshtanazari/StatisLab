import pandas as pd
from pd.api.types import is_numeric_dtype
from pd.api.types import is_categorical_dtype

class preprocessor:

    def __init__(self, df: pd.DataFrame):
        self.df = df.copy 
    
    # change type of a column
    def changeDtype(self, colName, Dtype):
        self.df[colName] = df[colName].astype(Dtype)
        return "the data type of column"+ colName + "changed to " + Dtype
    
    # drop a column
    def dropCol(self, colNames:list[str]):
        self.df = self.df.drop(columns= colNames)
        return "the column/s were dropped"+ colNames
    
    # drop duplicate data rows 
    def dropDuplicates(self, colNames:list[str]| None = None, replacementValue = None):
        if(colNames is None):
            self.df = self.df.drop_duplicates()
            return "Duplicate data were dropped from the entire DataFrame."
        else:
            self.df = self.df.drop_duplicates(subset=colNames)
            return "Duplicate data were dropped from columns: " + ", ".join(colNames)
    
    # handle missing values
    def handleMissing(self, method, colNames:list[str]| None = None):
        match method:
            case "all rows with Missing values":
                self.df = df.dropna()
                return "all rows with missing values are dropped"
            case "rows of specific cols":
                self.df = self.dropna(subset= colNames)
                return "dropped all rows with missing values at column names" + colNames
            case "ffill":
                self.df = df.fillna(method="ffill")
                return "dropped all rows with missing values at column names" + colNames
            case "bfill":
                self.df = df.fillna(method="bfill") 
                return "dropped all rows with missing values at column names" + colNames
            case "mode":
                for col in colNames:   
                    self.df[col] = self.df[col].fillna(df[col].mode())
                    return "dropped all rows with missing values at column names" + colNames
            case "constant":
                for col in colNames:
                    self.df[col] = self.df[col].fillna(replacementValue)

                

    
    def flagMissing(self, newColName: str, colName:str):
        self.df[newColName] = df[colName].isna()
        return "added a new column to trace pattern of the missing values at column" + colName
    
    def handleMissingInterpolate(self, method: str, axis=0):
        # methods should only include: 
        interpolationMethods = [
        "linear",       # default, linear interpolation between points
        "time",         # uses datetime index to interpolate
        "index",        # linear interpolation using numerical index
        "values",       # linear interpolation using the actual values (alias of index)
        "nearest",      # fills with the nearest non-null value
        "zero",         # step function, previous non-null value (useful for 0-order hold)
        "slinear",      # spline interpolation, linear
        "quadratic",    # polynomial interpolation of degree 2
        "cubic",        # polynomial interpolation of degree 3
        "polynomial",   # generic polynomial interpolation, requires `order` parameter
        "spline",       # spline interpolation, requires `order` parameter
        "barycentric",  # barycentric polynomial interpolation
        "krogh",        # Krogh polynomial interpolation
        "piecewise_polynomial",  # deprecated, but exists
        "pchip",        # monotonic cubic interpolation
        "akima",        # Akima interpolation, monotone spline
        "from_derivatives",  # interpolate using derivatives
        "pad",          # forward fill (alias of ffill)
        "ffill",        # forward fill
        "bfill",        # backward fill (alias of backfill)
        "backfill"      # backward fill
        ]
        if method not in interpolationMethods:
            return "the method specified is not valid"
        self.df = self.df.interpolate(axis = axis, method = method)

    def handleMissingNumeric(self, colName, method: str):
    # check if the column is numeric
        if not is_numeric_dtype(self.df[colName]):
            return "numeric data type is required"
        if method == "mean":
            self.df[colName] = self.df[colName].fillna(self.df[colName].mean())
            return "numeric data type is required"
        elif method == "median":
            self.df[colName] = self.df[colName].fillna(self.df[colName].median())
            return "numeric data type is required"
        elif method =="polynomial":
            return
        elif method == "knn":
            return 
        elif method == "mice":
            return

    def handleMssingCategoric(self, colName, method:str):
        # check if the column is categorical
        if not is_categorical_dtype(self.df[colName]):
            return "categorcial data type is required"
        if method == "random sampling":
            return 
        if method == "predictive":
            return


        

            




    
    


    


    
    


# to be removed and edited
import pandas as pd
import numpy as np

data = {
    "id": [1, 2, 3, 4, 5, 6, 7, 8],
    "name": ["Alice", "Bob", "Charlie", "Diana", None, "Frank", "Grace", "Henry"],
    "age": [23, 27, None, 31, 29, None, 24, 40],
    "email": [
        "alice@example.com",
        "bob@example.com",
        None,
        "diana@example.com",
        "eve@example.com",
        None,
        "grace@example.com",
        "henry@example.com"
    ],
    "score": [88, 92, 79, None, 85, 90, None, 76],
    "city": ["NY", "LA", "NY", "SF", "LA", None, "NY", "SF"]
}

df = pd.DataFrame(data)

# get describtion of each column


# numeric
def describe_numeric(df: pd.DataFrame, col: str) -> dict:
    """return basic descriptive statistics for a numeric column."""
    if col not in df.columns: 
        raise ValueError(f"column {col} not found in DataFrame")
    series = df[col].dropna()
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
        "missing_percent": df[col].isna().mean() * 100
    }

# categorical
def describe_categorical(df: pd.DataFrame, col: str) -> dict: 
    if col not in df.columns:
        raise ValueError(f"column {col} not found in DataFrame")
    series = df[col].dropna()

    return {
        "unique_values": series.nunique(), 
        "top": series.mode()[0],
        "top_freq" : series.value_counts().iloc[0],
        "value_counts" : series.value_counts().to_dict(),
        "percentage" : (series.value_counts(normalize = True) * 100).round(2).to_dict()
    }

