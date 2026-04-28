# Patient Lab Report Management System

A mini full-stack Patient Lab Report Management System for clinic lab staff. It supports patient records, lab report upload, abnormal result flagging, dashboard summaries, and patient/report search filters.

## Tech Stack

- Frontend: React, React Router, Context API, Tailwind CSS, lucide-react icons
- Backend: FastAPI, Pydantic, SQLAlchemy
- Database: SQLite
- File storage: Local `backend/uploads/`

## Project Structure

```text
backend/
  app/
    routers/       REST route modules
    services/      patient/report business logic
    database.py    SQLite connection and session dependency
    main.py        FastAPI app entrypoint
    models.py      SQLAlchemy models
    schemas.py     Pydantic schemas
  schema.sql       SQL schema reference
  requirements.txt
  uploads/
frontend/
  src/
    components/
    pages/
    state/
    api.js
```

## Run Locally

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173` or `http://localhost:5173`.

On Windows PowerShell, if `npm` is blocked by script execution policy, use `cmd /c npm install` and `cmd /c npm run dev`.

## Status Logic

Report status is computed on create/update:

- `Pending`: missing result value or reference range
- `Abnormal`: result value is below reference minimum or above reference maximum
- `Normal`: result value is within the reference range

## API Docs

Interactive FastAPI docs are available at `http://127.0.0.1:8000/docs`.

### Patients

`POST /api/patients`

Request:

```json
{
  "name": "Asha Mehta",
  "age": 34,
  "gender": "Female",
  "contact_number": "9876543210"
}
```

Response:

```json
{
  "id": 1,
  "patient_id": "PSS-00001",
  "name": "Asha Mehta",
  "age": 34,
  "gender": "Female",
  "contact_number": "9876543210",
  "created_at": "2026-04-28T10:00:00"
}
```

`GET /api/patients?search=asha`

Returns all patients, optionally filtered by patient name or patient ID.

`GET /api/patients/{patient_pk}`

Returns patient details and all associated reports.

### Reports

`POST /api/reports/patients/{patient_pk}`

Multipart form fields:

- `report_type`: `Blood Test`, `Urine Test`, `Lipid Panel`, or `Custom`
- `custom_report_type`: required only when report type is `Custom`
- `report_date`: date, for example `2026-04-28`
- `result_value`: number, optional
- `unit`: string, optional
- `reference_min`: number, optional
- `reference_max`: number, optional
- `file`: PDF or image file, optional

Response includes auto-computed `status`, `file_name`, and `file_url`.

`GET /api/reports`

Optional query filters:

- `report_type=Blood Test`
- `status=Abnormal`
- `start_date=2026-04-01`
- `end_date=2026-04-28`
- `limit=10`

`PUT /api/reports/{report_id}`

Updates report fields and recomputes status. Accepts the same multipart fields as create.

`DELETE /api/reports/{report_id}`

Deletes a report and removes its local uploaded file when present.

### Dashboard

`GET /api/dashboard/summary`

Response:

```json
{
  "total_patients": 12,
  "total_reports": 41,
  "abnormal_reports": 5,
  "reports_uploaded_today": 3
}
```

`GET /api/dashboard/recent-reports?status=Abnormal`

Returns the last 10 reports across all patients, optionally filtered by status.
