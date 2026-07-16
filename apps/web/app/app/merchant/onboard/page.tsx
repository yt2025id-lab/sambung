"use client"

import { useState } from "react"
import type { FC } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const STEPS = ["Scan", "Details", "Verify", "Submit"] as const

const OnboardPage: FC = () => {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [nmid, setNmid] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [settleToken, setSettleToken] = useState("IDRT")
  const [logoName, setLogoName] = useState("")
  const [proofName, setProofName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => {
      router.push("/app/merchant")
    }, 1500)
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
        <Link href="/app/merchant" className="landing-brand">
          sambung<span style={{ color: "var(--color-brand)" }}>.</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/app/merchant" className="landing-nav-link">
            Sign out
          </Link>
        </nav>
      </header>

      <main
        style={{
          maxWidth: "36rem",
          margin: "0 auto",
          padding: "2rem 1.5rem 6rem",
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: "1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "9999px",
              background: "linear-gradient(135deg, #16a34a, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            Y
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.9375rem", fontWeight: 600 }}>yt2025id@gmail.com</p>
            <p className="mono-label" style={{ color: "var(--color-brand)", marginTop: "0.125rem" }}>
              Signed in with Google
            </p>
          </div>
          <span
            style={{
              padding: "0.25rem 0.625rem",
              borderRadius: "9999px",
              fontSize: "0.6875rem",
              fontWeight: 600,
              background: "rgba(74,222,128,0.1)",
              color: "var(--color-brand)",
              border: "1px solid rgba(74,222,128,0.2)",
            }}
          >
            Verified
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "2rem",
          }}
        >
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem" }}>
              <div
                style={{
                  width: "100%",
                  height: "2px",
                  borderRadius: "1px",
                  background: i <= step ? "var(--color-brand)" : "rgba(255,255,255,0.08)",
                  transition: "background 0.3s",
                }}
              />
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: i <= step ? "var(--color-brand)" : "#52525b",
                  transition: "color 0.3s",
                }}
              >
                {i + 1} {s}
              </span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Scan QRIS</h2>
            <p style={{ color: "#a1a1aa", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Scan QRIS sticker or enter NMID manually.
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label className="mono-label" style={{ color: "#71717a", marginBottom: "0.375rem", display: "block" }}>
                NMID
              </label>
              <input
                type="text"
                value={nmid}
                onChange={(e) => setNmid(e.target.value)}
                placeholder="ID1021912345"
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
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!nmid.trim()}
              className="glass-btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "0.75rem",
                fontSize: "0.9375rem",
                opacity: nmid.trim() ? 1 : 0.5,
              }}
            >
              Scan QRIS sticker <span aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Details</h2>
            <p style={{ color: "#a1a1aa", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Tell us about your business.
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label className="mono-label" style={{ color: "#71717a", marginBottom: "0.375rem", display: "block" }}>
                NMID
              </label>
              <p style={{ fontSize: "0.875rem", color: "#a1a1aa", padding: "0.625rem 0", fontFamily: "var(--font-mono)" }}>
                {nmid}
              </p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label className="mono-label" style={{ color: "#71717a", marginBottom: "0.375rem", display: "block" }}>
                Business name (optional)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Warung Makmur"
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
              <p style={{ color: "#52525b", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                Shown to customers on the payment screen.
              </p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label className="mono-label" style={{ color: "#71717a", marginBottom: "0.375rem", display: "block" }}>
                Get paid in
              </label>
              <select
                value={settleToken}
                onChange={(e) => setSettleToken(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "white",
                  fontSize: "0.875rem",
                  outline: "none",
                  appearance: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              >
                <option value="IDRT" style={{ background: "#18181b" }}>
                  IDRT — Stellar Indonesian Rupiah token
                </option>
                <option value="USDC" style={{ background: "#18181b" }}>
                  USDC — Stellar USD stablecoin
                </option>
              </select>
              <p style={{ color: "#52525b", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                Customers can pay with any currency — we auto-convert so you always receive this one.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setStep(0)} className="glass-btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "0.75rem" }}>
                Back
              </button>
              <button onClick={() => setStep(2)} className="glass-btn-primary" style={{ flex: 1, justifyContent: "center", padding: "0.75rem" }}>
                Next <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Verify</h2>
            <p style={{ color: "#a1a1aa", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Upload your business documents.
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label className="mono-label" style={{ color: "#71717a", marginBottom: "0.375rem", display: "block" }}>
                Logo (optional, ≤200KB)
              </label>
              <div
                style={{
                  padding: "1.25rem",
                  borderRadius: "0.75rem",
                  border: "1px dashed rgba(255,255,255,0.1)",
                  textAlign: "center",
                  color: "#52525b",
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                onClick={() => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = "image/jpeg,image/png,image/webp"
                  input.onchange = (e: any) => {
                    const file = e.target?.files?.[0]
                    if (file) setLogoName(file.name)
                  }
                  input.click()
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 0.5rem", opacity: 0.5 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {logoName ? (
                  <span style={{ color: "var(--color-brand)" }}>{logoName}</span>
                ) : (
                  <span>Tap to upload an image</span>
                )}
                <p style={{ fontSize: "0.6875rem", marginTop: "0.25rem" }}>JPEG, PNG, WebP</p>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label className="mono-label" style={{ color: "#71717a", marginBottom: "0.375rem", display: "block" }}>
                Proof of ownership (required, ≤5MB)
              </label>
              <div
                style={{
                  padding: "1.25rem",
                  borderRadius: "0.75rem",
                  border: "1px dashed rgba(255,255,255,0.1)",
                  textAlign: "center",
                  color: "#52525b",
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                onClick={() => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = "application/pdf,image/png,image/jpeg,image/webp"
                  input.onchange = (e: any) => {
                    const file = e.target?.files?.[0]
                    if (file) setProofName(file.name)
                  }
                  input.click()
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 0.5rem", opacity: 0.5 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                {proofName ? (
                  <span style={{ color: "var(--color-brand)" }}>{proofName}</span>
                ) : (
                  <span>Tap to upload Bizfile (NIB) or business letterhead</span>
                )}
                <p style={{ fontSize: "0.6875rem", marginTop: "0.25rem" }}>PDF, PNG, JPEG, or WebP</p>
              </div>
              <p style={{ color: "#52525b", fontSize: "0.75rem", marginTop: "0.5rem", lineHeight: 1.5 }}>
                Your document is encrypted on this device before being uploaded. Only Sambung's reviewer can decrypt it.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setStep(1)} className="glass-btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "0.75rem" }}>
                Back
              </button>
              <button onClick={() => setStep(3)} disabled={!proofName} className="glass-btn-primary" style={{
                flex: 1,
                justifyContent: "center",
                padding: "0.75rem",
                opacity: proofName ? 1 : 0.5,
              }}>
                Next <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Submit</h2>
            <p style={{ color: "#a1a1aa", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Review and submit your application.
            </p>

            <div className="spec" style={{ marginBottom: "1.5rem" }}>
              <div className="spec-row">
                <dt className="spec-k mono-label">NMID</dt>
                <dd className="spec-v">{nmid}</dd>
              </div>
              <div className="spec-row">
                <dt className="spec-k mono-label">Business</dt>
                <dd className="spec-v">{businessName || "—"}</dd>
              </div>
              <div className="spec-row">
                <dt className="spec-k mono-label">Settle in</dt>
                <dd className="spec-v">{settleToken}</dd>
              </div>
              <div className="spec-row">
                <dt className="spec-k mono-label">Logo</dt>
                <dd className="spec-v">{logoName || "—"}</dd>
              </div>
              <div className="spec-row">
                <dt className="spec-k mono-label">Proof</dt>
                <dd className="spec-v">{proofName}</dd>
              </div>
            </div>

            <p style={{ color: "#52525b", fontSize: "0.75rem", textAlign: "center", marginBottom: "1rem", lineHeight: 1.5 }}>
              Free to set up. Sambung covers all the network fees. About 10 seconds to confirm.
            </p>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="glass-btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "0.75rem",
                fontSize: "0.9375rem",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Submit for review"}
            </button>

            <p style={{ color: "#52525b", fontSize: "0.6875rem", textAlign: "center", marginTop: "1rem" }}>
              Currently in beta — manual business review coming soon.
            </p>
          </div>
        )}

        <p
          className="mono-label"
          style={{
            color: "#52525b",
            textAlign: "center",
            marginTop: "2rem",
          }}
        >
          Powered by Stellar · Pyth · Soroswap
        </p>
      </main>
    </div>
  )
}

export default OnboardPage
