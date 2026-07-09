"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useGroups } from "@/lib/group-context";
import { useMarkets } from "@/lib/hooks/reads";
import { MarketCard } from "@/components/MarketCard";
import { GroupCard } from "@/components/GroupCard";
import { TrendingCard } from "@/components/TrendingCard";
import { WalletButton } from "@/components/WalletButton";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/icons";
import type { TrendingMarket } from "@/lib/trending";

async function fetchTrending(): Promise<TrendingMarket[]> {
  const res = await fetch("/api/trending");
  if (!res.ok) throw new Error("Failed to load");
  const data = (await res.json()) as { markets: TrendingMarket[] };
  return data.markets ?? [];
}

export default function HomePage() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Avoid a hydration flash of the wrong (signed-out) state.
  if (!mounted) return <div className="min-h-[60vh]" />;

  return isConnected ? <CrewHome /> : <SignedOutLanding />;
}

/* ── Signed out: the pitch ─────────────────────────────────────────────── */

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "users",
    title: "Call it",
    body: "Start a group and put an argument on the record — “Maya's late to dinner again, yes or no?”",
  },
  {
    icon: "target",
    title: "Everyone picks a side",
    body: "Your crew pools ETH on Yes or No. The terms lock on-chain — no take-backs.",
  },
  {
    icon: "receipt",
    title: "Pull the receipt",
    body: "A resolver settles it, winners split the whole pot, and the receipt goes in the group chat.",
  },
];

function SignedOutLanding() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-16 sm:py-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-fg-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Group bets, settled on-chain
        </p>
        <h1 className="display-hero max-w-3xl text-5xl sm:text-7xl">
          Alright<span className="text-accent">,</span> bet.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-fg-muted">
          The betting group chat. Make the call, everyone picks a side and pools
          ETH, and when it settles the winners split the pot — with a receipt to
          prove it.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <LinkButton href="/groups/new" size="lg">
            Start your first bet
          </LinkButton>
          <LinkButton href="/groups/join" size="lg" variant="secondary">
            Join with a code
          </LinkButton>
          <span className="text-sm text-fg-faint">or connect below</span>
          <WalletButton />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-14">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-fg-faint">
          How it works
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-ink [&_svg]:h-5 [&_svg]:w-5">
                  <Icon name={s.icon} />
                </span>
                <span className="font-display text-2xl font-bold text-fg-faint tabular">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <TrendingStrip />
    </div>
  );
}

/* ── Signed in: your crew ──────────────────────────────────────────────── */

function CrewHome() {
  const { myGroups, activeGroup } = useGroups();

  const { ids, groupName } = useMemo(() => {
    const map = new Map<number, string>();
    for (const g of myGroups)
      for (const id of g.marketIds) map.set(id, g.name);
    return { ids: [...map.keys()], groupName: map };
  }, [myGroups]);

  const { markets, isLoading } = useMarkets(ids);
  const open = markets
    .filter((m) => !m.resolved)
    .sort((a, b) => Number(a.resolveBy) - Number(b.resolveBy));

  const startHref = activeGroup
    ? `/groups/${activeGroup.id}/new-market`
    : "/groups/new";

  // Connected but no crew yet — first-run.
  if (myGroups.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <EmptyState
          icon={<Icon name="users" />}
          title="Get your crew together"
          description="Alright, Bet runs on groups. Start one for your friends, club, or family — then call your first bet."
          action={
            <div className="flex gap-2">
              <LinkButton href="/groups/new">Create a group</LinkButton>
              <LinkButton href="/groups/join" variant="secondary">
                Join with a code
              </LinkButton>
            </div>
          }
        />
        <div className="mt-10">
          <TrendingStrip />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Call-to-action banner */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-hero text-4xl sm:text-5xl">What&apos;s the bet?</h1>
          <p className="mt-2 text-base text-fg-muted">
            Put it on the record with{" "}
            {activeGroup ? (
              <span className="font-medium text-fg">{activeGroup.name}</span>
            ) : (
              "your crew"
            )}
            .
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton href={startHref} size="lg">
            Start a bet
          </LinkButton>
          <LinkButton href="/groups/new" size="lg" variant="secondary">
            New group
          </LinkButton>
        </div>
      </section>

      {/* Open bets */}
      <section className="mt-12">
        <SectionHead
          title="Bets on the table"
          hint="Open bets across your crews"
        />
        {isLoading && ids.length > 0 ? (
          <CardGrid>
            {ids.slice(0, 3).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </CardGrid>
        ) : open.length > 0 ? (
          <CardGrid>
            {open.map((m) => (
              <MarketCard key={m.id} market={m} groupName={groupName.get(m.id)} />
            ))}
          </CardGrid>
        ) : (
          <EmptyState
            icon={<Icon name="dice" />}
            title="No open bets"
            description="Nothing on the table right now. Call the next one."
            action={<LinkButton href={startHref}>Start a bet</LinkButton>}
          />
        )}
      </section>

      {/* Your groups */}
      <section className="mt-12">
        <SectionHead title="Your crews" />
        <div className="mt-4 space-y-3">
          {myGroups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      </section>

      <TrendingStrip />
    </div>
  );
}

/* ── Shared bits ───────────────────────────────────────────────────────── */

function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      {hint && <span className="text-sm text-fg-faint">{hint}</span>}
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

/** Demoted "inspiration" strip — the world's markets, framed as prompts to
 *  steal, never the main event. Horizontal scroll so it reads as a sidebar. */
function TrendingStrip() {
  const { data, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrending,
    staleTime: 60_000,
  });
  const items = (data ?? []).slice(0, 8);

  return (
    <section className="mt-16 border-t border-border py-10">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">
            Steal a question from the world
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Trending on Polymarket — run any of these with your crew.
          </p>
        </div>
        <Link
          href="/groups"
          className="hidden shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline sm:inline-flex"
        >
          Your groups <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-72 shrink-0">
              <CardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="-mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {items.map((m) => (
            <div key={m.id} className="w-72 shrink-0 snap-start">
              <TrendingCard market={m} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
