from datetime import date

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.services import patient_service, report_service

router = APIRouter(prefix="/reports", tags=["reports"])


def form_payload(
    report_type: schemas.ReportType = Form(...),
    report_date: date = Form(...),
    result_value: float | None = Form(None),
    unit: str | None = Form(None),
    reference_min: float | None = Form(None),
    reference_max: float | None = Form(None),
    custom_report_type: str | None = Form(None),
) -> schemas.ReportCreate:
    try:
        return schemas.ReportCreate(
            report_type=report_type,
            custom_report_type=custom_report_type,
            report_date=report_date,
            result_value=result_value,
            unit=unit,
            reference_min=reference_min,
            reference_max=reference_max,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post(
    "/patients/{patient_pk}",
    response_model=schemas.ReportRead,
    status_code=status.HTTP_201_CREATED,
)
def create_report(
    patient_pk: int,
    payload: schemas.ReportCreate = Depends(form_payload),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    if patient_service.get_patient(db, patient_pk) is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    try:
        report = report_service.create_report(db, patient_pk, payload, file)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    report = report_service.get_report(db, report.id)
    return report_service.report_to_read(report)


@router.get("", response_model=list[schemas.ReportRead])
def list_reports(
    status: schemas.ReportStatus | None = None,
    report_type: schemas.ReportType | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int | None = None,
    db: Session = Depends(get_db),
):
    reports = report_service.list_reports(
        db,
        status=status.value if status else None,
        report_type=report_type.value if report_type else None,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
    )
    return [report_service.report_to_read(report) for report in reports]


@router.put("/{report_id}", response_model=schemas.ReportRead)
def update_report(
    report_id: int,
    payload: schemas.ReportUpdate = Depends(form_payload),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    report = report_service.get_report(db, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    try:
        updated = report_service.update_report(db, report, payload, file)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    updated = report_service.get_report(db, updated.id)
    return report_service.report_to_read(updated)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = report_service.get_report(db, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    report_service.delete_report(db, report)
    return None
