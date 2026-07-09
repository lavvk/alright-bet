"use client";

import type { Address } from "viem";
import { Badge } from "@/components/ui/Badge";
import { formatEth, truncateAddress, formatDateTime } from "@/lib/utils";
import type { Market } from "@/lib/payouts";

const BASESCAN = "https://sepolia.basescan.org/tx/";

export interface ReceiptData {
  market: Market;
  groupName?: string;
  resolveTx: `0x${string}` | null;
  winners: { bettor: Address; stake: bigint; payout: bigint }[];
  totalPot: bigint;
  // Connected viewer's result (undefined if they didn't bet / not connected).
  you?: {
    won: boolean;
    stake: bigint;
    payout: bigint;
  };
}

/** Signature shareable receipt for a resolved market. */
export function ReceiptCard({ data }: { data: ReceiptData }) {
  const { market, groupName, winners, totalPot, resolveTx, you } = data;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
      {/* Header band */}
      <div className="relative bg-accent px-6 py-5 text-white">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-bold tracking-tight">
            Alright<span className="opacity-60">,</span> Bet
          </span>
          <span className="text-xs opacity-80">Receipt · #{market.id}</span>
        </div>
        <p className="mt-3 text-xs uppercase tracking-wider opacity-80">
          {groupName ?? "Group market"}
        </p>
        <h2 className="mt-1 font-display text-lg font-bold leading-snug">
          {market.question}
        </h2>
      </div>

      {/* Outcome */}
      <div className="border-b border-dashed border-border px-6 py-5 text-center">
        <p className="text-xs uppercase tracking-wider text-fg-muted">
          Final outcome
        </p>
        <p
          className={`mt-1 font-display text-4xl font-extrabold tracking-tight ${
            market.outcome ? "text-yes" : "text-no"
          }`}
        >
          {market.outcome ? "YES" : "NO"}
        </p>
      </div>

      {/* Your result */}
      {you && (
        <div
          className={`px-6 py-5 text-center ${
            you.won ? "bg-yes-soft" : "bg-no-soft"
          }`}
        >
          <p
            className={`text-2xl font-extrabold ${
              you.won ? "text-yes" : "text-no"
            }`}
          >
            {you.won ? "You called it" : "Missed this one"}
          </p>
          <div className="mt-2 flex justify-center gap-6 text-sm">
            <span>
              <span className="text-fg-muted">Staked</span>{" "}
              <span className="font-semibold tabular">
                {formatEth(you.stake)} ETH
              </span>
            </span>
            {you.won && (
              <span>
                <span className="text-fg-muted">Won</span>{" "}
                <span className="font-semibold tabular text-yes">
                  {formatEth(you.payout)} ETH
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="space-y-2.5 px-6 py-5 text-sm">
        <Row label="Total pot" value={`${formatEth(totalPot)} ETH`} />
        <Row label="Resolved" value={formatDateTime(market.resolveBy)} />
        <Row
          label="Resolver"
          value={
            <span className="font-mono">{truncateAddress(market.resolver)}</span>
          }
        />
      </div>

      {/* Winners */}
      {winners.length > 0 && (
        <div className="border-t border-border px-6 py-5">
          <p className="mb-2 text-xs uppercase tracking-wider text-fg-muted">
            Top winners
          </p>
          <ul className="space-y-1.5">
            {winners.map((w, i) => (
              <li
                key={w.bettor}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 font-mono">
                  <span className="text-fg-faint">{i + 1}.</span>
                  {truncateAddress(w.bettor)}
                </span>
                <span className="font-semibold tabular text-yes">
                  +{formatEth(w.payout)} ETH
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-dashed border-border px-6 py-4 text-xs text-fg-muted">
        <Badge tone="neutral">Base Sepolia</Badge>
        {resolveTx ? (
          <a
            href={`${BASESCAN}${resolveTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-accent hover:underline"
          >
            {truncateAddress(resolveTx, 6)} ↗
          </a>
        ) : (
          <span>on-chain</span>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
