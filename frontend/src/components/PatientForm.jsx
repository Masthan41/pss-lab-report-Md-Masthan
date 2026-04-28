import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../api.js";

const initialForm = { name: "", age: "", gender: "Male", contact_number: "" };

export default function PatientForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters.";
    if (!form.age || Number(form.age) < 0 || Number(form.age) > 130) next.age = "Enter a valid age.";
    if (form.contact_number.trim().length < 7) next.contact_number = "Enter a valid contact number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await api.createPatient({ ...form, age: Number(form.age) });
      setForm(initialForm);
      await onCreated();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-5">
      <Field label="Name" error={errors.name}>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="Age" error={errors.age}>
        <input className="input" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
      </Field>
      <Field label="Gender">
        <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </Field>
      <Field label="Contact" error={errors.contact_number}>
        <input className="input" value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
      </Field>
      <div className="flex items-end">
        <button className="btn-primary w-full" disabled={saving}>
          <Plus size={16} />
          {saving ? "Saving" : "Add Patient"}
        </button>
      </div>
      {errors.form && <p className="text-sm font-semibold text-alert md:col-span-5">{errors.form}</p>}
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
