
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.alerts import router as alerts_router
from app.database import engine, Base
from app.models.alert import Alert

app = FastAPI(
    title="IT Operations Alert Management Dashboard",
    description="A system for receiving and managing IT alerts.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables during normal application startup.
# Tests use a separate SQLite database.
if os.getenv("APP_ENV") != "test":
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "IT Operations Alert Management Dashboard"
    }


app.include_router(alerts_router)
