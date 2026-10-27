# Nasafisha App

This repository is organized so the application code lives under an `app/` directory.

## Folder Structure

```text
Nasafisha_app/
├── README.md
├── app/
│   ├── .env.example
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

The Vite app uses `http://localhost:4000` for the backend by default. To
override it, copy `app/.env.example` to `app/.env.local` and change
`VITE_API_BASE_URL` and `VITE_API_URL`. Citizen sign-in uses the backend's
Supabase email-code endpoints; it does not use a mock login.

Start the backend and its database in a separate terminal:

```bash
cd ..\..\Nasafisha_api\Nasafisha_api
docker compose up -d nest-db
npm run start:dev
```

## Notes

- The frontend app root is `app/`.
- Frontend environment files are ignored by Git. Use `.env.local` for local settings.
- The backend allows `http://localhost:5173` by default; configure `CORS_ORIGINS` for other origins.
- Built-in config and tooling are already in place for Vite, Vue, Tailwind, ESLint, Vitest, and Playwright.