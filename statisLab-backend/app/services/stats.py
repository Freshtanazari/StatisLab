import pandas as pd
from scipy import stats

# numeric
def describe_numeric(df: pd.DataFrame, col: str) -> dict:
    """return basic descriptive statistics for a numeric column."""
    if col not in df.columns: 
        raise ValueError(f"column {col} not found in DataFrame")
    series = df[col].dropna()
    return {
        "count": series.count(),
        "mean": series.mean(),
        "median": series.median(),
        "std": series.std(),
        "variance": series.var(),
        "min": series.min(),
        "max": series.max(),
        "q1": series.quantile(0.25),
        "q3": series.quantile(0.75),
        "iqr": series.quantile(0.75) - series.quantile(0.25),
        "missing_percent": df[col].isna().mean() * 100
    }

# categorical
def describe_categorical(df: pd.DataFrame, col: str) -> dict: 
    if col not in df.columns:
        raise ValueError(f"column {col} not found in DataFrame")
    series = df[col].dropna()

    return {
        "unique_values": series.nunique(), 
        "top": series.mode()[0],
        "top_freq" : series.value_counts().iloc[0],
        "value_counts" : series.value_counts().to_dict(),
        "percentage" : (series.value_counts(normalize = True) * 100).round(2).to_dict()
    }

