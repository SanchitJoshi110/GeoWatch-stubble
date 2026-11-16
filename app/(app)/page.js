import Link from "next/link";
import DistrictBreakdown from "@/components/DistrictBreakdown";
import Icon from "@/components/Icon";
import IncidentFilters from "@/components/IncidentFilters";
import IncidentMapLoader from "@/components/IncidentMapLoader";
import IncidentsTable from "@/components/IncidentsTable";
import KpiCard from "@/components/KpiCard";
import StatusLegend from "@/components/StatusLegend";
import SyncButton from "@/components/SyncButton";
import { listDistrictsInScope } from "@/lib/districts";
import { parseIncidentFilters } from "@/lib/filters";
import { getDashboardStatistics, listIncidentsForMap, listIncidentsPage } from "@/lib/incidents";
import { INCIDENT_STATUS_PILL } from "@/lib/incidentStatus";
import { toMapMarker } from "@/lib/mapMarkers";
import { ROLE } from "@/lib/roles";
import { requireSession } from "@/lib/session";
import { syncSatelliteDetectionsAction } from "@/lib/syncActions";

export const dynamic = "force-dynamic";
// The satellite sync runs from this page and can take longer than the 10 second default.
export const maxDuration = 60;

const OFFICER_MAP_ZOOM = 9;
const OFFICER_TABLE_ROWS = 10;

function getAverageCenter(markers) {
  const total = markers.length;
  return [
    markers.reduce((sum, marker) => sum + marker.latitude, 0) / total,
    markers.reduce((sum, marker) => sum + marker.longitude, 0) / total,
  ];
}

export default async function DashboardPage({ searchParams }) {
  const session = await requireSession();
  const isStateAdmin = session.role === ROLE.STATE_ADMIN;
  const { districtId, status } = parseIncidentFilters(await searchParams);

  const districts = await listDistrictsInScope(session);
  const scopeDistrictIds = districts.map((district) => district.id);
  const [statistics, mapIncidents, assignedIncidents] = await Promise.all([
    getDashboardStatistics(scopeDistrictIds),
    listIncidentsForMap({ scopeDistrictIds, districtId, status }),
    isStateAdmin ? null : listIncidentsPage({ scopeDistrictIds, status }),
  ]);
  const { countByStatus } = statistics;
  const markers = mapIncidents.map(toMapMarker);
  const officerMapView = !isStateAdmin && markers.length > 0 ? { center: getAverageCenter(markers), zoom: OFFICER_MAP_ZOOM } : {};

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-primary">
            {isStateAdmin ? `${session.state} dashboard` : `${districts[0].name} district dashboard`}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-outline">
            <Icon name="info" className="!text-base text-secondary" />
            {isStateAdmin
              ? "Satellite detections (NASA FIRMS) are suspected hotspots until a person verifies them."
              : "Incidents automatically assigned to you. Detections stay suspected until you verify them."}
          </p>
        </div>
        {isStateAdmin && <SyncButton action={syncSatelliteDetectionsAction} />}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isStateAdmin ? (
          <>
            <KpiCard label="Total suspected incidents" value={statistics.totalCount} />
            <KpiCard label="Detected" value={countByStatus.DETECTED ?? 0} accentColor={INCIDENT_STATUS_PILL.DETECTED.marker} hint="Not yet assigned" />
            <KpiCard label="Assigned" value={countByStatus.ASSIGNED ?? 0} accentColor={INCIDENT_STATUS_PILL.ASSIGNED.marker} hint="With a district officer" />
            <KpiCard label="Resolved" value={countByStatus.RESOLVED ?? 0} accentColor={INCIDENT_STATUS_PILL.RESOLVED.marker} hint="Closed after investigation" />
          </>
        ) : (
          <>
            <KpiCard label="Assigned to me" value={countByStatus.ASSIGNED ?? 0} accentColor={INCIDENT_STATUS_PILL.ASSIGNED.marker} hint="Waiting for investigation" />
            <KpiCard label="Under investigation" value={countByStatus.UNDER_INVESTIGATION ?? 0} accentColor={INCIDENT_STATUS_PILL.UNDER_INVESTIGATION.marker} />
            <KpiCard label="Confirmed" value={countByStatus.CONFIRMED ?? 0} accentColor={INCIDENT_STATUS_PILL.CONFIRMED.marker} />
            <KpiCard label="Resolved" value={countByStatus.RESOLVED ?? 0} accentColor={INCIDENT_STATUS_PILL.RESOLVED.marker} />
          </>
        )}
      </div>

      <IncidentFilters districts={districts} districtId={districtId} status={status} resetHref="/" showDistrict={isStateAdmin} />

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-lowest shadow-sm">
        <div className="flex items-center gap-2 border-b border-outline-variant/60 px-5 py-3">
          <Icon name="map" className="text-primary" />
          <h2 className="font-display text-base font-bold text-primary">Incident map</h2>
          <span className="ml-auto text-xs text-outline">{markers.length} shown</span>
        </div>
        <div className="h-[540px]">
          <IncidentMapLoader incidents={markers} {...officerMapView} />
        </div>
        <StatusLegend />
      </section>

      {isStateAdmin ? (
        <section className="rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold tracking-tight text-primary">Incidents by district</h2>
          <p className="mb-5 mt-0.5 text-sm text-outline">Each bar is split by incident status.</p>
          <DistrictBreakdown rows={statistics.byDistrict} />
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-lowest shadow-sm">
          <div className="px-6 py-4">
            <h2 className="font-display text-lg font-bold tracking-tight text-primary">My assigned incidents</h2>
            <p className="text-sm text-outline">Suspected hotspots assigned to you for verification.</p>
          </div>
          <IncidentsTable incidents={assignedIncidents.incidents.slice(0, OFFICER_TABLE_ROWS)} showDistrict={false} />
          <div className="flex items-center justify-between border-t border-outline-variant bg-surface px-6 py-3 text-sm text-outline">
            <span>
              Showing {Math.min(OFFICER_TABLE_ROWS, assignedIncidents.totalCount)} of {assignedIncidents.totalCount} incidents in {districts[0].name}
            </span>
            <Link href="/incidents" className="font-semibold text-secondary hover:underline">View all incidents</Link>
          </div>
        </section>
      )}
    </>
  );
}
