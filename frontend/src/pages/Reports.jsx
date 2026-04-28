import { useEffect, useState } from "react";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function Reports() {
  const [filters, setFilters] = useState({ report_type: "", status: "", start_date: "", end_date: "" });
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.reports(filters).then(setReports).catch(() => setReports([]));
  }, [filters]);

  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="text-sm text-slate-500">Filter all reports by type, status, and date range.</p>
      </div>

      <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-4">
        <select className="input" value={filters.report_type} onChange={(e) => update("report_type", e.target.value)}>
          <option value="">All Types</option>
          <option>Blood Test</option>
          <option>Urine Test</option>
          <option>Lipid Panel</option>
          <option>Custom</option>
        </select>
        <select className="input" value={filters.status} onChange={(e) => update("status", e.target.value)}>
          <option value="">All Statuses</option>
          <option>Normal</option>
          <option>Abnormal</option>
          <option>Pending</option>
        </select>
        <input className="input" type="date" value={filters.start_date} onChange={(e) => update("start_date", e.target.value)} />
        <input className="input" type="date" value={filters.end_date} onChange={(e) => update("end_date", e.target.value)} />
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Type</th>
                <th>Date</th>
                <th>Result</th>
                <th>Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.patient_name}</td>
                  <td>{report.report_type === "Custom" ? report.custom_report_type : report.report_type}</td>
                  <td>{report.report_date}</td>
                  <td>{report.result_value ?? "Pending"} {report.unit}</td>
                  <td>{report.reference_min ?? "-"} - {report.reference_max ?? "-"}</td>
                  <td><StatusBadge status={report.status} /></td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan="6" className="text-center text-slate-500">No reports match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
