/** Shared types + category logic for the trending (Polymarket) feed. */

export const CATEGORIES = [
  "All",
  "Politics",
  "Sports",
  "Crypto",
  "Culture",
  "Campus",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface TrendingMarket {
  id: string;
  question: string;
  yesPct: number; // 0..1
  noPct: number; // 0..1
  volume: number; // USD
  liquidity: number; // USD
  endDate: string | null; // ISO
  image: string | null;
  category: Exclude<Category, "All">;
}

const KEYWORDS: Record<Exclude<Category, "All">, RegExp> = {
  Politics:
    /\b(president|election|trump|biden|congress|senate|governor|democrat|republican|vote|poll|primary|government|shutdown|policy|geopolit)/i,
  Sports:
    /\b(nba|nfl|world cup|fifa|super bowl|championship|playoff|premier league|ufc|f1|formula 1|olympic|match|win the|cup|league|tournament|golf|tennis)/i,
  Crypto:
    /\b(bitcoin|btc|ethereum|eth|crypto|solana|sol|token|coin|defi|stablecoin|nft|blockchain|airdrop|halving)/i,
  Culture:
    /\b(movie|film|oscar|grammy|album|spotify|taylor swift|celebrity|tv|show|netflix|box office|award|song|artist|streamer|kanye|drake)/i,
  // Polymarket has no real campus markets; this stays empty in practice but
  // keeps the chip consistent with our group "Campus" framing.
  Campus: /\b(campus|university|college|dorm|finals|graduat|professor)/i,
};

export function categorize(question: string): Exclude<Category, "All"> {
  for (const [cat, re] of Object.entries(KEYWORDS) as [
    Exclude<Category, "All">,
    RegExp,
  ][]) {
    if (re.test(question)) return cat;
  }
  return "Culture"; // sensible catch-all bucket
}
