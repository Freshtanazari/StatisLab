import logging

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from ...services.preprocessor import preprocessor 
from ..shared.sharedResources import dataset_store
from ..shared.security import verify_session_access
import pandas as pd
import io
from fastapi.responses import StreamingResponse


logger = logging.getLogger(__name__)


class downloadRequest(BaseModel):
    sessionId : str

downloadLog_router = APIRouter()

@downloadLog_router.post("/download_audit")
async def download_audit(http_request: Request, request: downloadRequest):
    try: 
        sessionId = request.sessionId
        verify_session_access(http_request, sessionId)
        prep = preprocessor(sessionId=sessionId, store=dataset_store)
    except HTTPException:
        raise
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset session not found.",
        ) from exc
    except Exception as e:
        logger.exception("Unable to initialize audit download")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate audit download.",
        ) from e
    # call the method

    audit_log = prep.display_audit_log()  # Your method to fetch logs
    df = pd.DataFrame(audit_log)
    output = io.BytesIO()
    df.to_excel(output, index=False, engine="openpyxl")
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=audit_.xlsx"}
    )
