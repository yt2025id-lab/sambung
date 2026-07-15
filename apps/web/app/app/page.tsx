"use client"

import { useState, useEffect, useRef } from "react"
import type { FC } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getRate, resolveQRIS } from "@/lib/api"
import type { RateResponse } from "@/lib/api"

const AppPage: FC = () => {
  const router = useRouter()
  const [rate, setRate] = useState<RateResponse | null>(null)
  const [qrisString, setQrisString] = useState("")
  const [usdcAmount, setUsdcAmount] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [scannerReady, setScannerReady] = useState(false)
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<any>(null)

  useEffect(() => {
    getRate()
      .then(setRate)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!showScanner) {
      setScannerReady(false)
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop()
        } catch {}
        html5QrCodeRef.current = null
      }
      return
    }

    let cancelled = false

    const start = async () => {
      const { Html5Qrcode } = await import("html5-qrcode")
      if (cancelled) return

      const scanner = new Html5Qrcode("qris-scanner")
      html5QrCodeRef.current = scanner
      setScannerReady(true)

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            setQrisString(decodedText)
            setShowScanner(false)
          },
          () => {}
        )
      } catch {
        if (!cancelled) setError("Kamera tidak tersedia atau izin ditolak")
      }
    }

    start()

    return () => {
      cancelled = true
      if (html5QrCodeRef.current) {
        try { html5QrCodeRef.current.stop() } catch {}
        html5QrCodeRef.current = null
      }
    }
  }, [showScanner])

  const idrtAmount =
    rate && usdcAmount
      ? (parseFloat(usdcAmount) * rate.rate).toLocaleString("id-ID")
      : "0"

  const handleSubmit = async () => {
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
    <div
      className="min-h-screen bg-[#0a0a0b] text-white antialiased"
      style={{ fontFamily: "Geist, system-ui, -apple-system, sans-serif" }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0.75rem 1.5rem",
        }}
      >
        <Link href="/" className="landing-brand">
          sambung<span style={{ color: "var(--color-brand)" }}>.</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/history"
            className="landing-nav-link"
          >
            Riwayat
          </Link>
        </nav>
      </header>

      <main
        style={{
          maxWidth: "28rem",
          margin: "0 auto",
          padding: "3rem 1.5rem 6rem",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Kirim QRIS
          </h1>
          <p style={{ color: "#a1a1aa", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Isi detail kiriman USDC ke QRIS tujuan
          </p>
        </div>

        <div
          className="glass-card"
          style={{ padding: "1.75rem" }}
        >
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <p className="mono-label" style={{ color: "#71717a" }}>
              Kurs
            </p>
            <p
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--color-brand)",
              }}
            >
              1 USDC = Rp{" "}
              {rate ? rate.rate.toLocaleString("id-ID") : "..."}
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              className="mono-label"
              style={{
                color: "#71717a",
                marginBottom: "0.375rem",
                display: "block",
              }}
            >
              Kode QRIS
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={qrisString}
                onChange={(e) => setQrisString(e.target.value)}
                placeholder="Tempel kode QRIS di sini..."
                style={{
                  flex: 1,
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "white",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-brand)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                }
              />
              <button
                onClick={() => setShowScanner(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.375rem",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#a1a1aa",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-brand)"
                  e.currentTarget.style.color = "var(--color-brand)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                  e.currentTarget.style.color = "#a1a1aa"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <rect x="7" y="7" width="10" height="10" rx="2" />
                </svg>
                Scan
              </button>
            </div>
            {error && (
              <p style={{ marginTop: "0.375rem", fontSize: "0.8125rem", color: "#ef4444" }}>
                {error}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              className="mono-label"
              style={{
                color: "#71717a",
                marginBottom: "0.375rem",
                display: "block",
              }}
            >
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
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-brand)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.1)")
              }
            />
            <p className="mono-label" style={{ color: "#71717a", marginTop: "0.5rem" }}>
              ≈ Rp {idrtAmount}
            </p>
          </div>

          <button
            onClick={handleSubmit}
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
        </div>
        {showScanner && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "360px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "1rem",
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                <div id="qris-scanner" ref={scannerRef} style={{ width: "100%", height: "100%" }} />
                {!scannerReady && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#71717a",
                      fontSize: "0.875rem",
                    }}
                  >
                    Mengaktifkan kamera...
                  </div>
                )}
              </div>
              <p style={{ color: "#a1a1aa", fontSize: "0.8125rem", marginTop: "1rem" }}>
                Arahkan kamera ke kode QRIS
              </p>
              <button
                onClick={() => setShowScanner(false)}
                className="glass-btn-ghost"
                style={{ marginTop: "1rem", padding: "0.625rem 1.5rem" }}
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AppPage
