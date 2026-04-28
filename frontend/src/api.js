const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = await response.json();
      message = Array.isArray(body.detail)
        ? body.detail.map((item) => item.msg).join(", ")
        : body.detail || message;
    } catch {
      message = response.statusText;
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function getUploadUrl(path) {
  if (!path) return "";
  return `${API_BASE.replace("/api", "")}${path}`;
}

export const api = {
  summary: () => request("/dashboard/summary"),
  recentReports: (status = "") =>
    request(`/dashboard/recent-reports${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  patients: (search = "") =>
    request(`/patients${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  patient: (id) => request(`/patients/${id}`),
  createPatient: (payload) =>
    request("/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  deletePatient: (patientId) => request(`/patients/${patientId}`, { method: "DELETE" }),
  reports: (params = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    return request(`/reports${search.toString() ? `?${search}` : ""}`);
  },
  createReport: (patientId, formData) =>
    request(`/reports/patients/${patientId}`, { method: "POST", body: formData }),
  updateReport: (reportId, formData) =>
    request(`/reports/${reportId}`, { method: "PUT", body: formData }),
  deleteReport: (reportId) => request(`/reports/${reportId}`, { method: "DELETE" }),
};
