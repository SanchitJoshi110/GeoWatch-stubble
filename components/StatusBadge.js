import { INCIDENT_STATUS_LABEL, INCIDENT_STATUS_PILL } from "@/lib/incidentStatus";

export default function StatusBadge({ status }) {
  const colors = INCIDENT_STATUS_PILL[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.marker }} />
      {INCIDENT_STATUS_LABEL[status] ?? status}
    </span>
  );
}
