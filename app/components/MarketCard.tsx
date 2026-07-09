import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProbabilityBar } from "@/components/ui/ProbabilityBar";
import { impliedYesPct, totalPool, type Market } from "@/lib/payouts";
import { formatEth, formatPercent, timeLeft, isPast } from "@/lib/utils";

/** On-chain group market card. Links to the market detail page. */
export function MarketCard({
  market,
  groupName,
}: {
  market: Market;
  groupName?: string;
}) {
  const yes = impliedYesPct(market.poolYes, market.poolNo);
  const total = totalPool(market);
  const noVolume = total === 0n;
  const closed = isPast(market.resolveBy);

  return (
    <Link href={`/market/${market.id}`} className="block">
      <Card hover className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          {groupName ? (
            <Badge tone="accent">{groupName}</Badge>
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
            <Badge tone="neutral">{timeLeft(market.resolveBy)}</Badge>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 font-display text-base font-semibold leading-snug tracking-tight text-fg">
          {market.question}
        </h3>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-fg-faint">
                In the pot
              </p>
              <p className="font-display text-2xl font-bold leading-none tabular">
                {formatEth(total)}
                <span className="ml-1 text-sm font-semibold text-fg-muted">
                  ETH
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-fg-faint">
                Leaning
              </p>
              <p className="font-display text-base font-semibold tabular">
                {noVolume ? (
                  <span className="text-fg-muted">wide open</span>
                ) : yes >= 0.5 ? (
                  <span className="text-yes">{formatPercent(yes)} Yes</span>
                ) : (
                  <span className="text-no">{formatPercent(1 - yes)} No</span>
                )}
              </p>
            </div>
          </div>
          <ProbabilityBar yes={yes} empty={noVolume} className="mt-3" />
        </div>
      </Card>
    </Link>
  );
}
