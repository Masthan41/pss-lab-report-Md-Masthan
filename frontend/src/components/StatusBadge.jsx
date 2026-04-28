const styles = {
  Normal: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Abnormal: "bg-red-50 text-red-700 ring-red-200",
  Pending: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles[status] || styles.Pending}`}>
      {status || "Pending"}
    </span>
  );
}
