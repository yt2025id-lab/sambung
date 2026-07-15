import axios from "axios";
import type { QRISData } from "@sambung/sdk";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export interface RateResponse {
  pair: string;
  rate: number;
  source: string;
  updatedAt: string;
}

export interface QuoteResponse {
  quoteId: string;
  usdcAmount: number;
  idrtAmount: number;
  feeBps: number;
  feeAmount: number;
  rate: number;
  expiresAt: string;
}

export interface RemittanceResponse {
  id: string;
  status: string;
  usdcAmount: string;
  idrtAmount: string;
  feeBps: number;
  nmid: string;
  reference: string;
  stellarTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

export async function resolveQRIS(qrisString: string): Promise<QRISData> {
  const { data } = await api.post("/v1/qris/resolve", {
    qris_string: qrisString,
  });
  return data;
}

export async function getRate(): Promise<RateResponse> {
  const { data } = await api.get("/v1/rates/usdc-idr");
  return data;
}

export async function getQuote(params: {
  nmid: string;
  usdcAmount: number;
}): Promise<QuoteResponse> {
  const { data } = await api.post("/v1/remittance/quote", params);
  return data;
}

export async function createRemittance(params: {
  quoteId: string;
  nmid: string;
  usdcAmount: number;
}): Promise<RemittanceResponse> {
  const { data } = await api.post("/v1/remittance/create", params);
  return data;
}

export async function getRemittanceStatus(
  id: string
): Promise<RemittanceResponse> {
  const { data } = await api.get(`/v1/remittance/status/${id}`);
  return data;
}

export async function getRemittanceHistory(): Promise<RemittanceResponse[]> {
  const { data } = await api.get("/v1/remittance/history");
  return data;
}
