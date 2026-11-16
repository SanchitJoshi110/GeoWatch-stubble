# GeoWatch Stubble — Satellite-Based Stubble Burning Detection Dashboard

Admin dashboard that shows satellite-detected suspected crop burning (NASA FIRMS, VIIRS) for Punjab and Haryana on an interactive map. Detections are assigned automatically to the officer of the district they fall in, who investigates and closes them.

## Roles (login)
Sign in by choosing a state, then optionally a district. The password for every account is `1234` (college demo).

| Choice | Role | Can do |
|---|---|---|
| State only ("State Admin (no district)") | State Admin | See all districts of the state, sync satellite data, review incidents |
| State + district | District Officer | See only their district, review incidents, mark confirmed cases resolved |

## Run locally
1. Install Node 22, then `npm install`.
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL`: the local value in the file, or a MongoDB Atlas connection string.
   - `FIRMS_MAP_KEY`: free key from https://firms.modaps.eosdis.nasa.gov/api/map_key/
   - `SESSION_SECRET`: any long random string.
3. Local database only: `npm run db` (keep it running; the first run downloads MongoDB).
4. `npx prisma db push` to create collections and indexes.
5. `npm run sync` to load the latest satellite detections (or press **Sync satellite data** as State Admin).
6. `npm run dev` and open http://localhost:3000.

## Stack
Next.js (JavaScript), Tailwind CSS, Prisma + MongoDB, Leaflet, UI designed in Google Stitch.

## Notes
- FIRMS returns at most 5 days per request, so sync regularly during the burning season.
- Detections are suspected incidents until a district officer verifies them.
- District boundaries are the 2011 census boundaries (`data/`).
