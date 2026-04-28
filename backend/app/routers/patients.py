from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.services import patient_service, report_service

router = APIRouter(prefix="/patients", tags=["patients"])


@router.post("", response_model=schemas.PatientRead, status_code=status.HTTP_201_CREATED)
def create_patient(payload: schemas.PatientCreate, db: Session = Depends(get_db)):
    return patient_service.create_patient(db, payload)


@router.get("", response_model=list[schemas.PatientRead])
def list_patients(search: str | None = None, db: Session = Depends(get_db)):
    return patient_service.list_patients(db, search)


@router.get("/{patient_pk}", response_model=schemas.PatientDetail)
def get_patient(patient_pk: int, db: Session = Depends(get_db)):
    patient = patient_service.get_patient(db, patient_pk)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    reports = [report_service.report_to_read(report) for report in patient.reports]
    return schemas.PatientDetail(
        id=patient.id,
        patient_id=patient.patient_id,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        contact_number=patient.contact_number,
        created_at=patient.created_at,
        reports=reports,
    )


@router.delete("/{patient_pk}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_pk: int, db: Session = Depends(get_db)):
    patient = patient_service.get_patient(db, patient_pk)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient_service.delete_patient(db, patient)
    return None
