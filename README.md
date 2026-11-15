# Qurani-Kərim (Next.js)
**Canlı sayt:** https://qurani-kerim-next.vercel.app

Next.js 16 + TypeScript + Drizzle ORM + Neon Postgres. Vercel-də işləyir.

## Quraşdırma
1. `npm install`
2. `.env.local` yarat (nümunə: `.env.example`): `DATABASE_URL` (Neon), `AUTH_SECRET` (≥32 simvol), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (≥12 simvol)
3. `npm run db:push` — cədvəlləri yaradır
4. `npm run db:seed` — surə/ayə/tərcümə/təfsir datası və admin hesabı
5. `npm run dev`

## Vercel
Mühit dəyişənləri: `DATABASE_URL`, `AUTH_SECRET`. (Admin hesabı yalnız seed zamanı yaranır, Vercel-də `ADMIN_*` lazım deyil.)
