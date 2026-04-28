import { Activity, LayoutDashboard, Search, Users } from "lucide-react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import PatientDetail from "./pages/PatientDetail.jsx";
import Patients from "./pages/Patients.jsx";
import Reports from "./pages/Reports.jsx";
import { useLab } from "./state/LabContext.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/reports", label: "Reports", icon: Activity },
];

export default function App() {
  const navigate = useNavigate();
  const { globalSearch, setGlobalSearch, patients } = useLab();

  const submitSearch = (event) => {
    event.preventDefault();
    navigate("/patients");
  };

  const matchedPatients = globalSearch
    ? patients.filter((patient) => {
        const term = globalSearch.toLowerCase();
        return (
          patient.name.toLowerCase().includes(term) ||
          patient.patient_id.toLowerCase().includes(term)
        );
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-clinical">PSS Automate</p>
          <h1 className="mt-2 text-2xl font-bold">Lab Reports</h1>
        </div>
        <nav className="space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ${
                  isActive ? "bg-teal-50 text-clinical" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <Activity className="text-clinical" />
              <span className="text-lg font-bold">Lab Reports</span>
            </div>
            <form className="relative w-full lg:max-w-xl" onSubmit={submitSearch}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Search by patient name or ID"
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-clinical focus:ring-2 focus:ring-teal-100"
              />
              {matchedPatients.length > 0 && (
                <div className="absolute mt-2 w-full rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                  {matchedPatients.slice(0, 4).map((patient) => (
                    <button
                      type="button"
                      key={patient.id}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      <span className="font-semibold">{patient.name}</span>
                      <span className="ml-2 text-slate-500">{patient.patient_id}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>
            <nav className="flex gap-2 lg:hidden">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-xs font-semibold ${
                      isActive ? "bg-teal-50 text-clinical" : "bg-white text-slate-600"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
