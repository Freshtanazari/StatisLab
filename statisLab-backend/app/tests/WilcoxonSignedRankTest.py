from .StatisticalTest import StatisticalTest
from scipy.stats import wilcoxon
from ..models.Dataset import Dataset
from ..storage.DatasetStore import DatasetStore
import numpy as np 


class WilcoxonSignedRankTest(StatisticalTest):
    " this si a non paremetica test equivalent to paird t-test. if the groups are related"
    # note: fix for empty or nan values passed down to the function 

    def __init__(self, col1, col2,sessionId, store: DatasetStore, alpha= 0.05):
        dataset = store.getDataset(sessionID=sessionId)
        self.sessionId = sessionId
        self.df = dataset.df_current # get the current dataset
        self.col1 = col1
        self.col2 = col2
        self.alpha = alpha 

    def checkAssumptions(self):
        assumptions = {}

        # 1. paird data
        assumptions["paired_data"] = bool(len(self.df[self.col1]) == len(self.df[self.col2]))

        #2. differences are continuous
        assumptions["differences_continueous"] = bool(self.df[self.col1].dtype.kind in 'biufc' and self.df[self.col2].dtype.kind in 'biufc')

        return assumptions
    
    def run(self) -> dict:

        stat, pValue = wilcoxon(self.df[self.col1], self.df[self.col2])
        assumptions = self.checkAssumptions()
        effectS = self.effectSize(stat)

        # safe floats: 
        stat = 0.0 if not np.isfinite(stat) else float(stat)
        pValue = 1.0 if not np.isfinite(pValue) else float(pValue)
        return{
            "test Name" : "Wilicoxon Signed_Rank Test",
            "statistic" : float(stat),
            "p value": float(pValue),
            "reject null" : bool(pValue < self.alpha),
            "effect Size" : effectS, 
            "assumptions": assumptions, 
            "null hypothesis": self.nullHypothesis(), 
            "alternative hypothesis": self.alternativeHypothesis()
        }
    
    def effectSize(self, stat) -> dict:
        # r = Z / sqrt(N), approximate effect size (requires normal approximation)
        # For simplicity, use: r = stat / sqrt(N*(N+1)/2)
        # N = number of non-zero differences
        non_zero_diffs = (self.df[self.col1] - self.df[self.col2]).astype(float)
        non_zero_diffs = non_zero_diffs[non_zero_diffs != 0]

        N = len(non_zero_diffs)
        
        if N == 0:
            r = 0
        else:
            r = stat / (N*(N+1)/2) ** 0.5
            # clamp to safe float
            if not np.isfinite(r):
                r = 0
        return {
            "effect_size": "r",
            "value": float(r)
        }   

    def nullHypothesis(self):
       return f"The median difference between {self.col1} and {self.col2} is zero (no change)."
    def alternativeHypothesis(self):
        return f"The median difference between {self.col1} and {self.col2} is not zero (change exists)."
    def storeTest(result, sessionId, store):
        pass 