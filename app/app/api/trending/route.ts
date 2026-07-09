import { NextResponse } from "next/server";
import { categorize, type TrendingMarket } from "@/lib/trending";

const GAMMA_URL =
  "https://gamma-api.polymarket.com/markets?closed=false&active=true&limit=24&order=volume24hr&ascending=false";

/** Raw Gamma market fields we rely on (all optional/guarded). */
interface GammaMarket {
  id?: string;
  question?: string;
  outcomes?: string; // stringified JSON array, e.g. '["Yes","No"]'
  outcomePrices?: string; // stringified JSON array, e.g. '["0.12","0.88"]'
  volumeNum?: number;
  volume?: string;
  liquidityNum?: number;
  liquidity?: string;
  endDate?: string;
  image?: string;
  icon?: string;
}

// Last-good snapshot, served if Gamma rate-limits (429) or errors.
let lastGood: TrendingMarket[] = [];

function parseStringArray(value: unknown): string[] | null {
  if (typeof value !== "string") return null;
  try {
    const arr = JSON.parse(value);
    return Array.isArray(arr) ? arr.map(String) : null;
  } catch {
    return null;
  }
}

function num(...candidates: unknown[]): number {
  for (const c of candidates) {
    const n = typeof c === "string" ? Number(c) : typeof c === "number" ? c : NaN;
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function mapMarket(m: GammaMarket): TrendingMarket | null {
  const question = typeof m.question === "string" ? m.question.trim() : "";
  if (!question || !m.id) return null;

  const outcomes = parseStringArray(m.outcomes);
  const prices = parseStringArray(m.outcomePrices);
  if (!outcomes || !prices || outcomes.length !== 2 || prices.length !== 2)
    return null; // not a binary market — our contract is binary only

  // Confirm it's a Yes/No binary market (not a 2-way bundle leg).
  const labels = outcomes.map((o) => o.toLowerCase());
  if (!labels.includes("yes") || !labels.includes("no")) return null;

  const yesIdx = labels.indexOf("yes");
  const yesPct = Number(prices[yesIdx]);
  if (!Number.isFinite(yesPct)) return null;

  return {
    id: String(m.id),
    question,
    yesPct: Math.max(0, Math.min(1, yesPct)),
    noPct: Math.max(0, Math.min(1, 1 - yesPct)),
    volume: num(m.volumeNum, m.volume),
    liquidity: num(m.liquidityNum, m.liquidity),
    endDate: typeof m.endDate === "string" ? m.endDate : null,
    image: m.image ?? m.icon ?? null,
    category: categorize(question),
  };
}

export async function GET() {
  try {
    const res = await fetch(GAMMA_URL, {
      // Respect Gamma's ~60 req/min — revalidate at most once a minute.
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      // 429 or upstream error → serve the last good snapshot.
      return NextResponse.json({ markets: lastGood, stale: true });
    }

    const data: unknown = await res.json();
    const raw: GammaMarket[] = Array.isArray(data) ? data : [];

    // One-time shape sanity log (helps verify the mapping against real JSON).
    if (raw[0] && process.env.NODE_ENV !== "production") {
      console.log(
        "[trending] sample Gamma market keys:",
        Object.keys(raw[0]).join(", "),
      );
    }

    const markets = raw
      .map(mapMarket)
      .filter((m): m is TrendingMarket => m !== null);

    if (markets.length) lastGood = markets;
    return NextResponse.json({ markets, stale: false });
  } catch {
    return NextResponse.json({ markets: lastGood, stale: true });
  }
}
