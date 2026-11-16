import { prisma } from "../lib/prisma.js";
import { syncSatelliteDetections } from "../lib/firmsSync.js";

try {
  console.log(await syncSatelliteDetections());
} finally {
  await prisma.$disconnect();
}
