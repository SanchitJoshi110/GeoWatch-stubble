# CLAUDE.md — Stubble Burning Detection Dashboard

Permanent rules only. Project architecture, data models and progress go in `PROJECT_SUMMARY.md` (if needed).

**Project:** Next.js admin dashboard showing satellite-detected suspected crop burning on an interactive map; incidents are stored, assigned to district authorities, reviewed and tracked to resolution.
**Modules (build nothing else unless asked):** dashboard, incident map, satellite observation records, incident list/filters, incident details, district management, assignment, review/status tracking, basic analytics/reports.

## Principles
- Simplest reliable, readable solution. No unnecessary files, abstractions, dependencies or code; remove unused imports, variables, functions and dependencies.
- Implement only what is requested. Never invent requirements; ask when unclear.
- Inspect the repo before assuming versions, packages, DB, styling or deployment. Use the existing package manager, dependencies, styling and structure.

## Architecture
- Separate UI, business logic, data access and API calls. One responsibility per component/function; keep them short.
- Server Components by default; `'use client'` only for real interactivity. Minimal global state.
- Secrets and privileged operations stay server-side.
- Use JavaScript (`.js`/`.jsx`), not TypeScript. Document model and API response shapes with JSDoc `@typedef`.
- Reuse existing code; never duplicate logic or functionality under new names.

## Code Style
- Descriptive names (`isAssignmentPending`, not `flag`); avoid `data`, `info`, `temp`, `helper`, `common`, `manager`, `process`, `handle`. Follow existing naming conventions.
- Named constants instead of magic numbers/strings. No clever or deeply nested code.
- Comment only non-obvious decisions.

## Map and Satellite Data
- Load browser-only map code via `next/dynamic` (`ssr: false`); keep map logic separate from other dashboard code.
- Never fabricate coordinates, confidence, observation times or fallback values. Preserve each observation's source, time, coordinates and confidence; assignment/review never overwrites the original record.
- Detections are *suspected* incidents. Keep satellite detection status separate from human investigation status.
- Label sample/simulated data everywhere; never present it as a real detection.
- Support zoom, pan, marker selection with details, and status-coloured markers. Map, list and dashboard filters stay consistent. Selecting an incident must not reload the map or refetch data. Cluster when density justifies it.

## Incident Workflow
- Proposed statuses (confirm before implementing): Detected, Pending Review, Assigned, Under Investigation, Confirmed, False Positive, Resolved.
- Validate status transitions. Record who assigned/reviewed and when; keep history where supported; never silently overwrite important fields. District filtering and assignment must agree.

## UI
- All UI design comes from Google Stitch (MCP): generate screens there, fetch them, and match the result end to end. Do not hand-design screens. UI must be modern, premium-feeling and easy to understand.
- Clean, professional admin look with consistent typography, spacing and status colours/labels; map prominent; desktop and tablet responsive.
- Provide loading, empty, error and success states. Confirm consequential actions. Minimal animation, gradients and shadows.
- Don't redesign approved screens without permission.

## Security and Errors
- Validate input on client and server and at API boundaries. Never trust client-supplied IDs or permissions; enforce auth/role checks server-side.
- Use safe DB access; prevent injection, XSS, CSRF. Never commit `.env` or secrets.
- Never swallow exceptions or expose stack traces to the browser; log technical detail server-side without secrets.
- Handle network and map-service failures, prevent duplicate submissions, and leave no inconsistent UI state after failures.

## Performance
- Optimise measured bottlenecks, not assumptions. Avoid duplicate fetches; cache/revalidate appropriately; fetch only required fields.
- Paginate and filter lists; avoid rendering unnecessary rows/markers. Dynamic-import only genuinely heavy features.

## Agent Efficiency
- Read only relevant files; no repo-wide scans, re-reads of unchanged files, or re-explaining known architecture. Every tool call needs a purpose; no unnecessary subagents.
- Keep plans short; go deeper only for complex or high-risk work. After two failed attempts with the same approach, reassess the root cause.
- Never trade correctness, security or testing for fewer tokens.

## Workflow
Understand → inspect needed files → reuse → brief plan → implement only the request → test → check regressions → summarise changed files, tests and open issues.
Ask first when a business rule or lifecycle is ambiguous, the satellite data source or geographic requirements are unspecified, a decision is irreversible (architecture/DB), or approaches differ materially. Don't ask what the repo answers.

## Testing
Run lint, existing tests, and a production build after significant changes. Test map load and markers, filters/search, assignment and status updates, invalid input and API failures, responsive layout, sample-data labelling, and browser/server logs. Never claim a test or build passed without running it.
