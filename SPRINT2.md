# Latimore OS v2 — Sprint 2

Auth, object storage, knowledge review API.

## What's in this sprint

### New files
- `app/login/page.tsx` — Login page
- `app/api/auth/login/route.ts` — Login handler (session cookie)
- `app/api/auth/logout/route.ts` — Logout handler
- `app/api/upload/route.ts` — File upload → object storage → KnowledgeAsset
- `app/api/knowledge/[id]/[action]/route.ts` — Review actions (approve-internal, approve-client, restrict, archive)
- `app/api/composer/[id]/approve/route.ts` — Composer approval with gate enforcement
- `lib/storage/client.ts` — S3-compatible storage client (Supabase Storage or AWS S3)
- `prisma/seed-admin.ts` — Admin user seed script
- `components/os/OSShell.tsx` — Updated with logout + user display

### No mock data. No decorative changes. Every file does one operational job.

## Merge into main

```bash
cd ~/osv2-foundation/osv2-build

# Copy sprint 2 files (adjust path to where you unzipped sprint 2)
cp -r ~/osv2-sprint2/* .

git add .
git commit -m "feat: sprint 2 — auth, storage, knowledge review API"
git push origin main
```

## After merge — seed admin user

```bash
# Set your env first
export NEXTAUTH_SECRET="your-secret-here"
export ADMIN_PASSWORD="YourStrongPassword2026!"

npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-admin.ts
```

## Environment additions for this sprint

Add to `.env.local`:

```
# Object Storage (Supabase Storage or S3-compatible)
OBJECT_STORAGE_BUCKET=latimore-os-knowledge
OBJECT_STORAGE_ENDPOINT=https://[ref].supabase.co/storage/v1
OBJECT_STORAGE_ACCESS_KEY=your-supabase-anon-key
OBJECT_STORAGE_SECRET_KEY=your-supabase-service-role-key
OBJECT_STORAGE_REGION=us-east-1
```

## Compliance gate enforcement (Composer approve)

Approval is blocked if ANY of these are true:
- Draft has no campaign attached (UTM missing)
- Draft has zero citations
- `complianceChecked` is false
- Draft status is not `REVIEW`

AI output cannot approve itself. A REVIEWER or ADMIN must POST to `/api/composer/[id]/approve`.
