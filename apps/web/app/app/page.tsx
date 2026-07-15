"use client"

import { useState, useEffect } from "react"
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
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-brand)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.1)")
              }
            />
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
        </div>
      </main>
    </div>
  )
}

export default AppPage
