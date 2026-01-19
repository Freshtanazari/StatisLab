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

