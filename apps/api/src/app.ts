import Fastify from 'fastify'
import cors from '@fastify/cors'
import formbody from '@fastify/formbody'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import { config } from './config.js'
import { sambungRoutes } from './routes/sambung.js'
import { webhookRoutes } from './routes/webhooks.js'
import { publicRoutes } from './routes/public.js'
import { adminRoutes } from './routes/admin.js'
import { errorHandler } from './middleware/error-handler.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: config.NODE_ENV === 'development'
        ? { target: 'pino-pretty' }
        : undefined,
    },
  })

  await app.register(cors, { origin: true })
  await app.register(formbody)
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'SAMBUNG API',
        version: '0.1.0',
        description: 'Cross-border remittance API — TKI → QRIS Indonesia',
      },
    },
  })
  await app.register(swaggerUi, { routePrefix: '/docs' })

  app.setErrorHandler(errorHandler)

  await app.register(sambungRoutes, { prefix: '/v1' })
  await app.register(webhookRoutes, { prefix: '/v1/webhooks' })
  await app.register(publicRoutes, { prefix: '/v1' })
  await app.register(adminRoutes, { prefix: '/v1/admin' })

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return app
}
