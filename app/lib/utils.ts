import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther } from "viem";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 0x1234…cdef */
export function truncateAddress(address?: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

/** Format wei → a short ETH string, trimming trailing zeros. */
export function formatEth(wei: bigint | undefined, maxFrac = 4): string {
  if (wei === undefined) return "0";
  const s = formatEther(wei);
  const n = Number(s);
  if (n === 0) return "0";
  if (n < 0.0001) return "<0.0001";
  return n.toLocaleString("en-US", { maximumFractionDigits: maxFrac });
}

/** 0.732 → "73%" (rounded). */
export function formatPercent(fraction: number, digits = 0): string {
  if (!Number.isFinite(fraction)) return "—";
  return `${(fraction * 100).toFixed(digits)}%`;
}

/** Compact volume: 88169895 → "$88.2M". */
export function formatVolume(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "$0";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

/**
 * Human "time left" until a unix-seconds deadline.
 * Returns e.g. "3d left", "5h left", "12m left", or "Closed".
 */
export function timeLeft(resolveBySeconds: bigint | number): string {
  const target = Number(resolveBySeconds) * 1000;
  const diff = target - Date.now();
  if (diff <= 0) return "Closed";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m left`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d left`;
  const months = Math.floor(days / 30);
  return `${months}mo left`;
}

/** Full date + time. */
export function formatDateTime(input: bigint | number): string {
  const date = new Date(Number(input) * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isPast(resolveBySeconds: bigint | number): boolean {
  return Number(resolveBySeconds) * 1000 <= Date.now();
}

/** Pull the first meaningful line out of a viem/wagmi error. */
export function shortError(error: unknown): string {
  if (!error) return "Something went wrong";
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : String(error);
  // wagmi/viem errors are verbose; the first line is usually the gist.
  const first = msg.split("\n")[0].trim();
  if (/user rejected|denied|rejected the request/i.test(msg))
    return "You rejected the request";
  if (/insufficient funds/i.test(msg)) return "Insufficient funds";
  return first.length > 140 ? `${first.slice(0, 137)}…` : first;
}
