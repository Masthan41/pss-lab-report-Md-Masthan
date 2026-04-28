from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.services import report_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=schemas.DashboardSummary)
def summary(db: Session = Depends(get_db)):
    total_patients = db.scalar(select(func.count(models.Patient.id))) or 0
    total_reports = db.scalar(select(func.count(models.Report.id))) or 0
    abnormal_reports = db.scalar(
        select(func.count(models.Report.id)).where(models.Report.status == "Abnormal")
    ) or 0
    uploaded_today = db.scalar(
        select(func.count(models.Report.id)).where(func.date(models.Report.created_at) == date.today())
    ) or 0
    return schemas.DashboardSummary(
        total_patients=total_patients,
        total_reports=total_reports,
        abnormal_reports=abnormal_reports,
        reports_uploaded_today=uploaded_today,
    )


@router.get("/recent-reports", response_model=list[schemas.ReportRead])
def recent_reports(
    status: schemas.ReportStatus | None = None, db: Session = Depends(get_db)
):
    reports = report_service.list_reports(
        db, status=status.value if status else None, limit=10
    )
    return [report_service.report_to_read(report) for report in reports]
