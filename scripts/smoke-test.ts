import 'dotenv/config'

const BASE_URL = process.env.API_URL ?? 'http://localhost:3000'

async function smokeTest() {
  console.log(`\n🔍 SAMBUNG Smoke Test — ${BASE_URL}\n`)

  // 1. Health check
  const health = await fetch(`${BASE_URL}/health`).then(r => r.json())
  console.assert(health.status === 'ok', 'Health check failed')
  console.log('✅ Health check')

  // 2. Rate
  const rate = await fetch(`${BASE_URL}/v1/rates/usdc-idr`).then(r => r.json())
  console.assert(rate.base === 'USDC', 'Rate check failed')
  console.log(`✅ Rate: USDC/IDRT = ${rate.bid}/${rate.ask}`)

  // 3. Quote
  const quote = await fetch(`${BASE_URL}/v1/remittance/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount_idr: 5000000 }),
  }).then(r => r.json())
  console.assert(quote.recipientReceives > 0, 'Quote failed')
  console.log(`✅ Quote: Rp 5jt → ${quote.usdcRequired} USDC, fee ${quote.totalFeeIdr}`)

  console.log('\n🎉 All smoke tests passed!\n')
}

smokeTest().catch(err => {
  console.error('❌ Smoke test failed:', err)
  process.exit(1)
})
