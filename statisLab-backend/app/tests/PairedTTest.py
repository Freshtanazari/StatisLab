from StatisticalTest import StatisticalTest
from scipy.stats import ttest_rel
import numpy as np
from scipy.stats import shapiro

class PairedTTest(StatisticalTest):
    # note : valueCol1(before) --> numeric col 
    # valueCol2(after) --> numeric col
    def __init__(self,df, valueCol1, valueCol2, alpha):
        self.df = df
        self.valueCol1 = valueCol1
        self.valueCol2 = valueCol2 
        # get numeric cols as arrays
        self.data1 = self.df[self.valueCol1].values
        self.data2 = self.df[self.valueCol2].values
        self.alpha = alpha

    def checkAssumptions(self) -> dict:
        assumptions ={}
        diff = self.df[self.valueCol1] - self.df[self.valueCol2]

        #1. normality - shapiro-wilk
        assumptions["normality_of_differences"] = shapiro(diff).pvalue > self.alpha

        return assumptions 
      
    def run(self):
        
        tStat, pValue = ttest_rel(self.data1, self.data2)
        return {
            "test_name": "paired t-test",
            "t_statistic": tStat, 
            "P_value": pValue, 
            "reject_null": pValue < self.alpha
        }
    
    def effectSize(self):
        # Cohen's d for paired samples: mean differnce / std difference 
        diff = self.data1 - self.data2 
        d = np.mean(diff) / np.std(diff, ddof=1)
        return {
            "cohen_d": d
        }
    
    def nullHypothesis(self):
        return f"The mean of {self.valueCol1} equals the mean of {self.valueCol2} (no difference)."
        
    def alternativeHypothesis(self):
         return f"The mean of {self.valueCol1} is different from the mean of {self.valueCol2}."