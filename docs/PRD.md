# Product requirements: UtilityConnect

## Overview and problem

UtilityConnect connects customers, residents, facility managers and commercial locations with local providers through searchable profiles, service estimates and trackable booking requests. People currently rely on informal referrals and manual coordination, making pricing, timing and accountability difficult to compare.

## Objectives and scope

Phase 1 delivers responsive web discovery, customer/provider accounts, admin-controlled provider review, service catalogs, booking coordination, histories, reviews, disputes and operational oversight. The platform is an intermediary; it does not collect payment. Native apps, online payments/invoices/refunds, procurement/inventory, long-term AMC/subscriptions, real-time chat and AI recommendations are future work.

## Roles and requirements

- Customers: register, manage account, discover approved profiles, request service, track/cancel eligible booking, review completed work, open a dispute, receive updates.
- Providers: register pending review, manage profile/services, upload private review documents, respond to requests, record job progress and completion, see history and recorded earning amounts.
- Administrators: review documents, approve/reject with reason, suspend/reactivate users, oversee bookings and disputes, inspect operational summary and export booking CSV.

## Main flow

Customer selects a category/location, inspects approved provider services and estimate, submits instant or scheduled request, provider accepts/rejects, accepted work moves to in-progress and completed, customer reviews eligible work, and admin monitors persisted records.

## Technology and data

React/Vite browser client; Express REST API under `/api/v1`; MongoDB/Mongoose models for users, providers, categories, services, bookings, reviews, notifications and disputes. Passwords are bcrypt hashes. Session JWT is an HTTP-only cookie. Providers start pending. See DATABASE and ARCHITECTURE docs.

## KPIs

Registered accounts count all User records (operational dashboard currently reports overall total). Verified provider count means approved provider profiles. Satisfaction is mean stored provider review rating with review count. Completion duration is not currently presented in UI. Booking conversion needs tracked eligible unique search initiators and unique bookers; this is not currently instrumented. No target performance claims are made.

## Assumptions and constraints

Initial seed currency is INR, but services store configurable currency. A scheduled appointment is represented by its start time; conflict checks currently reserve a one-hour window. Location uses user-entered city/locality/address; maps are optional and not implemented in this build. Provider approval represents admin action in the system, not an external credentialing guarantee.

## Deliverables and acceptance

Repository includes frontend, API, seed script, env templates, docs and smoke test files. Acceptance is limited to checks explicitly recorded in TESTING.md; database-backed end-to-end acceptance requires a reachable MongoDB and is not inferred from source alone.
