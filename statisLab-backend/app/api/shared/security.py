import logging
import uuid

from fastapi import HTTPException, Request, status


logger = logging.getLogger(__name__)


def get_or_create_session_id(request: Request) -> str:
    session_id = request.session.get("sessionId")
    if not session_id:
        session_id = str(uuid.uuid4())
        request.session["sessionId"] = session_id
    return session_id


def verify_session_access(request: Request, session_id: str) -> str:
    active_session_id = get_or_create_session_id(request)
    if active_session_id != session_id:
        logger.warning(
            "Session access denied for requested session %s", session_id
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this session.",
        )
    return active_session_id