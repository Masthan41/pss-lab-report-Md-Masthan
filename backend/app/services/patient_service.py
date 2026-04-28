from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app import models, schemas


def generate_patient_code(db: Session) -> str:
    last_patient = db.execute(
        select(models.Patient).order_by(models.Patient.id.desc())
    ).scalars().first()
    next_id = 1 if last_patient is None else last_patient.id + 1
    return f"PSS-{next_id:05d}"


def create_patient(db: Session, payload: schemas.PatientCreate) -> models.Patient:
    patient = models.Patient(
        patient_id=generate_patient_code(db),
        name=payload.name.strip(),
        age=payload.age,
        gender=payload.gender.value,
        contact_number=payload.contact_number.strip(),
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def list_patients(db: Session, search: str | None = None) -> list[models.Patient]:
    stmt = select(models.Patient).order_by(models.Patient.created_at.desc())
    if search:
        term = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(models.Patient.name.ilike(term), models.Patient.patient_id.ilike(term))
        )
    return list(db.execute(stmt).scalars().all())


def get_patient(db: Session, patient_pk: int) -> models.Patient | None:
    return db.execute(
        select(models.Patient)
        .options(selectinload(models.Patient.reports))
        .where(models.Patient.id == patient_pk)
    ).scalars().first()
