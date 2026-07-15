import {
  Horizon, Keypair, TransactionBuilder,
  Operation, BASE_FEE, Memo,
} from '@stellar/stellar-sdk'
import { config, USDC, IDRT } from './config.js'

const server = new Horizon.Server(config.STELLAR_HORIZON_URL)

export async function executePathPayment(remittanceId: string): Promise<string> {
  const sourceKeypair = Keypair.fromSecret(config.SAMBUNG_TREASURY_SECRET)
  const account = await server.loadAccount(sourceKeypair.publicKey())

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.pathPaymentStrictSend({
      sendAsset: USDC,
      sendAmount: '100',
      destination: config.ANCHOR_IDRT_ISSUER,
      destAsset: IDRT,
      destMin: '1',
      path: [USDC, IDRT],
    }))
    .addMemo(Memo.hash(remittanceId))
    .setTimeout(30)
    .build()

  tx.sign(sourceKeypair)
  const result = await server.submitTransaction(tx)
  return result.hash
}
