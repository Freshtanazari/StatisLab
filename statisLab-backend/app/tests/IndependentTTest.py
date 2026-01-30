import pandas as pd
from scipy.stats import ttest_ind, shapiro, levene
import numpy as np
from StatisticalTest import StatisticalTest

class IndependentTtest(StatisticalTest):
    "to compare the mean of two independent groups to see if they are significantly different"
    # note. valueCol --> numeric col
    # groupCol --> categorical col with 2 levels
    # should be checked for each dataset

    def __init__(self, df:pd.DataFrame, valueCol:str, groupCol, alpha: float = 0.05, welch: bool = False):
        self.df = df
        self.valueCol = valueCol 
        self.groupCol = groupCol
        self.alpha = alpha 
        self.welch = welch

        self.groups = df[groupCol].unique()
        if len(self.groups) != 2 :
            raise ValueError("IndependentTTest requires exactly 2 groups")
        self.group1 = df[df[groupCol] == self.groups[0]][valueCol]
        self.group2 = df[df[groupCol] == self.groups[1]][valueCol]

    def checkAssumptions(self) -> dict:
        assumptions ={}

        #1. normality - shapiro-wilk
        assumptions["normality_group1"] = shapiro(self.group1).pvalue > self.alpha
        assumptions["normality_group2"] = shapiro(self.group2).pvalue > self.alpha

        #2. Equal Variance- levene
        assumptions["equal_variance"] = levene(self.group1, self.group2).pvalue > self.alpha

        #3. Independence 
        assumptions["independence"] = True # since the user has chose the independence t test

        return assumptions

    def run(self) -> dict:
        tStat, pValue =  ttest_ind(self.group1, self.group2, equal_var=not self.welch )
        testName =  test_name = "Welch's t-test (unequal variances)" if self.welch else "Student's independent t-test (equal variances)"
        return {
            "test_name" : testName,
            "t_statistic" : tStat, 
            "p_value": pValue,
            "reject_null": pValue< self.alpha
        }
    
    def effectSize(self) -> dict:
        n1, n2 = len(self.group1), len(self.group2)
        s1, s2 = np.var(self.group1, ddof = 1), np.var(self.group2, ddof = 1)
        pooledSD = np.sqrt(((n1 -1)*s1 +(n2-1)*s2) / (n1 + n2 - 2))
        d = (np.mean(self.group1) - np.mean(self.group2)) / pooledSD
        return {"cohens_d": d}
    def nullHypothesis(self):
        return f"The mean of group {self.groups[0]} is equal to the mean of group {self.groups[1]} (no difference)."

    def alternativeHypothesis(self):
        return f"The mean of group {self.groups[0]} is not equal to the mean of group {self.groups[1]}."

    
