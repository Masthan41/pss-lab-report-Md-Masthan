import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const LabContext = createContext(null);

export function LabProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [patientList, reportList, summaryData] = await Promise.all([
        api.patients(),
        api.reports(),
        api.summary(),
      ]);
      setPatients(patientList);
      setReports(reportList);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      patients,
      reports,
      summary,
      loading,
      error,
      refresh,
      globalSearch,
      setGlobalSearch,
    }),
    [patients, reports, summary, loading, error, refresh, globalSearch]
  );

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab() {
  const context = useContext(LabContext);
  if (!context) throw new Error("useLab must be used inside LabProvider");
  return context;
}
