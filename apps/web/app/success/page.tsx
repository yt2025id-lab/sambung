"use client";

import type { FC } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const SuccessPage: FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id") || "";
  const usdc = searchParams.get("usdc") || "0";
  const idrt = searchParams.get("idrt") || "0";
  const ref = searchParams.get("ref") || "";
  const status = searchParams.get("status") || "initiated";

  return (
    <main className="mx-auto max-w-lg px-4 py-12 text-center">
      <div className="mb-4 text-5xl">✅</div>
      <h1 className="mb-2 text-2xl font-bold">Transaksi Berhasil</h1>
      <p className="mb-8 text-zinc-500">Uang sedang diproses ke penerima</p>

      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm">
        <Row label="ID Transaksi" value={id.slice(0, 12) + "..."} />
        <Row label="Referensi" value={ref} />
        <Row label="Jumlah" value={`${usdc} USDC`} />
        <Row
          label="Setara"
          value={`Rp ${Number(idrt).toLocaleString("id-ID")}`}
        />
        <Row
          label="Status"
          value={status}
          valueClass="text-[#4caf50] uppercase"
        />
      </div>

      <button
        onClick={() => router.push("/")}
        className="w-full rounded-xl bg-[#4caf50] py-3.5 text-center text-lg font-semibold text-white transition hover:bg-[#388e3c]"
      >
        Kirim Lagi
      </button>

      <div className="mt-4">
        <Link
          href="/history"
          className="text-sm font-medium text-[#4caf50] hover:underline"
        >
          Lihat Riwayat
        </Link>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  valueClass = "font-semibold text-zinc-900",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between border-b border-zinc-100 py-3 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
};

export default SuccessPage;
