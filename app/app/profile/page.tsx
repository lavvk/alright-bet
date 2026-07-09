"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { Address } from "viem";
import { getBetsForUser, getClaimsForUser, readMarket } from "@/lib/events";
import { groupStore, type Group } from "@/lib/groups";
import { useGroups } from "@/lib/group-context";
import { toMarket, type Market } from "@/lib/payouts";
import { ConnectGate } from "@/components/ConnectGate";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GroupCard } from "@/components/GroupCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatEth, truncateAddress } from "@/lib/utils";

interface Participation {
  market: Market;
  side: boolean; // their (net) side; markets are one-side-per-wallet on-chain
  stake: bigint;
  won: boolean | null; // null while unresolved
}

interface ProfileData {
  participated: Participation[];
  wins: number;
  losses: number;
  totalWinnings: bigint; // actual claimed
}

async function loadProfile(address: Address): Promise<ProfileData> {
  const [bets, claims] = await Promise.all([
    getBetsForUser(address),
    getClaimsForUser(address),
  ]);

  const ids = [...new Set(bets.map((b) => b.marketId))];
  const markets = await Promise.all(
    ids.map(async (id) => toMarket(id, await readMarket(id))),
  );
  const marketById = new Map(markets.map((m) => [m.id, m]));

  const participated: Participation[] = ids.map((id) => {
    const m = marketById.get(id)!;
    const mine = bets.filter((b) => b.marketId === id);
    const side = mine[0]?.outcome ?? true;
    const stake = mine.reduce((acc, b) => acc + b.amount, 0n);
    const won = m.resolved ? m.outcome === side : null;
    return { market: m, side, stake, won };
  });

  const wins = participated.filter((p) => p.won === true).length;
  const losses = participated.filter((p) => p.won === false).length;
  const totalWinnings = claims.reduce((acc, c) => acc + c.amount, 0n);

  return { participated, wins, losses, totalWinnings };
}

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">Profile</h1>
      <div className="mt-8">
        <ConnectGate description="Connect to see your betting record.">
          <ProfileBody />
        </ConnectGate>
      </div>
    </div>
  );
}

function ProfileBody() {
  const { address } = useAccount();
  const { myGroups } = useGroups();

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["profile", address],
    queryFn: () => loadProfile(address as Address),
    enabled: !!address,
    staleTime: 30_000,
    retry: 2,
    retryDelay: (i) => 500 * 2 ** i,
  });

  return (
    <div className="space-y-8">
      {/* Identity */}
      <Card className="flex items-center gap-4 p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
          {address?.slice(2, 4).toUpperCase()}
        </span>
        <div>
          <p className="font-mono text-sm font-medium">
            {truncateAddress(address, 6)}
          </p>
          <p className="text-xs text-fg-muted">Base Sepolia</p>
        </div>
      </Card>

      {/* Stats */}
      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : isError ? (
        <EmptyState
          icon={<Icon name="signal" />}
          title="Couldn't read your history"
          description="The Base Sepolia RPC is slow or rate-limiting right now. Your on-chain record is safe — give it another shot."
          action={
            <Button
              variant="secondary"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Retrying…" : "Try again"}
            </Button>
          }
        />
      ) : data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Crews" value={myGroups.length} />
          <StatCard label="Bets" value={data.participated.length} />
          <StatCard label="Wins" value={data.wins} tone="yes" />
          <StatCard label="Losses" value={data.losses} tone="no" />
        </div>
      ) : null}

      {data && (
        <Card className="flex items-center justify-between p-5">
          <span className="text-sm text-fg-muted">Total winnings claimed</span>
          <span className="text-xl font-bold tabular text-yes">
            {formatEth(data.totalWinnings)} ETH
          </span>
        </Card>
      )}

      {/* Groups */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Your groups</h2>
        {myGroups.length > 0 ? (
          <div className="space-y-3">
            {myGroups.map((g: Group) => (
              <GroupCard key={g.id} group={g} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-fg-muted">
            You haven&apos;t joined any groups yet.
          </p>
        )}
      </section>

      {/* Receipts */}
      {data && data.participated.some((p) => p.market.resolved) && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Receipts</h2>
          <div className="space-y-2">
            {data.participated
              .filter((p) => p.market.resolved)
              .map((p) => (
                <Link
                  key={p.market.id}
                  href={`/market/${p.market.id}/receipt`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                >
                  <Badge tone={p.won ? "yes" : "no"}>
                    {p.won ? "Won" : "Lost"}
                  </Badge>
                  <span className="line-clamp-1 flex-1 text-sm font-medium">
                    {p.market.question}
                  </span>
                  <span className="text-sm text-accent">View →</span>
                </Link>
              ))}
          </div>
        </section>
      )}

      {data && data.participated.length === 0 && (
        <EmptyState
          icon={<Icon name="target" />}
          title="No bets yet"
          description="Join a group and lock in your first prediction."
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "yes" | "no";
}) {
  return (
    <Card className="p-4 text-center">
      <p
        className={`text-2xl font-bold tabular ${
          tone === "yes" ? "text-yes" : tone === "no" ? "text-no" : "text-fg"
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-fg-muted">{label}</p>
    </Card>
  );
}
