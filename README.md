# Latimore OS v2

**Recruiting Operating System — os.latimorelifelegacy.com**

Built to SPEC-1. Schema-first. No fake metrics. No decorative dashboards.

---

## Stack

- **Framework:** Next.js 14 App Router
- **Database:** PostgreSQL via Prisma (Supabase)
- **Auth:** Session-based (cookie)
- **Rate limiting:** Upstash Redis
- **Job queue:** QStash
- **Storage:** Object storage (S3-compatible)
- **Tracking:** go.latimorelifelegacy.com/t/:slug

---

## Deploy from Termux

```bash
# 1. Clone
git clone https://gitlab.com/latimorelifelegacy25/osv2.0.git
cd osv2.0

# 2. Install
npm install

# 3. Set env
cp .env.example .env.local
# Edit .env.local with your Supabase + Upstash credentials

# 4. Push schema
npx prisma db push

# 5. Seed
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# 6. Dev
npm run dev
```

---

## Architecture Rules (SPEC-1)

```
External platforms are sources.
Raw provider payloads are evidence.
PostgreSQL is the system of record.
Analytics rollups are the reporting truth.
Knowledge must be reviewed before Composer use.
Composer creates approved, cited, UTM-tracked outputs.
AI cannot approve, publish, send, or bypass gates.
UTM required on all publishable output.
No raw URLs in publishable output — use go.latimorelifelegacy.com/t/:slug.
```

---

## Admin Modules

| Route | Function |
|---|---|
| `/admin` | Command Center — live DB stats |
| `/admin/importer` | Upload → KnowledgeAsset → review queue |
| `/admin/content` | Knowledge review, approve, restrict |
| `/admin/composer` | Draft → review → approve → publish |
| `/admin/crm` | Leads, pipeline, UTM attribution |
| `/admin/campaigns` | Campaign CRUD + tracking links |
| `/admin/analytics` | Reads PostgreSQL — no live provider calls |
| `/admin/settings` | Env config, integrations, account separation |

---

## Account Separation

| System | Domain | Audience | CTA |
|---|---|---|---|
| OS v2 Recruiting | os.latimorelifelegacy.com | Agents, career changers, entrepreneurs | Join the team |
| Retail LLC | latimorelifelegacy.com | Families, pre-retirees, SMBs | Book a consultation |

No cross-posting. No shared social accounts. No shared CTAs.

---

## Hashtag Fix

All OS v2 content uses `#LatimoreOS` (not `#LatimorOS`).
