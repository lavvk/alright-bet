import type { Address } from "viem";

/** A market as returned by getMarket(), in a named shape. */
export interface Market {
  id: number;
  question: string;
  resolveBy: bigint;
  resolver: Address;
  resolved: boolean;
  outcome: boolean; // only meaningful when resolved
  poolYes: bigint;
  poolNo: bigint;
}

/** Tuple returned by the getMarket view → named Market. */
export function toMarket(
  id: number,
  tuple: readonly [string, bigint, Address, boolean, boolean, bigint, bigint],
): Market {
  const [question, resolveBy, resolver, resolved, outcome, poolYes, poolNo] =
    tuple;
  return { id, question, resolveBy, resolver, resolved, outcome, poolYes, poolNo };
}

/** Implied YES probability as a fraction 0..1. Returns 0.5 when no volume. */
export function impliedYesPct(poolYes: bigint, poolNo: bigint): number {
  const total = poolYes + poolNo;
  if (total === 0n) return 0.5;
  // Use Number on the ratio; pools are small testnet amounts.
  return Number((poolYes * 10000n) / total) / 10000;
}

export function totalPool(m: Pick<Market, "poolYes" | "poolNo">): bigint {
  return m.poolYes + m.poolNo;
}

/**
 * Pro-rata payout for a winning stake, matching the contract's distribution:
 *   payout = stake / winningPool * totalPool
 * If the winning pool is empty (no winners), returns 0n.
 * Integer math mirrors Solidity truncation closely enough for display.
 */
export function computePayout(
  stake: bigint,
  winningPool: bigint,
  total: bigint,
): bigint {
  if (winningPool === 0n || stake === 0n) return 0n;
  return (stake * total) / winningPool;
}

/** Net profit (payout minus original stake). Can be negative if they lost. */
export function netResult(payout: bigint, stake: bigint): bigint {
  return payout - stake;
}

export interface BetAgg {
  bettor: Address;
  yes: bigint;
  no: bigint;
}

/**
 * Given aggregated bets and a resolved market, rank winners by payout.
 * Returns [{ bettor, stake, payout }] sorted descending by payout.
 */
export function topWinners(
  bets: BetAgg[],
  market: Market,
  limit = 5,
): { bettor: Address; stake: bigint; payout: bigint }[] {
  if (!market.resolved) return [];
  const winningPool = market.outcome ? market.poolYes : market.poolNo;
  const total = market.poolYes + market.poolNo;
  return bets
    .map((b) => {
      const stake = market.outcome ? b.yes : b.no;
      return {
        bettor: b.bettor,
        stake,
        payout: computePayout(stake, winningPool, total),
      };
    })
    .filter((w) => w.stake > 0n)
    .sort((a, b) => (b.payout > a.payout ? 1 : b.payout < a.payout ? -1 : 0))
    .slice(0, limit);
}
