import Link from "next/link";
import Icon from "@/components/Icon";
import SampleDataBadge from "@/components/SampleDataBadge";
import StatusBadge from "@/components/StatusBadge";

const headerCellClass = "px-6 py-3.5 font-semibold";

export default function IncidentsTable({ incidents, showDistrict = true }) {
  const columnCount = showDistrict ? 7 : 6;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-outline-variant bg-surface text-xs uppercase tracking-wide text-outline">
            <th className={headerCellClass}>Observed</th>
            {showDistrict && <th className={headerCellClass}>District</th>}
            <th className={headerCellClass}>Status</th>
            <th className={headerCellClass}>Assigned to</th>
            <th className={headerCellClass}>Source</th>
            <th className={headerCellClass}>Confidence</th>
            <th className={`${headerCellClass} text-right`}>Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/50">
          {incidents.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="px-6 py-12 text-center text-outline">
                <Icon name="search_off" className="mb-2 block !text-3xl" />
                No incidents match the current filters.
              </td>
            </tr>
          )}
          {incidents.map((incident) => (
            <tr key={incident.id} className="transition-colors hover:bg-surface">
              <td className="whitespace-nowrap px-6 py-4 font-medium">
                {incident.observation.observedAt.toISOString().slice(0, 10)}
              </td>
              {showDistrict && <td className="whitespace-nowrap px-6 py-4 font-semibold text-primary">{incident.district.name}</td>}
              <td className="whitespace-nowrap px-6 py-4"><StatusBadge status={incident.status} /></td>
              <td className="whitespace-nowrap px-6 py-4">
                {incident.assignedTo ?? <span className="italic text-outline">Unassigned</span>}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="mr-1.5">{incident.observation.source}</span>
                {incident.observation.isSampleData && <SampleDataBadge />}
              </td>
              <td className="whitespace-nowrap px-6 py-4 capitalize">{incident.observation.confidence ?? "-"}</td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                <Link
                  href={`/incidents/${incident.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-primary-container hover:text-secondary hover:underline"
                >
                  Details <Icon name="arrow_forward" className="!text-base" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
