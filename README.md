# StatisLab

**StatisLab** is a web-based data analysis application that generates a structured statistical report from a user-provided CSV file.  
It is designed to help users quickly explore datasets, apply basic preprocessing, verify statistical assumptions, and run common statistical tests — all with transparent logging and reproducible results.

---
## 📌 Project Status

This project is currently under active development.  
Future iterations will expand statistical coverage, improve assumption diagnostics, enhance reporting, and introduce more advanced analysis workflows.

## 🚀 Features

### 1. CSV Upload & Validation
- Upload datasets in `.csv` format
- Validate file structure and data types before processing
- Prevents invalid or malformed inputs

---

### 2. Dataset Overview & Quality Check
- Number of rows and columns
- Missing value detection
- Basic data quality indicators
- Initial dataset preview

---

### 3. Data Preprocessing
Users can apply common data-cleaning operations:
- Missing value handling (imputation or removal)
- Dropping rows or columns
- Data type casting
- Descriptive statistics for each column

📌 **Every preprocessing step is logged** to ensure transparency and reproducibility.

---

### 4. Statistical Analysis
- Apply common statistical tests
- Automatic checking of statistical assumptions (e.g., normality, independence, homoscedasticity)
- Descriptive and inferential statistics
- Visualizations generated using Python libraries

---

### 5. Visualization
- Distribution plots
- Box plots
- Other exploratory visualizations to support statistical findings

---

### 6. Report Generation
- Automatically generates a structured analysis report
- Includes:
  - Dataset summary
  - Preprocessing steps and changes
  - Statistical tests applied
  - Assumption checks
  - Visualizations
  - Final results and interpretations

---

## 🛠 Tech Stack
- **Frontend:** React
- **Backend:** Python
- **Data Processing & Statistics:** Pandas, NumPy, SciPy
- **Visualization:** Matplotlib / Seaborn

---

## 🎯 Goal
StatisLab aims to make statistical analysis more **accessible**, **transparent**, and **reproducible**, especially for students, researchers, and early-stage data practitioners.

