# SAMBUNG — Execution Plan & Regulatory Analysis
## Cross-Border Remittance: TKI → QRIS Indonesia

---

## 📋 DAFTAR ISI
1. [Regulasi Indonesia — Deep Dive](#1-regulasi-indonesia)
2. [Arsitektur SAMBUNG (Simplified)](#2-arsitektur-sambung)
3. [Execution Plan per Week](#3-execution-plan)
4. [Tech Stack & PJP Partner](#4-tech-stack--pjp-partner)
5. [Risk Assessment & Mitigasi](#5-risk-assessment)
6. [Success Metrics](#6-success-metrics)

---

## 1. REGULASI INDONESIA

### 1.1 Status SAMBUNG vs Regulasi — Per Juli 2026

Model SAMBUNG: **Crypto → Anchor IDRT → PJP → QRIS e-wallet**

Kunci regulasinya: **SAMBUNG tidak perlu jadi PJP**. SAMBUNG cukup jadi **platform aggregator** yang menghubungkan Stellar network dengan PJP partner yang sudah licensed oleh Bank Indonesia.

### 1.2 Regulasi Kunci

#### A. UU 7/2011 tentang Mata Uang
- **Pasal 21(1):** Rupiah wajib digunakan untuk transaksi di Indonesia
- **Dampak ke SAMBUNG:** ✅ **Compliant**. Penerima final di Indonesia hanya menerima Rupiah. Crypto hanya sebagai funding source dari luar negeri

#### B. PBI 10/2025 — Pengaturan Industri Sistem Pembayaran (Berlaku 31 Maret 2026)
- **Regulasi terbaru dan paling relevan.** Ini menggantikan PBI 22/2020 dan PBI 23/6/2021
- **Poin kunci:**
  - Klasifikasi baru: **PSP Utama** dan **PSP selain PSP Utama** (didasari penilaian TIKMI)
  - **TIKMI:** Transaction, Interconnection, Competence, Risk Management, IT Infrastructure — framework assessment baru dari BI
  - **Activity Bundling:** 3 paket aktivitas (Bundling 1, 2, 3) — SAMBUNG tidak masuk sini karena bukan PJP
  - **Modal disetor:** Rp 15M untuk PJP kategori 1
  - **Capital adequacy ratio:** Minimal 10% dari risk-weighted transactions + surcharge 1.5-2.5% untuk PJP
- **Dampak ke SAMBUNG:** ✅ **Tidak perlu PJP license**. SAMBUNG operate via PJP partner. Tapi **PJP partner wajib comply** ke PBI 10/2025

#### C. PADG 3/2025 — QRIS Wajib
- **QRIS wajib** untuk semua transaksi pembayaran yang difasilitasi QR Code di Indonesia
- Juga mencakup **QRIS Tap** (NFC)
- Sumber dana bisa dari: rekening, kartu, e-money, dompet digital, **fasilitas kredit**
- **Dampak ke SAMBUNG:** ✅ Positif. SAMBUNG justru **menggunakan QRIS sebagai distribution channel**. Ini didorong BI

#### D. UU P2SK (UU 4/2023) + UU 4/2026
- Crypto jadi aset keuangan digital di bawah OJK (sejak Jan 2026)
- Stablecoin punya kategori hukum sendiri tapi **tetap tidak boleh dipakai sebagai alat pembayaran di Indonesia**
- **Dampak ke SAMBUNG:** ⚠️ **Sesuai PRD** — crypto hanya funding, bukan payment. Kritis: pastikan flow SAMBUNG tidak pernah menyebut "bayar pakai crypto" di sisi Indonesia

#### E. PMK 50/2025 — Pajak Crypto
- Pajak crypto: **PPh 0.1% + PPN 0.11%** (sekarang PPN sudah dihapus per UU 4/2026)
- PPh final untuk transaksi crypto: tarif baru naik mulai 2026
- **Dampak ke SAMBUNG:** Kena di sisi crypto → IDRT conversion. Rupiah ke QRIS kena PPN biasa

#### F. UU PDP (UU 27/2022)
- Wajib: **consent**, **data export/deletion on demand**, **breach reporting dalam 3 hari**
- Denda: 2% dari revenue tahunan
- **Dampak ke SAMBUNG:** Wajib implement sejak awal. KYC data TKI dilindungi

### 1.3 Status Hukum SAMBUNG — Kesimpulan

| Aspek | Status | Catatan |
|-------|--------|---------|
| Crypto sebagai payment di Indonesia | ❌ DILARANG | Tapi SAMBUNG tidak melakukan ini. Crypto hanya funding dari luar negeri |
| PJP license | ✅ TIDAK DIPERLUKAN | Cukup integrasi dengan PJP partner existing (Xendit/Midtrans) |
| Cross-border remittance | ✅ LEGAL | Diatur di PBI 10/2025 sebagai aktivitas remitansi |
| QRIS sebagai distribution | ✅ DIDORONG BI | PADG 3/2025 mewajibkan QRIS |
| Stablecoin sebagai alat bayar | ❌ DILARANG | Tapi SAMBUNG settle ke Rupiah via Anchor. Crypto hanya intermediate layer |
| Data protection (UU PDP) | ⚠️ WAJIB | Implement sejak MVP |

### 1.4 Entry Strategy — 3 Opsi

| Opsi | Modal | Complexity | Time | Recommended? |
|------|-------|-----------|:----:|:-----------:|
| **1. Aggregator via PJP** (Xendit/Midtrans) | Rp 0 | Rendah | 2-4 minggu | ✅ **Paling cepat** |
| 2. Jadi PJP sendiri (licensed BI) | Rp 15M+ | Tinggi | 6-12 bulan | ❌ Tidak untuk MVP |
| 3. Partnership dengan PJP + revenue share | Rp 0 | Rendah | 2-4 minggu | ✅ Alternatif |

**Rekomendasi:** Opsi 1 — integrasi dengan Xendit sebagai PJP partner utama.

---

## 2. ARSITEKTUR SAMBUNG (SIMPLIFIED)

### 2.1 Core Flow

```
TKI di HK                      SAMBUNG Backend                 Stellar Network
    │                               │                               │
    ├─ Kirim Rp 5jt ke QRIS ────────▶                               │
    │   (scan QRIS/foto NMID)       │                               │
    │                               ├── Path Payment USDC → IDRT ──▶│
    │                               │   (Stellar atomic swap)       │
    │                               │◀── IDRT masuk ke Anchor ─────┤
    │                               │                               │
    │                               ├── Call PJP API ────────────▶ Xendit
    │                               │◀── IDR → QRIS wallet ────────┤
    │◀── "Dana diterima!" ─────────┤                               │
```

### 2.2 Komponen MVP

```
sambung/
├── contracts/
│   └── payment-gateway/       # 1 Soroban contract (paling penting)
│       ├── src/lib.rs          # Initiate + confirm payment
│       └── Cargo.toml
├── apps/
│   ├── api/                   # Express/Fastify server
│   │   ├── src/routes/
│   │   │   └── sambung.ts     # SAMBUNG-specific endpoints
│   │   └── src/services/
│   │       ├── stellar.ts     # Stellar SDK wrapper
│   │       ├── anchor.ts      # Anchor SEP-006
│   │       └── payment.ts     # Core payment logic
│   └── mobile/                # React Native (Expo)
│       └── app/(tabs)/sambung/
│           └── send.tsx       # Kirim ke QRIS flow
├── packages/
│   ├── sdk/                   # Shared SDK
│   │   └── src/qris.ts        # QRIS parser (fork Quay)
│   └── database/              # Prisma schema
└── keeper/                    # Off-chain executor
    └── src/path-payment.ts    # Path Payment executor
```

### 2.3 Database Simplified (hanya SAMBUNG)

```
users → remittances → recipients
  │                          │
  └── Google OAuth + Stellar │
                              └── NMID + provider + phone
```

Tabel:
- **users** — Google OAuth, Stellar address, phone
- **recipients** — NMID, provider (GoPay/OVO/DANA), phone, bank fallback
- **remittances** — amount_usdc, amount_idr, status (initiated → swapping → settled → failed), stellar_tx_hash, pjp_tx_id
- **rate_cache** — USDC→IDRT rate dari Soroswap
- **pjp_partners** — config Xendit/Midtrans

---

## 3. EXECUTION PLAN

### 3.1 Timeline

```
Bulan 1: Foundation
  Week 1-2: Setup + SDK
  Week 3-4: Stellar Integration + QRIS Parser

Bulan 2: SAMBUNG MVP
  Week 5-6: Payment Flow End-to-End (testnet)
  Week 7-8: PJP Integration + QRIS Settlement

Bulan 3: Production
  Week 9-10: Security + Load Test + Mainnet
  Week 11-12: Beta Launch + Marketing
```

### 3.2 Detail Per Week

#### Week 1-2: Foundation

| Day | Task | Output |
|:---:|------|--------|
| 1-2 | Monorepo setup (pnpm + turborepo) | Root package.json, workspace config |
| 2-3 | Docker + Supabase local dev | docker-compose, supabase local |
| 3-4 | Prisma schema (SAMBUNG tables) | schema.prisma + migrations |
| 4-5 | API server skeleton (Express/Fastify) | routes, middleware, error handler |
| 5-6 | Google OAuth + JWT auth | Login flow, middleware auth |
| 6-7 | SDK package setup | Shared types, constants |
| 7-8 | Deployment pipeline (Vercel + Render) | CI/CD, staging env |

**Files to create:**
- `package.json` (root workspace)
- `pnpm-workspace.yaml`
- `turbo.json`
- `docker-compose.yml`
- `apps/api/src/index.ts`
- `apps/api/src/config.ts`
- `packages/database/schema.prisma`
- `packages/database/migrations/`
- `packages/sdk/src/types.ts`
- `packages/sdk/src/constants.ts`

#### Week 3-4: Stellar + QRIS

| Day | Task | Output |
|:---:|------|--------|
| 1-2 | Soroban contract: payment-gateway (Rust) | `contracts/payment-gateway/src/lib.rs` |
| 2-3 | Deploy to Stellar testnet | Script deploy, contract address |
| 3-4 | Stellar SDK wrapper (Node.js) | `services/stellar.ts` |
| 4-5 | QRIS parser fork dari Quay | `sdk/src/qris.ts` — parse NMID + amount |
| 5-6 | QRIS scanner (mobile) | Camera + parse + display merchant info |
| 6-7 | Anchor SEP-006 integration | `services/anchor.ts` — deposit/withdraw |
| 7-8 | Rate oracle (USDC→IDRT) | `services/rates.ts` — dari Soroswap DEX |

**Key deliverable:** Scan QRIS → extract NMID → show merchant name + amount

#### Week 5-6: Payment Flow (Testnet)

| Day | Task | Output |
|:---:|------|--------|
| 1-2 | `POST /v1/remittance/quote` | Rate + fee calculation |
| 2-3 | `POST /v1/remittance/create` | Initiate payment, call Soroban |
| 3-4 | Keeper service: Path Payment executor | `keeper/src/path-payment.ts` |
| 4-5 | Keeper service: Anchor confirmation | `keeper/src/anchor.ts` |
| 5-6 | Webhook handler (PJP + Anchor) | `routes/webhooks.ts` |
| 6-7 | Mobile: send flow (scan → confirm → success) | `app/sambung/send.tsx` |
| 7-8 | Mobile: history + tracking | `app/sambung/history.tsx` |

**Key deliverable:** End-to-end: scan QRIS → Path Payment USDC→IDRT → settle (testnet)

#### Week 7-8: PJP Integration

| Day | Task | Output |
|:---:|------|--------|
| 1-2 | Xendit API integration (disbursement) | `services/pjp.ts` — topUp + bankTransfer |
| 2-3 | Webhook: PJP settlement confirmation | Verifikasi settlement di Xendit |
| 3-4 | Fallback PJP: Flip or Midtrans | Multi-PJP support |
| 4-5 | SMS notification (penerima) | Notifikasi via Twilio/Wa.me |
| 5-6 | Recipient management (saved NMID) | `routes/recipients.ts` |
| 6-7 | Rate cache + auto-refresh | `services/rates.ts` — cron job |
| 7-8 | Error handling + retry logic | Failed payment recovery |

**Key deliverable:** Real settlement ke QRIS e-wallet via Xendit

#### Week 9-10: Security & Production

| Day | Task | Output |
|:---:|------|--------|
| 1-2 | Security audit (Soroban contract) | Audit report |
| 2-3 | Pen-test API endpoints | Fix findings |
| 3-4 | Load test (1000+ tx) | k6 script, report |
| 5-6 | Deploy contracts to Stellar mainnet | Mainnet addresses |
| 6-7 | Production infra setup | Vercel + Render + Supabase prod |
| 7-8 | Monitoring + alerting | Sentry, Datadog |

#### Week 11-12: Beta Launch

| Day | Task | Output |
|:---:|------|--------|
| 1-2 | Landing page (Next.js) | `apps/web` — sambung.id |
| 3-4 | Beta: TKI Hong Kong (50 users) | Telegram group + invite |
| 5-6 | Bug fixes + iteration | Based on beta feedback |
| 7-8 | Marketing: Telegram & WhatsApp | Grup TKI, referral program |

---

## 4. TECH STACK & PJP PARTNER

### 4.1 Final Tech Stack

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| **Smart Contract** | Stellar Soroban (Rust) | Satu contract dulu: payment-gateway |
| **Backend** | Fastify + TypeScript | Lebih cepat dari Express, native TypeScript |
| **Database** | PostgreSQL via Supabase | Managed, RLS, realtime |
| **ORM** | Prisma | Type-safe, migrations mudah |
| **Mobile** | React Native + Expo SDK 54 | Satu codebase iOS/Android |
| **Blockchain SDK** | `@stellar/stellar-sdk` v12 | Latest |
| **Queue** | BullMQ + Redis | Background job untuk Path Payment |
| **Auth** | Google OAuth + JWT | Simple, user TKI sudah punya Google |
| **QRIS Parser** | Custom fork dari Quay | EMVCo-MPM TLV parser |
| **Monitoring** | Sentry + Grafana | Error tracking + metrics |
| **CI/CD** | GitHub Actions + Vercel + Render | Auto-deploy |

### 4.2 PJP Partner Recommendation

| Partner | Kelebihan | Kekurangan | Rekomendasi |
|---------|-----------|------------|:-----------:|
| **Xendit** | API terbersih, disbursement API matang, Flip integration | Market recognition lebih kecil | ✅ **Primary** |
| **Midtrans** | Market leader, GoPay exclusive, GoTo backing | API lebih kompleks, disbursement perlu enterprise | ✅ **Secondary** |
| **Flip** | Termurah untuk bank transfer, BI FAST | Tidak untuk e-wallet QRIS | ⚠️ **Untuk bank fallback** |
| **DOKU** | PJP Category 1, QRIS API | Dokumentasi kurang | ❌ Skip |

**Rekomendasi final:**
- **Xendit** untuk primary PJP (e-wallet QRIS + bank transfer)
- **Flip** untuk bank transfer BI FAST (fallback)
- Belum perlu Midtrans kecuali GoPay eksklusif diperlukan

### 4.3 Anchor IDRT

| Anchor | IDRT | Status | Catatan |
|--------|:----:|:------:|---------|
| **PT Rupiah Token** | ✅ IDRT | Live | Issuer: `GDPKQ2TSNJOFSEE7XSUXPWRP27H6GFGLWD7JCHNEYYWQVGFA543EVBVT` |
| StellarX | ✅ IDRT | Live | SEP-006/SEP-024 support |
| Indodax | ✅ IDRT | Live | OJK licensed |

**Rekomendasi:** PT Rupiah Token + StellarX sebagai fallback

---

## 5. RISK ASSESSMENT

### 5.1 Regulasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|:-----------:|:------:|----------|
| **BI larang crypto sebagai funding meski cross-border** | Rendah | Tinggi | Diversifikasi ke channel fiat juga. SAMBUNG bisa support USDC → IDRT → QRIS atau bank transfer langsung |
| **Stablecoin corridor diatur ketat** | Medium | Medium | Posisi SAMBUNG aman karena settle ke Rupiah sebelum sampai ke penerima |
| **PJP partner license dicabut** | Rendah | Tinggi | Multiple PJP fallback dari awal |
| **Pajak crypto naik drastis** | Medium | Medium | Fee model bisa disesuaikan. Kompetitif vs Western Union tetap 5x lebih murah |

### 5.2 Teknis

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|:-----------:|:------:|----------|
| **Anchor IDRT liquidity kering** | Medium | Tinggi | Buffer liquidity pool. Multiple anchor fallback |
| **Path Payment gagal (slippage)** | Medium | Medium | Slippage tolerance 1%. Retry dengan path berbeda (USDC→XLM→IDRT) |
| **PJP API downtime** | Medium | Tinggi | Retry + queue. Fallback PJP partner. Manual settlement option |
| **Soroban mainnet bug** | Rendah | Tinggi | Extensive testnet testing. Security audit. Escrow contract untuk protect user funds |
| **QRIS NMID tidak valid** | Rendah | Medium | Validasi NMID format + checksum sebelum submit |

### 5.3 Market

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|:-----------:|:------:|----------|
| **Adoption TKI rendah** | Medium | Tinggi | Marketing via Telegram/WhatsApp grup TKI. Affiliate program. Referral bonus |
| **Trust issue (crypto = scam)** | Tinggi | Tinggi | Edukasi: "gak perlu punya crypto". Branding sebagai remitansi, bukan crypto |
| **Competitor copy cepat** | Medium | Medium | PJP partnership exclusivity. QRIS integration sebagai moat. Fokus ke UX |

---

## 6. SUCCESS METRICS

| Metrik | 3 Bulan | 6 Bulan |
|--------|:-------:|:-------:|
| Volume transaksi | $500K/bulan | $5M+/bulan |
| User aktif | 5,000 | 50,000+ |
| TKI user | 1,000+ | 10,000+ |
| PJP partner | 2 | 3+ |
| Fee revenue | $5K/bulan | $50K+/bulan |
| Uptime | 99.5% | 99.9% |
| Tx success rate | 95% | 99% |
| Settlement time | <5 menit | <2 menit |

---

## RINGKASAN EKSEKUTIF

**SAMBUNG adalah layanan remitansi TKI → QRIS Indonesia pakai Stellar.**

**Regulasi:** ✅ Compliant. SAMBUNG tidak perlu PJP license. Crypto hanya sebagai funding layer dari luar negeri. Penerima final hanya terima Rupiah via QRIS.

**Timeline:** 12 minggu untuk MVP.
- Bulan 1: Foundation (monorepo, database, QRIS parser, Stellar integration)
- Bulan 2: SAMBUNG flow end-to-end (scan QRIS → Path Payment → PJP settlement)
- Bulan 3: Security audit, mainnet deploy, beta TKI Hong Kong

**PJP Partner:** Xendit (primary) + Flip (fallback)
**Anchor:** PT Rupiah Token / StellarX
**Contract:** 1 Soroban contract (payment-gateway) — sederhana dulu

**Biaya per transaksi:** ~1.0% (vs Western Union 5-10%)
**Revenue:** 0.2% platform fee = Rp 10,000 per Rp 5jt remittance

**Minimum viable product:** TKI scan QRIS keluarga → bayar USDC → keluarga terima Rupiah di GoPay/OVO/DANA dalam <5 menit.
