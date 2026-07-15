import { describe, it, expect } from 'vitest'
import { parseQRIS, formatQRIS } from '../qris.js'

describe('parseQRIS', () => {
  const qris1 =
    '00023031261330313066494431303031323334353637383930520435383132530333363058024944591153414d42554e4720526563697069656e74540c303030353030303030303030630482EB'
  const qris2 =
    '00023031261330313066494431303039383736353433323130520435383132530333363058024944591153414d42554e4720526563697069656e74540c30303030323530303030303063049B2D'
  const qris3 =
    '00023031261330313066494431303035353535353535353535520435383132530333363058024944591153414d42554e4720526563697069656e74540c3030313030303030303030306304E923'

  it('parses a valid QRIS with NMID + amount', () => {
    const result = parseQRIS(qris1)
    expect(result.nmid).toBe('ID1001234567890')
    expect(result.amount).toBe(5000000)
    expect(result.currency).toBe('360')
    expect(result.merchantName).toBe('SAMBUNG Recipient')
    expect(result.crc).toBe('82EB')
  })

  it('parses a valid QRIS with different NMID', () => {
    const result = parseQRIS(qris2)
    expect(result.nmid).toBe('ID1009876543210')
    expect(result.amount).toBe(250000)
  })

  it('parses QRIS without amount field', () => {
    const result = parseQRIS(qris3)
    expect(result.nmid).toBe('ID1005555555555')
    expect(result.amount).toBe(10000000)
  })

  it('throws on invalid CRC16', () => {
    const badCrc = qris1.slice(0, -4) + 'FFFF'
    expect(() => parseQRIS(badCrc)).toThrow('QRIS_CRC_MISMATCH')
  })

  it('throws on missing NMID', () => {
    const qris =
      '0002303152043538313253033336305802494459114e4f204e4d4944540530303030306304B9F4'
    expect(() => parseQRIS(qris)).toThrow('QRIS_INVALID')
  })

  it('throws on empty string', () => {
    expect(() => parseQRIS('')).toThrow()
  })

  it('parses QRIS with whitespace', () => {
    const qris = qris1.replace(/(.{4})/g, '$1 ').replace(/ $/g, '')
    const result = parseQRIS(qris)
    expect(result.nmid).toBe('ID1001234567890')
  })
})

describe('formatQRIS', () => {
  it('generates a valid QRIS string parseable by parseQRIS', () => {
    const qris = formatQRIS('ID1020304050607', 750000)
    const result = parseQRIS(qris)
    expect(result.nmid).toBe('ID1020304050607')
    expect(result.amount).toBe(750000)
    expect(result.currency).toBe('360')
  })

  it('generates a valid QRIS without amount', () => {
    const qris = formatQRIS('ID1098765432101')
    const result = parseQRIS(qris)
    expect(result.nmid).toBe('ID1098765432101')
    expect(result.amount).toBeUndefined()
  })

  it('generates format parseable by parseQRIS (roundtrip)', () => {
    const qris = formatQRIS('ID1011121314151', 1234567)
    const result = parseQRIS(qris)
    expect(result.nmid).toBe('ID1011121314151')
    expect(result.amount).toBe(1234567)
  })
})
