# SAMBUNG — Build Guide & Complete Reference
## v1.0 — 15 Juli 2026

---

## PRASYARAT

```bash
# Tools yang harus diinstall
node >= 20.0.0
pnpm >= 9.0.0
rustc >= 1.80.0
cargo >= 1.80.0
wasm-pack        # Untuk Soroban contract build
docker           # Untuk Supabase lokal + Redis
stellar-cli      # `cargo install stellar-cli`
```

---

## 1. MONOREPO STRUCTURE

```
sambung/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI pipeline
│       └── deploy.yml                # Deploy ke staging/prod
│
├── contracts/                        # Soroban smart contracts
│   ├── core/                         # Shared types & utilities
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── types.rs              # PaymentStatus, Currency, NMID
│   │       ├── errors.rs             # Contract error enum
│   │       └── auth.rs               # SEP-0010 auth helpers
│   └── payment-gateway/              # Core payment engine
│       ├── Cargo.toml
│       ├── src/
│       │   ├── lib.rs                # Main contract: initiate + confirm
│       │   ├── path_payment.rs       # Stellar Path Payment builder
│       │   ├── anchor.rs             # Anchor SEP-006 integration (off-chain bridge)
│       │   └── receipt.rs            # On-chain receipt event
│       └── tests/
│           └── integration_test.rs
│
├── apps/
│   ├── api/                          # Fastify API server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       ├── index.ts              # Entry point
│   │       ├── config.ts             # Env config loader
│   │       ├── app.ts                # Fastify app setup
│   │       ├── plugins/              # Fastify plugins
│   │       │   ├── auth.ts           # JWT + Google OAuth
│   │       │   ├── cors.ts
│   │       │   └── swagger.ts        # OpenAPI docs
│   │       ├── routes/
│   │       │   ├── index.ts          # Route aggregator
│   │       │   ├── sambung.ts        # POST /v1/remittance/*, GET /v1/recipients/*
│   │       │   ├── webhooks.ts       # POST /v1/webhooks/pjp/*
│   │       │   ├── public.ts         # GET /v1/rates/* (public)
│   │       │   └── admin.ts          # Admin endpoints
│   │       ├── services/
│   │       │   ├── payment.ts        # Core payment orchestration
│   │       │   ├── stellar.ts        # Stellar SDK wrapper
│   │       │   ├── anchor.ts         # Anchor SEP-006 Integration
│   │       │   ├── pjp.ts            # PJP partner HTTP client
│   │       │   ├── rates.ts          # USDC→IDRT rate oracle
│   │       │   ├── qris.ts           # QRIS resolver
│   │       │   └── notification.ts   # SMS/WhatsApp notifikasi
│   │       ├── jobs/                 # BullMQ background workers
│   │       │   ├── queue.ts          # Queue setup
│   │       │   ├── remittance-worker.ts   # Process remittance
│   │       │   └── settlement-worker.ts   # Confirm settlement
│   │       └── middleware/
│   │           ├── auth.ts           # JWT verification
│   │           ├── rate-limit.ts
│   │           ├── error-handler.ts
│   │           └── request-id.ts
│   │
│   ├── mobile/                       # React Native (Expo)
│   │   ├── package.json
│   │   ├── app.json
│   │   ├── tsconfig.json
│   │   ├── app/
│   │   │   ├── _layout.tsx
│   │   │   └── (tabs)/
│   │   │       └── sambung/
│   │   │           ├── index.tsx         # Home / send form
│   │   │           ├── scan.tsx          # QRIS camera scanner
│   │   │           ├── confirm.tsx       # Confirm payment
│   │   │           ├── success.tsx       # Success screen
│   │   │           └── history.tsx       # Transaction history
│   │   └── services/
│   │       ├── api.ts               # API client
│   │       └── stellar.ts           # Stellar wallet integration
│   │
│   └── web/                          # Landing page (Next.js)
│       ├── package.json
│       ├── app/
│       │   ├── page.tsx
│       │   └── layout.tsx
│       └── components/
│           └── hero.tsx
│
├── packages/
│   ├── sdk/                          # Shared TypeScript SDK
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── client.ts             # API client
│   │       ├── qris.ts               # EMVCo-MPM QRIS Parser
│   │       ├── stellar.ts            # Stellar SDK helpers
│   │       ├── anchor.ts             # Anchor integration helpers
│   │       ├── pjp.ts                # PJP types
│   │       ├── types.ts              # Shared types
│   │       ├── constants.ts          # Constants
│   │       └── utils.ts              # Utilities (CRC16, etc)
│   │
│   ├── database/                     # Prisma schema
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── queue/                        # BullMQ queue package
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts
│   │
│   └── common/                       # Common types
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── types.ts
│           └── constants.ts
│
├── keeper/                           # Off-chain executor service
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                  # Main event loop
│       ├── path-payment.ts           # Stellar Path Payment executor
│       ├── anchor.ts                 # Anchor SEP-006 client
│       ├── pjp.ts                    # PJP partner HTTP client
│       └── monitor.ts                # Health checker
│
├── scripts/
│   ├── deploy-contracts.sh           # Deploy Soroban to testnet/mainnet
│   ├── seed-test-data.ts             # Seed test data
│   ├── smoke-test.ts                 # Smoke test
│   └── gen-test-vectors.ts           # Generate test QRIS vectors
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json                      # Root workspace
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json                # Shared TS config
├── README.md
└── AGENTS.md                         # AI-assisted dev guide
```

---

## 2. SETUP COMMANDS

```bash
# === 1. Buat monorepo ===
mkdir -p sambung && cd sambung

# Root package.json
pnpm init

# === 2. Install dependencies ===

# Root workspace
pnpm add -w -D typescript @types/node turbo prettier eslint

# API server
pnpm --filter @sambung/api add fastify @fastify/cors @fastify/jwt \
  @fastify/rate-limit @fastify/swagger @fastify/swagger-ui \
  @fastify/formbody zod bullmq ioredis dotenv \
  @stellar/stellar-sdk axios pino pino-pretty

pnpm --filter @sambung/api add -D vitest @types/bullmq

# SDK
pnpm --filter @sambung/sdk add -D typescript vitest

# Database
pnpm --filter @sambung/database add @prisma/client prisma zod
pnpm --filter @sambung/database add -D tsx typescript

# Mobile
pnpm --filter @sambung/mobile add expo react-native react-native-camera-kit \
  expo-router expo-secure-store @react-navigation/native

# Keeper
pnpm --filter @sambung/keeper add @stellar/stellar-sdk axios bullmq ioredis dotenv pino

# === 3. Install Rust/Soroban ===
cargo install stellar-cli --features opt

# Verify
pnpm --version  # >= 9
node --version  # >= 20
rustc --version # >= 1.80
stellar --version
```

---

## 3. ENVIRONMENT VARIABLES

File `.env.example`:

```env
# === APP ===
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# === DATABASE (Supabase) ===
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
DIRECT_URL=postgresql://postgres:postgres@localhost:54322/postgres

# === AUTH ===
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_min_32_chars

# === STELLAR ===
STELLAR_NETWORK=testnet              # testnet | mainnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
SAMBUNG_TREASURY_SECRET=your_treasury_secret_key
SAMBUNG_TREASURY_PUBLIC=your_treasury_public_key

# === CONTRACT ADDRESSES (deployed) ===
PAYMENT_GATEWAY_CONTRACT_ID=
REGISTRY_CONTRACT_ID=

# === ANCHOR (PT Rupiah Token) ===
ANCHOR_IDRT_ISSUER=GDPKQ2TSNJOFSEE7XSUXPWRP27H6GFGLWD7JCHNEYYWQVGFA543EVBVT
ANCHOR_IDRT_CODE=IDRT
ANCHOR_SEP6_URL=https://anchor.stellarx.com
ANCHOR_API_KEY=your_anchor_api_key

# === PJP PARTNER (Xendit) ===
PJP_PRIMARY=XENDIT
XENDIT_SECRET_KEY=your_xendit_secret_key
XENDIT_WEBHOOK_TOKEN=your_xendit_webhook_token

PJP_FALLBACK=FLIP
FLIP_API_KEY=your_flip_api_key
FLIP_SECRET_KEY=your_flip_secret_key

# === QUEUE (Redis) ===
REDIS_URL=redis://localhost:6379

# === NOTIFICATION ===
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+62812xxxx

# === MONITORING ===
SENTRY_DSN=your_sentry_dsn
```

---

## 4. COMMAND REFERENCE

```bash
# === Development ===
pnpm dev                         # Run all apps in dev mode
pnpm --filter @sambung/api dev   # Run API server only
pnpm --filter @sambung/mobile dev # Run mobile app

# === Build ===
pnpm build                       # Build all packages
pnpm --filter @sambung/sdk build

# === Test ===
pnpm test                        # Run all tests
pnpm --filter @sambung/api test
pnpm --filter @sambung/sdk test

# === Lint ===
pnpm lint
pnpm format

# === Database ===
pnpm --filter @sambung/database db:migrate
pnpm --filter @sambung/database db:seed
pnpm --filter @sambung/database db:studio

# === Stellar/Soroban ===
pnpm contracts:build             # Build all Soroban contracts
pnpm contracts:deploy:testnet    # Deploy to testnet
pnpm contracts:deploy:mainnet    # Deploy to mainnet

# === Deploy ===
pnpm deploy:staging              # Deploy API + web to staging
pnpm deploy:prod                 # Deploy to production
```

---

## 5. STELLAR TESTNET (untuk development)

```bash
# === Setup Friendbot (dapatkan test XLM) ===
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"

# === Deploy Soroban contract ke testnet ===
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/payment_gateway.wasm \
  --source SAMBUNG_TREASURY_SECRET \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# === Interact dengan contract ===
stellar contract invoke \
  --id CONTRACT_ID \
  --source TREASURY_SECRET \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015" \
  -- \
  initialize \
  --admin ADMIN_ADDRESS \
  --fee-cfg '{...}'

# === Path Payment test (Stellar CLI) ===
# Test USDC → IDRT path
# USDC on testnet: GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
# IDRT on testnet: GBV4G7AY6OZYYL3Z2S2VYMYZ5Y7V4G7H7V4G7H7V4G7H7V4G7H7V4G7
```

---

## 6. DETAIL IMPLEMENTASI

### 6.1 API Endpoints

#### SAMBUNG Remittance

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/v1/remittance/quote` | Get quote (rate + fee) | User |
| `POST` | `/v1/remittance/create` | Initiate payment | User |
| `GET` | `/v1/remittance/:id` | Check status | User |
| `GET` | `/v1/remittance/history` | List history | User |
| `POST` | `/v1/remittance/:id/cancel` | Cancel (if initiated) | User |
| `GET` | `/v1/remittance/:id/receipt` | Download receipt | User |

#### Recipient Management

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/v1/recipients` | Save recipient | User |
| `GET` | `/v1/recipients` | List recipients | User |
| `PUT` | `/v1/recipients/:id` | Update recipient | User |
| `DELETE` | `/v1/recipients/:id` | Delete recipient | User |

#### QRIS Resolution

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/v1/qris/resolve` | Parse QRIS image → NMID | User |
| `GET` | `/v1/qris/nmid/:nmid` | Lookup NMID | User |

#### Rates (Public)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/rates/usdc-idr` | Live USDC→IDR rate |

#### Webhooks (Dari PJP/Anchor)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/v1/webhooks/pjp/settlement` | PJP confirms settlement | HMAC |
| `POST` | `/v1/webhooks/pjp/failed` | PJP reports failure | HMAC |
| `POST` | `/v1/webhooks/anchor/swap` | Anchor confirms swap | HMAC |

#### Admin

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/admin/dashboard` | Dashboard stats |
| `GET` | `/v1/admin/transactions` | All transactions |
| `POST` | `/v1/admin/transactions/:id/refund` | Force refund |
| `POST` | `/v1/admin/anchor/retry` | Retry failed swap |

### 6.2 Request/Response Contoh

```json
// POST /v1/remittance/create
// Request
{
  "amount_idr": 5000000,
  "recipient_nmid": "ID1001234567890",
  "recipient_provider": "GoPay",
  "recipient_phone": "6281234567890",
  "sender_stellar_address": "GABCDEF...12345",
  "signed_transaction": "base64_signed_tx_envelope"
}

// Response
{
  "payment_id": "pay_def456",
  "status": "initiated",
  "stellar_tx": "base64_unsigned_tx_envelope",
  "amount_usdc": "325.73",
  "rate": 15350.50,
  "fees": {
    "anchor": 25000,
    "pjp": 15000,
    "platform": 10000
  },
  "recipient_receives": 4950000,
  "estimated_completion": "< 5 minutes"
}
```

### 6.3 Status Flow

```
initiated → swapping → waiting_anchor → settled (success)
                                          → failed (retry)
                                          
initiated → cancelled (by user)
waiting_anchor → expired → refunded (timelock)
```

---

## 7. DATABASE SCHEMA (Prisma)

```prisma
// packages/database/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum RemittanceStatus {
  initiated
  swapping
  waiting_anchor
  settled
  failed
  cancelled
  refunded
}

model User {
  id              String   @id @default(uuid()) @db.Uuid
  googleId        String   @unique @map("google_id")
  email           String   @unique
  stellarAddress  String?  @unique @map("stellar_address")
  phone           String?
  fullName        String?  @map("full_name")
  avatarUrl       String?  @map("avatar_url")
  kycStatus       String   @default("pending") @map("kyc_status")
  createdAt       DateTime @default(now()) @map("created_at")
  lastLogin       DateTime? @map("last_login")
  isActive        Boolean  @default(true) @map("is_active")

  remittances Remittance[]
  recipients  Recipient[]

  @@map("users")
}

model Recipient {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @map("user_id") @db.Uuid
  name          String
  nmid          String
  provider      String   // GoPay, OVO, DANA, LinkAja, Bank
  phone         String?
  bankCode      String?  @map("bank_code")
  bankAccount   String?  @map("bank_account")
  isFavorite    Boolean  @default(false) @map("is_favorite")
  txCount       Int      @default(0) @map("tx_count")
  totalReceived BigInt   @default(0) @map("total_received")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([nmid])
  @@map("recipients")
}

model Remittance {
  id                String           @id @default(uuid()) @db.Uuid
  userId            String           @map("user_id") @db.Uuid
  recipientId       String?          @map("recipient_id") @db.Uuid

  // Denormalized recipient info
  recipientNmid     String           @map("recipient_nmid")
  recipientProvider String           @map("recipient_provider")
  recipientPhone    String?          @map("recipient_phone")

  // Amounts
  amountUsdc        Decimal          @map("amount_usdc") @db.Decimal(20, 7)
  amountIdr         BigInt           @map("amount_idr")
  feeUsdc           Decimal          @default(0) @map("fee_usdc") @db.Decimal(20, 7)
  feeIdr            BigInt           @default(0) @map("fee_idr")
  rateAtTx          Decimal?         @map("rate_at_tx") @db.Decimal(12, 2)

  // Status
  status            RemittanceStatus @default(initiated)
  failureReason     String?          @map("failure_reason")

  // Stellar
  stellarTxHash     String?          @map("stellar_tx_hash")
  sorobanPaymentId  String?          @map("soroban_payment_id")

  // PJP
  pjpPartnerId      String?          @map("pjp_partner_id") @db.Uuid
  pjpTxId           String?          @map("pjp_tx_id")

  // Anchor
  anchorQuoteId     String?          @map("anchor_quote_id")
  anchorTxHash      String?          @map("anchor_tx_hash")

  // Timestamps
  createdAt         DateTime         @default(now()) @map("created_at")
  completedAt       DateTime?        @map("completed_at")
  updatedAt         DateTime         @updatedAt @map("updated_at")

  user      User       @relation(fields: [userId], references: [id])
  recipient Recipient? @relation(fields: [recipientId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@index([stellarTxHash])
  @@map("remittances")
}

model RateCache {
  id          String   @id @default(uuid()) @db.Uuid
  baseAsset   String   @map("base_asset")
  quoteAsset  String   @map("quote_asset")
  bid         Decimal  @db.Decimal(12, 2)
  ask         Decimal  @db.Decimal(12, 2)
  source      String   @default("soroswap")
  cachedAt    DateTime @default(now()) @map("cached_at")

  @@unique([baseAsset, quoteAsset])
  @@map("rate_cache")
}

model PjpPartner {
  id             String   @id @default(uuid()) @db.Uuid
  name           String
  type           String   // e-wallet, bank, payment_gateway
  apiBaseUrl     String   @map("api_base_url")
  apiKeyHash     String   @map("api_key_hash")
  webhookUrl     String?  @map("webhook_url")
  webhookSecret  String?  @map("webhook_secret")
  supportsQris   Boolean  @default(true) @map("supports_qris")
  supportsBank   Boolean  @default(false) @map("supports_bank")
  feeBps         Int      @default(30) @map("fee_bps")
  isActive       Boolean  @default(true) @map("is_active")
  healthStatus   String   @default("healthy") @map("health_status")
  createdAt      DateTime @default(now()) @map("created_at")

  @@map("pjp_partners")
}

model AuditLog {
  id          String   @id @default(uuid()) @db.Uuid
  action      String
  entityType  String   @map("entity_type")
  entityId    String   @map("entity_id") @db.Uuid
  actorType   String   @map("actor_type")
  actorId     String?  @map("actor_id")
  metadata    Json?    @default("{}")
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([entityType, entityId])
  @@index([createdAt])
  @@map("audit_log")
}
```

---

## 8. KEY CODE IMPLEMENTATIONS

### 8.1 QRIS Parser (Core SDK)

```typescript
// packages/sdk/src/qris.ts
// Fork dari Quay — EMVCo-MPM TLV Parser untuk QRIS

export interface QRISData {
  nmid: string
  merchantName?: string
  merchantCity?: string
  merchantCategory?: string
  amount?: number
  currencyCode: string
  countryCode: string
  crc: string
}

export function parseQRIS(payload: string): QRISData {
  const tlv = parseTLV(payload)
  
  const merchantInfo = tlv.get(0x26)
  if (!merchantInfo) throw new Error('Invalid QRIS: missing merchant account info')
  
  const nmid = merchantInfo.get('01') || merchantInfo.get('02')
  if (!nmid) throw new Error('Invalid QRIS: missing NMID')
  
  const amount = tlv.get(0x54)
  const merchantName = tlv.get(0x59)
  const merchantCity = tlv.get(0x60)
  
  // Validate CRC
  const crc = tlv.get(0x63)
  if (!verifyCRC16(payload, crc)) {
    throw new Error('Invalid QRIS: CRC mismatch')
  }
  
  return {
    nmid,
    merchantName,
    merchantCity,
    amount: amount ? parseInt(amount) / 100 : undefined,
    currencyCode: tlv.get(0x53) || '360',
    countryCode: tlv.get(0x58) || 'ID',
    crc: crc || '',
  }
}

function parseTLV(data: string): Map<number, Map<string, string>> {
  const result = new Map<number, Map<string, string>>()
  let i = 0
  
  while (i < data.length) {
    const tag = parseInt(data.substring(i, i + 2), 16)
    i += 2
    const length = parseInt(data.substring(i, i + 2), 16)
    i += 2
    const value = data.substring(i, i + length * 2)
    i += length * 2
    
    if (tag === 0x26) {
      // Merchant account info — contains sub-TLV
      result.set(tag, parseSubTLV(value))
    } else {
      const sub = new Map<string, string>()
      sub.set('00', value)
      result.set(tag, sub)
    }
  }
  
  return result
}

function parseSubTLV(data: string): Map<string, string> {
  const result = new Map<string, string>()
  let i = 0
  
  while (i < data.length) {
    const tag = data.substring(i, i + 2)
    i += 2
    const length = parseInt(data.substring(i, i + 2), 16)
    i += 2
    const value = data.substring(i, i + length * 2)
    i += length * 2
    result.set(tag, hexToString(value))
  }
  
  return result
}

function hexToString(hex: string): string {
  let result = ''
  for (let i = 0; i < hex.length; i += 2) {
    result += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16))
  }
  return result
}

// CRC16 for QRIS EMVCo-MPM
function verifyCRC16(fullPayload: string, expectedCRC: string): boolean {
  // CRC-16/CCITT-FALSE
  // Full payload up to (but excluding) CRC tag
  const crcStartIndex = fullPayload.indexOf('6304')
  if (crcStartIndex === -1) return false
  
  const data = fullPayload.substring(0, crcStartIndex)
  const crc = parseInt(expectedCRC, 16)
  
  let remainder = 0xFFFF
  for (let i = 0; i < data.length; i += 2) {
    const byte = parseInt(data.substring(i, i + 2), 16)
    remainder = ((remainder >> 8) | (remainder << 8)) & 0xFFFF
    remainder ^= byte
    remainder ^= (remainder & 0xFF) >> 4
    remainder ^= (remainder << 8) << 4
    remainder ^= ((remainder & 0xFF) << 4) << 1
    remainder &= 0xFFFF
  }
  
  return remainder === crc
}
```

### 8.2 Stellar SDK Wrapper

```typescript
// apps/api/src/services/stellar.ts

import {
  Horizon, Keypair, TransactionBuilder,
  Operation, Asset, Memo, BASE_FEE,
} from '@stellar/stellar-sdk'
import { config } from '../config.js'

const server = new Horizon.Server(config.STELLAR_HORIZON_URL)

export const USDC = new Asset(
  'USDC',
  config.STELLAR_NETWORK === 'mainnet'
    ? 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
    : 'GBV4G7AY6OZYYL3Z2S2VYMYZ5Y7V4G7H7V4G7H7V4G7H7V4G7H7V4G7H7'
)

export const IDRT = new Asset(
  'IDRT',
  config.ANCHOR_IDRT_ISSUER
)

export async function getLiveRate(): Promise<{ bid: number; ask: number }> {
  // Query Stellar DEX (Soroswap) for USDC/IDRT orderbook
  const orderbook = await server.orderbook(USDC, IDRT).call()
  
  const bestBid = orderbook.bids[0]?.price
  const bestAsk = orderbook.asks[0]?.price
  
  return {
    bid: bestBid ? parseFloat(bestBid) : 15350,
    ask: bestAsk ? parseFloat(bestAsk) : 15380,
  }
}

export async function submitPathPayment(params: {
  sourceSecret: string
  sendAsset: Asset
  sendAmount: string
  destAsset: Asset
  destMin: string
  destination: string
  path: Asset[]
  paymentId: string
}): Promise<string> {
  const sourceKeypair = Keypair.fromSecret(params.sourceSecret)
  const account = await server.loadAccount(sourceKeypair.publicKey())
  
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.pathPaymentStrictSend({
      sendAsset: params.sendAsset,
      sendAmount: params.sendAmount,
      destination: params.destination,
      destAsset: params.destAsset,
      destMin: params.destMin,
      path: params.path,
    }))
    .addMemo(Memo.hash(params.paymentId))
    .setTimeout(30)
    .build()
  
  tx.sign(sourceKeypair)
  const result = await server.submitTransaction(tx)
  return result.hash
}

export async function getAccountBalance(publicKey: string, assetCode: string): Promise<string> {
  const account = await server.loadAccount(publicKey)
  const balance = account.balances.find(b => 
    'asset_code' in b && b.asset_code === assetCode
  )
  return balance ? balance.balance : '0'
}
```

### 8.3 Payment Orchestration

```typescript
// apps/api/src/services/payment.ts

import { v4 as uuid } from 'uuid'
import { prisma } from '@sambung/database'
import * as stellar from './stellar.js'
import * as anchor from './anchor.js'
import * as pjp from './pjp.js'
import { queue } from '../jobs/queue.js'
import { config } from '../config.js'

export interface CreatePaymentParams {
  userId: string
  amountIdr: number
  recipientNmid: string
  recipientProvider: string
  recipientPhone?: string
  senderStellarAddress: string
}

export async function createPayment(params: CreatePaymentParams) {
  // 1. Get live rate
  const rate = await stellar.getLiveRate()
  
  // 2. Calculate USDC needed
  const usdcAmount = params.amountIdr / rate.ask
  
  // 3. Calculate fees
  const anchorFee = Math.floor(params.amountIdr * 0.005)   // 0.5%
  const pjpFee = Math.floor(params.amountIdr * 0.003)      // 0.3%
  const platformFee = Math.floor(params.amountIdr * 0.002)  // 0.2%
  const totalFee = anchorFee + pjpFee + platformFee
  
  // 4. Create remittance record
  const remittance = await prisma.remittance.create({
    data: {
      userId: params.userId,
      recipientNmid: params.recipientNmid,
      recipientProvider: params.recipientProvider,
      recipientPhone: params.recipientPhone,
      amountUsdc: usdcAmount,
      amountIdr: params.amountIdr,
      feeUsdc: totalFee / rate.ask,
      feeIdr: totalFee,
      rateAtTx: rate.ask,
      status: 'initiated',
    },
  })
  
  // 5. Queue Path Payment execution (async)
  await queue.add('process-remittance', {
    remittanceId: remittance.id,
    usdcAmount,
    amountIdr: params.amountIdr - totalFee,
  })
  
  return {
    paymentId: remittance.id,
    status: 'initiated',
    amountUsdc: usdcAmount.toFixed(7),
    rate: rate.ask,
    fees: {
      anchor: anchorFee,
      pjp: pjpFee,
      platform: platformFee,
    },
    recipientReceives: params.amountIdr - totalFee,
  }
}

export async function processRemittance(remittanceId: string) {
  const remittance = await prisma.remittance.findUniqueOrThrow({ where: { id: remittanceId } })
  
  // 1. Update status
  await prisma.remittance.update({
    where: { id: remittanceId },
    data: { status: 'swapping' },
  })
  
  try {
    // 2. Execute Path Payment USDC → IDRT
    const txHash = await stellar.submitPathPayment({
      sourceSecret: config.SAMBUNG_TREASURY_SECRET,
      sendAsset: stellar.USDC,
      sendAmount: remittance.amountUsdc.toString(),
      destAsset: stellar.IDRT,
      destMin: remittance.amountIdr.toString(),
      destination: config.ANCHOR_IDRT_ISSUER,
      path: [stellar.USDC, stellar.IDRT],
      paymentId: remittanceId,
    })
    
    // 3. Wait for Anchor confirmation (poll/webhook)
    await prisma.remittance.update({
      where: { id: remittanceId },
      data: { 
        status: 'waiting_anchor',
        stellarTxHash: txHash,
      },
    })
    
    // 4. Queue settlement check
    await queue.add('check-settlement', { remittanceId }, { delay: 10000 })
    
  } catch (error) {
    await prisma.remittance.update({
      where: { id: remittanceId },
      data: { 
        status: 'failed',
        failureReason: error instanceof Error ? error.message : 'Unknown error',
      },
    })
    throw error
  }
}
```

### 8.4 Anchor SEP-006 Integration

```typescript
// apps/api/src/services/anchor.ts

import axios from 'axios'
import { config } from '../config.js'

const anchorClient = axios.create({
  baseURL: config.ANCHOR_SEP6_URL,
  headers: {
    'Authorization': `Bearer ${config.ANCHOR_API_KEY}`,
    'Content-Type': 'application/json',
  },
})

export async function getAnchorInfo() {
  const { data } = await anchorClient.get('/info')
  return data
}

export async function deposit(params: {
  assetCode: string
  amount: string
  account: string
  memoType?: string
  memo?: string
}) {
  const { data } = await anchorClient.post('/deposit', {
    asset_code: params.assetCode,
    amount: params.amount,
    account: params.account,
    memo_type: params.memoType || 'hash',
    memo: params.memo || '',
  })
  return data
}

export async function withdraw(params: {
  assetCode: string
  amount: string
  dest: string
  destExtra?: string
  account: string
  memo?: string
}) {
  const { data } = await anchorClient.post('/withdraw', {
    asset_code: params.assetCode,
    amount: params.amount,
    dest: params.dest,
    dest_extra: params.destExtra,
    account: params.account,
    memo: params.memo,
  })
  return data
}

export async function getTransactionStatus(txId: string) {
  const { data } = await anchorClient.get(`/transaction?id=${txId}`)
  return data.transaction
}
```

### 8.5 PJP (Xendit) Integration

```typescript
// apps/api/src/services/pjp.ts

import axios from 'axios'
import { config } from '../config.js'

const xendit = axios.create({
  baseURL: 'https://api.xendit.co',
  headers: {
    'Authorization': `Basic ${Buffer.from(config.XENDIT_SECRET_KEY + ':').toString('base64')}`,
    'Content-Type': 'application/json',
  },
})

export async function disbursementToQRIS(params: {
  nmid: string
  amountIdr: number
  phone?: string
  reference: string
}) {
  // Xendit E-Wallet disbursement
  const { data } = await xendit.post('/ewallets/charges', {
    reference_id: params.reference,
    currency: 'IDR',
    amount: params.amountIdr,
    checkout_method: 'ONE_TIME_PAYMENT',
    channel_code: 'ID_QRIS',
    channel_properties: {
      qr_code: {
        nmid: params.nmid,
      },
    },
  })
  return data
}

export async function disbursementToBank(params: {
  bankCode: string
  accountNumber: string
  amountIdr: number
  reference: string
}) {
  const { data } = await xendit.post('/disbursements', {
    external_id: params.reference,
    bank_code: params.bankCode,
    account_holder_name: '',
    account_number: params.accountNumber,
    description: `Remittance from SAMBUNG`,
    amount: params.amountIdr,
  })
  return data
}

export async function getDisbursementStatus(xenditId: string) {
  const { data } = await xendit.get(`/disbursements/${xenditId}`)
  return data
}
```

### 8.6 Soroban Contract (Rust) — Payment Gateway

```rust
// contracts/payment-gateway/src/lib.rs

use soroban_sdk::{
    contract, contractimpl, contracttype,
    contracterror, Env, Address, BytesN, Symbol, Vec,
    token::TokenClient,
};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum PaymentStatus {
    Initiated,
    Swapping,
    WaitingAnchor,
    Settled,
    Failed,
    Refunded,
}

#[contracttype]
pub struct PaymentIntent {
    pub id: BytesN<32>,
    pub sender: Address,
    pub usdc_amount: i128,
    pub idrt_amount: i128,
    pub fee_bps: u32,
    pub status: PaymentStatus,
    pub created_at: u64,
}

#[contracttype]
pub struct FeeConfig {
    pub platform_fee_bps: u32,
    pub anchor_fee_bps: u32,
    pub pjp_fee_bps: u32,
    pub treasury: Address,
}

#[contracterror]
#[derive(Debug, PartialEq)]
pub enum Error {
    Unauthorized = 1,
    PaymentNotFound = 2,
    InvalidStatus = 3,
    InsufficientBalance = 4,
}

#[contract]
pub struct PaymentGateway;

#[contractimpl]
impl PaymentGateway {
    pub fn initialize(
        env: Env,
        admin: Address,
        fee_cfg: FeeConfig,
        usdc_address: Address,
    ) {
        admin.require_auth();
        env.storage().persistent().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().persistent().set(&Symbol::new(&env, "fee_cfg"), &fee_cfg);
        env.storage().persistent().set(&Symbol::new(&env, "usdc"), &usdc_address);
    }

    pub fn initiate_payment(
        env: Env,
        sender: Address,
        usdc_amount: i128,
    ) -> BytesN<32> {
        sender.require_auth();

        let payment_id = env.crypto().sha256(&(
            sender.clone(),
            usdc_amount,
            env.ledger().timestamp(),
        ));

        let usdc = Self::get_usdc(env.clone());
        let token = TokenClient::new(&env, &usdc);
        token.transfer(&sender, &env.current_contract_address(), &usdc_amount);

        let intent = PaymentIntent {
            id: payment_id.clone(),
            sender: sender.clone(),
            usdc_amount,
            idrt_amount: 0,
            fee_bps: Self::get_fee(env.clone()),
            status: PaymentStatus::Initiated,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&payment_id, &intent);

        env.events().publish((
            Symbol::new(&env, "PaymentInitiated"),
            payment_id.clone(),
        ), (sender, usdc_amount));

        payment_id
    }

    pub fn confirm_settlement(
        env: Env,
        admin: Address,
        payment_id: BytesN<32>,
        idrt_amount: i128,
    ) {
        admin.require_auth();

        let mut intent = Self::get_intent(env.clone(), payment_id.clone());
        
        intent.idrt_amount = idrt_amount;
        intent.status = PaymentStatus::Settled;
        env.storage().persistent().set(&payment_id, &intent);

        env.events().publish((
            Symbol::new(&env, "PaymentSettled"),
            payment_id.clone(),
        ), (idrt_amount,));
    }

    pub fn mark_failed(
        env: Env,
        admin: Address,
        payment_id: BytesN<32>,
    ) {
        admin.require_auth();
        let mut intent = Self::get_intent(env.clone(), payment_id.clone());
        intent.status = PaymentStatus::Failed;
        env.storage().persistent().set(&payment_id, &intent);

        env.events().publish((
            Symbol::new(&env, "PaymentFailed"),
            payment_id.clone(),
        ), ());
    }

    fn get_usdc(env: Env) -> Address {
        env.storage().persistent()
            .get(&Symbol::new(&env, "usdc")).unwrap()
    }

    fn get_fee(env: Env) -> u32 {
        let cfg: FeeConfig = env.storage().persistent()
            .get(&Symbol::new(&env, "fee_cfg")).unwrap();
        cfg.platform_fee_bps
    }

    fn get_intent(env: Env, id: BytesN<32>) -> PaymentIntent {
        env.storage().persistent().get(&id).unwrap()
    }
}
```

---

## 9. MOBILE APP (Expo Router)

```typescript
// apps/mobile/app/_layout.tsx
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}
```

```typescript
// apps/mobile/app/(tabs)/sambung/index.tsx
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'

export default function SendScreen() {
  const [amount, setAmount] = useState('')
  const [nmid, setNmid] = useState('')

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Kirim ke QRIS</Text>
      
      <Text style={{ marginTop: 16 }}>Nominal (Rp)</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 12, marginTop: 4, borderRadius: 8 }}
        placeholder="Rp 5.000.000"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity
        style={{ 
          marginTop: 12, padding: 16, 
          backgroundColor: '#f0f0f0', borderRadius: 8,
          alignItems: 'center' 
        }}
        onPress={() => router.push('/sambung/scan')}
      >
        <Text>Scan QRIS Keluarga</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 12 }}>Atau masukkan NMID:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 12, marginTop: 4, borderRadius: 8 }}
        placeholder="ID100..."
        value={nmid}
        onChangeText={setNmid}
      />

      <TouchableOpacity
        style={{ 
          marginTop: 24, padding: 16, 
          backgroundColor: '#0066FF', borderRadius: 8,
          alignItems: 'center' 
        }}
        onPress={() => router.push('/sambung/confirm')}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Lanjut</Text>
      </TouchableOpacity>
    </View>
  )
}
```

---

## 10. DOCKER + DEPLOYMENT

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sambung
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
```

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: sambung
        ports: ['5432:5432']
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      - run: pnpm lint
```

---

## 11. SUMMARY BUILD STEPS

```bash
# ===== MINGGU 1-2: Foundation =====

# Step 1: Setup monorepo
git init
# Copy semua file dari struktur di atas
pnpm install
pnpm build

# Step 2: Setup database
docker compose up -d postgres
pnpm --filter @sambung/database db:migrate
pnpm --filter @sambung/database db:seed

# Step 3: Setup local dev
cp .env.example .env
# Isi .env dengan nilai yang sesuai

# Step 4: Run API server
pnpm --filter @sambung/api dev

# ===== MINGGU 3-4: Stellar + QRIS =====

# Step 5: Build & deploy Soroban contract
cargo build --target wasm32-unknown-unknown -p payment-gateway
stellar contract deploy --wasm ... --source ... --rpc-url ...

# Step 6: Test QRIS parser
pnpm --filter @sambung/sdk test

# ===== MINGGU 5-8: Payment Flow =====

# Step 7: Test Path Payment (USDC → IDRT)
pnpm --filter @sambung/keeper dev

# Step 8: Integrasi PJP (Xendit)
# Daftar di https://dashboard.xendit.co
# Dapatkan API key → masukkan ke .env

# ===== MINGGU 9-12: Production =====

# Step 9: Deploy ke mainnet
stellar contract deploy --wasm ... --source ... --rpc-url https://horizon.stellar.org

# Step 10: Beta launch
pnpm deploy:prod
```
