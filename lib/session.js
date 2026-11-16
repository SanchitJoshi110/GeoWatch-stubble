import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "session";
const SESSION_LIFETIME_SECONDS = 8 * 60 * 60;

function signPayload(encodedPayload) {
  return createHmac("sha256", process.env.SESSION_SECRET).update(encodedPayload).digest("base64url");
}

function readSessionToken(token) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = Buffer.from(signPayload(encodedPayload));
  const actualSignature = Buffer.from(signature);
  const isSignatureValid =
    expectedSignature.length === actualSignature.length && timingSafeEqual(expectedSignature, actualSignature);
  if (!isSignatureValid) return null;

  const session = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  return session.expiresAt > Date.now() ? session : null;
}

/** @typedef {{ role: string, state: string, districtId: string | null, name: string, expiresAt: number }} Session */

export async function createSession({ role, state, districtId, name }) {
  const session = { role, state, districtId, name, expiresAt: Date.now() + SESSION_LIFETIME_SECONDS * 1000 };
  const encodedPayload = Buffer.from(JSON.stringify(session)).toString("base64url");
  (await cookies()).set(SESSION_COOKIE_NAME, `${encodedPayload}.${signPayload(encodedPayload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_LIFETIME_SECONDS,
    path: "/",
  });
}

/** @returns {Promise<Session | null>} */
export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return readSessionToken(token);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
