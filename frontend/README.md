# helsebygg-client

React frontend for the Helsebygg AS anonymous incident-reporting system.

## Pages

- `/login` – login form
- `/submit` – anonymous report submission (any authenticated user)
- `/dashboard` – list of incoming reports (managers/admins only)
- `/dashboard/:id` – report detail with status change and case notes

## Dev workflow

```bash
npm install
npm run dev          # http://localhost:5173, proxies /api to http://127.0.0.1:3000
```

If you're running the API on another VM (not localhost), open
`vite.config.js` and change the `target` field in the proxy section
to match — e.g. `http://192.168.20.20:3000`.

## Production build

```bash
npm run build
```

This produces a `dist/` folder containing `index.html`, a CSS file, and
a hashed JS bundle. That folder is what you deploy to the App Server.

### Deploying to the App Server (IIS)

1. Build on your helper machine: `npm run build`.
2. Copy the entire `dist/` folder into your offline bundle, e.g.
   `C:\offline-bundle\helsebygg-client-dist\`.
3. Transfer the bundle to the App Server.
4. Copy `dist\*` into `C:\inetpub\wwwroot\` (or whatever folder your
   IIS site's physical path points to).
5. Drop the `web.config` (provided separately in the Windows Server
   setup guide) into the same folder so IIS serves `index.html` for
   any non-`/api/*` route (React Router needs this) and reverse-proxies
   `/api/*` to the API VM.

## Environment assumption

The client makes relative-path requests only (`/api/auth/login`, etc.).
In production IIS handles both serving the app and proxying `/api/*`,
so no CORS and no separate API URL ever appears in the client code.

## Known trade-offs

- **Refresh = re-login.** There's no `/api/auth/me` endpoint, so on
  page reload the app falls back to whatever role was stored in
  `localStorage`. If the session cookie is expired, the next API call
  will 401 and the `RequireAuth` guard kicks the user back to
  `/login`.
- **Role in localStorage is a UI hint, not a security control.**
  The backend re-checks the JWT role on every privileged request —
  so even if someone tampers with `localStorage`, they cannot reach
  `/api/reports` (GET/PATCH) or `/api/reports/:id/notes` without a
  real manager/admin JWT.
