from fastapi import FastAPI
from app.routes.routes import router
from starlette.middleware.sessions import SessionMiddleware
from app.routes.session import sessionRouter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="StatisLab")


origins = ["http://localhost:3000"]

# to include CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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


@app.get("/")
def root():
    return {"message": "Welcome to StatisLab V1!"}

