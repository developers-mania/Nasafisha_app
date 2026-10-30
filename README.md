# Nasafisha App

This repository is organized so the application code lives under an `app/` directory.

## Folder Structure

```text
Nasafisha_app/
├── README.md
├── backend/       # NestJS API (copied from Desktop/Nasafisha_api)
├── app/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── .prettierrc
│   ├── .vscode/
│   │   └── extensions.json
│   ├── data/
│   │   └── db.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── playwright.config.ts
│   ├── postcss.config.mjs
│   ├── tailwind.config.mjs
│   ├── tsconfig.json
│   ├── vercel.json
│   ├── vite.config.js
│   ├── vitest.config.ts
│   ├── public/
│   │   ├── infospace-meta.png
│   │   ├── logo-dark.png
│   │   ├── logo-light.png
│   │   ├── manifest.webmanifest
│   │   ├── offline.html
│   │   ├── vite.svg
│   │   └── icons/
│   │       ├── icon-192.png
│   │       ├── icon-512.png
│   │       └── icon-maskable.png
│   └── src/
│       ├── App.vue
│       ├── main.js
│       ├── style.css
│       ├── api/
│       ├── assets/
│       ├── components/
│       ├── composables/
│       ├── config/
│       ├── helpers/
│       ├── i18n/
│       ├── layouts/
│       ├── offline/
│       ├── providers/
│       ├── router/
│       ├── store/
│       ├── types/
│       ├── views/
│       └── tests/
└── .git/
```

## Getting started

```bash
cd app
npm install
npm run dev
```

To run the mock API locally:

```bash
npm install -g json-server
json-server --watch data/db.json
```

## NestJS API

The backend project is available in `backend/`. Install its dependencies and
create a local environment file from the example before starting it:

```powershell
cd backend
npm install
Copy-Item .env.example .env
# Fill backend/.env with the required database, JWT, and Supabase settings.
npm run start:dev
```

The original backend folder on the Desktop is unchanged. Its local `.env`,
dependencies, build output, Git metadata, and uploaded files were not copied.
The frontend's shared API client defaults to `http://localhost:4000`; override
it with `VITE_API_BASE_URL` in `app/.env` if needed. Start Vite from `app/` with
`npm run dev`. The backend's default CORS configuration allows the Vite
development origin on port 5173.

The staff, contractor, and field sign-in forms call the backend's
`/auth/admin/login`, `/auth/contractor/login`, and `/auth/crew/login` routes.
There is no mock-success fallback: a backend or credential error is shown to
the user. The citizen landing flow now uses the backend's email-code endpoints
(`/auth/otp/request` and `/auth/otp/verify`), including account registration.
Google OAuth currently authenticates with Supabase; it is not exchanged for a
NestJS access token, so it does not yet authenticate requests to
backend-protected routes. Some dashboard and dumping-site screens still use
the local JSON mock API.

## Google sign-in

The Vue app supports Google OAuth through Supabase. Set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY` in `app/.env` using the project URL and
publishable key from Supabase. Existing projects using the legacy anon key may
set `VITE_SUPABASE_ANON_KEY` instead. Never put a `service_role` key in the
frontend.

Enable the Google provider in Supabase Authentication and configure its Google
OAuth client credentials. In Google Cloud, allow the app origin as an authorized
JavaScript origin and add Supabase's displayed `/auth/v1/callback` URL as an
authorized redirect URI. In Supabase URL Configuration, allow
`http://localhost:5173/auth/callback` for local development and the equivalent
callback URL on the deployed app.

New Google accounts without a trusted role are treated as citizens. To grant a
staff, field, or contractor role, provision the matching `role` value
(`admin`, `field`, or `contractor`) in the user's trusted Supabase `app_metadata`.
Roles in Google profile metadata are not used for access decisions.

## Notes

- The frontend app root is `app/`.
- `.env` files are ignored by Git and should not be committed.
- Built-in config and tooling are already in place for Vite, Vue, Tailwind, ESLint, Vitest, and Playwright.