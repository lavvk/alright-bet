"use client";

import { useEffect } from "react";
import Link from "next/link";
import { alrightBet } from "@/lib/contract";
import { useContractTx } from "@/lib/hooks/writes";
import { computePayout, netResult, type Market } from "@/lib/payouts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatEth } from "@/lib/utils";

export function ClaimPanel({
  market,
  stakeYes,
  stakeNo,
  hasClaimed,
  onUpdated,
}: {
  market: Market;
  stakeYes: bigint;
  stakeNo: bigint;
  hasClaimed: boolean;
  onUpdated: () => void;
}) {
  const winningPool = market.outcome ? market.poolYes : market.poolNo;
  const total = market.poolYes + market.poolNo;
  const myWinningStake = market.outcome ? stakeYes : stakeNo;
  const myLosingStake = market.outcome ? stakeNo : stakeYes;
  const won = myWinningStake > 0n;
  const payout = computePayout(myWinningStake, winningPool, total);
  const profit = netResult(payout, myWinningStake);

  const tx = useContractTx({
    pending: "Claiming your winnings…",
    success: "Winnings claimed 🎉",
  });

  useEffect(() => {
    if (tx.isSuccess) onUpdated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx.isSuccess]);

  function claim() {
    tx.writeContract({
      ...alrightBet,
      functionName: "claimWinnings",
      args: [BigInt(market.id)],
    });
  }

  const didParticipate = stakeYes > 0n || stakeNo > 0n;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-fg-muted">Outcome</span>
        <span
          className={`text-lg font-bold ${market.outcome ? "text-yes" : "text-no"}`}
        >
          {market.outcome ? "Yes" : "No"}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
        <Row label="Total pot" value={`${formatEth(total)} ETH`} />
        {didParticipate && (
          <Row
            label="Your stake"
            value={`${formatEth(myWinningStake + myLosingStake)} ETH`}
          />
        )}
        {won && <Row label="Your payout" value={`${formatEth(payout)} ETH`} />}
      </div>

      {!didParticipate ? (
        <p className="mt-4 text-center text-sm text-fg-muted">
          You didn&apos;t bet on this one.
        </p>
      ) : won ? (
        <div className="mt-4">
          <p className="text-center text-sm font-semibold text-yes">
            You called it — up {formatEth(profit)} ETH
          </p>
          {hasClaimed ? (
            <div className="mt-3 rounded-xl border border-border bg-surface-2 py-2.5 text-center text-sm font-medium text-fg-muted">
              Claimed ✓
            </div>
          ) : (
            <Button
              variant="yes"
              size="lg"
              className="mt-3 w-full"
              onClick={claim}
              disabled={tx.isSubmitting}
            >
              {tx.isPending
                ? "Confirm in wallet…"
                : tx.isConfirming
                  ? "Claiming…"
                  : "Claim winnings"}
            </Button>
          )}
        </div>
      ) : winningPool === 0n ? (
        <p className="mt-4 text-center text-sm text-fg-muted">
          Nobody backed the winning side — no payouts on this one.
        </p>
      ) : (
        <p className="mt-4 text-center text-sm font-semibold text-no">
          Missed this one. Better luck next bet.
        </p>
      )}

      <Link
        href={`/market/${market.id}/receipt`}
        className="mt-3 block text-center text-sm font-medium text-accent hover:underline"
      >
        Pull the receipt →
      </Link>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium tabular">{value}</span>
    </div>
  );
}
