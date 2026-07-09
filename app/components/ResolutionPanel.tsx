"use client";

import { useEffect, useState } from "react";
import { alrightBet } from "@/lib/contract";
import { useContractTx } from "@/lib/hooks/writes";
import type { Market } from "@/lib/payouts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Resolver-only settlement. v1: the market's `resolver` address calls
 * resolveMarket(id, outcome) directly.
 *
 * TODO(v2): swap this for group-vote resolution — collect member votes
 * off-chain (or via a future on-chain tally) and submit the consensus
 * outcome here. This component is intentionally isolated so that drop-in
 * is a single-file change.
 */
export function ResolutionPanel({
  market,
  onUpdated,
}: {
  market: Market;
  onUpdated: () => void;
}) {
  const [outcome, setOutcome] = useState<boolean | null>(null);

  const tx = useContractTx({
    pending: "Settling the market…",
    success: "Market resolved",
  });

  useEffect(() => {
    if (tx.isSuccess) onUpdated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx.isSuccess]);

  function resolve() {
    if (outcome === null) return;
    tx.writeContract({
      ...alrightBet,
      functionName: "resolveMarket",
      args: [BigInt(market.id), outcome],
    });
  }

  return (
    <Card className="border-accent/40 bg-accent-soft/40 p-5">
      <h3 className="font-semibold text-fg">You&apos;re the resolver</h3>
      <p className="mt-1 text-sm text-fg-muted">
        Betting has closed. Settle the outcome to pay out winners.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[true, false].map((o) => (
          <button
            key={String(o)}
            type="button"
            onClick={() => setOutcome(o)}
            className={cn(
              "rounded-xl border-2 py-2.5 text-sm font-semibold transition-all",
              outcome === o
                ? o
                  ? "border-yes bg-yes-soft text-yes"
                  : "border-no bg-no-soft text-no"
                : "border-border bg-surface text-fg-muted hover:border-border-strong",
            )}
          >
            {o ? "Yes" : "No"}
          </button>
        ))}
      </div>
      <Button
        className="mt-3 w-full"
        onClick={resolve}
        disabled={outcome === null || tx.isSubmitting}
      >
        {tx.isPending
          ? "Confirm in wallet…"
          : tx.isConfirming
            ? "Resolving…"
            : "Resolve market"}
      </Button>
    </Card>
  );
}
