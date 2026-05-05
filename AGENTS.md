# AGENTS.md — finanzas

## Stack
- Next.js 16 (App Router), React 19, TypeScript strict
- Prisma 7.7 + PostgreSQL via `@prisma/adapter-pg`
- Tailwind v4, ESLint v9
- Node 22 (Dockerfile)

## Commands
```
npm run dev          # dev server (port 3000)
npm run build        # production build
npm run lint         # ESLint
npx tsc --noEmit     # typecheck (no script defined)
```

## Database / Prisma
- `.env` sets `DATABASE_URL=postgresql://admin:password@localhost:5433/finanzas`
- Start DB: `docker compose up -d db`
- Prisma CLI requires `dotenv/config` already imported in `prisma.config.ts`
- Generate client after schema changes: `npx prisma generate`
- Run migrations: `npx prisma migrate dev`
- Client output: `src/generated/prisma` (gitignored)
- DB singleton lives in `src/lib/db.ts` (singleton pattern to avoid connection exhaustion in dev)

## Architecture
```
src/
  app/          # Next.js App Router — pages, layouts, API routes
    api/        # Route handlers: accounts, categories, transactions, users
  lib/          # Shared utilities (db, auth[stub], env[stub], utils)
  modules/      # Domain modules: account, auth, category, transaction, user
    *.repository.ts   # Prisma data access
    *.service.ts      # Business logic, calls repository
    *.types.ts        # Types/interfaces
```
- Repositories import `prisma` from `@/lib/db`; services import repositories; API routes import services
- Path alias: `@/*` → `./src/*`

## Docker
- `docker compose up` starts app (port 3000) + postgres (container port 5432 → host 5433)
- Container DB URL uses hostname `db`, not `localhost`

## Gotchas
- No test framework is configured — do not assume jest/vitest exists
- No formatter configured (no prettier/biome)
- `src/lib/auth.ts` and `src/lib/env.ts` are empty stubs
- Prisma schema has a typo: `creadtedAt` field on `Account` model (line 38)
