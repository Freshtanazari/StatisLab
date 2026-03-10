from .StatisticalTest import StatisticalTest
from scipy.stats import ttest_rel
import numpy as np
from scipy.stats import shapiro
from ..models.Dataset import Dataset
from ..storage.DatasetStore import DatasetStore
import pandas as pd


class PairedTTest(StatisticalTest):
    # note : valueCol1(before) --> numeric col 
    # valueCol2(after) --> numeric col
    def __init__(self, col1,sessionId, store: DatasetStore, col2, alpha = 0.5):
        dataset = store.getDataset(sessionID=sessionId)
        self.sessionId = sessionId
        self.df = dataset.df_current # get the current dataset
        self.valueCol1 = col1
        self.valueCol2 = col2 
        # get numeric cols as arrays
        self.data1 = pd.to_numeric(self.df[self.valueCol1], errors="coerce").dropna()
        self.data2 = pd.to_numeric(self.df[self.valueCol2], errors="coerce").dropna()
        self.alpha = alpha

    def checkAssumptions(self) -> dict:
        assumptions ={}
        diff = self.df[self.valueCol1] - self.df[self.valueCol2]

        #1. normality - shapiro-wilk
        assumptions["normality_of_differences"] = bool(shapiro(diff).pvalue > self.alpha)

        return assumptions 
      
    def run(self):
        try:
            tStat, pValue = ttest_rel(self.data1, self.data2)
        except ValueError:
            return {
                "error": "Make sure your data is cleaned: no NaN or empty values."
            }
        # safe floats: 
        tStat = 0.0 if not np.isfinite(tStat) else float(tStat)
        pValue = 1.0 if not np.isfinite(pValue) else float(pValue)

        assumptions = self.checkAssumptions()
        effectS = self.effectSize()
        return {
            "test name": "paired t-test",
            "t statistic": float(tStat), 
            "P value": float(pValue), 
            "reject null": bool(pValue < self.alpha), 
            "assumptions": assumptions, 
            "effect size": effectS, 
        }
    
    def effectSize(self):
        # Cohen's d for paired samples: mean differnce / std difference 
        # std_diff = np.std(diff, ddof=1)
        # d = 0.0 if std_diff == 0 else np.mean(diff) / std_diff
        diff = self.data1 - self.data2 

        d = np.mean(diff) / np.std(diff, ddof=1)
        d = 0.0 if not np.isfinite(d) else float(d)
        return {
            "cohen_d": float(d)
        }
    
    def nullHypothesis(self):
        return f"The mean of {self.valueCol1} equals the mean of {self.valueCol2} (no difference)."
        
    def alternativeHypothesis(self):
         return f"The mean of {self.valueCol1} is different from the mean of {self.valueCol2}."
    def storeTest(result, sessionId, store):
        pass 