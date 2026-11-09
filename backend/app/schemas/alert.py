from pydantic import BaseModel, Field, field_validator
from typing import Literal

class AlertCreate(BaseModel):
    source: str = Field(min_length=2, max_length=100)
    message: str = Field(min_length=5, max_length=500)
    severity: Literal["critical", "warning", "info"]

    @field_validator("severity", mode="before")
    @classmethod
    def normalize_severity(cls, value):
        if isinstance(value, str):
            return value.strip().lower()
        return value