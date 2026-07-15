import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed PJP partners
  await prisma.pjpPartner.upsert({
    where: { id: 'xendit' },
    update: {},
    create: {
      id: 'xendit',
      name: 'Xendit',
      type: 'payment_gateway',
      apiBaseUrl: 'https://api.xendit.co',
      apiKeyHash: 'placeholder',
      supportsQris: true,
      supportsBank: true,
      feeBps: 30,
      isActive: true,
    },
  })

  await prisma.pjpPartner.upsert({
    where: { id: 'flip' },
    update: {},
    create: {
      id: 'flip',
      name: 'Flip',
      type: 'bank',
      apiBaseUrl: 'https://api.flip.id',
      apiKeyHash: 'placeholder',
      supportsQris: false,
      supportsBank: true,
      feeBps: 0,
      isActive: true,
    },
  })

  // Seed rate cache
  await prisma.rateCache.upsert({
    where: { baseAsset_quoteAsset: { baseAsset: 'USDC', quoteAsset: 'IDRT' } },
    update: {},
    create: {
      baseAsset: 'USDC',
      quoteAsset: 'IDRT',
      bid: 15350,
      ask: 15380,
      source: 'soroswap',
    },
  })

  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
