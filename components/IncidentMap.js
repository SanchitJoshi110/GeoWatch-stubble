"use client";

import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { INCIDENT_STATUS_LABEL, INCIDENT_STATUS_PILL } from "@/lib/incidentStatus";

const DEFAULT_CENTER = [30.4, 76.0];
const DEFAULT_ZOOM = 7;
const MARKER_RADIUS_PX = 9;

export default function IncidentMap({ incidents, center = DEFAULT_CENTER, zoom = DEFAULT_ZOOM }) {
  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {incidents.map((incident) => {
        const markerColor = INCIDENT_STATUS_PILL[incident.status].marker;
        return (
          <CircleMarker
            key={incident.id}
            center={[incident.latitude, incident.longitude]}
            radius={MARKER_RADIUS_PX}
            pathOptions={{ color: "#ffffff", weight: 2, fillColor: markerColor, fillOpacity: 0.95 }}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <div className="font-display text-base font-bold">{incident.districtName}</div>
                <div>Status: {INCIDENT_STATUS_LABEL[incident.status]}</div>
                <div>Observed: {incident.observedAtLabel}</div>
                <div>Source: {incident.source}</div>
                <div>Confidence: {incident.confidence ?? "not provided"}</div>
                {incident.isSampleData && <div className="font-semibold text-[#B45309]">Sample data</div>}
                <Link href={`/incidents/${incident.id}`} className="font-semibold text-secondary underline">
                  View details
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
