# Setup and deployment

1. Install Node.js 20+ and npm; provision MongoDB locally or Atlas. Allow the API host network access and use a least-privileged database user.
2. Copy `server/.env.example` to `server/.env`; configure `MONGODB_URI`, random `JWT_SECRET`, `CLIENT_URL`, `COOKIE_SECURE=true` for HTTPS and a persistent private `UPLOAD_DIR` or storage integration.
3. Copy `client/.env.example` to `client/.env` and set `VITE_API_URL` to the deployed API `/api/v1` origin. Vite variables are public, never put secrets there.
4. Run `npm install`, optionally `npm run seed` only in development, `npm test`, `npm run build`; start API with `npm start --workspace server` and serve `client/dist` with Vercel/Netlify.
5. Set API CORS origin to the exact deployed frontend. Configure HTTPS and secure cookies. The current cookie SameSite policy is Lax; if frontend/API are cross-site, deployment needs SameSite=None/Secure and CSRF protections before use.
6. Configure private object storage, backups, retention/deletion, malware scanning and access auditing for identity documents before production. Current storage is a local private folder, suitable only for a single-server development setup.

No map token is required because only manual text location is implemented. OSM tile URL is a template only. `DEFAULT_TIMEZONE` sets the timezone for new provider profiles (default `Asia/Kolkata`); providers can change their timezone in the profile workspace. Email env fields are placeholders; email sending is not wired. Troubleshoot database errors by checking URI/network/user permissions. Do not run demo seed on production.
