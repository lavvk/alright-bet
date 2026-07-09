"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useMarket, useStake, useHasClaimed } from "@/lib/hooks/reads";
import { groupStore } from "@/lib/groups";
import { impliedYesPct, totalPool } from "@/lib/payouts";
import { StakeForm } from "@/components/StakeForm";
import { ResolutionPanel } from "@/components/ResolutionPanel";
import { ClaimPanel } from "@/components/ClaimPanel";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProbabilityBar } from "@/components/ui/ProbabilityBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/Button";
import {
  formatEth,
  formatPercent,
  truncateAddress,
  isPast,
  formatDateTime,
} from "@/lib/utils";

export default function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const marketId = Number(id);
  const { address } = useAccount();

  const { market, isLoading, refetch: refetchMarket } = useMarket(marketId);
  const { stakeYes, stakeNo, refetch: refetchStake } = useStake(
    marketId,
    address,
  );
  const { hasClaimed, refetch: refetchClaimed } = useHasClaimed(
    marketId,
    address,
  );

  const group = useMemo(
    () => groupStore.getGroupForMarket(marketId),
    [marketId],
  );

  const onUpdated = useCallback(() => {
    refetchMarket();
    refetchStake();
    refetchClaimed();
  }, [refetchMarket, refetchStake, refetchClaimed]);

  if (isLoading) return <MarketSkeleton />;

  if (!market) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <EmptyState
          icon={<Icon name="search" />}
          title="Market not found"
          description={`No on-chain market #${id} exists.`}
          action={<LinkButton href="/">Back to trending</LinkButton>}
        />
      </div>
    );
  }

  const yes = impliedYesPct(market.poolYes, market.poolNo);
  const total = totalPool(market);
  const noVolume = total === 0n;
  const closed = isPast(market.resolveBy);
  const isResolver =
    !!address && address.toLowerCase() === market.resolver.toLowerCase();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-28 sm:px-6 lg:pb-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Main */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {group ? (
              <Link href={`/groups/${group.id}`}>
                <Badge tone="accent">{group.name}</Badge>
              </Link>
            ) : (
              <Badge tone="accent">Group market</Badge>
            )}
            {market.resolved ? (
              <Badge tone={market.outcome ? "yes" : "no"}>
                Resolved · {market.outcome ? "Yes" : "No"}
              </Badge>
            ) : closed ? (
              <Badge tone="warning">Awaiting resolution</Badge>
            ) : (
              <Badge tone="neutral">Open</Badge>
            )}
          </div>

          <h1 className="mt-3 display-hero text-3xl sm:text-4xl">
            {market.question}
          </h1>

          {/* Price split */}
          <Card className="mt-6 p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-yes">Yes</p>
                <p className="font-display text-4xl font-bold leading-none text-yes tabular">
                  {noVolume ? "—" : formatPercent(yes)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-no">No</p>
                <p className="font-display text-4xl font-bold leading-none text-no tabular">
                  {noVolume ? "—" : formatPercent(1 - yes)}
                </p>
              </div>
            </div>
            <ProbabilityBar yes={yes} empty={noVolume} className="mt-3 h-2" />
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-dashed border-border pt-4 text-center text-sm">
              <Stat label="Total pot" value={`${formatEth(total)} ETH`} />
              <Stat label="Yes pool" value={`${formatEth(market.poolYes)}`} />
              <Stat label="No pool" value={`${formatEth(market.poolNo)}`} />
            </div>
          </Card>

          {/* Meta */}
          <Card className="mt-4 p-5 text-sm">
            <MetaRow
              label="Status"
              value={
                market.resolved
                  ? "Settled"
                  : closed
                    ? "Closed — awaiting resolution"
                    : <CountdownTimer resolveBy={market.resolveBy} />
              }
            />
            <MetaRow
              label="Resolve by"
              value={formatDateTime(market.resolveBy)}
            />
            <MetaRow
              label="Resolver"
              value={
                <span className="font-mono">
                  {truncateAddress(market.resolver)}
                  {isResolver && (
                    <span className="ml-1.5 text-accent">(you)</span>
                  )}
                </span>
              }
            />
          </Card>
        </div>

        {/* Side panel */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {market.resolved ? (
            <ClaimPanel
              market={market}
              stakeYes={stakeYes}
              stakeNo={stakeNo}
              hasClaimed={hasClaimed}
              onUpdated={onUpdated}
            />
          ) : (
            <>
              <Card className="p-5" id="bet">
                <h2 className="mb-3 font-semibold">Pick a side</h2>
                <StakeForm
                  market={market}
                  stakeYes={stakeYes}
                  stakeNo={stakeNo}
                  onUpdated={onUpdated}
                />
              </Card>
              {closed && isResolver && (
                <ResolutionPanel market={market} onUpdated={onUpdated} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile sticky bet bar */}
      {!market.resolved && !closed && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 p-3 backdrop-blur-md lg:hidden">
          <a
            href="#bet"
            className="flex items-center justify-center gap-3 rounded-xl bg-accent py-3 text-sm font-semibold text-white"
          >
            <span>Yes {noVolume ? "—" : formatPercent(yes)}</span>
            <span className="opacity-60">·</span>
            <span>Pick a side & lock it in</span>
          </a>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-fg-muted">{label}</p>
      <p className="mt-0.5 font-semibold tabular">{value}</p>
    </div>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function MarketSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div>
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="mt-4 h-9 w-full" />
          <Skeleton className="mt-2 h-9 w-2/3" />
          <Skeleton className="mt-6 h-40 w-full rounded-2xl" />
          <Skeleton className="mt-4 h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}
