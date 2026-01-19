from fastapi import FastAPI
from app.routes.routes import router

app = FastAPI(title="StatisLab")

from fastapi.middleware.cors import CORSMiddleware

origins = ["http://localhost:3000"]

# to include CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

#include routes from routes.py
app.include_router(router)


@app.get("/")
def root():
    return {"message": "Welcome to StatisLab V1!"}

