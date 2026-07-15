import type { QRISData } from './types.js'

export function parseQRIS(payload: string): QRISData {
  const cleaned = payload.replace(/\s/g, '')
  const tlv = parseTLV(cleaned)

  const nmid = getNmidFromQRIS(tlv)
  if (!nmid) {
    throw new Error('QRIS_INVALID: missing NMID in merchant info')
  }

  const rawAmount = tlv.get(0x54)

  const crcIndex = cleaned.lastIndexOf('6304')
  if (crcIndex === -1) throw new Error('QRIS_CRC_MISMATCH: CRC16 tag not found')
  const crcHex = cleaned.substring(crcIndex + 4, crcIndex + 8)

  if (!verifyCRC16(cleaned, crcIndex, crcHex)) {
    throw new Error('QRIS_CRC_MISMATCH: CRC16 verification failed')
  }

  return {
    nmid,
    merchantName: tlv.get(0x59),
    merchantCity: tlv.get(0x60),
    merchantCategory: tlv.get(0x52),
    amount: rawAmount ? parseInt(rawAmount) / 100 : undefined,
    currency: tlv.get(0x53) ?? '360',
    crc: crcHex,
  }
}

function getNmidFromQRIS(tlv: Map<number, string>): string | undefined {
  for (const tag of [0x26, 0x50, 0x51, 0x62]) {
    const raw = tlv.get(tag)
    if (!raw) continue
    const sub = parseSubTLVText(raw)
    const nmid = sub.get('01') ?? sub.get('02')
    if (nmid) return nmid
  }
  return undefined
}

export function formatQRIS(nmid: string, amount?: number): string {
  const payload = buildTLV([
    [0x00, '01'],
    [0x26, buildSubTLV([['01', nmid]])],
    [0x52, '5812'],
    [0x53, '360'],
    [0x58, 'ID'],
    [0x59, 'SAMBUNG Recipient'],
    ...(amount ? [[0x54, String(amount * 100).padStart(12, '0')] as [number, string]] : []),
  ])

  const crc = computeCRC16(payload + '6304')
  return payload + '6304' + crc.toString(16).toUpperCase().padStart(4, '0')
}

function parseTLV(data: string): Map<number, string> {
  const result = new Map<number, string>()
  let i = 0

  while (i < data.length - 3) {
    const tag = parseInt(data.substring(i, i + 2), 16)
    i += 2
    const length = parseInt(data.substring(i, i + 2), 16)
    i += 2
    const value = data.substring(i, i + length * 2)
    i += length * 2

    result.set(tag, hexToString(value))
  }

  return result
}

function parseSubTLV(data: string): Map<string, string> {
  const result = new Map<string, string>()
  let i = 0

  while (i < data.length - 3) {
    const tag = data.substring(i, i + 2)
    i += 2
    const length = parseInt(data.substring(i, i + 2), 16)
    i += 2
    const value = data.substring(i, i + length * 2)
    i += length * 2
    result.set(tag, hexToString(value))
  }

  return result
}

function parseSubTLVText(data: string): Map<string, string> {
  const result = new Map<string, string>()
  let i = 0

  while (i < data.length - 3) {
    const tag = data.substring(i, i + 2)
    i += 2
    const length = parseInt(data.substring(i, i + 2), 16)
    i += 2
    const value = data.substring(i, i + length)
    i += length
    result.set(tag, value)
  }

  return result
}

function hexToString(hex: string): string {
  let out = ''
  for (let i = 0; i < hex.length; i += 2) {
    out += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16))
  }
  return out
}

function buildTLV(tags: [number, string][]): string {
  return tags.map(([tag, value]) => {
    const hex = stringToHex(value)
    const len = hex.length / 2
    return tag.toString(16).padStart(2, '0') + len.toString(16).padStart(2, '0') + hex
  }).join('')
}

function buildSubTLV(tags: [string, string][]): string {
  return tags.map(([tag, value]) => {
    return tag + value.length.toString(16).padStart(2, '0') + value
  }).join('')
}

function stringToHex(str: string): string {
  return str.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
}

function verifyCRC16(fullPayload: string, crcIndex: number, crcHex: string): boolean {
  const data = fullPayload.substring(0, crcIndex + 4)
  const calculated = computeCRC16(data)
  return calculated === parseInt(crcHex, 16)
}

function computeCRC16(data: string): number {
  let crc = 0xFFFF
  for (let i = 0; i < data.length; i += 2) {
    const byte = parseInt(data.substring(i, i + 2), 16)
    crc = ((crc >> 8) | (crc << 8)) & 0xFFFF
    crc ^= byte
    crc ^= (crc & 0xFF) >> 4
    crc ^= (crc << 12) & 0xFFFF
    crc ^= ((crc & 0xFF) << 5) & 0xFFFF
  }
  return crc & 0xFFFF
}
