
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.alert import AlertCreate
from app.models.alert import Alert
from app.database import SessionLocal

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def receive_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    db_alert = Alert(
        source=alert.source,
        message=alert.message,
        severity=alert.severity
    )

    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)

    return {
        "status": "received",
        "message": "Alert successfully saved",
        "alert": {
            "id": db_alert.id,
            "source": db_alert.source,
            "message": db_alert.message,
            "severity": db_alert.severity,
            "status": db_alert.status,
            "created_at": db_alert.created_at
        }
    }




@router.get("/")
def get_alerts(
    severity: str | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)

    if severity:
        query = query.filter(Alert.severity == severity)

    if status:
        query = query.filter(Alert.status == status)

    alerts = query.order_by(Alert.created_at.desc()).all()

    return {
        "total": len(alerts),
        "alerts": [
            {
                "id": alert.id,
                "source": alert.source,
                "message": alert.message,
                "severity": alert.severity,
                "status": alert.status,
                "created_at": alert.created_at
            }
            for alert in alerts
        ]
    }

@router.get("/stats")
def get_alert_stats(db: Session = Depends(get_db)):

    total_alerts = db.query(Alert).count()

    critical = db.query(Alert).filter(
        Alert.severity == "critical"
    ).count()

    warning = db.query(Alert).filter(
        Alert.severity == "warning"
    ).count()

    info = db.query(Alert).filter(
        Alert.severity == "info"
    ).count()

    new = db.query(Alert).filter(
        Alert.status == "new"
    ).count()

    acknowledged = db.query(Alert).filter(
        Alert.status == "acknowledged"
    ).count()

    resolved = db.query(Alert).filter(
        Alert.status == "resolved"
    ).count()

    return {
        "total_alerts": total_alerts,
        "critical": critical,
        "warning": warning,
        "info": info,
        "new": new,
        "acknowledged": acknowledged,
        "resolved": resolved
    }

@router.get("/{alert_id}")
def get_alert_by_id(
    alert_id: int,
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return {
        "id": alert.id,
        "source": alert.source,
        "message": alert.message,
        "severity": alert.severity,
        "status": alert.status,
        "created_at": alert.created_at
    }

@router.patch("/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    alert.status = "acknowledged"

    db.commit()
    db.refresh(alert)

    return {
        "message": "Alert acknowledged successfully",
        "alert": {
            "id": alert.id,
            "source": alert.source,
            "severity": alert.severity,
            "status": alert.status
        }
    }

@router.patch("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    alert.status = "resolved"

    db.commit()
    db.refresh(alert)

    return {
        "message": "Alert resolved successfully",
        "alert": {
            "id": alert.id,
            "source": alert.source,
            "severity": alert.severity,
            "status": alert.status
        }
    }

