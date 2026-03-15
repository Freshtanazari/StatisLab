from scipy.stats import f_oneway
from scipy.stats import shapiro, levene
from .StatisticalTest import StatisticalTest
from ...storage.DatasetStore import DatasetStore
import pandas as pd


class OneWayANOVA(StatisticalTest):
    # compares means of numeric variables across 3 or more independent groups

    def __init__(self , valueCol ,sessionId, store: DatasetStore, groupCol, alpha = 0.05):
        self.dataset = store.getDataset(sessionID=sessionId)
        self.sessionId = sessionId
        self.df = self.dataset.df_current
        self.alpha = alpha
        self.valueCol = valueCol
        self.groupCol = groupCol

        # protect against numpy bool error
        if pd.api.types.is_bool_dtype(self.df[self.valueCol]):
            raise TypeError(f"{self.valueCol} cannot be boolean for ANOVA. It must be numeric.")

        self.groups = self.df[self.groupCol].unique()

        if len(self.groups) < 3:
            raise ValueError("one way anova must at least have 3 columns")

    def checkAssumptions(self) -> dict:
        assumptions = {}

        # 1. normality - shapiro-wilk
        for group in self.groups:
            data = pd.to_numeric(
                self.df[self.df[self.groupCol] == group][self.valueCol],
                errors="coerce"
            ).dropna()

            assumptions[f"normality_{group}"] = bool(shapiro(data).pvalue > self.alpha)

        # 2. equal variance - levene
        grouped_result = [
            pd.to_numeric(
                self.df[self.df[self.groupCol] == group][self.valueCol],
                errors="coerce"
            ).dropna()
            for group in self.groups
        ]

        assumptions["equal_variance"] = bool(levene(*grouped_result).pvalue > self.alpha)

        # 3. independence (assumed by study design)
        assumptions["independence"] = True

        return assumptions

    def run(self) -> dict:

        grouped_result = [
            pd.to_numeric(
                self.df[self.df[self.groupCol] == group][self.valueCol],
                errors="coerce"
            ).dropna()
            for group in self.groups
        ]

        fStat, pValue = f_oneway(*grouped_result)
        assumptions = self.checkAssumptions()
        effect = self.effectSize(fStat)
        result =  {
            "test": "one-way-ANOVA test",
            "f_statistic": float(fStat),
            "p_value": float(pValue),
            "reject_null": bool(pValue < self.alpha),
            "assumptions": assumptions, 
            "effect_size" : effect
        }
        self.storeTest(result)
        return result 


    def effectSize(self, fStat: float) -> dict:
        k = len(self.groups)
        N = len(self.df)

        eta_squared = (fStat * (k - 1)) / (fStat * (k - 1) + (N - k))

        return {
            "effect_size": "eta_squared",
            "value": float(eta_squared)
        }

    def nullHypothesis(self):
        return "All group means are equal."

    def alternativeHypothesis(self):
        return "At least one group mean is different."

    def storeTest(self, result):
        self.dataset.report.addAnalysis(result)
        pass 