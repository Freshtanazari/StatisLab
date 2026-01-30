import pandas as pd
import scipy 
import matplotlib as plt
import seaborn as sns
from app.storage.DatasetStore import DatasetStore

class Analysis:

    def __init__(self, sessionID: str, store: DatasetStore):
        self.dataset = store.getDataset(sessionID)
        self.df = self.dataset.df_current
 

    


        
        