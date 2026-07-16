"use client"

import { useEffect, useState } from "react"
import type { FC } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Session {
  email: string
  name: string
  picture?: string
}

const MerchantPage: FC = () => {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem("sambung.merchant_session")
    if (!raw) {
      router.replace("/app/merchant/login")
      return
    }
    setSession(JSON.parse(raw))
    setChecking(false)
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem("sambung.merchant_session")
    router.push("/app/merchant/login")
  }

  if (checking || !session) return null

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
          <button
            onClick={handleSignOut}
            className="landing-nav-link"
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            Sign out
          </button>
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
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
              }}
            >
              {session.email[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{session.email}</p>
              <p className="mono-label" style={{ color: "var(--color-brand)", marginTop: "0.125rem" }}>
                Signed in with Google
              </p>
            </div>
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

        <Link
          href="/app/merchant/onboard"
          className="glass-card"
          style={{
            display: "block",
            padding: "1.5rem",
            marginBottom: "1rem",
            textDecoration: "none",
            color: "white",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)"
            e.currentTarget.style.background = "rgba(255,255,255,0.06)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
            e.currentTarget.style.background = "rgba(255,255,255,0.03)"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Add your business</h3>
              <p style={{ color: "#a1a1aa", fontSize: "0.875rem", marginTop: "0.25rem", lineHeight: 1.5 }}>
                Two minutes. No fees. Verified and yours.
              </p>
            </div>
            <span style={{ color: "#71717a", fontSize: "1.25rem" }}>→</span>
          </div>
        </Link>
      </main>
    </div>
  )
}

export default MerchantPage
