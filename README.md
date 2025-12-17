## Tact0 Client Interface

Enterprise-friendly Next.js (App Router) interface for the Tact0 Engine with:

- Dark-first theme + light toggle using your palette.
- Zustand for UI/session state, TanStack Query for engine data.
- Real auth (email/password) via Prisma + Supabase Postgres + JWT cookie.
- Protected chat that proxies to the engine’s `/chat`.
- Tailwind CSS v4.

## Quickstart

```bash
npm install
npm run dev
```

Create `.env.local` with your engine + Supabase:

```
NEXT_PUBLIC_ENGINE_URL=https://your-engine.example.com
NEXT_PUBLIC_ENGINE_API_KEY=
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require
AUTH_JWT_SECRET=generate_a_long_random_string
```

Then:
- `npx prisma generate`
- `npm run dev -- --port 3001` (if engine also runs on 3000)

## Deploy on Vercel

- The app is Vercel-ready out of the box.  
- Add the env vars above in your Vercel project settings (DATABASE_URL from Supabase, AUTH_JWT_SECRET, engine URL/API key).  
- `npm run build` is the production build command; `next start` serves it.

## Notes

- Auth endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` (JWT cookie).  
- Chat proxy: `/api/chat` → `${NEXT_PUBLIC_ENGINE_URL}/chat` (adds engine API key server-side).  
- Middleware protects `/chat` routes.  
- Theme tokens live in `app/globals.css` (`background`, `surface`, `text`, `signal`).  
- UI components live under `components/`; engine HTTP wiring is in `lib/api-client.ts`.
