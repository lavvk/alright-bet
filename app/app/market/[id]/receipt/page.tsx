"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { Address } from "viem";
import {
  readMarket,
  getBetsForMarket,
  getResolveTx,
} from "@/lib/events";
import { groupStore } from "@/lib/groups";
import {
  toMarket,
  topWinners,
  computePayout,
  type BetAgg,
} from "@/lib/payouts";
import { ReceiptCard, type ReceiptData } from "@/components/ReceiptCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";

async function loadReceipt(
  marketId: number,
  viewer?: Address,
): Promise<ReceiptData | null> {
  const tuple = await readMarket(marketId);
  const market = toMarket(marketId, tuple);
  if (!market.resolved) return null;

  const [bets, resolveTx] = await Promise.all([
    getBetsForMarket(marketId),
    getResolveTx(marketId),
  ]);

  // Aggregate stake per bettor per side.
  const byBettor = new Map<string, BetAgg>();
  for (const b of bets) {
    const key = b.bettor.toLowerCase();
    const agg = byBettor.get(key) ?? {
      bettor: b.bettor,
      yes: 0n,
      no: 0n,
    };
    if (b.outcome) agg.yes += b.amount;
    else agg.no += b.amount;
    byBettor.set(key, agg);
  }
  const aggs = [...byBettor.values()];
  const winners = topWinners(aggs, market);
  const totalPot = market.poolYes + market.poolNo;

  let you: ReceiptData["you"];
  if (viewer) {
    const mine = byBettor.get(viewer.toLowerCase());
    if (mine && (mine.yes > 0n || mine.no > 0n)) {
      const winningStake = market.outcome ? mine.yes : mine.no;
      const winningPool = market.outcome ? market.poolYes : market.poolNo;
      you = {
        won: winningStake > 0n,
        stake: mine.yes + mine.no,
        payout: computePayout(winningStake, winningPool, totalPot),
      };
    }
  }

  const group = groupStore.getGroupForMarket(marketId);
  return {
    market,
    groupName: group?.name,
    groupEmoji: group?.emoji,
    resolveTx,
    winners,
    totalPot,
    you,
  };
}

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const marketId = Number(id);
  const { address } = useAccount();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["receipt", marketId, address],
    queryFn: () => loadReceipt(marketId, address),
    staleTime: 30_000,
  });

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      {isLoading ? (
        <Skeleton className="h-[28rem] w-full rounded-2xl" />
      ) : isError ? (
        <EmptyState
          icon="⚠️"
          title="Couldn't load the receipt"
          description="Reading on-chain history failed. Try again in a moment."
        />
      ) : !data ? (
        <EmptyState
          icon="⏳"
          title="No receipt yet"
          description="This market hasn't been resolved. Come back once it's settled."
          action={
            <LinkButton href={`/market/${marketId}`}>
              Back to market
            </LinkButton>
          }
        />
      ) : (
        <>
          <ReceiptCard data={data} />
          <p className="mt-4 text-center text-xs text-fg-faint">
            Screenshot it. Send it to the group chat. You earned it.
          </p>
        </>
      )}
    </div>
  );
}
