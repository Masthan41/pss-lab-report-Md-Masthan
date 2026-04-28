import { AlertTriangle, CalendarDays, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { useLab } from "../state/LabContext.jsx";

export default function Dashboard() {
  const { summary } = useLab();
  const [status, setStatus] = useState("");
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.recentReports(status).then(setRecent).catch(() => setRecent([]));
  }, [status]);

  const cards = [
    { label: "Total Patients", value: summary?.total_patients ?? 0, icon: Users },
    { label: "Total Reports", value: summary?.total_reports ?? 0, icon: FileText },
    { label: "Abnormal Reports", value: summary?.abnormal_reports ?? 0, icon: AlertTriangle },
    { label: "Uploaded Today", value: summary?.reports_uploaded_today ?? 0, icon: CalendarDays },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-slate-500">Overview of patients, uploaded reports, and flagged results.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-md border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <Icon className="text-clinical" size={20} />
            </div>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </article>
        ))}
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-bold">Recent Reports</h3>
          <select className="input sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option>Normal</option>
            <option>Abnormal</option>
            <option>Pending</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Report Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((report) => (
                <tr key={report.id}>
                  <td>{report.patient_name}</td>
                  <td>{report.report_type === "Custom" ? report.custom_report_type : report.report_type}</td>
                  <td>{report.report_date}</td>
                  <td><StatusBadge status={report.status} /></td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan="4" className="text-center text-slate-500">No reports found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
