import logging

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from typing import Optional, Dict
from ...services.preprocessor import preprocessor
from ...utils.json_serialization import convert_numpy
from ..shared.sharedResources import dataset_store
from ..shared.security import verify_session_access


logger = logging.getLogger(__name__)


class PreprocessRequest(BaseModel):
    sessionId : str
    action : str
    params: Optional[Dict] = None  # method parameters, if any although will be there

getTable_router = APIRouter()
# preprocess 
@getTable_router.post("/preprocess")

async def getTableData(http_request: Request, request: PreprocessRequest):
    # create a preprocessor instance:
    try: 
        verify_session_access(http_request, request.sessionId)
        prep = preprocessor(sessionId=request.sessionId, store=dataset_store)
    except HTTPException:
        raise
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset session not found.",
        ) from exc
    except Exception as e:
        logger.exception("Unable to initialize table data request")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load table data.",
        ) from e
    # call the method
    try:
        result = prep.tableData()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to build table data response")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load table data.",
        ) from e
    
    return convert_numpy(result)
