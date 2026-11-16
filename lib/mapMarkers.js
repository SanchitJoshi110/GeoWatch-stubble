// Shapes a Prisma incident (with observation and district) into plain data for the map.
export function toMapMarker(incident) {
  return {
    id: incident.id,
    status: incident.status,
    districtName: incident.district.name,
    latitude: incident.observation.latitude,
    longitude: incident.observation.longitude,
    observedAtLabel: incident.observation.observedAt.toISOString().slice(0, 10),
    source: incident.observation.source,
    confidence: incident.observation.confidence,
    isSampleData: incident.observation.isSampleData,
  };
}
