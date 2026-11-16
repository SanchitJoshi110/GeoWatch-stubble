// Ray-casting point-in-polygon for GeoJSON Polygon / MultiPolygon features. Coordinates are [longitude, latitude].

function isPointInRing(longitude, latitude, ring) {
  let isInside = false;
  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current++) {
    const [currentLng, currentLat] = ring[current];
    const [previousLng, previousLat] = ring[previous];
    const crossesLatitude = currentLat > latitude !== previousLat > latitude;
    if (crossesLatitude) {
      const crossingLng = ((previousLng - currentLng) * (latitude - currentLat)) / (previousLat - currentLat) + currentLng;
      if (longitude < crossingLng) isInside = !isInside;
    }
  }
  return isInside;
}

// The first ring is the outer boundary; any further rings are holes.
function isPointInPolygon(longitude, latitude, [outerRing, ...holes]) {
  return isPointInRing(longitude, latitude, outerRing) && !holes.some((hole) => isPointInRing(longitude, latitude, hole));
}

function getPolygons(geometry) {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

export function findContainingFeature(longitude, latitude, features) {
  return features.find((feature) =>
    getPolygons(feature.geometry).some((polygon) => isPointInPolygon(longitude, latitude, polygon)),
  );
}
