"use client";

import { useState, useEffect } from "react";
import type { FC } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getQuote, createRemittance } from "@/lib/api";
import type { QuoteResponse } from "@/lib/api";

const ConfirmPage: FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [usdcAmount, setUsdcAmount] = useState(searchParams.get("amount") || "");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nmid = searchParams.get("nmid") || "";
  const merchant = searchParams.get("merchant") || "Merchant QRIS";

  useEffect(() => {
    if (!usdcAmount || !nmid) return;
    const parsed = parseFloat(usdcAmount);
    if (!parsed || parsed <= 0) return;
    getQuote({ nmid, usdcAmount: parsed })
      .then(setQuote)
      .catch(() => setError("Gagal mendapatkan kuotasi"));
  }, [usdcAmount, nmid]);

  const handleSend = async () => {
    if (!quote || !usdcAmount || !nmid) return;
    setLoading(true);
    setError("");
    try {
      const result = await createRemittance({
        quoteId: quote.quoteId,
        nmid,
        usdcAmount: parseFloat(usdcAmount),
      });
      router.push(
        `/success?id=${result.id}&usdc=${result.usdcAmount}&idrt=${result.idrtAmount}&ref=${result.reference}&status=${result.status}`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm font-medium text-[#4caf50] hover:underline"
      >
        ← Kembali
      </button>

      <h1 className="mb-8 text-2xl font-bold">Konfirmasi</h1>

      <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-zinc-500">Tujuan</p>
        <p className="text-lg font-semibold">{merchant}</p>
        <p className="text-sm text-zinc-400">NMID: {nmid}</p>
      </div>

      <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <label className="text-sm text-zinc-500">Jumlah (USDC)</label>
        <input
          type="number"
          value={usdcAmount}
          onChange={(e) => setUsdcAmount(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-lg font-semibold focus:border-[#4caf50] focus:outline-none"
        />
        {quote && (
          <div className="mt-3 space-y-1.5 text-sm text-zinc-500">
            <div className="flex justify-between">
              <span>Setara</span>
              <span className="font-medium text-zinc-900">
                Rp {quote.idrtAmount.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Biaya ({quote.feeBps} bps)</span>
              <span className="font-medium text-zinc-900">
                {quote.feeAmount} USDC
              </span>
            </div>
            <div className="flex justify-between border-t border-zinc-100 pt-1.5">
              <span>Total</span>
              <span className="font-semibold text-zinc-900">
                {(parseFloat(usdcAmount) + (quote.feeAmount || 0)).toFixed(7)} USDC
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={handleSend}
        disabled={loading || !quote}
        className="w-full rounded-xl bg-[#4caf50] py-3.5 text-center text-lg font-semibold text-white transition hover:bg-[#388e3c] disabled:opacity-50"
      >
        {loading ? "Mengirim..." : "Kirim"}
      </button>
    </main>
  );
};

export default ConfirmPage;
