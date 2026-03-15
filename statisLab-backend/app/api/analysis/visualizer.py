import logging

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from typing import Optional, Dict, List
from ...services.visualizer import Visualizer
from ...utils.json_serialization import convert_numpy
from ..shared.sharedResources import dataset_store
from ..shared.security import verify_session_access


logger = logging.getLogger(__name__)


ALLOWED_ACTIONS = {
    "boxplot": "boxplot",
    "histogram": "histogram",
    "kde": "kde",
    "barplot": "barplot",
    "pieChart": "pieChart",
    "scatterplot": "scatterplot",
    "lineplot": "lineplot",
    "violinplot": "violinplot",
    "pairplot": "pairplot",
    "heatmap": "heatmap",
    "get_missingness_heatmap": "get_missingness_heatmap",
}


# visualizer
class AnalysisRequest(BaseModel):
    sessionId : str
    action : str
    params: Optional[Dict] = None  # method parameters, if any although will be there
    name: Optional[str] = None
    section: Optional[str] = None
    parametersNames: Optional[List[str]] = None

visualizer_router = APIRouter()


def _store_full_report_entry(report, result, request: AnalysisRequest):
    report_entry = {
        "sessionId": request.sessionId,
        "action": request.action,
        "name": request.name or request.action,
        "section": request.section or "Data Visualization",
        "params": request.params or {},
        "parametersNames": request.parametersNames or [],
        "result": convert_numpy(result),
    }

    # Service methods currently append raw result; replace that with full report entry.
    analyses = report.returnAllAnalysis()
    if analyses and analyses[-1] == result:
        idx = len(analyses) - 1
        report.removeAnalysis(idx)
        report.insertAnalysis(idx, report_entry)
    else:
        report.addAnalysis(report_entry)

    return report_entry

@visualizer_router.post("/visualizer")

async def run_action(http_request: Request, request: AnalysisRequest):

    # create preprecessor instacne 
    try:
        verify_session_access(http_request, request.sessionId)
        analyzer = Visualizer(sessionId = request.sessionId, store = dataset_store)
    except HTTPException:
        raise
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset session not found.",
        ) from exc
    except Exception as e:
        logger.exception("Unable to initialize visualizer service")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to initialize visualization.",
        ) from e
    
    # validate the method 
    method_name = ALLOWED_ACTIONS.get(request.action)
    if not method_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Action {request.action} is not allowed.",
        )
    
    method = getattr(analyzer, method_name)

    try: 
        # call the method
        result = method(**(request.params or {}))
        report_entry = _store_full_report_entry(analyzer.dataset.report, result, request)
    except HTTPException:
        raise
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as e:
        logger.exception("Visualization action failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Visualization action failed.",
        ) from e
    
    return {
         "data": report_entry["result"],
         "report": report_entry,
    }
