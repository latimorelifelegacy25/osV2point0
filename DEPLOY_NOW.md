# Latimore OS v2 — Go-Live Hardening

This repo is the recruiting operating system for `os.latimorelifelegacy.com`.

## Launch rule

Do not treat the system as live until these pass:

```bash
npm install
npm run db:generate
npm run preflight
npm run build
npm run db:push
npm run smoke
```

For deployed smoke tests:

```bash
SMOKE_BASE_URL=https://os.latimorelifelegacy.com npm run smoke
```

## Required environment

Core:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ADMIN_EMAILS`

Recommended for production:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `QSTASH_TOKEN`
- `STORAGE_ENDPOINT`
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`
- `NEXT_PUBLIC_BASE_URL`

## Verification checklist

- `/api/health` returns `ok: true`
- Prisma can connect to Supabase Postgres
- Admin route is protected
- Campaign CRUD works
- CRM lead creation works
- Tracking links resolve through `go.latimorelifelegacy.com/t/:slug`
- Composer does not publish without review gates
- Analytics read from PostgreSQL rollups, not live provider dashboards

## First-time database setup

This repository currently uses Prisma schema push for first-time setup unless migrations are later committed.

```bash
npm run db:push
```

After the system stabilizes, create and commit proper migrations before production schema changes.
