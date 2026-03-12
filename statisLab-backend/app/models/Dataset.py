import pandas as pd
from .Report import Report

class Dataset():
    """
    a class for storing dataset information 
    """

    def __init__(self, df: pd.DataFrame):
        self.df_original = df
        self.df_current = df.copy()
        self.audit_log = []
        self.schema = self.keepSchema()
        self.report = Report()

    def keepSchema(self):
        schema = {}
        for col in self.df_original.columns:
            schema[col] = str(self.df_original[col].dtype)
        return schema
    
    def reset(self):
        self.df_current = self.df_original.copy()
    
    def getShape(self):
        return self.df_current.shape
    
    def getPreview(self, n = 5):
        return self.df_current.head(n).to_dict(orient="records")
    
    def getSchema(self):
        return self.schema