# helsebygg-api

Node/Express backend for the Helsebygg AS anonymous incident-reporting system.

## Layout

```
.
├── server.js              # Express entry – wires middleware + routers
├── db.js                  # Two mysql2 pools (auth + reports), strictly separated
├── middleware/
│   └── auth.js            # requireSession, requireRole
├── routes/
│   ├── auth.js            # POST /api/auth/login, /logout
│   ├── tokens.js          # POST /api/submission-token (requires session)
│   ├── reports.js         # POST /api/reports (anonymous), GET/PATCH (managers)
│   └── notes.js           # GET/POST /api/reports/:id/notes (managers)
└── utils/
    └── token.js           # HMAC-signed, stateless submission tokens
```

## How anonymity is preserved

1. **Login** sets a session cookie that identifies the user. This cookie is used
   only by `/api/auth/*` and `/api/submission-token`.
2. **Submission token** is minted per-request and contains *no* user identifier.
   The server stores only a per-user daily *count* (in `submission_quota`), never
   a link to the specific token.
3. **Report submission** (`POST /api/reports`) is unauthenticated from a session
   perspective. It validates the HMAC on the submission token and consumes the
   nonce. The reports DB user has no privileges on the auth schema, so even a
   buggy query cannot join across.
4. `created_at` on `incident_report` is a `DATE` (day-bucketed), so timing cannot
   correlate a submission with a login timestamp in the auth DB.

## First-time setup

```bash
npm install
cp .env.example .env
# Generate two random 64-byte secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Paste them into SESSION_JWT_SECRET and SUBMISSION_HMAC_KEY in .env.
```

### Generate a real password hash for seed users

```bash
node -e "require('argon2').hash('YourPassword1!').then(console.log)"
```

Paste the resulting `$argon2id$...` string into the `password_hash` column of
`user_account`.

### Start

```bash
npm start
```

The server binds to `127.0.0.1:3000`. Put IIS (or another reverse proxy) in front
to expose it on `https://avvik.helsebygg.no`.

## Endpoints

| Method | Path                              | Auth                | Purpose                        |
|--------|-----------------------------------|---------------------|--------------------------------|
| POST   | `/api/auth/login`                 | -                   | Returns session cookie         |
| POST   | `/api/auth/logout`                | -                   | Clears session cookie          |
| POST   | `/api/submission-token`           | session             | Mint one-shot submission token |
| POST   | `/api/reports`                    | submission token    | Anonymous report               |
| GET    | `/api/reports`                    | manager/admin       | List reports                   |
| GET    | `/api/reports/:id`                | manager/admin       | Read report                    |
| PATCH  | `/api/reports/:id/status`         | manager/admin       | Update status                  |
| GET    | `/api/reports/:id/notes`          | manager/admin       | List case notes                |
| POST   | `/api/reports/:id/notes`          | manager/admin       | Add case note                  |
| GET    | `/api/health`                     | -                   | DB ping                        |
