from StatisticalTest import StatisticalTest
from scipy.stats import wilcoxon


class WilcoxonSignedRankTest(StatisticalTest):
    " this si a non paremetica test equivalent to paird t-test. if the groups are related"

    def __init__(self, df, col1, col2, alpha= 0.05):
        self.df = df
        self.col1 = col1
        self.col2 = col2 
        self.alpha = alpha 

    def checkAssumptions(self):
        assumptions = {}

        # 1. paird data
        assumptions["paired_data"] = len(self.df[self.col1]) == len(self.df[self.col2])

        #2. differences are continuous
        assumptions["differences_continueous"] = self.df[self.col1].dtype.kind in 'biufc' and self.df[self.col2].dtype.kind in 'biufc'

        return assumptions
    
    def run(self) -> dict:
        stat, pValue = wilcoxon(self.df[self.col1], self.df[self.col2])
        return{
            "test_Name" : "Wilicoxon Signed_Rank Test",
            "statistic" : stat,
            "p_value": pValue,
            "reject_null" : pValue < self.alpha
        }
    
    def effectSize(self, stat, N) -> dict:
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
        return {
            "effect_size": "r",
            "value": r
        }   

    def nullHypothesis(self):
       return f"The median difference between {self.col1} and {self.col2} is zero (no change)."
    def alternativeHypothesis(self):
        return f"The median difference between {self.col1} and {self.col2} is not zero (change exists)."