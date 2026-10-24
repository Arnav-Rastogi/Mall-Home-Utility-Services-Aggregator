# Database reference

All models use Mongoose timestamps. IDs are Mongo ObjectIds.

| Model | Important fields / references | Indexes and invariants |
|---|---|---|
| User | name, unique lower-case email, phone, password hash, role, status, city/locality | unique email; role enum; password select:false |
| Category | name, slug, description, icon, active | unique name and slug |
| Provider | unique User ref, bio, skills, experience, Category refs, serviceAreas, city/locality, IANA timezone, verification, private documents, workingHours, unavailable, rating/count | unique user; discovery requires approved + active user |
| Service | Provider ref, Category ref, name, description, basePrice, currency, unit, active | provider indexed; price nonnegative |
| Booking | customer/provider/service/category refs, private location, type, time, status, description/notes, estimate/agreed amount, rejection reason and lifecycle dates | customer/provider/status indexes and provider/time/status compound index |
| Review | unique Booking ref, customer/provider refs, rating 1–5, text | unique booking; only completed owned booking through API |
| Notification | recipient, type, title/message, related ID, readAt | recipient index |
| Dispute | booking/customer/provider refs, reason, description, status, resolution, admin | status indexed; active duplicate checked in API |

Booking status enum: pending, accepted, rejected, in_progress, completed, cancelled. Dates are stored as UTC instants; provider working-hour wall times use the provider's IANA timezone (default `Asia/Kolkata`). API offers and validates one-hour slots, excludes provider unavailable intervals and accepted/in-progress jobs, and checks conflicts at request creation and acceptance. No Mongo transaction or atomic slot reservation currently guards concurrent acceptance. Optional coordinates are `{lat,lng}`. Do not put full customer address into Provider or public profile fields.

Sample accounts and related records are created by `server/src/seed.js`; all seeded users share the documented development password. Seed data is disposable and fictitious.
