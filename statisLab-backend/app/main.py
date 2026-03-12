from fastapi import FastAPI
from app.api.routes import router
from starlette.middleware.sessions import SessionMiddleware
from app.api.session import sessionRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os


app = FastAPI(title="StatisLab")


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
    allow_origin_regex=r"https://.*\.hf\.space",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# to include the secret key
app.add_middleware(
    SessionMiddleware, 
    secret_key="dev-secret-key", # add it as anv var later
    max_age=60 * 60 * 5 # give each visitors 5 hours max
)

#include routes from routes.py
app.include_router(router)
app.include_router(sessionRouter)

# to enable the plots be shown on the front end:
# Ensure the directory exists
if not os.path.exists("plots"):
    os.makedirs("plots")

app.mount("/static_plots", StaticFiles(directory="plots"), name="static")

@app.get("/")
def root():
    return {"message": "Welcome to StatisLab V1!"}

