# UtilityConnect

UtilityConnect is a responsive marketplace for discovering local home, apartment, community and commercial service professionals and coordinating service bookings. The current repo was empty at project start; this implementation establishes a React/Vite client and Express/Mongoose API.

## Features

- Customer and provider registration/login using JWT in HTTP-only cookies. Public registration supports only customer/provider roles.
- Five database seeded categories: Electrician, Plumber, Carpenter, Tailor, Maintenance staff.
- Provider directory and public profiles, service listings and estimates, service area and rating filters, pagination.
- Pending provider verification, private local document upload, admin review and approval/rejection.
- Booking requests, status transitions, cancellation, recorded completion/earnings, reviews, disputes and persistent notifications.
- Role-specific overview dashboards, admin pending verification queue, CSV booking export.
- Responsive public pages, role dashboards, help and legal placeholders.

## Stack and architecture

React 18, Vite, React Router, Axios and Lucide on the frontend. Express 4, Mongoose, MongoDB, Zod validation, bcrypt, JWT, Helmet, CORS and rate limiting on the backend. API base path: `/api/v1`. Architecture and route details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API.md](docs/API.md).

## Prerequisites and setup

- Node.js 20 or newer and npm.
- MongoDB local instance or MongoDB Atlas database.
- Copy `server/.env.example` to `server/.env`; set `MONGODB_URI`, a long random `JWT_SECRET`, and `CLIENT_URL=http://localhost:5173`. Set `COOKIE_SECURE=false` for local HTTP.
- Copy `client/.env.example` to `client/.env`; set `VITE_API_URL=http://localhost:4000/api/v1`.
- Install dependencies from the repository root: `npm install`.
- Start development: `npm run dev` (client `http://localhost:5173`, API `http://localhost:4000`).
- Seed development examples: `npm run seed` after MongoDB is running and server env is configured. The script refuses to seed if any application collection already contains records, so it cannot reset existing data.
- Production client build: `npm run build`.
- API checks: `npm test`.

## Demo accounts

Seed password for all: `UtilityDemo123!`

| Role | Email |
|---|---|
| Customer | customer@utilityconnect.demo |
| Approved demo provider | provider@utilityconnect.demo |
| Second approved demo provider | provider2@utilityconnect.demo |
| Pending provider | pending@utilityconnect.demo |
| Administrator | admin@utilityconnect.demo |

Seeded providers, reviews and booking records are demonstrations; they do not represent genuine identity verification or customers. Never seed demo credentials in production.

## Tests, screenshots, deployment

Run `npm test` and `npm run build`. No screenshots are committed yet. Deployment setup, environment, cookie/CORS notes and known limitations are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). User instructions are in [docs/USER_GUIDE.md](docs/USER_GUIDE.md); test scenarios/results in [docs/TESTING.md](docs/TESTING.md).

## Operational exclusions and limitations

No payments, invoices, automatic refunds, native mobile apps, inventory/materials, AMC/subscriptions, live chat or AI recommendations are implemented. Disputes are manually administered. Email delivery and external private object storage are not wired; local uploads use a private server folder and are intended for development. Text location filtering works without map credentials; map rendering/geocoding is not implemented. Legal pages are placeholders and require jurisdiction-specific review. Scheduling now offers provider-timezone one-hour slots and checks unavailable intervals and accepted bookings; concurrent slot reservation still needs production hardening. Charts beyond summary metrics and several requested KPI distributions remain unimplemented. Mongo-backed tests/runtime require a configured reachable database.
