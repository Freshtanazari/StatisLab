import pandas as pd
import os

def validateCsvFile(file):
    """
    get a CSV file, see if it is valid or not, if valid create a dataset
    
    :param file: csv file 
    :returns false
    """
    allowed_types = {"text/csv", "application/vnd.ms-excel", "application/csv"}
    max_size_bytes = int(os.getenv("MAX_CSV_SIZE_BYTES", str(10 * 1024 * 1024)))
    max_rows = int(os.getenv("MAX_CSV_ROWS", "100000"))
    max_columns = int(os.getenv("MAX_CSV_COLUMNS", "200"))

    if file.content_type not in allowed_types:
        return False, "invalid file type"

    if not file.filename or not file.filename.lower().endswith(".csv"):
        return False, "file must have a .csv extension"

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > max_size_bytes:
        return False, "file is too large"
    
    try: 
        df = pd.read_csv(file.file)
        file.file.seek(0) # reset pointer so the program can read the file again
    except Exception as e:
        return False, "cannot read CSV"

    if len(df) > max_rows:
        return False, "file has too many rows"

    if len(df.columns) > max_columns:
        return False, "file has too many columns"
    
    return True, df
    

    
    
