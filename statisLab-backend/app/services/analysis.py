import pandas as pd
import scipy 
import matplotlib as plt
import seaborn as sns
from app.storage.DatasetStore import DatasetStore


class Analysis:
    
    def __init__(self, sessionId: str, store: DatasetStore):
        self.dataset = store.getDataset(sessionId)
        self.df = self.dataset.df_current
    
        
    # inspect dataset rows, columns and data types
    # def inspect_dataset(self):

    #     result = {
    #         "rows" : self.df.shape[0], 
    #         "columns" : self.df.shape[1], 
    #         "column_names": self.df.columns.tolist(), 
    #         "dtypes": self.df.dtypes.to_dict()
    #     }
    #     self.report.addAnalysis(result)


    # get the shema of the dataset
    def get_table_schema(self): 

        schema = []
        for col in self.df.columns:
            row = {}
            row["coluumn_name"] = col
            row["data_type"] = str(self.df[col].dtype)
            row["missing_values"] = self.df[col].isnull().sum()
            row["unique_values"] = self.df[col].nunique()
            row["Example"] = self.df[col].dropna()[0]
            schema.append(row)
        return schema

    def get_shape(self):
        rowCount, columnCount = self.df.shape
        return rowCount, columnCount
    
    def get_preview(self, n = 5):
        return self.df.head(n).to_dict(orient="records")
    
    def inspect_dataset(self):
        result = {
            "rowsCount" : self.get_shape()[0], 
            "columnsCount" : self.get_shape()[1], 
            "tableSchema": self.get_table_schema(), 
            "sampleData": self.get_preview()
        }
        self.dataset.report.addAnalysis(result)
        return result
    
    # get summary statistics of the numerical cols
    def get_summary_statistics(self):
        result = self.df.describe().to_dict()
        self.dataset.report.addAnalysis(result)
        return result
    
    # get the outliers
    def get_outliers_details(self):
        result = {}
        for col in self.df.select_dtypes(include=["number"]):
            Q1 = self.df[col].quantile(0.25)
            Q2 = self.df[col].quantile(0.5)
            Q3 = self.df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            outliers = self.df[self.df[col] < lower_bound][col].tolist() + self.df[self.df[col] > upper_bound][col].tolist()
            result[col] = {
                "outliers": outliers, 
                "Method": "IQR", 
              "percentage of outliers" : len(outliers) / len(self.df) * 100
            }
        self.dataset.report.addAnalysis(result)
        return result 

    def numerical_distribution(self, col):
        result = []
        # chekc if col exists 
        # Skewness label
        def skew_label(s):
            if abs(s) < 0.5:   return "Symmetric"
            elif s > 0:         return "Right-skewed"
            else:               return "Left-skewed"

        # Kurtosis label
        def kurt_label(k):
            if abs(k) < 0.5:   return "Normal-like"
            elif k > 0:         return "Heavy-tailed"
            else:               return "Light-tailed"

        # Mean vs Median label
        def gap_label(gap):
            if gap < 5:         return "Mean and median are close, distribution is balanced"
            elif gap < 20:      return "Slight gap, mild skew or a few outliers"
            else:               return "Large gap, mean is unreliable as center"

        # CV label
        def cv_label(cv):
            if cv < 15:         return "Low dispersion, values are tightly clustered"
            elif cv < 50:       return "Moderate dispersion"
            else:               return "High dispersion, values are widely spread"
        

        if self.df[col].dtype.kind in "biufc":

            mean = self.df[col].mean()
            median = self.df[col].median()
            std = self.df[col].std()
            mean_median_gap = abs(mean - median)
            cv = (std / (mean if mean != 0 else 0)) * 100
            skewness = self.df[col].skew()
            kurtosis = self.df[col].kurtosis()
            result = [
                { "name": "Skewness",                  "value": round(skewness, 4),        "interpretation": skew_label(skewness) },
                { "name": "Kurtosis",                  "value": round(kurtosis, 4),        "interpretation": kurt_label(kurtosis) },
                { "name": "Mean vs Median Gap",        "value": round(mean_median_gap, 4), "interpretation": gap_label(mean_median_gap) },
                { "name": "Coefficient of Variation",  "value": round(cv, 2),              "interpretation": cv_label(cv) },
            ]
        self.dataset.report.addAnalysis(result)
        return result
    
    def categorical_distribution(self, col):
        if self.df[col].dtype == "object" or self.df[col].dtype.name == "category":
            counts = self.df[col].value_counts()
            percentages = self.df[col].value_counts(normalize = True) * 100
            result = []
            for category in counts.index:
                result.append({
                    "category": category, 
                    "count": int(counts[category]),
                    "percentage": round(percentages[category], 2)
                })
            self.dataset.report.addAnalysis(result)
            return result

    def return_info(self):
        import io
        buf = io.StringIO()
        self.df.info(buf=buf)
        result = buf.getvalue()
        self.dataset.report.addAnalysis(result)
        return result
    
    def return_analysis_report(self):
        result = self.dataset.report.returnAllAnalysis();
        return result

    
    
    
    
            
    



 

    


        
        