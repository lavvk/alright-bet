"use client";

import { useReadContract, useReadContracts } from "wagmi";
import type { Address } from "viem";
import { alrightBet } from "@/lib/contract";
import { toMarket, type Market } from "@/lib/payouts";

type MarketTuple = readonly [
  string,
  bigint,
  Address,
  boolean,
  boolean,
  bigint,
  bigint,
];

/** A single market by id. */
export function useMarket(id: number | undefined) {
  const { data, ...rest } = useReadContract({
    ...alrightBet,
    functionName: "getMarket",
    args: id === undefined ? undefined : [BigInt(id)],
    query: { enabled: id !== undefined },
  });
  const market =
    data && id !== undefined ? toMarket(id, data as MarketTuple) : undefined;
  return { market, ...rest };
}

/** Batch-read a set of market ids → Market[]. */
export function useMarkets(ids: number[]) {
  const { data, ...rest } = useReadContracts({
    contracts: ids.map((id) => ({
      ...alrightBet,
      functionName: "getMarket" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: ids.length > 0 },
  });
  const markets: Market[] = (data ?? [])
    .map((res, i) =>
      res.status === "success"
        ? toMarket(ids[i], res.result as MarketTuple)
        : null,
    )
    .filter((m): m is Market => m !== null);
  return { markets, ...rest };
}

/** A wallet's stake on a market: { stakeYes, stakeNo }. */
export function useStake(id: number | undefined, user: Address | undefined) {
  const { data, ...rest } = useReadContract({
    ...alrightBet,
    functionName: "getStake",
    args: id !== undefined && user ? [BigInt(id), user] : undefined,
    query: { enabled: id !== undefined && !!user },
  });
  const [stakeYes, stakeNo] = (data as readonly [bigint, bigint]) ?? [0n, 0n];
  return { stakeYes, stakeNo, ...rest };
}

/** Whether a wallet has already claimed winnings on a market. */
export function useHasClaimed(
  id: number | undefined,
  user: Address | undefined,
) {
  const { data, ...rest } = useReadContract({
    ...alrightBet,
    functionName: "hasClaimed",
    args: id !== undefined && user ? [BigInt(id), user] : undefined,
    query: { enabled: id !== undefined && !!user },
  });
  return { hasClaimed: Boolean(data), ...rest };
}
