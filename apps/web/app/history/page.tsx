"use client";

import { useState, useEffect } from "react";
import type { FC } from "react";
import Link from "next/link";
import { getRemittanceHistory } from "@/lib/api";
import type { RemittanceResponse } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  initiated: "text-amber-500",
  swapping: "text-blue-500",
  waiting_anchor: "text-blue-500",
  settled: "text-[#4caf50]",
  failed: "text-red-500",
  refunded: "text-zinc-400",
};

const HistoryPage: FC = () => {
  const [remittances, setRemittances] = useState<RemittanceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRemittanceHistory()
      .then(setRemittances)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <Link
        href="/"
        className="mb-6 inline-block text-sm font-medium text-[#4caf50] hover:underline"
      >
        ← Kembali
      </Link>

      <h1 className="mb-8 text-2xl font-bold">Riwayat Transaksi</h1>

      {loading ? (
        <p className="text-center text-zinc-400">Memuat...</p>
      ) : remittances.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-5xl">📭</p>
          <p className="mt-4 text-zinc-500">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {remittances.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{r.usdcAmount} USDC</span>
                <span
                  className={`text-xs font-semibold uppercase ${STATUS_COLORS[r.status] || "text-zinc-400"}`}
                >
                  {r.status}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-zinc-500 truncate max-w-40">
                  {r.nmid || r.id.slice(0, 10)}
                </span>
                <span className="font-medium text-zinc-900">
                  Rp {Number(r.idrtAmount || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {new Date(r.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default HistoryPage;
