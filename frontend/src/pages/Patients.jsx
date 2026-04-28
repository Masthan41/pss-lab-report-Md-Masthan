import { Link } from "react-router-dom";
import PatientForm from "../components/PatientForm.jsx";
import { useLab } from "../state/LabContext.jsx";

export default function Patients() {
  const { patients, globalSearch, refresh, loading, error } = useLab();
  const term = globalSearch.toLowerCase();
  const filtered = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(term) ||
      patient.patient_id.toLowerCase().includes(term)
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Patients</h2>
        <p className="text-sm text-slate-500">Create patient records and open profiles for report history.</p>
      </div>

      <PatientForm onCreated={refresh} />
      {error && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-alert">{error}</p>}

      <div className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h3 className="font-bold">Patient List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <tr key={patient.id}>
                  <td className="font-semibold text-clinical">{patient.patient_id}</td>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.contact_number}</td>
                  <td><Link className="link" to={`/patients/${patient.id}`}>View</Link></td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan="6" className="text-center text-slate-500">No patients found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
