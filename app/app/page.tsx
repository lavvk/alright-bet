"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingCard } from "@/components/TrendingCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, type Category, type TrendingMarket } from "@/lib/trending";
import { cn } from "@/lib/utils";

async function fetchTrending(): Promise<TrendingMarket[]> {
  const res = await fetch("/api/trending");
  if (!res.ok) throw new Error("Failed to load trending markets");
  const data = (await res.json()) as { markets: TrendingMarket[] };
  return data.markets ?? [];
}

export default function HomePage() {
  const [category, setCategory] = useState<Category>("All");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrending,
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (category === "All") return data;
    return data.filter((m) => m.category === category);
  }, [data, category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Make predictions with friends.
        </h1>
        <p className="mt-2 max-w-xl text-base text-fg-muted">
          Lock the terms. Pull the receipt. Browse what the world&apos;s betting
          on, then spin up your own version inside your group.
        </p>
      </section>

      {/* Category chips */}
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === c
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon="📡"
          title="Couldn't load trending markets"
          description="Polymarket's API might be busy. Give it another shot."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon="🔍"
          title="Nothing here yet"
          description={`No trending ${category} markets right now. Try another category.`}
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <TrendingCard key={m.id} market={m} />
          ))}
        </div>
      )}
    </div>
  );
}
