"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGroups } from "@/lib/group-context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProbabilityBar } from "@/components/ui/ProbabilityBar";
import { formatPercent, formatVolume } from "@/lib/utils";
import type { TrendingMarket } from "@/lib/trending";

export function TrendingCard({ market }: { market: TrendingMarket }) {
  const router = useRouter();
  const { myGroups, activeGroup } = useGroups();

  function runInGroup() {
    const q = encodeURIComponent(market.question);
    const target = activeGroup ?? myGroups[0];
    if (target) {
      router.push(`/groups/${target.id}/new-market?q=${q}`);
    } else {
      // No group yet — go make one, carrying the question along.
      router.push(`/groups/new?q=${q}`);
    }
  }

  const endLabel = market.endDate
    ? new Date(market.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <Card hover className="flex flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <Badge tone="trending">Trending · Polymarket</Badge>
        <Badge tone="neutral">{market.category}</Badge>
      </div>

      <div className="mt-3 flex items-start gap-3">
        {market.image && (
          <Image
            src={market.image}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
            unoptimized
          />
        )}
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-fg">
          {market.question}
        </h3>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm font-semibold tabular">
        <span className="text-yes">{formatPercent(market.yesPct)} Yes</span>
        <span className="text-no">{formatPercent(market.noPct)} No</span>
      </div>
      <ProbabilityBar yes={market.yesPct} className="mt-2" />

      <div className="mt-4 flex items-center justify-between text-xs text-fg-muted tabular">
        <span>{formatVolume(market.volume)} Vol</span>
        <span>Closes {endLabel}</span>
      </div>

      <Button
        variant="secondary"
        size="sm"
        className="mt-4 w-full"
        onClick={runInGroup}
      >
        Run this in your group →
      </Button>
    </Card>
  );
}
