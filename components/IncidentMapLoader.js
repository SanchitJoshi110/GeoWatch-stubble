"use client";

import dynamic from "next/dynamic";

const IncidentMap = dynamic(() => import("@/components/IncidentMap"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-outline">Loading map...</div>,
});

export default function IncidentMapLoader({ incidents, center, zoom }) {
  if (incidents.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-outline">No incidents match the current filters.</div>;
  }
  return <IncidentMap incidents={incidents} center={center} zoom={zoom} />;
}
