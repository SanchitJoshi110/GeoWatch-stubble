"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { changeIncidentStatus } from "@/lib/incidents";
import { INCIDENT_STATUS } from "@/lib/incidentStatus";
import { requireSession } from "@/lib/session";

const MIN_RESOLUTION_NOTE_LENGTH = 5;
const MAX_NOTE_LENGTH = 1000;
const incidentIdSchema = z.string().regex(/^[0-9a-f]{24}$/, "Invalid incident id.");

const statusSchema = z.object({
  incidentId: incidentIdSchema,
  nextStatus: z.enum(Object.values(INCIDENT_STATUS).filter((status) => status !== INCIDENT_STATUS.RESOLVED)),
  note: z.string().trim().max(MAX_NOTE_LENGTH).optional(),
});

const resolveSchema = z.object({
  incidentId: incidentIdSchema,
  note: z.string().trim().min(MIN_RESOLUTION_NOTE_LENGTH).max(MAX_NOTE_LENGTH),
});

async function runIncidentAction(incidentId, parseInput) {
  const session = await requireSession();
  try {
    await changeIncidentStatus({ ...parseInput(), session });
    revalidatePath(`/incidents/${incidentId}`);
    revalidatePath("/incidents");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    const isUserFacing = error instanceof z.ZodError || /cannot|not found/i.test(error.message);
    console.error("Incident status change failed:", error);
    return { ok: false, message: isUserFacing ? "The request is invalid or not allowed." : "Something went wrong. Please try again." };
  }
}

export async function changeIncidentStatusAction(_previousState, formData) {
  const incidentId = formData.get("incidentId");
  return runIncidentAction(incidentId, () =>
    statusSchema.parse({ incidentId, nextStatus: formData.get("nextStatus"), note: formData.get("note") || undefined }),
  );
}

export async function resolveIncidentAction(_previousState, formData) {
  const incidentId = formData.get("incidentId");
  return runIncidentAction(incidentId, () => {
    const { note } = resolveSchema.parse({ incidentId, note: formData.get("note") });
    return { incidentId, nextStatus: INCIDENT_STATUS.RESOLVED, note };
  });
}
