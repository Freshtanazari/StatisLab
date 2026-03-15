from pathlib import Path

from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import FileResponse

from ..shared.security import get_or_create_session_id
from ..shared.sharedResources import dataset_store


plot_router = APIRouter()


@plot_router.get("/plots/{file_name}")
async def get_plot(request: Request, file_name: str, sessionId: str | None = Query(default=None)):
    session_id = request.session.get("sessionId")

    if not session_id and sessionId:
        # Cookie can be missing in cross-site image requests; fallback to provided sessionId.
        try:
            dataset_store.getDataset(sessionId)
            request.session["sessionId"] = sessionId
            session_id = sessionId
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to access this plot session.",
            )

    if not session_id:
        session_id = get_or_create_session_id(request)

    plots_dir = (Path("plots") / session_id).resolve()
    plot_path = (plots_dir / file_name).resolve()

    if plots_dir not in plot_path.parents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plot path.",
        )

    if not plot_path.exists() or not plot_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plot not found.",
        )

    return FileResponse(plot_path)