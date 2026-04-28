from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class Gender(str, Enum):
    male = "Male"
    female = "Female"


class ReportType(str, Enum):
    blood_test = "Blood Test"
    urine_test = "Urine Test"
    lipid_panel = "Lipid Panel"
    custom = "Custom"


class ReportStatus(str, Enum):
    normal = "Normal"
    abnormal = "Abnormal"
    pending = "Pending"


class PatientCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    age: int = Field(..., ge=0, le=130)
    gender: Gender
    contact_number: str = Field(..., min_length=7, max_length=20)


class PatientUpdate(PatientCreate):
    pass


class ReportBase(BaseModel):
    report_type: ReportType
    custom_report_type: str | None = Field(default=None, max_length=80)
    report_date: date
    result_value: float | None = None
    unit: str | None = Field(default=None, max_length=30)
    reference_min: float | None = None
    reference_max: float | None = None

    @field_validator("custom_report_type")
    @classmethod
    def clean_custom_type(cls, value: str | None) -> str | None:
        if value is None:
            return value
        stripped = value.strip()
        return stripped or None


class ReportCreate(ReportBase):
    pass


class ReportUpdate(ReportBase):
    pass


class ReportRead(ReportBase):
    id: int
    patient_id: int
    patient_name: str | None = None
    status: ReportStatus
    file_name: str | None = None
    file_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PatientRead(PatientCreate):
    id: int
    patient_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PatientDetail(PatientRead):
    reports: list[ReportRead] = []


class DashboardSummary(BaseModel):
    total_patients: int
    total_reports: int
    abnormal_reports: int
    reports_uploaded_today: int
