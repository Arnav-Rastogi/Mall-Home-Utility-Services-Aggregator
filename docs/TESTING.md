# Testing record

## Commands

- `npm test` runs Node built-in test runner for API utility/business rules.
- `npm run build` creates the production Vite bundle.
- `npm run dev` starts client and API together; API requires configured MongoDB and env values.

## Implemented automated checks

The API test suite covers pure booking transition, date and overlap rules. HTTP/database integration tests are not included yet; auth, ownership, provider approval, booking conflict and dashboard flows still need execution against an isolated test MongoDB.

## Checks actually run (24 October 2026)

- `npm test`: 9 passed, 0 failed (booking transition/participant rules, future-date validation, overlap boundaries, provider-local working-hour slots, booked/pending/unavailable states, open-date filtering and timezone conversion).
- `npm run build`: passed (Vite production build).
- `node --check src/index.js` and `node --check src/seed.js`: passed.
- `npm audit --omit=dev` in the server workspace: 0 reported vulnerabilities after updating Zod and Multer.

## Manual acceptance checklist

- Register customer and provider; verify provider starts pending.
- Confirm pending provider is absent from public search and booking cannot be placed.
- Admin approves provider; verify discovery returns provider.
- Customer creates future request; provider accepts; start and complete; customer reviews once.
- Create overlapping accepted booking and verify conflict is rejected.
- Verify one user cannot read another user's booking or notifications.
- Open and resolve a dispute as admin; export CSV as admin.

During local setup, MongoDB connection and seed counts were verified. The running app passed HTTP checks for API health and frontend serving; customer, approved provider, pending provider and admin logins; pending-provider exclusion from public discovery; role dashboards; admin booking CSV; and a persisted scheduled booking → accept → start → complete → review flow. Provider profile read/update, location, working hours, category selection, service creation and pending-profile exclusion were tested with a temporary provider account, then that account and its records were removed. Provider availability was checked in two steps: the open-date list returned November 27 with eight open slots, and selecting that date returned its 09:00–16:00 slots. A customer booking submitted from an available date/time without a postal code succeeded; its temporary booking and notification were removed. A temporary booking also confirmed pending slots display as `pending`, then as `booked` after acceptance; the record was removed afterward. Public provider serialization excludes verification documents. The `/providers/me` route collision discovered during these checks was fixed. Browser-driven visual automation, provider admin approval/rejection, dispute resolution, private document viewing, ownership-negative cases and concurrent booking race behavior were not exercised. No frontend browser automation suite is included.
