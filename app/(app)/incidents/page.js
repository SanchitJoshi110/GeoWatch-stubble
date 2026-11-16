import Link from "next/link";
import Icon from "@/components/Icon";
import IncidentFilters from "@/components/IncidentFilters";
import IncidentsTable from "@/components/IncidentsTable";
import { listDistrictsInScope } from "@/lib/districts";
import { parseIncidentFilters } from "@/lib/filters";
import { INCIDENTS_PAGE_SIZE, listIncidentsPage } from "@/lib/incidents";
import { ROLE } from "@/lib/roles";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const pagerButtonClass =
  "flex items-center gap-1 rounded-md border border-outline-variant bg-white px-3 py-1.5 text-sm font-medium text-primary-container hover:bg-surface";

export default async function IncidentsPage({ searchParams }) {
  const session = await requireSession();
  const isStateAdmin = session.role === ROLE.STATE_ADMIN;
  const { districtId, status, page } = parseIncidentFilters(await searchParams);
  const districts = await listDistrictsInScope(session);
  const { incidents, totalCount } = await listIncidentsPage({
    scopeDistrictIds: districts.map((district) => district.id),
    districtId,
    status,
    page,
  });
  const pageCount = Math.max(1, Math.ceil(totalCount / INCIDENTS_PAGE_SIZE));

  function buildPageLink(targetPage) {
    const query = new URLSearchParams({ page: String(targetPage) });
    if (districtId) query.set("districtId", districtId);
    if (status) query.set("status", status);
    return `/incidents?${query}`;
  }

  return (
    <>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-primary">Incidents</h1>
        <p className="mt-1 text-sm text-outline">
          {isStateAdmin ? `Suspected hotspots across ${session.state}.` : "Suspected hotspots assigned to you."}
        </p>
      </div>

      <IncidentFilters
        districts={districts}
        districtId={districtId}
        status={status}
        resetHref="/incidents"
        showDistrict={isStateAdmin}
      />

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-lowest shadow-sm">
        <IncidentsTable incidents={incidents} showDistrict={isStateAdmin} />
        <div className="flex items-center justify-between border-t border-outline-variant bg-surface px-6 py-4 text-sm text-outline">
          <span>Page {page} of {pageCount} ({totalCount} incidents)</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildPageLink(page - 1)} className={pagerButtonClass}>
                <Icon name="chevron_left" className="!text-base" /> Previous
              </Link>
            )}
            {page < pageCount && (
              <Link href={buildPageLink(page + 1)} className={pagerButtonClass}>
                Next <Icon name="chevron_right" className="!text-base" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
