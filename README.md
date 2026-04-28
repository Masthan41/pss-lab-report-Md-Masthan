# Patient Lab Report Management System

A mini full-stack Patient Lab Report Management System for clinic lab staff. It supports patient records, lab report upload, abnormal result flagging, dashboard summaries, and patient/report search filters.

## Tech Stack

- Frontend: React, React Router, Context API, Tailwind CSS, lucide-react icons
- Backend: FastAPI, Pydantic, SQLAlchemy
- Database: SQLite
- File storage: Local `backend/uploads/`

## Setup Steps

1. Install Python 3.11 or newer.
2. Install Node.js 20 or newer.
3. Clone or open this project folder.
4. Create and activate a Python virtual environment inside `backend`.
5. Install backend dependencies from `backend/requirements.txt`.
6. Install frontend dependencies from `frontend/package.json`.
7. Start the backend server.
8. Start the frontend development server.

## Environment Variables

No environment variables are required for the default local setup.

The frontend supports this optional variable:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

If this variable is not set, the frontend automatically uses:

```text
http://127.0.0.1:8000/api
```

Optional frontend `.env` example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

The backend currently uses local SQLite by default:

```text
backend/lab_reports.db
```

Uploaded files are stored locally in:

```text
backend/uploads/
```

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

From the project root:

```powershell
cd "C:\Users\91984\OneDrive\Desktop\PSS Assignment\backend"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

If the virtual environment does not exist yet:

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173` or `http://localhost:5173`.

On Windows PowerShell, if `npm` is blocked by script execution policy, use `cmd /c npm install` and `cmd /c npm run dev`.

## AI Usage Log

AI assistance was used during development for:

- Scaffolding the React + FastAPI project structure.
- Creating FastAPI routers, Pydantic schemas, SQLAlchemy models, and service-layer logic.
- Building frontend pages, reusable components, routing, Context API state, and Tailwind styling.
- Debugging local setup issues, including Python virtual environment problems and a blank React screen caused by missing Vite React configuration.
- Adding patient delete functionality and date labels in the Reports filter UI.
- Drafting README documentation and interview explanation notes.

All generated code was reviewed, run locally where possible, and adjusted to match the assignment requirements.

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

`DELETE /api/patients/{patient_pk}`

Deletes a patient, all associated reports, and uploaded files for those reports.

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
