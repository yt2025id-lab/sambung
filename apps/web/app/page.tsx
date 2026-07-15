"use client"

import { useState, useEffect, useRef } from "react"
import type { FC } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getRate, resolveQRIS } from "@/lib/api"
import type { RateResponse } from "@/lib/api"

const HomePage: FC = () => {
  const router = useRouter()
  const [rate, setRate] = useState<RateResponse | null>(null)
  const [qrisString, setQrisString] = useState("")
  const [usdcAmount, setUsdcAmount] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const appRef = useRef<HTMLElement>(null)

  useEffect(() => {
    getRate()
      .then(setRate)
      .catch(() => {})
  }, [])

  const idrtAmount =
    rate && usdcAmount
      ? (parseFloat(usdcAmount) * rate.rate).toLocaleString("id-ID")
      : "0"

  const handleScan = async () => {
    setError("")
    if (!qrisString.trim()) {
      setError("Masukkan kode QRIS")
      return
    }
    setLoading(true)
    try {
      const result = await resolveQRIS(qrisString.trim())
      if (!result.nmid) throw new Error("QRIS tidak valid")
      router.push(
        `/confirm?nmid=${encodeURIComponent(result.nmid)}&merchant=${encodeURIComponent(result.merchantName || "")}&amount=${result.amount || ""}`
      )
    } catch {
      setError("QRIS tidak valid atau tidak terbaca")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white antialiased" style={{ fontFamily: "Geist, system-ui, -apple-system, sans-serif" }}>
      <header className="landing-header">
        <div className="landing-header-blur" aria-hidden="true" />
        <div className="landing-header-inner">
          <Link href="/" className="landing-brand">
            sambung<span style={{ color: "var(--color-brand)" }}>.</span>
          </Link>
          <nav className="landing-nav">
            <a href="#how" className="landing-nav-link">Cara Kerja</a>
            <a href="#app" className="glass-btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>
              Kirim Sekarang <span aria-hidden="true">→</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="relative">
        <section className="landing-hero">
          <span className="glass-pill">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-brand)] live-dot" />
            Live beta · Indonesia
          </span>

          <h1 className="landing-hero-h">
            Kirim QRIS.<br />
            <span className="glass-shimmer">Token apa pun. Satu scan.</span>
          </h1>

          <p className="landing-hero-sub">
            QR rail on Stellar. Kirim USDC dari mana saja, sampai ke QRIS tujuan di Indonesia.
            Penerima terima IDR langsung ke dompet digital mereka.
          </p>

          <div className="landing-hero-ctas">
            <a href="#app" className="glass-btn-primary">
              Kirim Sekarang <span aria-hidden="true">→</span>
            </a>
            <a href="#how" className="glass-btn-ghost">
              Cara Kerja
            </a>
          </div>

          <div className="landing-hero-meta">
            <span className="mono-label">Stellar Soroban 2026</span>
          </div>

          <div className="hero-partners" aria-label="Built on">
            <span className="mono-label" style={{ color: "#52525b" }}>Built on</span>
            <ul className="hero-partners-list">
              <li>
                <svg viewBox="0 0 120 24" className="hero-partner-logo" style={{ height: "1.5rem" }}>
                  <text x="0" y="18" fill="#a1a1aa" fontSize="18" fontWeight="700" fontFamily="Geist, sans-serif">Stellar</text>
                </svg>
              </li>
              <li>
                <svg viewBox="0 0 140 24" className="hero-partner-logo" style={{ height: "1.5rem" }}>
                  <text x="0" y="18" fill="#a1a1aa" fontSize="16" fontWeight="600" fontFamily="Geist, sans-serif">Soroswap</text>
                </svg>
              </li>
              <li>
                <svg viewBox="0 0 80 24" className="hero-partner-logo" style={{ height: "1.5rem" }}>
                  <text x="0" y="18" fill="#a1a1aa" fontSize="16" fontWeight="600" fontFamily="Geist, sans-serif">Pyth</text>
                </svg>
              </li>
              <li>
                <svg viewBox="0 0 100 24" className="hero-partner-logo" style={{ height: "1.5rem" }}>
                  <text x="0" y="18" fill="#a1a1aa" fontSize="16" fontWeight="600" fontFamily="Geist, sans-serif">USDC</text>
                </svg>
              </li>
            </ul>
          </div>
        </section>

        <section id="how" style={{ maxWidth: "72rem", margin: "0 auto", padding: "4rem 1.5rem" }}>
          <div className="section-mark">
            <span className="section-mark-num">01</span>
            <span className="section-mark-rule" />
            <span className="section-mark-label mono-label">Cara Kerja</span>
          </div>

          <h2 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: "3rem",
            color: "white",
          }}>
            Scan. Kirim. Selesai.<br />
            <span style={{ color: "#a1a1aa" }}>Satu transaksi on-chain.</span>
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}>
            <article className="step glass-card">
              <header style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span className="section-mark-num" style={{ fontSize: "0.875rem" }}>01</span>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Scan</h3>
              </header>
              <p style={{ color: "#d4d4d8", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Baca QRIS dari kamera atau tempel kode. Resolve merchant tujuan.Quote harga dengan Pyth.
              </p>
              <p style={{ color: "#71717a", fontSize: "0.8125rem", lineHeight: 1.6, marginTop: "0.5rem" }}>
                Sambung parse EMVCo-MPM QR — QRIS hari ini, SGQR, DuitNow, UPI menyusul. NMID resolve ke record on-chain. Pyth stream USDC/IDR dalam &lt;400ms.
              </p>
              <pre className="step-fixture">qr       = QRIS (EMVCo-MPM)
nmid     = ID1021912345
merchant = Warung Makmur
amount   = Rp50.000
price    = 1 USDC = 16.250 IDR  (Pyth)</pre>
            </article>

            <article className="step glass-card">
              <header style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span className="section-mark-num" style={{ fontSize: "0.875rem" }}>02</span>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Kirim</h3>
              </header>
              <p style={{ color: "#d4d4d8", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Pilih jumlah. Path payment Stellar kirim USDC dan settle IDRT langsung.
              </p>
              <p style={{ color: "#71717a", fontSize: "0.8125rem", lineHeight: 1.6, marginTop: "0.5rem" }}>
                Path payment Stellar convert USDC → IDRT atomic via Soroswap. Slippage terkunci. Dana terkirim dalam 3-5 detik.
              </p>
              <pre className="step-fixture">send     = 3.08 USDC
via      = USDC → IDRT (Soroswap)
route    = Stellar path payment
max slip = 0.30%
guard    = Pyth conf &lt; 0.30%</pre>
            </article>

            <article className="step glass-card">
              <header style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span className="section-mark-num" style={{ fontSize: "0.875rem" }}>03</span>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Selesai</h3>
              </header>
              <p style={{ color: "#d4d4d8", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Atomic settlement. QRIS terbayar. Receipt on-chain.
              </p>
              <p style={{ color: "#71717a", fontSize: "0.8125rem", lineHeight: 1.6, marginTop: "0.5rem" }}>
                Semua terjadi dalam satu transaksi Stellar — terbayar penuh atau gagal total. Receipt di on-chain, siap untuk audit.
              </p>
              <pre className="step-fixture">tx       = Stellar · 0x9c2a…f01ad
sent     = Rp50.000 IDRT
recipient = Warung Makmur (QRIS)
gas      = ~0.00001 XLM
finality = 3-5 detik</pre>
            </article>
          </div>
        </section>

        <section style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "4rem 1.5rem",
        }}>
          <div className="section-mark">
            <span className="section-mark-num">02</span>
            <span className="section-mark-rule" />
            <span className="section-mark-label mono-label">Dua sisi, satu rail</span>
          </div>

          <h2 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: "3rem",
            color: "white",
          }}>
            Kirim dari mana saja.<br />
            <span style={{ color: "#a1a1aa" }}>Terima di dompet digital.</span>
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}>
            <article className="side glass-card">
              <header className="side-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span className="mono-label" style={{ color: "var(--color-brand)" }}>Untuk Pengirim</span>
                <span className="section-mark-num">01</span>
              </header>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                Kirim dengan apa yang kamu punya.
              </h3>
              <dl className="spec">
                <div className="spec-row">
                  <dt className="spec-k mono-label">Token</dt>
                  <dd className="spec-v">USDC — stablecoin</dd>
                </div>
                <div className="spec-row">
                  <dt className="spec-k mono-label">Off-ramp</dt>
                  <dd className="spec-v">None. Kirim direct.</dd>
                </div>
                <div className="spec-row">
                  <dt className="spec-k mono-label">Biaya</dt>
                  <dd className="spec-v">~$0.00001 per tx</dd>
                </div>
                <div className="spec-row">
                  <dt className="spec-k mono-label">Kecepatan</dt>
                  <dd className="spec-v">3-5 detik</dd>
                </div>
                <div className="spec-row">
                  <dt className="spec-k mono-label">KYC</dt>
                  <dd className="spec-v">Tidak diperlukan</dd>
                </div>
              </dl>
            </article>

            <article className="side glass-card">
              <header className="side-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span className="mono-label" style={{ color: "var(--color-brand)" }}>Untuk Penerima</span>
                <span className="section-mark-num">02</span>
              </header>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                Terima IDR. Tanpa ribet.
              </h3>
              <dl className="spec">
                <div className="spec-row">
                  <dt className="spec-k mono-label">Settlement</dt>
                  <dd className="spec-v">IDR via QRIS</dd>
                </div>
                <div className="spec-row">
                  <dt className="spec-k mono-label">Custody</dt>
                  <dd className="spec-v">Dompet digital langsung</dd>
                </div>
                <div className="spec-row">
                  <dt className="spec-k mono-label">Chargeback</dt>
                  <dd className="spec-v">Impossible at settlement</dd>
                </div>
                <div className="spec-row">
                  <dt className="spec-k mono-label">Receipt</dt>
                  <dd className="spec-v">On-chain · audit-ready</dd>
                </div>
                <div className="spec-row">
                  <dt className="spec-k mono-label">Limit</dt>
                  <dd className="spec-v">Sesuai batas QRIS</dd>
                </div>
              </dl>
            </article>
          </div>
        </section>

        <section id="app" ref={appRef} style={{
          maxWidth: "28rem",
          margin: "0 auto",
          padding: "4rem 1.5rem 6rem",
        }}>
          <div className="section-mark is-center" style={{ justifyContent: "center" }}>
            <span className="section-mark-num">03</span>
            <span className="section-mark-rule" />
            <span className="section-mark-label mono-label">Kirim Sekarang</span>
          </div>

          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
              <p className="mono-label" style={{ color: "#71717a" }}>Kurs</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand)" }}>
                1 USDC = Rp{" "}
                {rate ? rate.rate.toLocaleString("id-ID") : "..."}
              </p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label className="mono-label" style={{ color: "#71717a", marginBottom: "0.375rem", display: "block" }}>
                Kode QRIS
              </label>
              <input
                type="text"
                value={qrisString}
                onChange={(e) => setQrisString(e.target.value)}
                placeholder="Tempel kode QRIS di sini..."
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "white",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              {error && <p style={{ marginTop: "0.375rem", fontSize: "0.8125rem", color: "#ef4444" }}>{error}</p>}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label className="mono-label" style={{ color: "#71717a", marginBottom: "0.375rem", display: "block" }}>
                Jumlah (USDC)
              </label>
              <input
                type="number"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "white",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <p className="mono-label" style={{ color: "#71717a", marginTop: "0.5rem" }}>
                ≈ Rp {idrtAmount}
              </p>
            </div>

            <button
              onClick={handleScan}
              disabled={loading}
              className="glass-btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "0.75rem",
                fontSize: "1rem",
              }}
            >
              {loading ? "Memproses..." : "Lanjutkan"}
            </button>

            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <Link
                href="/history"
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "#71717a",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
              >
                Riwayat Transaksi
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-rule" />
        <div className="landing-footer-row">
          <div className="landing-footer-brand">
            <span className="landing-brand">
              sambung<span style={{ color: "var(--color-brand)" }}>.</span>
            </span>
            <span className="mono-label" style={{ color: "#52525b" }}>QR rail on Stellar</span>
          </div>
          <div className="landing-footer-cols">
            <div>
              <span className="mono-label" style={{ color: "#52525b" }}>Product</span>
              <a href="#app">Kirim</a>
              <a href="#how">Cara Kerja</a>
              <a href="/history">Riwayat</a>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span className="mono-label" style={{ color: "#52525b" }}>© sambung · 2026</span>
          <span className="mono-label" style={{ color: "#52525b" }}>Stellar Soroban 2026</span>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
