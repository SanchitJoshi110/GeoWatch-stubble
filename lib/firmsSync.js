// Imports real satellite detections from NASA FIRMS and stores them as suspected incidents.
import { readFileSync } from "node:fs";
import path from "node:path";
import { findContainingFeature } from "./geo.js";
import { prisma } from "./prisma.js";
import { SYSTEM_ACTOR, getDistrictOfficerName } from "./roles.js";

const FIRMS_SOURCES = ["VIIRS_SNPP_NRT", "VIIRS_NOAA20_NRT"];
const FIRMS_DAY_RANGE = 5; // FIRMS accepts 1-5 days per request.
const SEARCH_BOUNDING_BOX = "73.8,27.6,77.7,32.6"; // west,south,east,north around Punjab and Haryana
const REQUEST_TIMEOUT_MS = 30_000;
const STATE_BOUNDARY_FILES = ["punjab.geojson", "haryana.geojson"];
const VIIRS_CONFIDENCE_LABEL = { l: "low", n: "nominal", h: "high" };

function loadDistrictFeatures() {
  return STATE_BOUNDARY_FILES.flatMap((fileName) => {
    const filePath = path.join(process.cwd(), "data", fileName);
    return JSON.parse(readFileSync(filePath, "utf8")).features;
  });
}

async function fetchDetections(source) {
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${process.env.FIRMS_MAP_KEY}/${source}/${SEARCH_BOUNDING_BOX}/${FIRMS_DAY_RANGE}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`FIRMS request for ${source} failed with status ${response.status}.`);

  const [headerLine, ...rows] = (await response.text()).trim().split("\n");
  if (!headerLine.startsWith("latitude")) throw new Error(`FIRMS returned an unexpected response for ${source}.`);
  const columns = headerLine.split(",");

  return rows.map((row) => {
    const values = row.split(",");
    const record = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
    return { ...record, source };
  });
}

function toObservation(record) {
  const acquisitionTime = record.acq_time.padStart(4, "0");
  return {
    externalKey: [record.source, record.latitude, record.longitude, record.acq_date, acquisitionTime].join("|"),
    source: `NASA FIRMS ${record.source}`,
    satellite: record.satellite,
    observedAt: new Date(`${record.acq_date}T${acquisitionTime.slice(0, 2)}:${acquisitionTime.slice(2)}:00Z`),
    latitude: Number(record.latitude),
    longitude: Number(record.longitude),
    confidence: VIIRS_CONFIDENCE_LABEL[record.confidence] ?? record.confidence,
    brightness: Number(record.bright_ti4),
    frp: Number(record.frp),
    isSampleData: false,
  };
}

async function ensureDistricts(features) {
  const existing = await prisma.district.findMany();
  const knownNames = new Set(existing.map((district) => district.name));
  const missing = features
    .filter((feature) => !knownNames.has(feature.properties.district))
    .map((feature) => ({ name: feature.properties.district, state: feature.properties.st_nm }));
  if (missing.length > 0) await prisma.district.createMany({ data: missing });
  return Object.fromEntries((await prisma.district.findMany()).map((district) => [district.name, district.id]));
}

// Every new detection goes straight to the officer of its district; the history keeps that as an event.
async function recordAutoAssignments(incidents) {
  const stored = await prisma.incident.findMany({
    where: { observationId: { in: incidents.map((incident) => incident.observationId) } },
    select: { id: true, assignedTo: true },
  });
  await prisma.incidentEvent.createMany({
    data: stored.map((incident) => ({
      incidentId: incident.id,
      action: "AUTO_ASSIGNED",
      fromStatus: "DETECTED",
      toStatus: "ASSIGNED",
      actor: SYSTEM_ACTOR,
      note: `Assigned to ${incident.assignedTo}`,
    })),
  });
}

export async function syncSatelliteDetections() {
  if (!process.env.FIRMS_MAP_KEY) throw new Error("FIRMS_MAP_KEY is not configured.");

  const features = loadDistrictFeatures();
  const districtIdByName = await ensureDistricts(features);
  const detections = (await Promise.all(FIRMS_SOURCES.map(fetchDetections))).flat();

  const districtNameByKey = new Map();
  const observations = [];
  for (const record of detections) {
    const observation = toObservation(record);
    const district = findContainingFeature(observation.longitude, observation.latitude, features);
    if (!district || districtNameByKey.has(observation.externalKey)) continue;
    districtNameByKey.set(observation.externalKey, district.properties.district);
    observations.push(observation);
  }

  const storedKeys = new Set(
    (
      await prisma.satelliteObservation.findMany({
        where: { externalKey: { in: observations.map((observation) => observation.externalKey) } },
        select: { externalKey: true },
      })
    ).map((stored) => stored.externalKey),
  );
  const newObservations = observations.filter((observation) => !storedKeys.has(observation.externalKey));

  if (newObservations.length > 0) {
    await prisma.satelliteObservation.createMany({ data: newObservations });
    const created = await prisma.satelliteObservation.findMany({
      where: { externalKey: { in: newObservations.map((observation) => observation.externalKey) } },
      select: { id: true, externalKey: true },
    });
    const incidents = created.map((observation) => {
      const districtName = districtNameByKey.get(observation.externalKey);
      return {
        observationId: observation.id,
        districtId: districtIdByName[districtName],
        status: "ASSIGNED",
        assignedTo: getDistrictOfficerName(districtName),
      };
    });
    await prisma.incident.createMany({ data: incidents });
    await recordAutoAssignments(incidents);
  }

  return {
    fetchedCount: detections.length,
    skippedCount: detections.length - observations.length,
    alreadyStoredCount: storedKeys.size,
    addedCount: newObservations.length,
  };
}
