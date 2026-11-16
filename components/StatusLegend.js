import { INCIDENT_STATUS_LABEL, INCIDENT_STATUS_PILL } from "@/lib/incidentStatus";

export default function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-outline-variant/60 bg-surface-lowest px-5 py-3 text-xs">
      <span className="font-semibold uppercase tracking-wide text-outline">Legend</span>
      {Object.entries(INCIDENT_STATUS_LABEL).map(([status, label]) => (
        <span key={status} className="flex items-center gap-1.5 font-medium">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: INCIDENT_STATUS_PILL[status].marker }} />
          {label}
        </span>
      ))}
    </div>
  );
}
