# StatisLab

**StatisLab** is a web-based data analysis application that generates a structured statistical report from a user-provided CSV file.  
It is designed to help users quickly explore datasets, apply basic preprocessing, verify statistical assumptions, and run common statistical tests.
---
## 📌 Project Status

This project is considered feature-complete as a learning project, but will continue to receive updates and enhancements as new ideas and improvements arise.

## 🚀 Features

### 1. CSV Upload & Validation
- Upload datasets in `.csv` format
- Validate file structure and data types before processing
- Prevents invalid or malformed inputs

---

### 2. Dataset Overview & Quality Check
- Number of rows and columns
- Missing value detection
- Initial dataset preview

---

### 3. Data Preprocessing
Users can apply common data-cleaning operations:
- Missing value handling (imputation or removal)
- Dropping rows or columns
- Data type casting
- Descriptive statistics for each column

📌 **Every preprocessing step is logged** 

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
- generates a structured analysis report
- Includes:
  - Dataset summary and descriptive statistics
  - Preprocessing steps and changes are logged in a saparate downloadable Excel file. 
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
- **API:** FastAPI

---

## 🎯 Goal
StatisLab aims to make statistical analysis more **accessible**, especially for students, researchers, and early-stage data practitioners.

---

## ⚠️ Limitations

- **Supported File Types:** Only CSV files are supported for upload and analysis.
- **Statistical Tests:** The platform currently supports a limited set of common statistical tests. 
- **Assumption Checks:** Diagnostics for statistical assumptions are basic and may not cover all edge cases.
- **Data Size:** Performance may be impacted with very large datasets due to browser and server memory constraints.
- **No Real-Time Collaboration:** The application is designed for single-user workflows and does not support collaborative features.



---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome! If you have ideas or would like to help enhance StatisLab, feel free to open an issue or submit a pull request.

---

## 🙏 Acknowledgements

Some aspects of the UI design and test creation were refined with the help of AI tools to improve quality and efficiency.


