from StatisticalTest import StatisticalTest
from scipy.stats import mannwhitneyu


class MannWhitneyUtest(StatisticalTest):
    "this is the non-parametric test equivalent to the independent t-test"
    "comparing two independent groups when assumption of normaltiy is violated"

    def __init__(self, df, col1, col2, groupCol, alpha = 0.05):
        self.df = df
        self.col1 = col1
        self.col2 = col2 
        self.alpha = alpha 
        self.groupCol = groupCol
        self.groups = self.df[self.groupCol].unique()
        if len(self.groups) != 2 :
            raise KeyError("There are exactly two groups are requried for this test.")
        
    def checkAssumptions(self):
        assumptions ={}

        #1. values are continous or ordinal
        assumptions["values_continuous_or_ordinal"] = self.df[self.col1].dtype.kind in 'biufc'

        return assumptions
    
    def run(self) -> dict:

        group1 = self.df[self.df[self.groupCol] == self.groups[0]][self.col1]
        group2 = self.df[self.df[self.groupCol] == self.groups[1]][self.col1]

        stat, pValue = manwhitneyu(group1, group2, alternative="two-sided")

        return {
            "test": "Mann-Whitney U Test", 
            "statistic" : stat,
            "p_value" : pValue,
            "reject_null" : pValue <self.alpha
        }
    
    def effectSize(self, stat, N1, N2) -> dict:
        # r = Z / sqrt(N), approximate effect size
        # N = total number of observations
        N = N1 + N2
        r = stat / (N*(N+1)/12) ** 0.5  # approximation using mean/rank formula
        return {
            "effect_size": "r",
            "value": r
        }

    def nullHypothesis(self):
        return f"The distributions of {self.col1} in the two groups of {self.group_col} are equal."

    def alternativeHypothesis(self):
        return f"The distributions of {self.col1} in the two groups of {self.group_col} are not equal."
     
