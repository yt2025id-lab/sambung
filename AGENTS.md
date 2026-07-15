# AGENTS.md — AI-Assisted Development Guide

## Stack
- **Runtime:** Node.js 20+, pnpm 9+, Rust 1.80+
- **Backend:** Fastify + TypeScript + Prisma + PostgreSQL
- **Blockchain:** Stellar Soroban (Rust) + `@stellar/stellar-sdk`
- **Mobile:** React Native + Expo Router
- **Queue:** BullMQ + Redis
- **CI:** GitHub Actions

## Commands
```bash
pnpm dev           # Run all in dev
pnpm build         # Build all packages
pnpm test          # Run all tests
pnpm lint          # TypeScript check
pnpm db:migrate    # Prisma migrate
pnpm db:seed       # Seed data
pnpm db:studio     # Prisma Studio
```

## Conventions
- TypeScript strict mode
- Async/await, no callbacks
- Prisma for all DB access
- Zod for runtime validation
- Fastify for API server
- Soroban SDK v21 for contracts

## Project Structure
- `apps/api/src/routes/` — Fastify route handlers
- `apps/api/src/services/` — Business logic
- `packages/sdk/src/` — Shared SDK (QRIS parser, types)
- `contracts/` — Soroban Rust contracts
- `keeper/src/` — Off-chain tx executor

## Local Dev Notes
- PostgreSQL 16 + Redis 8.8 installed via Homebrew, started via `brew services`
- App runs under Turbo v2 (uses `tasks` key, not `pipeline`)
- API: `GET /health`, `GET /v1/rates/usdc-idr`, `POST /v1/qris/resolve`
- All packages resolve from `node_modules/.pnpm/` via workspace protocol
- Soroban CLI not yet installed (pending `cargo install stellar-cli` or brew)
- Testnet USDC issuer: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`
