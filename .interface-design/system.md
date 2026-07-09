# Alright Bet — interface design system

**Direction / feel:** "On the record" — confident, conversational, credible; a
called bet written down. Register: **product** (not marketing). The wager
(question + big display odds + pot) is the loudest thing on every screen.

Not: crypto-neon, generic SaaS, sportsbook, or sterile. No emoji anywhere.
**Not an exchange.** This is a *betting group chat, on-chain* — framed around your
crew, the pot, and the receipt, NOT a Polymarket-style global market exchange.

## Information architecture (front door)

- **Home (`/`) is group-first**, not a trending grid. Signed-out: bold "Alright,
  bet." hero + 3-step "how it works" (Call it → Everyone picks a side → Pull the
  receipt) + create/join CTA. Signed-in: "What's the bet?" banner with **Start a
  bet**, "Bets on the table" (open bets across the user's crews), "Your crews".
- **Trending (Polymarket) is demoted** to a horizontal-scroll "Steal a question
  from the world" strip at the bottom — inspiration to run in your group, never
  the main event. It is not a top-nav destination.
- **Voice: bold & social.** Vocabulary is "bets/crew/pot/call it/who's in/pull
  the receipt", not "markets/odds/volume". Market cards lead with **the pot**
  (hero display ETH) + a "Leaning 63% Yes" tell, not an exchange %-split.

## Color — committed, OKLCH (hue 264 periwinkle)

Authored in `app/app/globals.css`. Brand accent is an electric cobalt-periwinkle
that sits **outside** the YES/NO arc so it never reads as an outcome.

- `--accent`: `oklch(0.55 0.19 264)` light / `oklch(0.74 0.15 264)` dark.
- `--accent-ink`: AA-safe text-on-`--accent-soft`.
- YES = hue 150, NO = hue 27 — **functional only**, never decorative.
- Neutrals tinted ~0.02 chroma toward 264 (confident slate, not pure gray).
- One accent. ~60/30/10 distribution. Color communicates; gray builds structure.
- RainbowKit modal mirrors accent as hex in `app/app/providers.tsx`
  (`#5b5bd6` light / `#9b9cf0` dark).

All UI colors bind to semantic tokens (`bg-surface`, `text-fg-muted`,
`border-border`, `text-accent`, `bg-yes-soft`, …). No raw hex / `gray-*` in
components. Four text levels: `fg` / `fg-muted` / `fg-faint` + on-accent.

## Typography

- **Display** = Bricolage Grotesque (`--font-display`, `.font-display` /
  `.display-hero`): headlines, wordmark, and hero numerals (odds / pots /
  countdowns / receipt outcome). Negative tracking (`-0.02em`, hero `-0.035em`).
- **UI/body** = Inter (`--font-sans`). **Mono** = Geist Mono — addresses/IDs only.
- Fixed rem scale (not fluid clamp). Hierarchy from size **+ weight + color**,
  not size alone. Dynamic numbers get `.tabular` (tabular-nums).
- Loaded via `next/font` in `app/app/layout.tsx` (inter, geistMono, bricolage).

## Signature language — the betting slip / ledger

"On the record" is taken literally: the app looks like wagers written on ledger
paper and torn off as betting slips. Four signature elements (globals.css):

- **Ledger canvas** — a whisper-faint dot grid on `body`
  (`radial-gradient` at `color-mix(fg 6%)`, 22px). Opaque `bg-surface` cards sit
  on top, so the grid reads only in gutters/gaps. Never on top of content.
- **`.stamp`** — rotated (-7°) outlined accent stamp ("On the record"), echoes the
  lock-in ring. The hero's signature mark; use sparingly (1 per view max).
- **`.perf`** — perforated hairline (repeating radial dots), the tear-off edge of
  a slip. Used on MarketCard above the pot block and as dashed stub dividers.
- **Slip №** — MarketCards + receipt carry a `font-mono` "Slip № 007" ticket
  number so wager cards read as tickets, not exchange rows.

## Depth & layering

- **Layered "expensive" elevation** via `--shadow-card` / `--shadow-card-hover`
  (1px ring + two soft depths in light; single ring on dark). `Card` uses it and
  drops its border. Hover lifts `-translate-y-1` with an accent-tinted depth.
- Card grids stagger in with `.rise` (`animationDelay` ~50ms × index, capped).
- Sidebar/header share the canvas bg with a hairline border (`bg-bg/80` +
  `backdrop-blur`), not a different color.
- Borders are low-contrast token borders; dark mode leans on borders over shadow.
- Radius scale: inputs/buttons `rounded-xl`, cards `rounded-2xl`, pills
  `rounded-full`. Concentric radii on nested elements.

## Motion

- Ease-out tokens: `--ease-out-quart` `cubic-bezier(.25,1,.5,1)`,
  `--ease-out-expo` `cubic-bezier(.16,1,.3,1)`. Durations < 300ms; press
  `active:scale-[0.98]`.
- **Signature "lock-in" stamp** (`.lock-in` in globals.css) — fired from
  `StakeForm` on tx success (remount via `key={stamp}`).
- `ProbabilityBar` fills via `transform: scaleX` with side origins — **never**
  animate `width`.
- Respect `prefers-reduced-motion` (globals.css drops durations).

## Iconography — no emoji

- House line set: `components/ui/icons.tsx` → `<Icon name=... />`, 24×24, 1.75
  stroke, `currentColor`. Names: search, signal, dice, question, trend, target,
  alert, wallet, clock, sparkle, link, trophy.
- Group identity: `components/ui/GroupAvatar.tsx` — initials monogram on an
  `accent-soft` tile, derived from the group name. `Group.emoji` is vestigial
  (optional, never rendered); no emoji picker.
- `EmptyState.icon` takes an `<Icon/>` (rendered in an `accent-soft` disc).

## Key component patterns

- **Button** (`ui/Button.tsx`) — variants primary/secondary/ghost/yes/no/danger;
  sizes sm 32px · md 40px · lg 48px; `rounded-xl`, 150ms, focus ring on `--ring`,
  `active:scale-[0.98]`. `LinkButton` mirrors it.
- **Card** (`ui/Card.tsx`) — `rounded-2xl border-border bg-surface shadow-sm`;
  `hover` prop adds lift + `-translate-y-0.5`.
- **Badge** (`ui/Badge.tsx`) — pill; tones neutral/accent/yes/no/warning/trending.
- **ProbabilityBar** — `h-1.5 rounded-full bg-surface-2`, scaleX fills.
- **GroupAvatar** — sizes sm 24 / md 36 / lg 48; monogram in `font-display`.

## Provenance / consistency

The source was recovered from `.next` source maps; `globals.css` was re-authored
to this periwinkle identity (the recovered build was an older cobalt palette).
Hold to these tokens + `cn()` + `tone` vocabulary on all new surfaces. Verify
against the four checks (swap / squint / signature / token) before shipping.
