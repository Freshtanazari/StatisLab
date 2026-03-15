from fastapi import APIRouter, Request
from .shared.security import get_or_create_session_id

# create the router 
sessionRouter = APIRouter(prefix="/session", tags=["session"])

@sessionRouter.get("/")
def createSession(request: Request):
    """
    creates a session for any unique  vistor
    
    :param request: Description
    :type request: Request
    """
    session_id = get_or_create_session_id(request)
    
    return {
        "sessionId": session_id,
        }