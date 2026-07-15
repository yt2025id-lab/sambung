import { prisma } from '@sambung/database'
import { getLiveRate } from './stellar.js'

export async function refreshRateCache() {
  const rate = await getLiveRate()

  await prisma.rateCache.upsert({
    where: {
      baseAsset_quoteAsset: { baseAsset: 'USDC', quoteAsset: 'IDRT' },
    },
    update: {
      bid: rate.bid,
      ask: rate.ask,
      source: 'soroswap',
      cachedAt: new Date(),
    },
    create: {
      baseAsset: 'USDC',
      quoteAsset: 'IDRT',
      bid: rate.bid,
      ask: rate.ask,
      source: 'soroswap',
    },
  })
}

export async function startRateRefresh(intervalMs = 30_000) {
  await refreshRateCache()
  setInterval(refreshRateCache, intervalMs)
}
