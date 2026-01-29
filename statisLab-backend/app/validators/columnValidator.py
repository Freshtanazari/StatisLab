import pandas as pd

def columnExists(df: pd.DataFrame, colName):
    # returns true if column exists and false otherwise
    if colName in df.columns:
        return True
    else:
        return False