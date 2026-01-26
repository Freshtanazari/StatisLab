import pandas as pd
from fastapi import UploadFile

def previewFile(df: pd.DataFrame, n: int = 10):
    """
    Return a preview of the uploaded CSV file.

    :param df: uploaded CSV files as pandas DataFrame
    :param n: number of rows to preview (default 10)
    :return: list of dicts containing the first n rows
    """
   
    preview = df.head(n).to_dict(orient="records")
    print(preview)
    return preview

def getTotalColumnsAndRows(dataset: pd.DataFrame):
    shape = dataset.shape
    return (shape[1], shape[0])


# to be removed:
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



# get the missing values percentage for the dataframe
def getPercentageMissing(df):
    """
    returns a percentage showing the whole missing values
    :param df: uploaded CSV files as pandas DataFrame
    :return: one integer value
    """
    missingValues = df.isnull().sum().sum()
    rows = df.shape[0]
    columns = df.shape[1]
    totalCells = rows * columns
    missingPercentage = (missingValues * 100)/totalCells
    return round(missingPercentage, 2)

# column types summary

def getColsTypes(df):
    """
    returns an array of all column types present in the array
    :param df: uploaded CSV files as pandas DataFrame
    :return: a dictionary with each data type and their count
    """
    cols = df.columns 
    types = {}
    for col in cols:
        if(str(df[col].dtype) in types):
            types[str(df[col].dtype)] += 1 
        else:
            types[str(df[col].dtype)] = 1
    
    return types

print(getColsTypes(df))

        
        


    
