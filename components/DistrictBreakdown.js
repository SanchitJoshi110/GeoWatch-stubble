import { INCIDENT_STATUS_LABEL, INCIDENT_STATUS_PILL } from "@/lib/incidentStatus";

export default function DistrictBreakdown({ rows }) {
  if (rows.length === 0) {
    return <p className="text-sm text-outline">No incidents to summarise yet.</p>;
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.district} className="grid grid-cols-12 items-center gap-3">
          <div className="col-span-3 text-right">
            <span className="block text-sm font-semibold text-primary">{row.district}</span>
            <span className="text-[11px] text-outline">{row.state} · {row.total} incidents</span>
          </div>
          <div className="col-span-8 flex h-7 gap-0.5 overflow-hidden rounded-lg bg-surface-low p-0.5">
            {row.segments.map((segment) => (
              <div
                key={segment.status}
                title={`${segment.count} ${INCIDENT_STATUS_LABEL[segment.status]}`}
                className="flex h-full items-center justify-center rounded-sm text-[11px] font-bold text-white"
                style={{
                  width: `${(segment.count / row.total) * 100}%`,
                  backgroundColor: INCIDENT_STATUS_PILL[segment.status].marker,
                }}
              >
                {segment.count}
              </div>
            ))}
          </div>
          <div className="col-span-1 text-right font-display text-base font-bold">{row.total}</div>
        </div>
      ))}
    </div>
  );
}
