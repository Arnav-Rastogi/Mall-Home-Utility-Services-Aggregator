# UtilityConnect: Mall & Home Utility Services Aggregator

A responsive web platform that connects people with nearby, admin-approved service providers (electricians, plumbers, carpenters, tailors and maintenance staff) for small on-demand and scheduled utility jobs in homes, apartments and commercial spaces such as malls.

Customers discover providers, compare services and estimated prices, pick an open time slot and track the job. Providers manage their profile, services and availability, and respond to requests. Administrators verify providers and oversee the platform.

> Phase 1 scope: web only. The platform is an intermediary and does **not** process payments.

---

## Table of contents

1. [Problem and objectives](#problem-and-objectives)
2. [Features](#features)
3. [Tech stack](#tech-stack)
4. [Project structure](#project-structure)
5. [Getting started](#getting-started)
6. [Demo accounts](#demo-accounts)
7. [Booking lifecycle](#booking-lifecycle)
8. [Availability and scheduling](#availability-and-scheduling)
9. [API overview](#api-overview)
10. [Security](#security)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Requirements coverage](#requirements-coverage)
14. [Known limitations](#known-limitations)
15. [Out of scope and future enhancements](#out-of-scope-and-future-enhancements)
16. [Documentation](#documentation)

---

## Problem and objectives

Users and facility managers struggle to find reliable service providers because of a lack of verified local professionals, time-consuming manual coordination, unclear pricing and availability, and dependence on word of mouth.

**Primary objectives**
- Quick access to local utility service providers
- Digitised service booking and task management
- Transparent pricing and availability
- More work opportunities for local professionals

**Secondary objectives**
- Support both residential and commercial (mall) services
- Service history and accountability
- Room to expand across locations and service types (categories are data, not code)

---

## Features

### Customers
- Register, log in and log out (JWT in an HTTP-only cookie)
- Browse the five service categories: Electrician, Plumber, Carpenter, Tailor (stitching/alteration), Maintenance staff
- Search providers by category, city, locality, price range, minimum rating and keyword; sort by rating, price or experience; paginated results
- View provider profiles: skills, experience, service areas, services with estimated prices, ratings and reviews
- Book **instant** or **scheduled** services. Scheduled bookings choose from real open dates and one-hour slots
- Track status, cancel pending or accepted bookings, and view booking history
- Leave a 1-5 star review (with text) on completed bookings, once per booking
- Receive in-app notifications on status changes

### Service providers
- Register (starts as `pending`) and build a profile: bio, skills, experience, categories, service areas
- Upload identity and skill verification documents (PDF/JPEG/PNG, size limited, stored privately)
- Create and toggle service offerings with prices
- Set weekly working hours, a timezone and unavailable intervals
- Accept or reject requests, then mark jobs in progress and completed
- See booking history and recorded earnings on the dashboard

### Administrators
- Review the pending provider queue and approve or reject with a reason; only approved providers appear in search and can receive bookings
- Operations dashboard: total users, providers, verified and pending providers, bookings by status, open disputes, satisfaction rating
- Export a bookings CSV
- API-level controls for categories, user suspension and dispute handling (see [Known limitations](#known-limitations))

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, React Router 7, Axios, Lucide icons, plain CSS |
| Backend | Node.js 20+, Express 4 |
| Database | MongoDB with Mongoose 8 |
| Validation | Zod |
| Auth and security | bcryptjs (cost 12), jsonwebtoken, cookie-parser, Helmet, CORS, express-rate-limit, Multer |
| Testing | Node built-in test runner (`node --test`) |
| Tooling | npm workspaces, concurrently |

---

## Project structure

```
.
├── client/                 React + Vite single-page app
│   ├── src/main.jsx        Routes, pages, dashboards, provider and admin panels
│   ├── src/BookingModal.jsx  Instant/scheduled booking with live slot availability
│   └── src/styles.css
├── server/
│   ├── src/index.js        Express app and all REST routes (/api/v1)
│   ├── src/models.js       Mongoose models
│   ├── src/rules.js        Booking transitions, slot and timezone logic
│   ├── src/seed.js         Demo data (refuses to run on a non-empty database)
│   ├── test/rules.test.js  Unit tests for the booking rules
│   └── uploads/            Local private document storage (development only)
├── docs/                   PRD, architecture, database, API, deployment, testing, user guide
└── package.json            npm workspaces and root scripts
```

---

## Getting started

### Prerequisites
- Node.js 20 or newer and npm
- A MongoDB instance (local, or a MongoDB Atlas cluster)

### Setup

```bash
# 1. Clone and install
git clone https://github.com/Arnav-Rastogi/Mall-Home-Utility-Services-Aggregator.git
cd Mall-Home-Utility-Services-Aggregator
npm install

# 2. Configure the API
cp server/.env.example server/.env
#   set MONGODB_URI, a long random JWT_SECRET, CLIENT_URL=http://localhost:5173
#   keep COOKIE_SECURE=false for local HTTP

# 3. Configure the client
cp client/.env.example client/.env
#   VITE_API_URL=http://localhost:4000/api/v1

# 4. (Optional) load demo data into an empty database
npm run seed

# 5. Run client and API together
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:4000 (health check: `GET /api/v1/health`)

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the API (with `--watch`) and the Vite dev server |
| `npm run build` | Production build of the client into `client/dist` |
| `npm test` | Runs the server unit tests |
| `npm run seed` | Seeds demo data (aborts if any collection already has records) |

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `PORT` | server | API port (default 4000) |
| `MONGODB_URI` | server | MongoDB connection string (required) |
| `JWT_SECRET` | server | Secret for signing session tokens (required) |
| `CLIENT_URL` | server | Exact frontend origin allowed by CORS (required) |
| `COOKIE_SECURE` | server | `true` when served over HTTPS |
| `UPLOAD_DIR`, `MAX_UPLOAD_BYTES` | server | Document storage folder and size limit (default 5 MB) |
| `CURRENCY` | server | Default currency for new services (`INR`) |
| `DEFAULT_TIMEZONE` | server | Timezone for new provider profiles (`Asia/Kolkata`) |
| `VITE_API_URL` | client | Base URL of the API (public, never put secrets here) |

`MAP_TILE_URL`, `PRIVATE_STORAGE_PROVIDER` and the `EMAIL_*` values are placeholders in `server/.env.example`; maps and email delivery are not wired up yet.

---

## Demo accounts

Created by `npm run seed`. Shared password: `UtilityDemo123!`

| Role | Email |
|---|---|
| Customer | customer@utilityconnect.demo |
| Approved provider | provider@utilityconnect.demo |
| Approved provider | provider2@utilityconnect.demo |
| Pending provider | pending@utilityconnect.demo |
| Administrator | admin@utilityconnect.demo |

The seeded providers, reviews and bookings are fictitious demo records, not real verification. **Never seed demo credentials in production.**

---

## Booking lifecycle

```
          ┌──────────► rejected
pending ──┤
          └──► accepted ──► in_progress ──► completed ──► (review)
   │              │
   └──────────────┴──► cancelled   (customer only)
```

| From | To | Who |
|---|---|---|
| pending | accepted / rejected | Provider |
| accepted | in_progress | Provider |
| in_progress | completed | Provider |
| pending / accepted | cancelled | Customer |

Completed, rejected and cancelled bookings are terminal. Admins cannot change booking status through the participant endpoint. Every status change creates a notification for the other party. When a provider accepts a request, the agreed amount defaults to the estimate.

---

## Availability and scheduling

- Providers define weekly working hours as `HH:mm-HH:mm` per weekday, plus a timezone (IANA name, default `Asia/Kolkata`) and optional unavailable intervals.
- The API generates **one-hour slots** in the provider's local time and marks each as `available`, `booked`, `pending` or `unavailable`.
- Scheduled bookings must be in the future, inside working hours and on a slot boundary. Overlaps with unavailable intervals or other active appointments are rejected at request time and again at acceptance time.
- The booking dialog loads open dates (next 60 days) and slots, and refreshes them every 20 seconds.
- Instant requests are allowed only while the provider is within working hours.

---

## API overview

Base path `/api/v1`. Errors use `{ "error": "..." }`; validation errors add `details`. Full reference: [docs/API.md](docs/API.md).

| Area | Endpoints |
|---|---|
| Auth and users | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PATCH /users/me` |
| Categories | `GET /categories`, `POST /categories` (admin), `PATCH /categories/:id` (admin) |
| Providers | `GET /providers`, `GET /providers/:id`, `GET /providers/:id/availability`, `GET /providers/:id/reviews` |
| Provider self-service | `GET/PATCH /providers/me`, `POST/PATCH /providers/me/services`, `POST /providers/me/verification-documents` |
| Bookings | `POST /bookings`, `GET /bookings`, `GET /bookings/:id`, `PATCH /bookings/:id/status`, `POST /bookings/:id/reviews` |
| Notifications | `GET /notifications`, `PATCH /notifications/read` |
| Disputes | `POST /disputes`, `GET /disputes`, `PATCH /disputes/:id` (admin) |
| Dashboard | `GET /dashboard` (role-specific) |
| Admin | `GET /admin/providers`, `GET /admin/providers/:id/documents/:index`, `PATCH /admin/providers/:id/verification`, `PATCH /admin/users/:id/status`, `GET /admin/reports/bookings.csv` |

### Data model

Eight Mongoose models: **User**, **Category**, **Provider**, **Service**, **Booking**, **Review**, **Notification**, **Dispute**. Details and indexes: [docs/DATABASE.md](docs/DATABASE.md).

---

## Security

- Passwords hashed with bcrypt (cost 12); hashes are excluded from normal queries
- Session JWT (7 days) in an HTTP-only, `SameSite=Lax` cookie; every request re-loads the user and checks the account is active
- Role-based access control on every protected route; the user role is immutable and public registration cannot create admins
- Ownership checks: customers see only their bookings, providers only their own, admins everything
- Zod validation on request bodies, Helmet headers, CORS locked to `CLIENT_URL`, 1 MB JSON limit, rate limit of 300 requests per 15 minutes on `/api/`
- Verification documents: PDF/JPEG/PNG only, size capped, served only to admins; public provider responses never include documents
- Required environment variables are checked at startup

---

## Testing

```bash
npm test        # server unit tests
npm run build   # production client build
```

The suite has 9 tests covering booking transition rules, participant checks, future-date validation, overlap detection, provider-timezone slot generation, booked/pending/unavailable states and open-date search. HTTP and database integration tests and browser automation are not included yet. See [docs/TESTING.md](docs/TESTING.md) for the manual acceptance checklist and what has been verified by hand.

---

## Deployment

- **Frontend:** build with `npm run build` and host `client/dist` on Vercel or Netlify, with `VITE_API_URL` pointing at the deployed API.
- **API:** run `npm start --workspace server` on a Node host such as Render or AWS, against MongoDB Atlas or another managed MongoDB.
- Set `CLIENT_URL` to the exact frontend origin, use HTTPS and set `COOKIE_SECURE=true`.
- If the frontend and API are on different sites, the cookie policy needs `SameSite=None; Secure` plus CSRF protection before production use.
- Local disk uploads are for development only; production needs private object storage, backups and malware scanning for identity documents.

Full steps: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Requirements coverage

Status against the project specification. "API only" means the backend route exists but there is no screen for it yet.

| Area | Status |
|---|---|
| Web platform, desktop and mobile responsive | Done |
| Browse by the five categories | Done |
| Search by location, service type and price | Done |
| Search by **availability** | Partial: availability is shown as open dates and slots when booking, but is not a search filter |
| Provider profiles (skills, experience, pricing) and ratings and reviews | Done |
| Instant and scheduled booking, status tracking, service history | Done |
| Provider registration, document upload, offerings and pricing, availability, accept/reject, job status | Done |
| Provider earnings and job history | Partial: dashboard shows recorded earnings and booking counts |
| Admin approval of providers | Done |
| Admin monitoring of requests and disputes | Partial: dispute endpoints exist (API only); no admin UI for disputes or a full requests list |
| Admin pricing guidelines (optional) | Not implemented |
| Admin analytics and reports | Partial: summary cards and bookings CSV |
| Notifications (REST alerts) | Done in the API and shown on the dashboard |
| Notification and dispute screens for customers | Partial: customers can open disputes through the API only |
| Residential and commercial (mall) support | Partial: supported through free-text address and copy; there is no dedicated space-type field |
| Multiple cities and scalability | Partial: city and locality fields, indexes and pagination; no city management screen |
| Non-functional: performance under 3 seconds | Not measured |
| Maps and location APIs | Not implemented: manual text location only |
| Database | MongoDB (the spec allows MongoDB or PostgreSQL) |
| Frontend framework | React with Vite (the spec allows React or Next.js) |
| Docs: PRD and technical documentation | Done, in `docs/` |
| Deployment-ready build | Production build and env templates; no Docker files |

### KPIs

| KPI | Status |
|---|---|
| Number of registered users | Shown |
| Number of verified service providers | Shown |
| User satisfaction rating | Shown (average and count) |
| Average job completion time | Not shown (timestamps are stored) |
| Service booking conversion rate | Not instrumented |

---

## Known limitations

- Admin screens cover provider approval and the bookings CSV; dispute handling, category management and user suspension are available through the API only.
- Charts and trend reports are not implemented, although `recharts` is installed.
- No concurrency-safe slot reservation: conflicts are checked when a request is made and when it is accepted, but two simultaneous requests could still race.
- Uploaded documents live on the local disk of the API server.
- Email delivery and map rendering/geocoding are not wired up.
- Privacy policy and terms pages are placeholders that need legal review.
- The frontend is concentrated in `client/src/main.jsx`; splitting it into components would help maintainability.
- Only pure business rules have automated tests.

---

## Out of scope and future enhancements

Out of scope for Phase 1: native mobile apps, material procurement and inventory management, long-term AMC contracts, and in-app payments.

Planned later: online payments and invoices, a mobile application, AMC and subscription plans, real-time chat with providers, and AI-based service recommendations.

---

## Documentation

| Document | Contents |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product requirements |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and security boundaries |
| [docs/DATABASE.md](docs/DATABASE.md) | Models, indexes and invariants |
| [docs/API.md](docs/API.md) | REST endpoint reference |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Setup and deployment guide |
| [docs/TESTING.md](docs/TESTING.md) | Test record and manual checklist |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | How each role uses the app |

---

## Impact

- Faster access to trusted utility services
- Reduced downtime for homes and malls
- More income opportunities for local professionals
- Better service transparency and accountability
