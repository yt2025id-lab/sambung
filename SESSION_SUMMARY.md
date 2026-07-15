# Session Summary — 15 July 2026 (Sesi 2)

## What We Did Today

### 1. Smart Contract — Build & Deploy (✅ Complete)
- **Stellar CLI v27.0.0** sudah terinstal, langsung pakai `stellar contract build`
- Fix 3 error kompatibilitas SDK v21 di `contracts/payment-gateway/src/lib.rs`:
  - `Error` enum tambah derive `Copy, Clone` (untuk `#[contracterror]`)
  - `sha256` ganti dari tuple → XDR serialization via `Bytes::new + ToXdr`
  - `Hash<32>` → `.into()` untuk `BytesN<32>`
- Hapus `contracts/core/` dari workspace (empty stub, blocking build)
- Pindahkan `[profile.release]` + `resolver = "2"` ke workspace root `Cargo.toml`
- Update `scripts/deploy-contracts.sh` + `package.json` → pakai `stellar contract build` & path `wasm32v1-none`
- **Deployed to testnet:** `CC2CN6DQAH5VV66IYWLA3LJ75PDOS2WTJHNO3W4TJ4DU62VZEJVE3IXK`
- Treasury account: `GCEOV5T5HEOXWMBIM2DY5NM73IJGOCABU2BMTM2LNYGTPL6IA5L4U3BX`
- Contract di-inisialisasi (admin, fee_config, USDC address)
- `.env` di-update dengan contract ID + treasury keys

### 2. QRIS Scanner — Mobile App (✅ Complete)
- `apps/mobile/` di-scaffold dengan Expo SDK 52 + Expo Router
- 5 screen:
  - `index.tsx` — home (kurs real-time, input jumlah USDC)
  - `scan.tsx` — kamera scanner QRIS via `expo-camera` dengan barcode detection
  - `confirm.tsx` — konfirmasi + quote + fee breakdown
  - `success.tsx` — receipt transaksi
  - `history.tsx` — daftar transaksi + status badge
- `services/api.ts` — API client (resolve QRIS, rate, quote, create remittance)
- `package.json`, `app.json`, `tsconfig.json` lengkap

### 3. QRIS Parser — Bug Fixes + Unit Tests (✅ Complete)
- **Bug 1:** `getNmidFromQRIS` — decode sub-TLV dari teks, bukan re-hex-encode (tambah `parseSubTLVText`)
- **Bug 2:** `verifyCRC16` — CRC hex diambil dari raw payload, bukan decoded string
- **Bug 3:** `buildSubTLV` — double encoding (hex value di-hex-encode lagi oleh `buildTLV`)
- **10 unit tests** di `packages/sdk/src/__tests__/qris.test.ts` — all passing ✅

### 4. PJP/Xendit — Enhancement (✅ Complete)
- **Webhook HMAC verification**: `x-callback-token` (Xendit) + `x-flip-signature` (Flip)
- **Flip API client**: `disbursementToQRIS` + `disbursementToBank` via Flip sandbox
- **Multi-PJP routing**: Xendit primary → Flip fallback otomatis
- **Webhook Flip endpoint**: `POST /webhooks/flip/settlement`
- Config schema: tambah `FLIP_API_KEY`, `FLIP_WEBHOOK_SECRET`
- `.env`: tambah `XENDIT_WEBHOOK_TOKEN`, `FLIP_API_KEY`, `FLIP_WEBHOOK_SECRET`

### 5. Web Frontend — Next.js (✅ Complete)
- `apps/web/` — Next.js 15 + Tailwind v4 + React 18
- 4 halaman:
  - `/` — home (input QRIS text, jumlah USDC, kurs real-time)
  - `/confirm` — konfirmasi + quote + fee breakdown
  - `/success` — receipt transaksi
  - `/history` — riwayat transaksi
- `lib/api.ts` — API client lengkap
- TypeScript clean (`declaration: false` fix untuk pnpm monorepo React type conflict)

### 6. Git & GitHub (✅ Complete)
- `git init`, 84 files committed (21,715 lines)
- Repo: **https://github.com/yt2025id-lab/sambung** (public)
- Vercel deploy started tapi belum selesai (deploy from root monorepo)

## State of the Project

```
Sambung/
├── apps/
│   ├── api/              — Fastify server (routes, services, jobs, webhooks)
│   ├── mobile/           — Expo + React Native (QRIS scanner, send flow)
│   └── web/              — Next.js 15 (remittance UI)
├── contracts/
│   └── payment-gateway/  — Soroban contract (deployed to testnet)
├── keeper/               — BullMQ worker (Path Payment + Anchor)
├── packages/
│   ├── database/         — Prisma schema + client (7 tables)
│   └── sdk/              — QRIS parser (10 tests), types, constants
├── scripts/              — deploy-contracts.sh, gen-test-vectors.ts
├── .env                  — Treasury keys, contract ID, PJP config
└── docs/                 — PRD, execution plan, build guide
```

## Next Session: Vercel Deploy + Polish
1. Selesaikan Vercel deploy (deploy from monorepo root, pakai pnpm)
2. `.env.example` — buat template tanpa secrets
3. CI/CD GitHub Actions — lint + test + build
4. UI polish — loading states, error handling, empty states
5. E2E test flow: scan QRIS → kirim → cek history
