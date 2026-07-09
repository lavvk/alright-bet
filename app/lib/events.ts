import {
  createPublicClient,
  http,
  type Address,
  type GetContractEventsReturnType,
} from "viem";
import { baseSepolia } from "viem/chains";
import { alrightBetAbi } from "./abi";
import { alrightBetAddress } from "./contract";

/**
 * Standalone viem client for reading historical event logs.
 * (wagmi's hooks cover live reads/writes; this is for getLogs scans.)
 */
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
});

const DEPLOY_BLOCK = BigInt(
  process.env.NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK ?? "0",
);

// Many public RPCs cap eth_getLogs at ~10k blocks per call.
const MAX_RANGE = 9000n;

type EventName =
  | "MarketCreated"
  | "BetPlaced"
  | "MarketResolved"
  | "WinningsClaimed";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Retry a flaky RPC call a few times with exponential backoff. Public Base
 * Sepolia endpoints intermittently rate-limit / time out on getLogs; a single
 * transient failure shouldn't sink the whole page.
 */
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await sleep(400 * 2 ** i); // 400ms, 800ms
    }
  }
  throw lastErr;
}

/**
 * Chunked getContractEvents from the deploy block to head, so we never blow
 * past an RPC's block-range limit. Each chunk is retried independently, so one
 * transient RPC hiccup doesn't fail the entire scan. Results are in order.
 */
async function scan<E extends EventName>(
  eventName: E,
  args?: Record<string, unknown>,
): Promise<GetContractEventsReturnType<typeof alrightBetAbi, E>> {
  const head = await withRetry(() => publicClient.getBlockNumber());
  const out: GetContractEventsReturnType<typeof alrightBetAbi, E> = [];
  let from = DEPLOY_BLOCK;
  while (from <= head) {
    const to = from + MAX_RANGE > head ? head : from + MAX_RANGE;
    const logs = await withRetry(() =>
      publicClient.getContractEvents({
        address: alrightBetAddress,
        abi: alrightBetAbi,
        eventName,
        // Indexed-arg filter; types vary per event so we widen here.
        args: args as never,
        fromBlock: from,
        toBlock: to,
      }),
    );
    out.push(...logs);
    from = to + 1n;
  }
  return out;
}

/** One-off market read via the standalone client (for event-driven pages). */
export async function readMarket(marketId: number) {
  const tuple = (await publicClient.readContract({
    address: alrightBetAddress,
    abi: alrightBetAbi,
    functionName: "getMarket",
    args: [BigInt(marketId)],
  })) as readonly [string, bigint, Address, boolean, boolean, bigint, bigint];
  return tuple;
}

export interface BetLog {
  marketId: number;
  bettor: Address;
  outcome: boolean;
  amount: bigint;
  txHash: `0x${string}`;
  blockNumber: bigint;
}

export interface ClaimLog {
  marketId: number;
  winner: Address;
  amount: bigint;
  txHash: `0x${string}`;
}

/** All bets on a single market. */
export async function getBetsForMarket(marketId: number): Promise<BetLog[]> {
  const logs = await scan("BetPlaced", { marketId: BigInt(marketId) });
  return logs.map((l) => ({
    marketId,
    bettor: l.args.bettor as Address,
    outcome: l.args.outcome as boolean,
    amount: l.args.amount as bigint,
    txHash: l.transactionHash,
    blockNumber: l.blockNumber,
  }));
}

/** All bets placed by a given wallet across all markets. */
export async function getBetsForUser(user: Address): Promise<BetLog[]> {
  const logs = await scan("BetPlaced", { bettor: user });
  return logs.map((l) => ({
    marketId: Number(l.args.marketId),
    bettor: l.args.bettor as Address,
    outcome: l.args.outcome as boolean,
    amount: l.args.amount as bigint,
    txHash: l.transactionHash,
    blockNumber: l.blockNumber,
  }));
}

/** Claims by a given wallet. */
export async function getClaimsForUser(user: Address): Promise<ClaimLog[]> {
  const logs = await scan("WinningsClaimed", { winner: user });
  return logs.map((l) => ({
    marketId: Number(l.args.marketId),
    winner: l.args.winner as Address,
    amount: l.args.amount as bigint,
    txHash: l.transactionHash,
  }));
}

/** The resolve transaction hash for a market, if resolved. */
export async function getResolveTx(
  marketId: number,
): Promise<`0x${string}` | null> {
  const logs = await scan("MarketResolved", { marketId: BigInt(marketId) });
  return logs[0]?.transactionHash ?? null;
}
