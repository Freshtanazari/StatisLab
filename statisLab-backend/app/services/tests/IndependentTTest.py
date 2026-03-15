import pandas as pd
from scipy.stats import ttest_ind, shapiro, levene
import numpy as np
from .StatisticalTest import StatisticalTest
from ...storage.DatasetStore import DatasetStore

# notes: handle when the coluumns have null values

class IndependentTtest(StatisticalTest):
    """
    Compare the mean of two independent groups to see if they are significantly different.
    """

    def __init__(self, valueCol: str, groupCol: str, sessionId: str, store: DatasetStore, alpha: float = 0.05, welch: bool = False):
        self.dataset = store.getDataset(sessionID=sessionId)
        self.df = self.dataset.df_current
        self.valueCol = valueCol
        self.groupCol = groupCol
        self.alpha = alpha
        self.welch = welch
        self.sessionId = sessionId

        # Get unique groups
        self.groups = self.df[groupCol].unique()
        if len(self.groups) != 2:
            raise ValueError("IndependentTTest requires exactly 2 groups")

        self.group1 = self.df[self.df[groupCol] == self.groups[0]][valueCol]
        self.group2 = self.df[self.df[groupCol] == self.groups[1]][valueCol]

    def checkAssumptions(self) -> dict:
        """Check normality and equal variance assumptions."""
        assumptions = {}

        # Convert all results to Python bool
        assumptions["normality_group1"] = bool(shapiro(self.group1).pvalue > self.alpha)
        assumptions["normality_group2"] = bool(shapiro(self.group2).pvalue > self.alpha)
        assumptions["equal_variance"] = bool(levene(self.group1, self.group2).pvalue > self.alpha)
        assumptions["independence"] = True  # assumed by study design

        return assumptions

    def effectSize(self) -> dict:
        """Calculate Cohen's d effect size."""
        n1, n2 = len(self.group1), len(self.group2)
        s1, s2 = np.var(self.group1, ddof=1), np.var(self.group2, ddof=1)
        pooledSD = np.sqrt(((n1 - 1) * s1 + (n2 - 1) * s2) / (n1 + n2 - 2))
        d = (np.mean(self.group1) - np.mean(self.group2)) / pooledSD
        return {"cohens_d": float(d)}

    def nullHypothesis(self) -> str:
        return f"The mean of group {self.groups[0]} is equal to the mean of group {self.groups[1]} (no difference)."

    def alternativeHypothesis(self) -> str:
        return f"The mean of group {self.groups[0]} is not equal to the mean of group {self.groups[1]}."

    def run(self) -> dict:
        """Run the independent t-test and return results in JSON-serializable format."""
        tStat, pValue = ttest_ind(self.group1, self.group2, equal_var=not self.welch)
        testName = "Welch's t-test (unequal variances)" if self.welch else "Student's independent t-test (equal variances)"

        assumptions = self.checkAssumptions()
        effect_size = self.effectSize()

        result = {
            "test": testName,
            "columns": [self.valueCol, self.groupCol],
            "T_statistic": float(tStat),
            "p_value": float(pValue),
            "reject_null": bool(pValue < self.alpha),
            "effect_size": effect_size,
            "hypotheses": {
                "null": self.nullHypothesis(),
                "alternative": self.alternativeHypothesis()
            },
            "assumptions": assumptions
        }
        self.storeTest(result)
        return result
    
    def storeTest(self, result):
        self.dataset.report.addAnalysis(result)
        pass 