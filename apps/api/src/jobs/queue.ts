import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { config } from '../config.js'

const connection = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null })

export const queue = new Queue('sambung', { connection })

export function createWorker(
  name: string,
  processor: (job: { data: Record<string, unknown> }) => Promise<void>,
) {
  return new Worker(name, processor, { connection })
}
