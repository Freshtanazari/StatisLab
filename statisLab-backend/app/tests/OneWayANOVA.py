from scipy.stats import f_oneway
from scipy.stats import shapiro,levene
from .StatisticalTest import StatisticalTest
from ..models.Dataset import Dataset
from ..storage.DatasetStore import DatasetStore

class OneWayANOVA(StatisticalTest):
    # NOTE . compares means of numeric variables across 3 or more independent groups
    # valueCol 
    # groupCol with 3 or more categories

    def __init__(self, alpha, valueCol,sessionId, store: DatasetStore, groupCol):
        dataset = store.getDataset(sessionID=sessionId)
        self.sessionId = sessionId
        self.df = dataset.df_current # get the current dataset
        self.alpha = alpha 
        self.valueCol = valueCol # should be numeric
        self.groupCol = groupCol

        self.groups = self.df[self.groupCol].unique()

        if len(self.groups) < 3:
            raise ValueError("one way anova must at least have 3 columns")
        
    def checkAssumptions(self) -> dict:
        assumptions ={}

        #1. normality - shapiro-wilk
        for group in self.groups:
             data = self.df[self.df[self.groupCol] == group ][self.valueCol]
             assumptions[f"normality_{group}"] = shapiro(data).pvalue > self.alpha

        #2. Equal Variance- levene
        grouped_result = [
            self.df[self.df[self.groupCol]== group][self.valueCol]
            for group in self.groups
        ]
        assumptions["equal_variance"] = levene(*grouped_result).pvalue > self.alpha

        #3. Independence 
        assumptions["independence"] = True # assumed by study design

        return assumptions

    def run(self) -> dict:

        grouped_result = [
            self.df[self.df[self.groupCol] == group][self.valueCol]
            for group in self.groups
        ]

        fStat, pValue = f_oneway(*grouped_result)

        return {
             "test": "one-way-ANOVA test",
             "f_statistic":fStat,
             "p_value": pValue,
             "reject_null": pValue < self.alpha
        }


    def effectSize(self, fStat: float) -> dict:
        k = len(self.groups)
        N = len(self.df)

        eta_squared = (fStat * (k - 1)) / (fStat * (k - 1) + (N - k))

        return {
            "effect_size": "eta_squared",
            "value": eta_squared
        }

    def nullHypothesis(self):
        return "All group means are equal."

    def alternativeHypothesis(self):
        return "At least one group mean is different."
    
    def storeTest(result, sessionId, store):
        pass 