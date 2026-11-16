import { prisma } from "@/lib/prisma";
import { ROLE, canAccessDistrict } from "@/lib/roles";
import { INCIDENT_STATUS, isTransitionAllowed } from "@/lib/incidentStatus";

export const INCIDENTS_PAGE_SIZE = 20;

const incidentInclude = { observation: true, district: true };

// scopeDistrictIds is what the signed-in user may see; a requested district filter can only narrow it.
function buildIncidentFilter({ scopeDistrictIds, districtId, status }) {
  const filter = {
    districtId: districtId && scopeDistrictIds.includes(districtId) ? districtId : { in: scopeDistrictIds },
  };
  if (status) filter.status = status;
  return filter;
}

export async function listIncidentsPage({ scopeDistrictIds, districtId, status, page = 1 }) {
  const where = buildIncidentFilter({ scopeDistrictIds, districtId, status });
  const [incidents, totalCount] = await Promise.all([
    prisma.incident.findMany({
      where,
      include: incidentInclude,
      orderBy: { observation: { observedAt: "desc" } },
      skip: (page - 1) * INCIDENTS_PAGE_SIZE,
      take: INCIDENTS_PAGE_SIZE,
    }),
    prisma.incident.count({ where }),
  ]);
  return { incidents, totalCount };
}

// Only the fields the map needs.
export function listIncidentsForMap({ scopeDistrictIds, districtId, status }) {
  return prisma.incident.findMany({
    where: buildIncidentFilter({ scopeDistrictIds, districtId, status }),
    select: {
      id: true,
      status: true,
      district: { select: { name: true } },
      observation: {
        select: { latitude: true, longitude: true, observedAt: true, source: true, confidence: true, isSampleData: true },
      },
    },
  });
}

export function getIncidentDetails(incidentId) {
  return prisma.incident.findUnique({
    where: { id: incidentId },
    include: { ...incidentInclude, events: { orderBy: { createdAt: "desc" } } },
  });
}

export async function hasSampleData() {
  return (await prisma.satelliteObservation.count({ where: { isSampleData: true } })) > 0;
}

export async function getDashboardStatistics(scopeDistrictIds) {
  const scope = { districtId: { in: scopeDistrictIds } };
  const [statusGroups, districtStatusGroups, districts] = await Promise.all([
    prisma.incident.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
    prisma.incident.groupBy({ by: ["districtId", "status"], where: scope, _count: { _all: true } }),
    prisma.district.findMany({ where: { id: { in: scopeDistrictIds } } }),
  ]);

  const countByStatus = Object.fromEntries(statusGroups.map((group) => [group.status, group._count._all]));
  const byDistrict = districts
    .map((district) => {
      const segments = districtStatusGroups
        .filter((group) => group.districtId === district.id)
        .map((group) => ({ status: group.status, count: group._count._all }));
      return {
        district: district.name,
        state: district.state,
        segments,
        total: segments.reduce((sum, segment) => sum + segment.count, 0),
      };
    })
    .filter((row) => row.total > 0)
    .sort((first, second) => second.total - first.total);

  return {
    totalCount: Object.values(countByStatus).reduce((sum, count) => sum + count, 0),
    countByStatus,
    byDistrict,
  };
}

export async function changeIncidentStatus({ incidentId, nextStatus, session, note }) {
  const incident = await prisma.incident.findUnique({ where: { id: incidentId }, include: { district: true } });
  // An incident outside the user's scope is reported as missing so its existence is not revealed.
  if (!incident || !canAccessDistrict(session, incident.district)) throw new Error("Incident not found.");
  if (!isTransitionAllowed(incident.status, nextStatus)) {
    throw new Error(`Cannot change status from ${incident.status} to ${nextStatus}.`);
  }
  // Closing a case is the district officer's decision, and it must say why.
  if (nextStatus === INCIDENT_STATUS.RESOLVED) {
    if (session.role !== ROLE.DISTRICT_OFFICER) throw new Error("Only the district officer can close an incident, so this cannot be done.");
    if (!note) throw new Error("A resolution note is required, so this cannot be done.");
  }
  return prisma.$transaction([
    prisma.incident.update({ where: { id: incidentId }, data: { status: nextStatus } }),
    prisma.incidentEvent.create({
      data: { incidentId, action: "STATUS_CHANGED", fromStatus: incident.status, toStatus: nextStatus, actor: session.name, note },
    }),
  ]);
}
