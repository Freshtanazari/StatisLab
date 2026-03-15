import logging

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from typing import Optional, Dict, List
from ...services.tests.chiSquareTest import ChiSquareTest
from ...services.tests.IndependentTTest import IndependentTtest
from ...services.tests.MannWhitneyUtest import MannWhitneyUtest
from ...services.tests.OneWayANOVA import OneWayANOVA
from ...services.tests.PairedTTest import PairedTTest
from ...services.tests.WilcoxonSignedRankTest import WilcoxonSignedRankTest
from ...utils.json_serialization import convert_numpy
from ..shared.sharedResources import dataset_store
from ..shared.security import verify_session_access


logger = logging.getLogger(__name__)

test_router = APIRouter()

class AnalysisRequest(BaseModel):
    sessionId : str
    action : str
    params: Optional[Dict] = None  # method parameters, if any although will be there
    name: Optional[str] = None
    section: Optional[str] = None
    parametersNames: Optional[List[str]] = None


def _store_full_report_entry(report, result, request: AnalysisRequest):
    report_entry = {
        "sessionId": request.sessionId,
        "action": request.action,
        "name": request.name or request.action,
        "section": request.section or "Statistical Tests",
        "params": request.params or {},
        "parametersNames": request.parametersNames or [],
        "result": convert_numpy(result),
    }

    # Test services currently append raw result; replace that with full report entry.
    analyses = report.returnAllAnalysis()
    if analyses and analyses[-1] == result:
        idx = len(analyses) - 1
        report.removeAnalysis(idx)
        report.insertAnalysis(idx, report_entry)
    else:
        report.addAnalysis(report_entry)

    return report_entry

@test_router.post("/Stest")
async def run_action(http_request: Request, request: AnalysisRequest):
    ACTION_MAP = {
        "ChiSquareTest": ChiSquareTest,
        "IndependentTTest": IndependentTtest,
        "MannWhitneyUTest": MannWhitneyUtest,
        "OneWayANOVA": OneWayANOVA,
        "PairedTTest": PairedTTest,
        "WilcoxonSignedRankTest": WilcoxonSignedRankTest
    }

    # create the test object
    try:
        verify_session_access(http_request, request.sessionId)
        test_class = ACTION_MAP[request.action]
        test = test_class(sessionId=request.sessionId, store=dataset_store, **(request.params or {}))
    except HTTPException:
        raise
    except KeyError as exc:
        if request.action not in ACTION_MAP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Action {request.action} is not allowed.",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset session not found.",
        ) from exc
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as e:
        logger.exception("Unable to initialize statistical test")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to initialize statistical test.",
        ) from e

    # run the test
    try:
        result = test.run()
        report_entry = _store_full_report_entry(test.dataset.report, result, request)
    except HTTPException:
        raise
    except (TypeError, ValueError, KeyError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as e:
        logger.exception("Statistical test execution failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Statistical test execution failed.",
        ) from e

    # Return a dictionary, not a set
    return {"data": report_entry["result"], "report": report_entry}

