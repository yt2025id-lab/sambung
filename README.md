# SAMBUNG

Cross-border remittance: TKI → QRIS Indonesia via Stellar Network.

## Quick Start

```bash
# Prasyarat
pnpm >= 9, Node >= 20, Rust >= 1.80, Docker

# Setup
pnpm install
docker compose up -d
cp .env.example .env
pnpm --filter @sambung/database db:migrate
pnpm --filter @sambung/database db:seed

# Run
pnpm dev
```

## Structure

```
contracts/        # Soroban smart contracts (Rust)
apps/api/         # Fastify API server
apps/mobile/      # React Native (Expo) mobile app
packages/         # Shared: SDK, database, queue, common
keeper/           # Off-chain transaction executor
```

## Docs

- `SAMBUNG_EXECUTION_PLAN.md` — Plan & regulasi
- `SAMBUNG_BUILD_GUIDE.md` — Build reference lengkap
