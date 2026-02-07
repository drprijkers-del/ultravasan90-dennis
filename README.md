# Heisenberg Endurance Lab — Ultravasan 90

Publieke training progress website met near real-time Strava integratie en live race-day tracking op kaart.

**Stack:** Next.js (App Router), Postgres (Neon/Supabase), Prisma ORM, Recharts, Leaflet, TypeScript, Tailwind CSS.

## Features

- **Training Dashboard** — km/week, km/maand, long run pace trend, totaal progress
- **Strava Sync** — OAuth + webhook: nieuwe runs verschijnen automatisch
- **Long Run Tracking** — pace trend over tijd met filtering (zondag / "long" / >15km)
- **Live Race Map** — GPS tracking dot op de Ultravasan route met checkpoints + ETA
- **Mock Mode** — zonder Strava/DB config wordt automatisch demo data getoond

## Pagina's

| Route | Beschrijving |
|-------|-------------|
| `/` | Home dashboard met 4 widgets + countdown |
| `/progress` | Tabel met alle long runs |
| `/race` | Live race tracking kaart + checkpoints |

## Setup

### 1. Strava App aanmaken

1. Ga naar https://www.strava.com/settings/api
2. Maak een nieuwe applicatie aan
3. Noteer **Client ID** en **Client Secret**
4. Stel het **Authorization Callback Domain** in op je Vercel domain (bijv. `your-app.vercel.app`)

### 2. Database opzetten

Maak een Postgres database aan bij [Neon](https://neon.tech) of [Supabase](https://supabase.com).

Kopieer de connection string (met `?sslmode=require`).

### 3. Environment variables

Kopieer `.env.example` naar `.env` en vul in:

```bash
cp .env.example .env
```

| Variable | Beschrijving |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string |
| `STRAVA_CLIENT_ID` | Van Strava Developer portal |
| `STRAVA_CLIENT_SECRET` | Van Strava Developer portal |
| `STRAVA_VERIFY_TOKEN` | Zelfgekozen token voor webhook verificatie |
| `STRAVA_REFRESH_TOKEN` | Wordt opgeslagen na OAuth flow |
| `RACE_PING_SECRET` | Geheim token voor live GPS pings |
| `NEXT_PUBLIC_SITE_URL` | Je Vercel URL |
| `NEXT_PUBLIC_RACE_DELAY_MINUTES` | `0` of `5` (live delay) |

### 4. Database migratie

```bash
npx prisma migrate dev --name init
```

### 5. Lokaal draaien

```bash
npm run dev
```

Open http://localhost:3000 — zonder Strava config zie je demo data.

### 6. Strava OAuth koppelen

Ga naar `/api/strava/auth` om de OAuth flow te starten. Na autorisatie wordt je token opgeslagen in de database.

### 7. Strava Webhook instellen

Maak een webhook subscription aan via de Strava API:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://your-app.vercel.app/api/strava/webhook \
  -F verify_token=heisenberg-ultravasan-verify
```

### 8. Deploy naar Vercel

1. Push naar GitHub
2. Import in Vercel
3. Voeg alle env vars toe in Vercel dashboard
4. Deploy

### 9. Test flow

1. Upload een run naar Strava (via Garmin, telefoon, etc.)
2. Strava stuurt webhook naar je app
3. Binnen 1-5 min zichtbaar op je site

## Race-day Live Tracking

### GPS pings sturen (vanaf je telefoon)

```bash
curl -X POST https://your-app.vercel.app/api/race/ping \
  -H "Authorization: Bearer YOUR_RACE_PING_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"lat": 61.1575, "lng": 13.2633, "speed_mps": 2.5}'
```

Gebruik een GPS tracker app die periodiek POST requests stuurt, of bouw een simpele PWA.

### Viewers

Viewers openen `/race` en zien real-time updates via Server-Sent Events (SSE).

## Projectstructuur

```
src/
  app/
    api/
      strava/auth/       → OAuth start
      strava/callback/   → OAuth callback
      strava/webhook/    → Webhook (GET verify + POST events)
      stats/             → Public stats API
      race/ping/         → Live GPS ingestion
      race/stream/       → SSE stream voor viewers
    progress/            → Long runs tabel
    race/                → Live map pagina
    page.tsx             → Home dashboard
    layout.tsx           → Root layout met nav
  components/            → UI componenten (charts, cards, map)
  lib/
    prisma.ts            → Prisma client singleton
    strava.ts            → Strava API client + sync logic
    mock-data.ts         → Demo data
    race-config.ts       → Race configuratie + helpers
  generated/prisma/      → Prisma generated client
prisma/
  schema.prisma          → Database schema
```
