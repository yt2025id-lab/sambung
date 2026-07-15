#!/usr/bin/env tsx

import { formatQRIS } from '../packages/sdk/src/qris.js'

// Generate test QRIS strings untuk development
const testVectors = [
  { nmid: 'ID1001234567890', amount: 5000000 },
  { nmid: 'ID1009876543210', amount: 250000 },
  { nmid: 'ID1005555555555', amount: 10000000 },
]

for (const v of testVectors) {
  const qris = formatQRIS(v.nmid, v.amount)
  console.log(`\nNMID: ${v.nmid}`)
  console.log(`Amount: Rp ${v.amount.toLocaleString()}`)
  console.log(`QRIS: ${qris}`)
}
