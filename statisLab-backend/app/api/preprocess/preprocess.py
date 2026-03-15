import logging

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from typing import Optional, Dict
from ...services.preprocessor import preprocessor
from ...utils.json_serialization import convert_numpy
from ..shared.sharedResources import dataset_store
from ..shared.security import verify_session_access


logger = logging.getLogger(__name__)


ALLOWED_ACTIONS = {
    "displayUnique": "displayUnique",
    "renameCol": "renameCol",
    "changeDtype": "changeDtype",
    "allToNumeric": "allToNumeric",
    "displayInfo": "displayInfo",
    "dropCol": "dropCol",
    "dropDuplicates": "dropDuplicates",
    "dropAllNulls": "dropAllNulls",
    "dropNullsFromCol": "dropNullsFromCol",
    "imputeByffill": "imputeByffill",
    "imputeBybfill": "imputeBybfill",
    "imputeByMode": "imputeByMode",
    "imputeByConstant": "imputeByConstant",
    "flagMissing": "flagMissing",
    "interpolateMissing": "interpolateMissing",
    "imputeMeanNumeric": "imputeMeanNumeric",
    "imputeMedianNumeric": "imputeMedianNumeric",
    "describe_categorical": "describe_categorical",
    "describe_numeric": "describe_numeric",
    "display_audit_log": "display_audit_log",
}

class PreprocessRequest(BaseModel):
    sessionId : str
    action : str
    params: Optional[Dict] = None  # method parameters, if any although will be there

preprocessor_router = APIRouter()

@preprocessor_router.post("/preprocess/action")

async def run_action(http_request: Request, request: PreprocessRequest):

    # create preprecessor instacne 
    try:
        verify_session_access(http_request, request.sessionId)
        prep = preprocessor(sessionId = request.sessionId, store = dataset_store)
    except HTTPException:
        raise
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset session not found.",
        ) from exc
    except Exception as e:
        logger.exception("Unable to initialize preprocessor")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to initialize preprocessing.",
        ) from e
    
    # validate the method 
    method_name = ALLOWED_ACTIONS.get(request.action)
    if not method_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Action {request.action} is not allowed.",
        )
    
    method = getattr(prep, method_name)

    try: 
        # call the method
        result = method(**(request.params or {}))
    except HTTPException:
        raise
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as e:
        logger.exception("Preprocess action failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Preprocess action failed.",
        ) from e
    
    return {
        "message" : convert_numpy(result),
    }
