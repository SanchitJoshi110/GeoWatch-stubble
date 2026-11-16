"use server";

import { revalidatePath } from "next/cache";
import { syncSatelliteDetections } from "@/lib/firmsSync";
import { ROLE } from "@/lib/roles";
import { requireSession } from "@/lib/session";

export async function syncSatelliteDetectionsAction(_previousState) {
  const session = await requireSession();
  if (session.role !== ROLE.STATE_ADMIN) return { ok: false, message: "Only a state admin can sync satellite data." };

  try {
    const summary = await syncSatelliteDetections();
    revalidatePath("/");
    revalidatePath("/incidents");
    return { ok: true, addedCount: summary.addedCount };
  } catch (error) {
    console.error("Satellite sync failed:", error);
    return { ok: false, message: "Could not fetch satellite data right now. Please try again later." };
  }
}
