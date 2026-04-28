import { Download, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, getUploadUrl } from "../api.js";
import ReportForm from "../components/ReportForm.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useLab } from "../state/LabContext.jsx";

export default function PatientDetail() {
  const { id } = useParams();
  const { refresh } = useLab();
  const [patient, setPatient] = useState(null);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  const loadPatient = async () => {
    const data = await api.patient(id);
    data.reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setPatient(data);
  };

  useEffect(() => {
    loadPatient().catch(() => setPatient(null));
  }, [id]);

  const saved = async () => {
    setEditing(null);
    setMessage("Report saved.");
    await Promise.all([loadPatient(), refresh()]);
  };

  const remove = async (reportId) => {
    if (!confirm("Delete this report?")) return;
    await api.deleteReport(reportId);
    await Promise.all([loadPatient(), refresh()]);
  };

  if (!patient) return <p className="text-sm text-slate-500">Loading patient profile...</p>;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="link" to="/patients">Back to patients</Link>
          <h2 className="mt-2 text-2xl font-bold">{patient.name}</h2>
          <p className="text-sm text-slate-500">{patient.patient_id}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Info label="Age" value={patient.age} />
          <Info label="Gender" value={patient.gender} />
          <Info label="Contact" value={patient.contact_number} />
          <Info label="Reports" value={patient.reports.length} />
        </div>
      </div>

      <ReportForm patientId={patient.id} report={editing} onSaved={saved} onCancel={() => setEditing(null)} />
      {message && <p className="text-sm font-semibold text-clinical">{message}</p>}

      <div className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h3 className="font-bold">Associated Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Value</th>
                <th>Reference</th>
                <th>Status</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patient.reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.report_type === "Custom" ? report.custom_report_type : report.report_type}</td>
                  <td>{report.report_date}</td>
                  <td>{report.result_value ?? "Pending"} {report.unit}</td>
                  <td>{report.reference_min ?? "-"} - {report.reference_max ?? "-"}</td>
                  <td><StatusBadge status={report.status} /></td>
                  <td>
                    {report.file_url ? (
                      <a className="icon-link" href={getUploadUrl(report.file_url)} target="_blank" rel="noreferrer" title="Open report file">
                        <Download size={16} /> Open
                      </a>
                    ) : "No file"}
                  </td>
                  <td className="space-x-2">
                    <button className="icon-button" onClick={() => setEditing(report)} title="Edit report"><Pencil size={16} /></button>
                    <button className="icon-button text-alert" onClick={() => remove(report.id)} title="Delete report"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {patient.reports.length === 0 && (
                <tr><td colSpan="7" className="text-center text-slate-500">No reports uploaded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
