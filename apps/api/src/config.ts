import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') })
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.string().default('info'),

  DATABASE_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  JWT_SECRET: z.string().min(32),

  STELLAR_NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),
  STELLAR_HORIZON_URL: z.string(),
  STELLAR_RPC_URL: z.string(),
  STELLAR_NETWORK_PASSPHRASE: z.string(),
  SAMBUNG_TREASURY_SECRET: z.string().optional(),
  SAMBUNG_TREASURY_PUBLIC: z.string().optional(),

  PAYMENT_GATEWAY_CONTRACT_ID: z.string().optional(),

  ANCHOR_IDRT_ISSUER: z.string(),
  ANCHOR_IDRT_CODE: z.string().default('IDRT'),
  ANCHOR_SEP6_URL: z.string().optional(),
  ANCHOR_API_KEY: z.string().optional(),

  XENDIT_SECRET_KEY: z.string().optional(),
  XENDIT_WEBHOOK_TOKEN: z.string().optional(),

  FLIP_API_KEY: z.string().optional(),
  FLIP_WEBHOOK_SECRET: z.string().optional(),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function loadConfig(): Env {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten())
    process.exit(1)
  }
  return result.data
}

export const config = loadConfig()
