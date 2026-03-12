from .StatisticalTest import StatisticalTest
from scipy.stats import mannwhitneyu
import pandas as pd
import numpy as np
from ..storage.DatasetStore import DatasetStore


class MannWhitneyUtest(StatisticalTest):
    """Non-parametric equivalent of the independent t-test"""

    def __init__(self, valueCol, sessionId, store: DatasetStore, groupCol, alpha=0.05):

        self.dataset = store.getDataset(sessionID=sessionId)
        self.sessionId = sessionId
        self.df = self.dataset.df_current.copy()
        self.col1 = valueCol
        self.groupCol = groupCol
        self.alpha = alpha

        if self.col1 not in self.df.columns:
            raise KeyError(f"{self.col1} not found in dataset")

        if self.groupCol not in self.df.columns:
            raise KeyError(f"{self.groupCol} not found in dataset")

        # remove missing values safely
        self.df = self.df[[self.col1, self.groupCol]].dropna()

        # get groups
        self.groups = self.df[self.groupCol].unique()

        if len(self.groups) != 2:
            raise ValueError("Exactly two groups are required for Mann-Whitney U test.")

    def checkAssumptions(self):

        assumptions = {}

        dtype = self.df[self.col1].dtype

        # reject boolean columns explicitly
        if pd.api.types.is_bool_dtype(dtype):
            assumptions["values_continuous_or_ordinal"] = False
        else:
            assumptions["values_continuous_or_ordinal"] = pd.api.types.is_numeric_dtype(dtype)

        return assumptions

    def run(self) -> dict:

        group1 = self.df[self.df[self.groupCol] == self.groups[0]][self.col1]
        group2 = self.df[self.df[self.groupCol] == self.groups[1]][self.col1]

        # ensure numeric conversion
        group1 = pd.to_numeric(group1, errors="coerce").dropna()
        group2 = pd.to_numeric(group2, errors="coerce").dropna()

        if len(group1) == 0 or len(group2) == 0:
            raise ValueError("One of the groups has no valid numeric values.")

        N1 = len(group1)
        N2 = len(group2)

        stat, pValue = mannwhitneyu(group1, group2, alternative="two-sided")

        effect = self.effectSize(stat, N1, N2)

        assumptions = self.checkAssumptions()

        result = {
            "test": "Mann-Whitney U Test",
            "statistic": float(stat),
            "p_value": float(pValue),
            "reject_null": bool(pValue < self.alpha),
            "effect_size": effect,
            "assumptions": assumptions,
            "n_group1": N1,
            "n_group2": N2, 
            "null_hypothesis": self.nullHypothesis(), 
            "alternative_hypothesis": self.alternativeHypothesis()
        }
        self.storeTest(result)
        return result
    

    def effectSize(self, stat, N1, N2) -> dict:

        N = N1 + N2

        # approximate r effect size
        r = stat / np.sqrt(N * (N + 1) / 12)

        return {
            "effect_size": "r",
            "value": float(r)
        }

    def nullHypothesis(self):
        return f"The distributions of {self.col1} in the two groups of {self.groupCol} are equal."

    def alternativeHypothesis(self):
        return f"The distributions of {self.col1} in the two groups of {self.groupCol} are not equal."
    def storeTest(self, result):
        self.dataset.report.addAnalysis(result)

