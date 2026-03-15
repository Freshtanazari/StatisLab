import logging

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status

from ..shared.sharedResources import dataset_store
from ..shared.security import get_or_create_session_id
from ...services.preview import previewFile as preview
from ...services.preview import getTotalColumnsAndRows
from ...validators.fileValidation import validateCsvFile
from ...models.Dataset import Dataset
from ...services.preview import getPercentageMissing
from ...services.preview import getDataTypes
from ...utils.json_serialization import convert_numpy


logger = logging.getLogger(__name__)

uploader_router = APIRouter()

@uploader_router.post("/upload")
async def upload_csv(request: Request, file: UploadFile = File(...)):
    """
    Endpoint to upload a CSV file.
    Uses preview() to generate a preview of the file.
    """

    # Use your helper function instead of writing pandas code here
    file.file.seek(0)  # reset pointer to start
    isValid, valueReturned = validateCsvFile(file);
    
    if not isValid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=valueReturned,
        )
    
    #get the dataset 
    df = valueReturned

    # created the dataset object 
    dataset_obj = Dataset(df)

    session_id = get_or_create_session_id(request)

    # store the dataset with its session id
    try:
        dataset_store.addDataset(session_id, dataset_obj)
    except Exception as exc:
        logger.exception("Failed to store uploaded dataset")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The server cannot accept more datasets right now.",
        ) from exc

    subDataset = preview(dataset_obj.df_current, n= 5)

    totals = getTotalColumnsAndRows(dataset_obj.df_current)
    missingPercentage = getPercentageMissing(dataset_obj.df_current)
    dataTypes = getDataTypes(dataset_obj.df_current)

    return {
        "dataset": convert_numpy(subDataset), 
        "totalCols": int(totals[0]), 
        "totalRows": int(totals[1]), 
        "missingPercentage": convert_numpy(missingPercentage), 
        "dataTypes": convert_numpy(dataTypes),
        "sessionId": session_id
    }