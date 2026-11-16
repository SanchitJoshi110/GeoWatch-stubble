import { INCIDENT_STATUS } from "@/lib/incidentStatus";

const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/;

// Query-string values are untrusted; drop anything malformed.
export function parseIncidentFilters(searchParams) {
  const districtId = OBJECT_ID_PATTERN.test(searchParams.districtId ?? "") ? searchParams.districtId : undefined;
  const status = INCIDENT_STATUS[searchParams.status];
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  return { districtId, status, page };
}
