import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/roles";

export const STATES = ["Punjab", "Haryana"];

/** Districts the signed-in user may see: the whole state for an admin, one district for an officer. */
export function listDistrictsInScope(session) {
  const where = session.role === ROLE.STATE_ADMIN ? { state: session.state } : { id: session.districtId };
  return prisma.district.findMany({ where, orderBy: { name: "asc" } });
}

/** For the login form: { Punjab: [{ id, name }], Haryana: [...] } */
export async function listDistrictNamesByState() {
  const districts = await prisma.district.findMany({ orderBy: { name: "asc" } });
  return Object.fromEntries(
    STATES.map((state) => [
      state,
      districts.filter((district) => district.state === state).map(({ id, name }) => ({ id, name })),
    ]),
  );
}

export function findDistrict(districtId) {
  return prisma.district.findUnique({ where: { id: districtId } });
}
