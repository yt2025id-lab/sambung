import axios from 'axios'
import { config } from '../config.js'

const client = axios.create({
  baseURL: config.ANCHOR_SEP6_URL ?? 'https://api.anchor-stellar.com',
  headers: {
    'Authorization': `Bearer ${config.ANCHOR_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export async function getInfo() {
  const { data } = await client.get('/info')
  return data
}

export async function deposit(params: {
  assetCode: string
  amount: string
  account: string
  memo?: string
}) {
  const { data } = await client.post('/deposit', {
    asset_code: params.assetCode,
    amount: params.amount,
    account: params.account,
    memo: params.memo,
  })
  return data
}

export async function getTransaction(id: string) {
  const { data } = await client.get(`/transaction?id=${id}`)
  return data.transaction
}
