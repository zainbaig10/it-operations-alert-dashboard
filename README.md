# IT Operations Alert Management Dashboard

A full-stack IT operations dashboard for receiving, tracking, and managing infrastructure and application alerts.

The system provides a centralized interface where IT engineers can monitor incidents, filter alerts by severity and status, and manage their resolution.

## Features

- **Alert ingestion:** Receive alerts through a REST API.
- **Payload validation:** Validate incoming alert data.
- **Severity management:** Categorize alerts as Critical, Warning, or Info.
- **Incident tracking:** Track alerts through New, Acknowledged, and Resolved states.
- **Dashboard metrics:** View total alerts and severity/status breakdowns.
- **Search and filtering:** Search alerts and filter by severity or status.
- **Incident management:** Acknowledge and resolve alerts from the dashboard.
- **Persistent storage:** Store alert records in MySQL.
- **Automated testing:** Test API functionality using pytest.
- **Containerization:** Run the frontend, backend, and database using Docker Compose.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI |
| Database | MySQL 8.4 |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Testing | pytest, FastAPI TestClient |
| Containerization | Docker, Docker Compose |
| API Testing | Postman |

## Architecture

```text
             IT Systems / Alert Sources
                       |
                       v
                FastAPI REST API
                       |
              Payload Validation
                       |
                       v
                SQLAlchemy ORM
                       |
                       v
                  MySQL DB
                       |
                       v
                React Dashboard
                       |
              IT Operations Team
```

The application uses a multi-service Docker Compose environment:

- **Frontend:** React application served through Vite.
- **Backend:** FastAPI application exposing REST endpoints.
- **Database:** MySQL database with persistent Docker volume storage.

## Alert Lifecycle

```text
       New
        |
        v
  Acknowledged
        |
        v
     Resolved
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API health |
| POST | `/alerts/` | Create a new alert |
| GET | `/alerts/` | Retrieve alerts |
| GET | `/alerts/stats` | Retrieve dashboard metrics |
| GET | `/alerts/{alert_id}` | Retrieve a specific alert |
| PATCH | `/alerts/{alert_id}/acknowledge` | Acknowledge an alert |
| PATCH | `/alerts/{alert_id}/resolve` | Resolve an alert |

### Example: Create an Alert

**POST** `/alerts/`

Request body:

```json
{
  "source": "Payment API",
  "message": "Payment service is unavailable",
  "severity": "critical"
}
```

Supported severity values:

- `critical`
- `warning`
- `info`

## Getting Started

### Prerequisites

- Docker Desktop
- Docker Compose
- Git

### 1. Clone the repository

```bash
git clone https://github.com/zainbaig10/it-operations-alert-dashboard.git

cd it-operations-alert-dashboard
```

### 2. Start the application

```bash
docker compose up --build -d
```

This starts the MySQL database, FastAPI backend, and React frontend.

### 3. Access the application

| Service | URL |
|---|---|
| React Dashboard | http://localhost:5173 |
| FastAPI API | http://localhost:8000 |
| Swagger API Documentation | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

### 4. Stop the application

```bash
docker compose down
```

To remove containers and the persistent MySQL volume as well:

```bash
docker compose down -v
```

**Warning:** The second command permanently deletes the database data stored in that Docker volume.

## Running Backend Tests

The backend includes automated API tests using pytest and a separate temporary SQLite database.

Run locally from the backend directory:

```bash
cd backend

python3 -m venv .venv

source .venv/bin/activate

python -m pip install -r requirements.txt

python -m pytest -v
```

## Project Structure

```text
it-operations-alert-dashboard/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── .gitignore
```

## Current Scope

This is a portfolio MVP. Alerts can currently be submitted through the REST API, including manually through Postman or Swagger UI.

Live integrations with external monitoring platforms, authentication, role-based access control, and production deployment are not currently included.

## Future Improvements

- Integrate monitoring platforms and automated alert sources.
- Add authentication and role-based access control.
- Implement real-time alert updates.
- Add incident history and audit logs.
- Add production deployment and monitoring.
- Improve alert prioritization and escalation workflows.

## Author

**Zain Baig**

GitHub: https://github.com/zainbaig10

---

Built as a hands-on project to demonstrate full-stack development, REST API design, database integration, automated testing, and containerization.
