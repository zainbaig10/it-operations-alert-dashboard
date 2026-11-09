
import os

# Tell the application to use test mode before importing it.
os.environ["APP_ENV"] = "test"

import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base
from app.routes.alerts import get_db


@pytest.fixture
def client(tmp_path):
    # Create a separate temporary SQLite database.
    database_file = tmp_path / "test.db"

    test_engine = create_engine(
        f"sqlite:///{database_file}",
        connect_args={"check_same_thread": False}
    )

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )

    # Create tables in the test database.
    Base.metadata.create_all(bind=test_engine)

    # Replace the normal database dependency.
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    # Clean up after each test.
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


def create_test_alert(client):
    response = client.post(
        "/alerts/",
        json={
            "source": "Test Monitoring Service",
            "message": "Database connection failed",
            "severity": "critical"
        }
    )

    assert response.status_code in (200, 201)
    return response.json()["alert"]["id"]


def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_and_list_alert(client):
    create_test_alert(client)

    response = client.get("/alerts/")

    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert len(response.json()["alerts"]) == 1


def test_invalid_alert_is_rejected(client):
    response = client.post(
        "/alerts/",
        json={
            "source": "Test Service",
            "message": "Database connection failed",
            "severity": "urgent"
        }
    )

    assert response.status_code == 422


def test_acknowledge_and_resolve_alert(client):
    alert_id = create_test_alert(client)

    acknowledge_response = client.patch(
        f"/alerts/{alert_id}/acknowledge"
    )

    assert acknowledge_response.status_code == 200

    alerts_response = client.get("/alerts/")
    alert = alerts_response.json()["alerts"][0]

    assert alert["status"] == "acknowledged"

    resolve_response = client.patch(
        f"/alerts/{alert_id}/resolve"
    )

    assert resolve_response.status_code == 200

    alerts_response = client.get("/alerts/")
    alert = alerts_response.json()["alerts"][0]

    assert alert["status"] == "resolved"


def test_missing_alert_returns_404(client):
    response = client.get("/alerts/99999")

    assert response.status_code == 404
