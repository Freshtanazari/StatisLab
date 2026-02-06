import pandas as pd
from scipy.stats import chi2_contingency 
from StatisticalTest import StatisticalTest

class ChiSquareTest(StatisticalTest):
    """
    Performs a chi-square test of independence between categorical variables
    """

    def __init__(self, df, col1, col2, alpha=0.05):
        self.df = df
        self.alpha = alpha 
        self.col1 = col1
        self.col2 = col2

    def checkAssumptions(self):
        assumptions = {}

        # create contingency table
        table = pd.crosstab(self.df[self.col1], self.df[self.col2])

        # 1. expected frequencies > = 5 
        chi2, pVAlue, dof, expected = chi2_contingency(table)
        assumptions["expected_frequencies_correct"] = (expected >= 5).all()

        #2. independence
        assumptions["independence"] = True

        return assumptions 
    
    def run(self) -> dict:
        table = pd.crosstab(self.df[self.col1], self.df[self.col2])
        chi2, pValue, dof, expected = chi2_contingency(table)
        
        return{
            "test": "Chi-Square Test",
            "chi2_statistic": chi2,
            "p_value": pValue,
            "reject_null": pValue < self.alpha       
        }
    
    def effectSize(self, chi2, N, shape) -> dict: 
        # Cramer's V = sqrt(chi2 / (N * (min(rows-1, cols-1))))
        rows, cols = shape
        cramerV = (chi2/(N * (min(rows-1, cols-1)))) ** 0.5
        return{
            "effect_size": "cramers_v",
            "value": cramerV
        }
    
    def nullHypothesis(self):
        return f"The variables {self.col1} and {self.col2} are independent."

    def alternativeHypothesis(self):
        return f"The variables {self.col1} and {self.col2} are dependent."