CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 130),
  gender TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  report_type TEXT NOT NULL,
  custom_report_type TEXT,
  report_date DATE NOT NULL,
  result_value REAL,
  unit TEXT,
  reference_min REAL,
  reference_max REAL,
  status TEXT NOT NULL,
  file_name TEXT,
  file_path TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS ix_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS ix_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS ix_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS ix_reports_date ON reports(report_date);
