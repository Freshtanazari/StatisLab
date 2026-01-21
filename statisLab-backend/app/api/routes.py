from fastapi import APIRouter, UploadFile, File
import pandas as pd
from ..services.preview import previewFile as preview
from ..services.preview import getTotalColumnsAndRows

router = APIRouter()

@router.post("/upload")

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """
    Endpoint to upload a CSV file.
    Uses preview() to generate a preview of the file.
    """
    print("this is run")
    # Use your helper function instead of writing pandas code here
    file.file.seek(0)  # reset pointer to start

    if file.content_type not in ["text/csv", "application/vnd.ms-excel"]:
        return {"error": "Invalid file type"}
    

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