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

        <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug text-fg">
          {market.question}
        </h3>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-sm font-semibold tabular">
            <span className="text-yes">
              {noVolume ? "—" : formatPercent(yes)} Yes
            </span>
            <span className="text-no">
              {noVolume ? "—" : formatPercent(1 - yes)} No
            </span>
          </div>
          <ProbabilityBar yes={yes} empty={noVolume} className="mt-2" />
          <div className="mt-3 flex items-center justify-between text-xs text-fg-muted tabular">
            <span>{formatEth(total)} ETH pot</span>
            <span>#{market.id}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
