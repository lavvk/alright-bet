import { cn } from "@/lib/utils";

/** Subtle "Testnet" pill — Base Sepolia, no real money. */
export function TestnetBadge({ className }: { className?: string }) {
  return (
    <span
      title="Base Sepolia testnet — play money only"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-fg-muted",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Testnet
    </span>
  );
}
