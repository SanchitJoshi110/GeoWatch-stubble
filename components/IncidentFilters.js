import Link from "next/link";
import Icon from "@/components/Icon";
import { INCIDENT_STATUS_LABEL } from "@/lib/incidentStatus";

const fieldClass =
  "h-10 rounded-md border border-outline-variant bg-white px-3 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-outline";

export default function IncidentFilters({ districts, districtId, status, resetHref, showDistrict = true }) {
  return (
    <form className="flex flex-wrap items-end gap-3 rounded-xl border border-outline-variant bg-surface-lowest p-4 shadow-sm">
      {showDistrict && (
        <label>
          <span className={labelClass}>District</span>
          <select name="districtId" defaultValue={districtId ?? ""} className={fieldClass}>
            <option value="">All districts</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>{district.name}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        <span className={labelClass}>Status</span>
        <select name="status" defaultValue={status ?? ""} className={fieldClass}>
          <option value="">All statuses</option>
          {Object.entries(INCIDENT_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="flex h-10 items-center gap-1.5 rounded-md bg-primary-container px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-secondary"
      >
        <Icon name="filter_alt" className="!text-base" />
        Apply filters
      </button>
      <Link
        href={resetHref}
        className="flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium text-outline hover:bg-surface-low hover:text-on-surface"
      >
        <Icon name="restart_alt" className="!text-base" />
        Reset
      </Link>
    </form>
  );
}
