import shutil
from datetime import date
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy import and_, select
from sqlalchemy.orm import Session, joinedload

from app import models, schemas

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def compute_status(
    result_value: float | None, reference_min: float | None, reference_max: float | None
) -> str:
    if result_value is None or reference_min is None or reference_max is None:
        return schemas.ReportStatus.pending.value
    if reference_min > reference_max:
        raise ValueError("Reference minimum cannot be greater than reference maximum.")
    if result_value < reference_min or result_value > reference_max:
        return schemas.ReportStatus.abnormal.value
    return schemas.ReportStatus.normal.value


def store_upload(file: UploadFile | None) -> tuple[str | None, str | None]:
    if file is None or not file.filename:
        return None, None
    suffix = Path(file.filename).suffix
    stored_name = f"{uuid4().hex}{suffix}"
    destination = UPLOAD_DIR / stored_name
    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return file.filename, str(destination)


def report_to_read(report: models.Report) -> schemas.ReportRead:
    file_url = f"/uploads/{Path(report.file_path).name}" if report.file_path else None
    return schemas.ReportRead(
        id=report.id,
        patient_id=report.patient_id,
        patient_name=report.patient.name if report.patient else None,
        report_type=report.report_type,
        custom_report_type=report.custom_report_type,
        report_date=report.report_date,
        result_value=report.result_value,
        unit=report.unit,
        reference_min=report.reference_min,
        reference_max=report.reference_max,
        status=report.status,
        file_name=report.file_name,
        file_url=file_url,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )


def create_report(
    db: Session, patient_pk: int, payload: schemas.ReportCreate, file: UploadFile | None = None
) -> models.Report:
    status = compute_status(payload.result_value, payload.reference_min, payload.reference_max)
    file_name, file_path = store_upload(file)
    report = models.Report(
        patient_id=patient_pk,
        report_type=payload.report_type.value,
        custom_report_type=payload.custom_report_type,
        report_date=payload.report_date,
        result_value=payload.result_value,
        unit=payload.unit,
        reference_min=payload.reference_min,
        reference_max=payload.reference_max,
        status=status,
        file_name=file_name,
        file_path=file_path,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def list_reports(
    db: Session,
    status: str | None = None,
    report_type: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int | None = None,
) -> list[models.Report]:
    filters = []
    if status:
        filters.append(models.Report.status == status)
    if report_type:
        filters.append(models.Report.report_type == report_type)
    if start_date:
        filters.append(models.Report.report_date >= start_date)
    if end_date:
        filters.append(models.Report.report_date <= end_date)

    stmt = select(models.Report).options(joinedload(models.Report.patient)).order_by(
        models.Report.created_at.desc()
    )
    if filters:
        stmt = stmt.where(and_(*filters))
    if limit:
        stmt = stmt.limit(limit)
    return list(db.execute(stmt).scalars().all())


def get_report(db: Session, report_id: int) -> models.Report | None:
    return db.execute(
        select(models.Report)
        .options(joinedload(models.Report.patient))
        .where(models.Report.id == report_id)
    ).scalars().first()


def update_report(
    db: Session,
    report: models.Report,
    payload: schemas.ReportUpdate,
    file: UploadFile | None = None,
) -> models.Report:
    report.report_type = payload.report_type.value
    report.custom_report_type = payload.custom_report_type
    report.report_date = payload.report_date
    report.result_value = payload.result_value
    report.unit = payload.unit
    report.reference_min = payload.reference_min
    report.reference_max = payload.reference_max
    report.status = compute_status(payload.result_value, payload.reference_min, payload.reference_max)
    if file is not None and file.filename:
        report.file_name, report.file_path = store_upload(file)
    db.commit()
    db.refresh(report)
    return report


def delete_report(db: Session, report: models.Report) -> None:
    if report.file_path:
        Path(report.file_path).unlink(missing_ok=True)
    db.delete(report)
    db.commit()
