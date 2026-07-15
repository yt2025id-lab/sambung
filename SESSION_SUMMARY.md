# Session Summary — 15 July 2026

## What We Did

### 1. Monorepo Setup (✅ Complete)
- **pnpm install** — all 4 workspace packages installed (281 packages)
- **PostgreSQL 16 + Redis 8.8** — installed via Homebrew, services running
- **Database** — `sambung` DB created, Prisma migration applied (7 tables), seed data inserted (Xendit + Flip partners, USDC/IDRT rate)
- **pnpm dev** — runs 4 processes: API (:3000), Keeper, SDK (tsc --watch), Database (tsc --watch)

### 2. Fixes Applied
- `turbo.json` — renamed `pipeline` → `tasks` (Turbo v2 breaking change)
- `schema.prisma` — added `remittances` relation on Recipient, changed PjpPartner.id from UUID to String (for 'xendit'/'flip' keys)
- `packages/sdk/src/qris.ts` — fixed `merchantInfo.get()` type error by refactoring NMID extraction into `getNmidFromQRIS()`
- `apps/api/src/services/stellar.ts` — fixed testnet USDC issuer to valid address `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`
- `keeper/src/config.ts` — same USDC issuer fix + dotenv root path fix
- `apps/api/src/config.ts` — dotenv loads from project root instead of CWD
- `keeper/src/index.ts` — `createWorker` → `Worker` (BullMQ v5 API), added `maxRetriesPerRequest: null` to Redis

### 3. Verified Working
- `GET /health` → `{"status":"ok"}`
- `GET /v1/rates/usdc-idr` → returns seeded rate data from DB
- `POST /v1/qris/resolve` → parses QRIS strings (tested with invalid QRIS → proper error)
- Keeper starts successfully with BullMQ workers connected to Redis

### 4. Stuck On
- **Soroban CLI not installed** — `brew install stellar/tap/soroban-cli` timed out, `cargo install soroban-cli` has dependency conflicts with Rust 1.93. Next try: `cargo install stellar-cli` (the new unified CLI that includes soroban commands), or use Docker.

## State of the Project

```
Sambung/
├── apps/api/           — Fastify server (routes, services, jobs)
├── contracts/          — Soroban Rust contract (payment-gateway)
├── keeper/             — BullMQ worker (off-chain tx executor)
├── packages/
│   ├── database/       — Prisma schema + client
│   └── sdk/            — QRIS parser, types, constants
├── scripts/            — deploy-contracts.sh, smoke-test.sh
├── .env                — database + Redis config (no secrets yet)
└── docs/               — PRD, execution plan, build guide
```

## Next Session: Continue at Step 2
1. Install Soroban CLI: `brew install stellar/tap/soroban-cli` or `cargo install stellar-cli`
2. Build contract: `pnpm contracts:build` from project root
3. Create testnet Stellar account, fund with friendbot
4. Deploy: `pnpm contracts:deploy:testnet`
5. Update `.env` with contract ID and treasury keys
6. Proceed to QRIS scanner mobile integration (step 3) and Xendit API (step 4)
