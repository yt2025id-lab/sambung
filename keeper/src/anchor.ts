import { prisma } from '@sambung/database'

export async function checkAnchorStatus(remittanceId: string) {
  const remittance = await prisma.remittance.findUnique({ where: { id: remittanceId } })
  if (!remittance || remittance.status !== 'waiting_anchor') return

  // Check if settlement is confirmed (from webhook or poll)
  if (remittance.pjpTxId) {
    await prisma.remittance.update({
      where: { id: remittanceId },
      data: {
        status: 'settled',
        completedAt: new Date(),
      },
    })
  }
}
