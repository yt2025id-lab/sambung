"use client"

import type { FC } from "react"
import Link from "next/link"

const HomePage: FC = () => {
  return (
    <div
      className="min-h-screen bg-[#0a0a0b] text-white antialiased"
      style={{ fontFamily: "Geist, system-ui, -apple-system, sans-serif" }}
    >
      <header className="landing-header">
        <div className="landing-header-blur" aria-hidden="true" />
        <div className="landing-header-inner">
          <Link href="/" className="landing-brand">
            sambung<span style={{ color: "var(--color-brand)" }}>.</span>
          </Link>
          <nav className="landing-nav">
            <a href="#how" className="landing-nav-link">Cara Kerja</a>
            <Link
              href="/app"
              className="glass-btn-primary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
            >
              Buka App <span aria-hidden="true">→</span>
            </Link>
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
            <Link href="/app" className="glass-btn-primary">
              Kirim Sekarang <span aria-hidden="true">→</span>
            </Link>
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
              {["Stellar", "Soroswap", "Pyth", "USDC"].map((name) => (
                <li key={name}>
                  <svg
                    viewBox={`0 0 ${name.length * 12 + 20} 24`}
                    className="hero-partner-logo"
                    style={{ height: "1.5rem" }}
                  >
                    <text
                      x="0"
                      y="18"
                      fill="#a1a1aa"
                      fontSize={name === "Stellar" ? 18 : 16}
                      fontWeight={700}
                      fontFamily="Geist, sans-serif"
                    >
                      {name}
                    </text>
                  </svg>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="how"
          style={{
            maxWidth: "72rem",
            margin: "0 auto",
            padding: "4rem 1.5rem",
          }}
        >
          <div className="section-mark">
            <span className="section-mark-num">01</span>
            <span className="section-mark-rule" />
            <span className="section-mark-label mono-label">Cara Kerja</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: "3rem",
              color: "white",
            }}
          >
            Scan. Kirim. Selesai.<br />
            <span style={{ color: "#a1a1aa" }}>Satu transaksi on-chain.</span>
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <article className="step glass-card">
              <header
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <span className="section-mark-num" style={{ fontSize: "0.875rem" }}>01</span>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Scan</h3>
              </header>
              <p style={{ color: "#d4d4d8", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Baca QRIS dari kamera atau tempel kode. Resolve merchant tujuan. Quote harga dengan Pyth.
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
              <header
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <span className="section-mark-num" style={{ fontSize: "0.875rem" }}>02</span>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Kirim</h3>
              </header>
              <p style={{ color: "#d4d4d8", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Pilih jumlah. Path payment Stellar kirim USDC dan settle IDRT langsung.
              </p>
              <p style={{ color: "#71717a", fontSize: "0.8125rem", lineHeight: 1.6, marginTop: "0.5rem" }}>
                Path payment Stellar convert USDC ke IDRT atomic via Soroswap. Slippage terkunci. Dana terkirim dalam 3-5 detik.
              </p>
              <pre className="step-fixture">send     = 3.08 USDC
via      = USDC → IDRT (Soroswap)
route    = Stellar path payment
max slip = 0.30%
guard    = Pyth conf &lt; 0.30%</pre>
            </article>

            <article className="step glass-card">
              <header
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
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

        <section
          style={{
            maxWidth: "72rem",
            margin: "0 auto",
            padding: "4rem 1.5rem",
          }}
        >
          <div className="section-mark">
            <span className="section-mark-num">02</span>
            <span className="section-mark-rule" />
            <span className="section-mark-label mono-label">Dua sisi, satu rail</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: "3rem",
              color: "white",
            }}
          >
            Kirim dari mana saja.<br />
            <span style={{ color: "#a1a1aa" }}>Terima di dompet digital.</span>
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <article className="side glass-card">
              <header
                className="side-head"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span className="mono-label" style={{ color: "var(--color-brand)" }}>
                  Untuk Pengirim
                </span>
                <span className="section-mark-num">01</span>
              </header>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                Kirim dengan apa yang kamu punya.
              </h3>
              <dl className="spec">
                {[
                  ["Token", "USDC — stablecoin"],
                  ["Off-ramp", "None. Kirim direct."],
                  ["Biaya", "~$0.00001 per tx"],
                  ["Kecepatan", "3-5 detik"],
                  ["KYC", "Tidak diperlukan"],
                ].map(([k, v]) => (
                  <div className="spec-row" key={k}>
                    <dt className="spec-k mono-label">{k}</dt>
                    <dd className="spec-v">{v}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="side glass-card">
              <header
                className="side-head"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span className="mono-label" style={{ color: "var(--color-brand)" }}>
                  Untuk Penerima
                </span>
                <span className="section-mark-num">02</span>
              </header>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                Terima IDR. Tanpa ribet.
              </h3>
              <dl className="spec">
                {[
                  ["Settlement", "IDR via QRIS"],
                  ["Custody", "Dompet digital langsung"],
                  ["Chargeback", "Impossible at settlement"],
                  ["Receipt", "On-chain · audit-ready"],
                  ["Limit", "Sesuai batas QRIS"],
                ].map(([k, v]) => (
                  <div className="spec-row" key={k}>
                    <dt className="spec-k mono-label">{k}</dt>
                    <dd className="spec-v">{v}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>
        </section>

        <section
          style={{
            textAlign: "center",
            padding: "4rem 1.5rem 6rem",
          }}
        >
          <div className="section-mark is-center" style={{ justifyContent: "center" }}>
            <span className="section-mark-num">03</span>
            <span className="section-mark-rule" />
            <span className="section-mark-label mono-label">Mulai</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              color: "white",
              marginBottom: "1.5rem",
            }}
          >
            Siap kirim uang<br />
            <span className="glass-shimmer">ke Indonesia?</span>
          </h2>

          <Link href="/app" className="glass-btn-primary" style={{ fontSize: "1.0625rem", padding: "0.75rem 2rem" }}>
            Kirim Sekarang <span aria-hidden="true">→</span>
          </Link>
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
              <Link href="/app">App</Link>
              <a href="#how">Cara Kerja</a>
              <Link href="/history">Riwayat</Link>
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
