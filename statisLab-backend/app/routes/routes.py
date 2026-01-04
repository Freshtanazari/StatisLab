from fastapi import APIRouter, UploadFile, File
import pandas as pd

router = APIRouter()

@router.post("/upload")

async def upload_csv(file: UploadFile = File(...)):
    #read the CSV into a pandas DataFrame
    df = pd.read_csv(file.file)
    #return column names and types
    return{
        "columns" : df.columns.tolist(),
        "dtypes" : df.dtypes.astype(str).to_dict(), 
        "preview": df.head(5).to_dict(orient = "records")
    }


@router.get("/status")

def status():
    return{"Status": "Backend is running"}