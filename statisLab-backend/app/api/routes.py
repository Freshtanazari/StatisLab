from fastapi import APIRouter, UploadFile, File
import pandas as pd
from pydantic import BaseModel
from ..services.preview import previewFile as preview
from ..services.preview import getTotalColumnsAndRows
from ..validators.fileValidation import validateCsvFile
from ..storage.DatasetStore import DatasetStore
from ..models.Dataset import Dataset
from ..services.preview import getPercentageMissing
from ..services.preview import getDataTypes
from ..services.preprocessor import preprocessor
from typing import Optional, Dict
from io import BytesIO
from fastapi.responses import StreamingResponse


import uuid
from fastapi import Request

dataset_store =  DatasetStore()

router = APIRouter()

@router.post("/upload")
async def upload_csv( file: UploadFile = File(...)):
    """
    Endpoint to upload a CSV file.
    Uses preview() to generate a preview of the file.
    """

    # Use your helper function instead of writing pandas code here
    file.file.seek(0)  # reset pointer to start
    isValid, valueReturned = validateCsvFile(file);
    
    if not isValid:
        return {"error": valueReturned}
    
    #get the dataset 
    df = valueReturned

    # created the dataset object 
    dataset_obj = Dataset(df)

    # create a session the sessionid 
    session_id = str(uuid.uuid4())

    print("session id is created" +  session_id)

    # store the dataset with its session id
    dataset_store.addDataset(session_id, dataset_obj)

    subDataset = preview(dataset_obj.df_current, n= 5)

    totals = getTotalColumnsAndRows(dataset_obj.df_current)
    missingPercentage = getPercentageMissing(dataset_obj.df_current)
    dataTypes = getDataTypes(dataset_obj.df_current)

    return {
        "dataset": subDataset, 
        "totalCols": int(totals[0]), 
        "totalRows": int(totals[1]), 
        "missingPercentage": missingPercentage, 
        "dataTypes": dataTypes,
        "sessionId": session_id
    }

class PreprocessRequest(BaseModel):
    sessionId : str
    action : str
    params: Optional[Dict] = None  # method parameters, if any although will be there

@router.post("/preprocess/action")

async def run_action(request: PreprocessRequest):

    # create preprecessor instacne 
    try:
        prep = preprocessor(sessionId = request.sessionId, store = dataset_store)
    except Exception as e:
        return {"error": str(e)}
    
    # validate the method 
    if not hasattr(prep, request.action):
        return {"error": f"action {request.action} not found"}
    
    method = getattr(prep, request.action)

    try: 
        # call the method
        print("we have called the method with params" + str(request.params))
        result = method(**(request.params or {}))
        print("resutlt is " + str(result))
        print(request)
    except Exception as e:
        print(e)
        print(e)
        return{"error": str(e)}
    
    return {
        "message" : result,
    }

@router.post("/preprocess")

async def getTableData(request: PreprocessRequest):
    # create a preprocessor instance:
    try: 
        prep = preprocessor(sessionId=request.sessionId, store=dataset_store)
    except Exception as e:
        return {"error": str(e)}
    # call the method
    try:
        result = prep.tableData()
    except Exception as e:
        return {"error": str(e)}
    
    return result

class downloadRequest(BaseModel):
    sessionId : str

@router.post("/download_audit")
async def download_audit(request: downloadRequest):
    try: 
        sessionId = request.sessionId
        prep = preprocessor(sessionId=sessionId, store=dataset_store)
    except Exception as e:
        return {"error": str(e)}
    # call the method

    audit_log = prep.display_audit_log()  # Your method to fetch logs
    df = pd.DataFrame(audit_log)
    print(df)
    output = BytesIO()
    df.to_excel(output, index=False, engine="openpyxl")
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=audit_.xlsx"}
    )

class VisualizerRequest(BaseModel):
    sessionId : str
    action : str
    params: Optional[Dict] = None  # method parameters, if any although will be there

@router.post("/preprocess/action")

async def run_action(request: PreprocessRequest):

    # create preprecessor instacne 
    try:
        analyzer = analyzer(sessionId = request.sessionId, store = dataset_store)
    except Exception as e:
        return {"error": str(e)}
    
    # validate the method 
    if not hasattr(analyzer, request.action):
        return {"error": f"action {request.action} not found"}
    
    method = getattr(analyzer, request.action)

    try: 
        # call the method
        print("we have called the method with params" + str(request.params))
        result = method(**(request.params or {}))
        print("resutlt is " + str(result))
        print(request)
    except Exception as e:
        print(e)
        print(e)
        return{"error": str(e)}
    
    return {
        result
    }

@router.get("/status")

def status():
    return{"Status": "Backend is running"}