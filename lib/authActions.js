"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { STATES, findDistrict } from "@/lib/districts";
import { ROLE, getDistrictOfficerName, getStateAdminName } from "@/lib/roles";
import { createSession, destroySession } from "@/lib/session";

// College project: every account shares one password.
const DEMO_PASSWORD = "1234";
const LOGIN_FAILED_MESSAGE = "Invalid state, district or password.";

const loginSchema = z.object({
  state: z.enum(STATES),
  districtId: z.string().regex(/^[0-9a-f]{24}$/).optional(),
  password: z.string().max(100),
});

function isPasswordCorrect(password) {
  const expected = Buffer.from(DEMO_PASSWORD);
  const actual = Buffer.from(password);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function loginAction(_previousState, formData) {
  const parsed = loginSchema.safeParse({
    state: formData.get("state"),
    districtId: formData.get("districtId") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success || !isPasswordCorrect(parsed.data.password)) return { message: LOGIN_FAILED_MESSAGE };

  const { state, districtId } = parsed.data;
  if (!districtId) {
    await createSession({ role: ROLE.STATE_ADMIN, state, districtId: null, name: getStateAdminName(state) });
    redirect("/");
  }

  const district = await findDistrict(districtId);
  if (!district || district.state !== state) return { message: LOGIN_FAILED_MESSAGE };
  await createSession({
    role: ROLE.DISTRICT_OFFICER,
    state,
    districtId: district.id,
    name: getDistrictOfficerName(district.name),
  });
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
