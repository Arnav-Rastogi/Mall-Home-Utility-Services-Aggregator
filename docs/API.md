# REST API

Base URL `/api/v1`. JSON errors use `{ "error": "..." }`; validation errors may include `details:[{field,message}]`. Authenticated routes use the `uc_session` HTTP-only cookie. List responses use `{items,total,page,pages}` where pagination applies.

| Method/path | Access | Purpose / body |
|---|---|---|
| GET `/health` | public | API health |
| POST `/auth/register` | public | `{name,email,password,role?,phone?,city?,locality?,bio?}`; role customer/provider only; provider created pending |
| POST `/auth/login` | public | `{email,password}`; sets cookie |
| POST `/auth/logout` | public | clears cookie |
| GET `/auth/me` | signed in | current safe user fields |
| PATCH `/users/me` | signed in | update name/phone/city/locality |
| GET `/categories` | public | active categories |
| POST `/categories` | admin | create `{name,slug,description?,icon?}` |
| PATCH `/categories/:id` | admin | edit/deactivate category |
| GET `/providers` | public | filters category, city, locality, q, min/max price, minRating, sort (`rating`,`price`,`experience`), page, limit |
| GET `/providers/:id` | public | approved provider profile/services |
| GET `/providers/:id/availability?days=60` | public | returns future dates with open slots and open/booked/pending counts; `from` and `days` can bound the calendar (max 90 days) |
| GET `/providers/:id/availability?date=YYYY-MM-DD` | public | returns provider-local one-hour times for that date, with `status` (`available`, `booked`, `pending`, `unavailable`) and `available` boolean; includes timezone |
| GET `/providers/:id/reviews` | public | latest provider reviews |
| GET `/providers/me` | provider | own profile/services |
| PATCH `/providers/me` | provider | profile, skills, categories, areas, hours, unavailable intervals |
| POST `/providers/me/services` | provider | create service with active category and nonnegative price |
| PATCH `/providers/me/services/:id` | owning provider | edit/deactivate service |
| POST `/providers/me/verification-documents` | provider | multipart `document`, PDF/JPEG/PNG, configured limit |
| POST `/bookings` | customer | provider, service, type, available slot ISO `scheduledAt` when scheduled, description and location; server checks hours and reserves pending slots against duplicate requests |
| GET `/bookings` | signed in | own customer/provider bookings; admin sees all; optional status/page/limit |
| GET `/bookings/:id` | participant/admin | authorized booking details |
| PATCH `/bookings/:id/status` | owner by transition | `{status,reason?,agreedAmount?}`; transitions are documented in source/README limitations |
| POST `/bookings/:id/reviews` | owning customer | completed booking only; `{rating,text?}`; one per booking |
| GET `/notifications` | signed in | own notifications; optional `unread=true` |
| PATCH `/notifications/read` | signed in | `{ids?:[]}` marks selected or all unread own notifications |
| POST `/disputes` | customer | `{booking,reason,description}` on own accepted/in-progress/completed booking |
| GET `/disputes` | signed in | own records; admin all |
| PATCH `/disputes/:id` | admin | `{status,resolutionNotes?}` |
| GET `/dashboard` | signed in | role-specific persisted summary |
| GET `/admin/providers` | admin | optional verification filter, includes user contact fields and document metadata (not file contents) |
| GET `/admin/providers/:id/documents/:index` | admin | streams private document |
| PATCH `/admin/providers/:id/verification` | admin | `{verification:'approved'|'rejected',reason?}` |
| PATCH `/admin/users/:id/status` | admin | `{status:'active'|'suspended'}` |
| GET `/admin/reports/bookings.csv` | admin | capped booking CSV export |

Common status codes: 200 success, 201 create, 400 invalid input/business rule, 401 missing/invalid session, 403 insufficient role/ownership, 404 missing record, 409 duplicate/conflicting record. Price is an estimate until provider accepts and records agreed amount. Payments are out of scope. Scheduled appointments must use a future one-hour slot within the provider's working hours and timezone. Concurrent slot claims are checked when requested and accepted but are not reserved transactionally.
