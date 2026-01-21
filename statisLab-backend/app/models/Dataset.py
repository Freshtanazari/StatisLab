import pandas as pd

class Dataset():
    """
    a class for storing dataset information 
    """

    def __init__(self, df: pd.DataFrame):
        self.df_orginal = df
        self.df_current = df.copy()
        self.schema = self.keepSchema()

    def keepSchema(self):
        schema = {}
        for col in self.def_orginal.columns:
            schema[col] = str(self.df_orginal[col].dtype)
        return schema
    
    def reset(self):
        self.df_current = self.df_orginal.copy()
    
    def getShape(self):
        return self.def_current.shape
    
    def getPreview(self, n = 5):
        return self.df_current.head(n).to_dict(orient="records")
    
    def getSchema(self):
        return self.schema