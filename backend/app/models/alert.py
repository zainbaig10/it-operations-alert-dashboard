
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func

from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(100), nullable=False)
    message = Column(String(500), nullable=False)
    severity = Column(
        Enum("critical", "warning", "info"),
        nullable=False
    )
    status = Column(
        Enum("new", "acknowledged", "resolved"),
        default="new",
        nullable=False
    )
    created_at = Column(DateTime, server_default=func.now())
