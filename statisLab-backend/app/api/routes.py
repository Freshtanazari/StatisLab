from fastapi import APIRouter, UploadFile, File
import pandas as pd
from ..services.preview import previewFile as preview
from ..services.preview import getTotalColumnsAndRows
from ..validators.fileValidation import validateCsvFile


router = APIRouter()

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """
    Endpoint to upload a CSV file.
    Uses preview() to generate a preview of the file.
    """
    print("this is run")
    # Use your helper function instead of writing pandas code here
    file.file.seek(0)  # reset pointer to start
    isValid, valueReturned = validateCsvFile(file);

    if isValid:
        df = valueReturned;
    else:
        errorMessage = valueReturned;
    
   
    

    df = pd.read_csv(file.file)
    dataset = preview(df, n= 10)
    totals = getTotalColumnsAndRows(df)
    return {
        "dataset": dataset, 
        "totalCols": totals[0], 
        "totalRows": totals[1]
    }

@router.get("/status")

def status():
    return{"Status": "Backend is running"}