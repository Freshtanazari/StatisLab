import pandas as pd
from fastapi import UploadFile

def previewFile(df: pd.DataFrame, n: int = 10): # returns a list
    """
    Return a preview of the uploaded CSV file.

    :param df: uploaded CSV files as pandas DataFrame
    :param n: number of rows to preview (default 10)
    :return: list of dicts containing the first n rows
    """
   
    preview = df.head(n).to_dict(orient="records")
    return preview

def getTotalColumnsAndRows(dataset: pd.DataFrame):
    shape = dataset.shape
    return (shape[1], shape[0])

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

# getting the data types of the columns
def getDataTypes(df):
    return {col: str(df[col].dtype) for col in df.columns}

# getting the overall missingness percentage in the whole dataframe
def getMissingPercentage(df):
    totalCells = df.size
    totalMissing = df.isna().sum().sum()
    percentage = totalMissing / totalCells
    return percentage




    
