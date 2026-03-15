import logging

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from ...services.report import get_report, delete_report_entry, reorder_report_entry, reset_report_entries
from ..shared.sharedResources import dataset_store
from ..shared.security import verify_session_access


logger = logging.getLogger(__name__)


class ReportRequest(BaseModel):
    sessionId : str


class DeleteReportRequest(BaseModel):
    sessionId: str
    index: int


class ReorderReportRequest(BaseModel):
    sessionId: str
    fromIndex: int
    toIndex: int


class ResetReportRequest(BaseModel):
    sessionId: str

getReport_router = APIRouter()


@getReport_router.post("/get_report")

async def getReport(http_request: Request, request: ReportRequest):
    # create a preprossor instane 
    try: 
        verify_session_access(http_request, request.sessionId)
        report = get_report(sessionId=request.sessionId, store = dataset_store)
    except HTTPException:
        raise
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except Exception as e:
        logger.exception("Failed to load report")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load report.",
        ) from e
    
    return report


@getReport_router.post("/report/delete")
async def deleteReport(http_request: Request, request: DeleteReportRequest):
    try:
        verify_session_access(http_request, request.sessionId)
        result = delete_report_entry(sessionId=request.sessionId, index=request.index, store=dataset_store)
    except HTTPException:
        raise
    except IndexError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except Exception as e:
        logger.exception("Failed to delete report entry")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete report entry.",
        ) from e

    return {"data": result}


@getReport_router.post("/report/reorder")
async def reorderReport(http_request: Request, request: ReorderReportRequest):
    try:
        verify_session_access(http_request, request.sessionId)
        result = reorder_report_entry(
            sessionId=request.sessionId,
            from_index=request.fromIndex,
            to_index=request.toIndex,
            store=dataset_store,
        )
    except HTTPException:
        raise
    except IndexError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except Exception as e:
        logger.exception("Failed to reorder report entries")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reorder report entries.",
        ) from e

    return {"data": result}


@getReport_router.post("/report/reset")
async def resetReport(http_request: Request, request: ResetReportRequest):
    try:
        verify_session_access(http_request, request.sessionId)
        result = reset_report_entries(sessionId=request.sessionId, store=dataset_store)
    except HTTPException:
        raise
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except Exception as e:
        logger.exception("Failed to reset report entries")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reset report entries.",
        ) from e

    return {"data": result}
