"use client";

import { useState, useEffect } from "react";
import type { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRate, resolveQRIS } from "@/lib/api";
import type { RateResponse } from "@/lib/api";

const HomePage: FC = () => {
  const router = useRouter();
  const [rate, setRate] = useState<RateResponse | null>(null);
  const [qrisString, setQrisString] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRate()
      .then(setRate)
      .catch(() => {});
  }, []);

  const idrtAmount =
    rate && usdcAmount
      ? (parseFloat(usdcAmount) * rate.rate).toLocaleString("id-ID")
      : "0";

  const handleScan = async () => {
    setError("");
    if (!qrisString.trim()) {
      setError("Masukkan kode QRIS");
      return;
    }
    setLoading(true);
    try {
      const result = await resolveQRIS(qrisString.trim());
      if (!result.nmid) throw new Error("QRIS tidak valid");
      router.push(
        `/confirm?nmid=${encodeURIComponent(result.nmid)}&merchant=${encodeURIComponent(result.merchantName || "")}&amount=${result.amount || ""}`
      );
    } catch {
      setError("QRIS tidak valid atau tidak terbaca");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Sambung</h1>
        <p className="mt-1 text-zinc-500">Kirim uang ke Indonesia</p>
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-zinc-500">Kurs</p>
        <p className="text-2xl font-semibold text-[#4caf50]">
          1 USDC = Rp{" "}
          {rate ? rate.rate.toLocaleString("id-ID") : "..."}
        </p>
      </div>

      <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <label className="text-sm text-zinc-500">Kode QRIS</label>
        <input
          type="text"
          value={qrisString}
          onChange={(e) => setQrisString(e.target.value)}
          placeholder="Tempel kode QRIS di sini..."
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-[#4caf50] focus:outline-none"
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <label className="text-sm text-zinc-500">Jumlah (USDC)</label>
        <input
          type="number"
          value={usdcAmount}
          onChange={(e) => setUsdcAmount(e.target.value)}
          placeholder="0.00"
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-lg font-semibold focus:border-[#4caf50] focus:outline-none"
        />
        <p className="mt-2 text-sm text-zinc-500">
          ≈ Rp {idrtAmount}
        </p>
      </div>

      <button
        onClick={handleScan}
        disabled={loading}
        className="w-full rounded-xl bg-[#4caf50] py-3.5 text-center text-lg font-semibold text-white transition hover:bg-[#388e3c] disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Lanjutkan"}
      </button>

      <div className="mt-6 text-center">
        <Link
          href="/history"
          className="text-sm font-medium text-[#4caf50] hover:underline"
        >
          Riwayat Transaksi
        </Link>
      </div>
    </main>
  );
};

export default HomePage;
