import logging
import uuid

from fastapi import HTTPException, Request, status
from .sharedResources import dataset_store


logger = logging.getLogger(__name__)


def get_or_create_session_id(request: Request) -> str:
    session_id = request.session.get("sessionId")
    if not session_id:
        session_id = str(uuid.uuid4())
        request.session["sessionId"] = session_id
    return session_id


def verify_session_access(request: Request, session_id: str) -> str:
    active_session_id = request.session.get("sessionId")

    if not active_session_id:
        # In cross-site deployments some browsers may drop the session cookie.
        # If the requested session still exists in the store, rebind it.
        try:
            dataset_store.getDataset(session_id)
        except KeyError:
            logger.warning(
                "Session access denied because no active cookie and dataset session %s was not found",
                session_id,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to access this session.",
            )

        request.session["sessionId"] = session_id
        logger.info("Recovered missing session cookie for session %s", session_id)
        return session_id

    if active_session_id != session_id:
        logger.warning(
            "Session access denied for requested session %s", session_id
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this session.",
        )
    return active_session_id