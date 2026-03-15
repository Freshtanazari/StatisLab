try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    load_dotenv = None

if load_dotenv is not None:
    load_dotenv()

from fastapi import FastAPI
from app.api.analysis.test import test_router
from app.api.Status.status import status_router
from app.api.upload.upload import uploader_router
from app.api.update.getTable import getTable_router
from app.api.analysis.descriptive import descriptive_router
from app.api.download.downloadLog import downloadLog_router
from app.api.update.getReport import getReport_router
from app.api.analysis.visualizer import visualizer_router
from app.api.analysis.plots import plot_router
from app.api.preprocess.preprocess import preprocessor_router
from starlette.middleware.sessions import SessionMiddleware
from app.api.session import sessionRouter
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
import secrets


app = FastAPI(title="StatisLab")

MIN_SESSION_SECONDS = 60 * 60 * 5

app_env = os.getenv("APP_ENV", "development").lower()
session_secret = os.getenv("SESSION_SECRET_KEY")
session_same_site = os.getenv(
    "SESSION_SAMESITE",
    "none" if app_env == "production" else "lax",
).lower()
configured_session_max_age = int(os.getenv("SESSION_MAX_AGE_SECONDS", str(MIN_SESSION_SECONDS)))
session_max_age = max(configured_session_max_age, MIN_SESSION_SECONDS)
if not session_secret:
    if app_env == "production":
        raise RuntimeError("SESSION_SECRET_KEY must be set in production.")
    session_secret = secrets.token_urlsafe(32)
    logging.getLogger(__name__).warning(
        "SESSION_SECRET_KEY is not set; using an ephemeral development secret."
    )

# to include the secret key
app.add_middleware(
    SessionMiddleware, 
    secret_key=session_secret,
    max_age=session_max_age,
    same_site=session_same_site,
    https_only=app_env == "production",
)

configured_origins = os.getenv("ALLOWED_ORIGINS")
if configured_origins:
    origins = [origin.strip() for origin in configured_origins.split(",") if origin.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://statis-lab-m32l-fnn4eyc3l-freshtanazari0m-9260s-projects.vercel.app",
    ]

 
# to include CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#include routes from routes.py

app.include_router(sessionRouter)
app.include_router(status_router)
app.include_router(uploader_router)
app.include_router(preprocessor_router)
app.include_router(getTable_router)
app.include_router(downloadLog_router)
app.include_router(descriptive_router)
app.include_router(visualizer_router)
app.include_router(plot_router)
app.include_router(test_router)
app.include_router(getReport_router)

# include the status route


@app.get("/")
def root():
    return {"message": "Welcome to StatisLab V1!"}

