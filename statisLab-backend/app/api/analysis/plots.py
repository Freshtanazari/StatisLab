from pathlib import Path

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import FileResponse

from ..shared.security import get_or_create_session_id


plot_router = APIRouter()


@plot_router.get("/plots/{file_name}")
async def get_plot(request: Request, file_name: str):
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