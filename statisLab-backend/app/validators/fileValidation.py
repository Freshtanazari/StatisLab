import pandas as pd

def validateCsvFile(file):
    """
    get a CSV file, see if it is valid or not, if valid create a dataset
    
    :param file: csv file 
    :returns false
    """
    if file.content_type not in ["text/csv", "application/vnd.ms-excel"]:
        return False, "invalid file type"
    
    try: 
        df = pd.read_csv(file.file)
        file.file.seek(0) # reset pointer so the program can read the file again
    except Exception as e:
        return False, f"cannot read CSV: {str(e)}"
    
    return True, df
    

    
    
