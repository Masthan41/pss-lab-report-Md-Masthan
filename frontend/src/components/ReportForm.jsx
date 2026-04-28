import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { api } from "../api.js";

const blank = {
  report_type: "Blood Test",
  custom_report_type: "",
  report_date: new Date().toISOString().slice(0, 10),
  result_value: "",
  unit: "mg/dL",
  reference_min: "",
  reference_max: "",
  file: null,
};

export default function ReportForm({ patientId, report, onSaved, onCancel }) {
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (report) {
      setForm({
        report_type: report.report_type,
        custom_report_type: report.custom_report_type || "",
        report_date: report.report_date,
        result_value: report.result_value ?? "",
        unit: report.unit || "",
        reference_min: report.reference_min ?? "",
        reference_max: report.reference_max ?? "",
        file: null,
      });
    } else {
      setForm(blank);
    }
  }, [report]);

  const validate = () => {
    const next = {};
    if (!form.report_date) next.report_date = "Report date is required.";
    if (form.report_type === "Custom" && !form.custom_report_type.trim()) {
      next.custom_report_type = "Name the custom report type.";
    }
    const hasMin = form.reference_min !== "";
    const hasMax = form.reference_max !== "";
    if (hasMin && hasMax && Number(form.reference_min) > Number(form.reference_max)) {
      next.reference = "Minimum range cannot exceed maximum range.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "file") return;
      if (value !== "") data.append(key, value);
    });
    if (form.file) data.append("file", form.file);
    try {
      if (report) await api.updateReport(report.id, data);
      else await api.createReport(patientId, data);
      setForm(blank);
      await onSaved();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-4">
      <Field label="Report Type">
        <select className="input" value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })}>
          <option>Blood Test</option>
          <option>Urine Test</option>
          <option>Lipid Panel</option>
          <option>Custom</option>
        </select>
      </Field>
      {form.report_type === "Custom" && (
        <Field label="Custom Type" error={errors.custom_report_type}>
          <input className="input" value={form.custom_report_type} onChange={(e) => setForm({ ...form, custom_report_type: e.target.value })} />
        </Field>
      )}
      <Field label="Report Date" error={errors.report_date}>
        <input className="input" type="date" value={form.report_date} onChange={(e) => setForm({ ...form, report_date: e.target.value })} />
      </Field>
      <Field label="Result Value">
        <input className="input" type="number" step="any" value={form.result_value} onChange={(e) => setForm({ ...form, result_value: e.target.value })} />
      </Field>
      <Field label="Unit">
        <input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
      </Field>
      <Field label="Reference Min" error={errors.reference}>
        <input className="input" type="number" step="any" value={form.reference_min} onChange={(e) => setForm({ ...form, reference_min: e.target.value })} />
      </Field>
      <Field label="Reference Max">
        <input className="input" type="number" step="any" value={form.reference_max} onChange={(e) => setForm({ ...form, reference_max: e.target.value })} />
      </Field>
      <Field label="Report File">
        <input className="input file:mr-3 file:rounded file:border-0 file:bg-teal-50 file:px-3 file:py-1 file:text-clinical" type="file" accept=".pdf,image/*" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />
      </Field>
      <div className="flex items-end gap-2">
        <button className="btn-primary" disabled={saving}>
          <Save size={16} />
          {saving ? "Saving" : report ? "Update" : "Upload"}
        </button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
      {errors.form && <p className="text-sm font-semibold text-alert md:col-span-4">{errors.form}</p>}
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="space-y-1 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
      {error && <span className="block text-xs text-alert">{error}</span>}
    </label>
  );
}
