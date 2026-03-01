import pandas as pd
from scipy.stats import chi2_contingency 
from .StatisticalTest import StatisticalTest
from ..models.Dataset import Dataset
from ..storage.DatasetStore import DatasetStore

class ChiSquareTest(StatisticalTest):
    """
    Performs a chi-square test of independence between categorical variables
    """

    def __init__(self, col1, col2, sessionId, store: DatasetStore, alpha=0.05):
        dataset = store.getDataset(sessionID=sessionId)
        self.sessionId = sessionId
        self.df = dataset.df_current # get the current dataset
        self.alpha = alpha 
        self.col1 = col1
        self.col2 = col2
        self.store = store


    def checkAssumptions(self):
        assumptions = {}

        # create contingency table
        table = pd.crosstab(self.df[self.col1], self.df[self.col2])

        # 1. expected frequencies > = 5 
        chi2, pVAlue, dof, expected = chi2_contingency(table)
        assumptions["expected_frequencies_correct"] = bool((expected >= 5).all())

        #2. independence
        assumptions["independence"] = True

        return assumptions 
    
    def run(self) -> dict:
        table = pd.crosstab(self.df[self.col1], self.df[self.col2])
        chi2, p_value, dof, expected = chi2_contingency(table)

        N = table.values.sum()
        rows, cols = table.shape

        cramer_v_result = self.effectSize(chi2, N, (rows, cols))
        assumptions = self.checkAssumptions()

        result = {
            "test": "Chi-Square Test",
            "columns": [self.col1, self.col2],
            "observations": int(N),
            "table_shape": {
                "rows": int(rows),
                "cols": int(cols)
            },
            "chi2_statistic": float(chi2),                     # FIX
            "p_value": float(p_value),                         # FIX
            "reject_null": bool(p_value < self.alpha),         # FIX
            "effect_size": {
                "name": cramer_v_result["effect_size"],
                "value": float(cramer_v_result["value"])       # FIX
            },
            "hypotheses": {
                "null": self.nullHypothesis(),
                "alternative": self.alternativeHypothesis()
            },
            "assumptions": {
                "expected_frequencies_correct": bool(
                    assumptions["expected_frequencies_correct"]
                ),
                "independence": bool(
                    assumptions["independence"]
                )
            }
        }

        return result
    
    def nullHypothesis(self):
        return f"The variables {self.col1} and {self.col2} are independent."

    def alternativeHypothesis(self):
        return f"The variables {self.col1} and {self.col2} are dependent."
    
    def storeTest(result, sessionId, store):
        pass 
    
    def effectSize(self, chi2, N, shape) -> dict:
        """
        Compute Cramér's V effect size for chi-square test.

        chi2: chi-square statistic
        N: total number of observations
        shape: tuple (rows, columns) of the contingency table
        """
        rows, cols = shape
        cramer_v = (chi2 / (N * (min(rows - 1, cols - 1)))) ** 0.5
        return {
            "effect_size": "cramers_v",
            "value": cramer_v
        }