// Proposed lifecycle - confirm with the project owner before relying on it.
export const INCIDENT_STATUS = {
  DETECTED: "DETECTED",
  PENDING_REVIEW: "PENDING_REVIEW",
  ASSIGNED: "ASSIGNED",
  UNDER_INVESTIGATION: "UNDER_INVESTIGATION",
  CONFIRMED: "CONFIRMED",
  FALSE_POSITIVE: "FALSE_POSITIVE",
  RESOLVED: "RESOLVED",
};

export const INCIDENT_STATUS_LABEL = {
  DETECTED: "Detected",
  PENDING_REVIEW: "Pending Review",
  ASSIGNED: "Assigned",
  UNDER_INVESTIGATION: "Under Investigation",
  CONFIRMED: "Confirmed",
  FALSE_POSITIVE: "False Positive",
  RESOLVED: "Resolved",
};

// Pill colours from the Stitch design system.
export const INCIDENT_STATUS_PILL = {
  DETECTED: { background: "#FEF2F2", text: "#B91C1C", border: "#FCA5A5", marker: "#EF4444" },
  PENDING_REVIEW: { background: "#FFFBEB", text: "#B45309", border: "#FCD34D", marker: "#F59E0B" },
  ASSIGNED: { background: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD", marker: "#3B82F6" },
  UNDER_INVESTIGATION: { background: "#F5F3FF", text: "#6D28D9", border: "#C4B5FD", marker: "#8B5CF6" },
  CONFIRMED: { background: "#FEF2F2", text: "#7F1D1D", border: "#F87171", marker: "#991B1B" },
  FALSE_POSITIVE: { background: "#F1F5F9", text: "#475569", border: "#CBD5E1", marker: "#94A3B8" },
  RESOLVED: { background: "#ECFDF5", text: "#047857", border: "#6EE7B7", marker: "#10B981" },
};

const ALLOWED_TRANSITIONS = {
  DETECTED: ["PENDING_REVIEW", "ASSIGNED"],
  PENDING_REVIEW: ["ASSIGNED", "FALSE_POSITIVE"],
  ASSIGNED: ["UNDER_INVESTIGATION"],
  UNDER_INVESTIGATION: ["CONFIRMED", "FALSE_POSITIVE"],
  CONFIRMED: ["RESOLVED"],
  FALSE_POSITIVE: [],
  RESOLVED: [],
};

export function getAllowedNextStatuses(currentStatus) {
  return ALLOWED_TRANSITIONS[currentStatus] ?? [];
}

export function isTransitionAllowed(currentStatus, nextStatus) {
  return getAllowedNextStatuses(currentStatus).includes(nextStatus);
}
