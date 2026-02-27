import pandas as pd
import scipy 
import matplotlib as plt
import seaborn as sns
from app.storage.DatasetStore import DatasetStore


class Analysis:
    

    def __init__(self, sessionID: str, store: DatasetStore):
        self.dataset = store.getDataset(sessionID)
        self.df = self.dataset.df_current
    
        
    # inspect dataset rows, columns and data types
    def inspect_dataset(self):
        result = {
            "rows" : self.df.shape[0], 
            "columns" : self.df.shape[1], 
            "column_names": self.df.columns.tolist(), 
            "dtypes": self.df.dtypes.to_dict()
        }
        self.report.addAnalysis(result)
        

    def preview(self):
        result = self.df.head(5)
        self.report.addAnalysis(result)
        
    def columnsNames(self):
        result = self.df.columns
        self.report.addAnalysis(result)
    
    def returnRows(self):
        result= self.df.shape[0]
        self.report.addAnalysis(result)
    
    def returnCols(self):
        result= self.df.shape[1]
        self.report.addAnalysis(result)
    
    def returnDtypes(self):
        colDtypes = {}
        for col in self.df.columns:
            colDtypes[col] = self.df[col].dtypes
        self.report.addAnalysis(colDtypes)


    def returnInfo(self):
        result= self.df.info()
        self.report.addAnalysis(result)
    
    def returnDescription(self):
        result= self.df.describe()
        self.report.addAnalysis(result)
    
    
    
            
    



 

    


        
        