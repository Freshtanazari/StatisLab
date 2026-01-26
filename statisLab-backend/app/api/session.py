from fastapi import APIRouter, Request
import uuid

# create the router 
router = APIRouter(prefix="./session", tags=["session"])

@router.get("/")
def createSession(request: Request):
    """
    creates a session for any unique  vistor
    
    :param request: Description
    :type request: Request
    """

    if "sessionId" not in request.session:
        request.session["sessionId"] = str(uuid.uuid4())
        request.session["datasets"] = []
    
    return {
        "sessionId": request.session["sessionId"],
        "datasets": request.session["datasets"] 
        }