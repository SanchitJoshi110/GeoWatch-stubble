export const ROLE = {
  STATE_ADMIN: "STATE_ADMIN",
  DISTRICT_OFFICER: "DISTRICT_OFFICER",
};

export const SYSTEM_ACTOR = "System (auto-assignment)";

export function getDistrictOfficerName(districtName) {
  return `${districtName} District Officer`;
}

export function getStateAdminName(stateName) {
  return `${stateName} State Admin`;
}

// A district is visible to a state admin of its state, and to the officer of that district only.
export function canAccessDistrict(session, district) {
  if (session.role === ROLE.STATE_ADMIN) return district.state === session.state;
  return district.id === session.districtId;
}
