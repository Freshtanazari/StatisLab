from scipy.stats import f_oneway
from scipy.stats import shapiro,levene
from StatisticalTest import StatisticalTest
class OneWayANOVA(StatisticalTest):
    # NOTE . compares means of numeric variables across 3 or more independent groups
    # valueCol 
    # groupCol with 3 or more categories

    def __init__(self,df, alpha, valueCol, groupCol):
        self.df = df
        self.alpha = alpha 
        self.valueCol = valueCol # should be numeric
        self.groupCol = groupCol
        self.groups = self.groupCol.unique()
        if len(self.groups):
            raise KeyError("one way anova must at least have 3 columns")
        
def checkAssumptions(self) -> dict:
        assumptions ={}

        #1. normality - shapiro-wilk
        for group in self.groups:
             assumptions["normality_"+ group] = shapiro(self.group).pvalue > self.alpha

        #2. Equal Variance- levene
        for group in self.groups:
             assumptions["equal_variance"+ group] = levene(self.group).pvalue > self.alpha

        #3. Independence 
        assumptions["independence"] = True # since the user has chose the independence t test

        return assumptions

    def run(self) -> dict:
        tStat, pValue = f_oneway(...self.groups)
        return {
             "test": "one-way-ANOVA test"
             "t_statistic":
             "p_value": 
             "reject_null"
        }


    def effectSize(Self):
     pass

    def nullHypothesis(self):
        return f"The mean of group {self.groups[0]} is equal to the mean of group {self.groups[1]} (no difference)."

    def alternativeHypothesis(self):
        return f"The mean of group {self.groups[0]} is not equal to the mean of group {self.groups[1]}."
        