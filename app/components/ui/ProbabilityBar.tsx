import { cn } from "@/lib/utils";

/**
 * Thin YES/NO probability bar. `yes` is a fraction 0..1.
 * When there's no volume yet, renders a neutral 50/50 placeholder.
 */
export function ProbabilityBar({
  yes,
  empty = false,
  className,
}: {
  yes: number;
  empty?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, yes)) * 100;
  return (
    <div
      className={cn(
        "flex h-1.5 w-full overflow-hidden rounded-full bg-surface-2",
        className,
      )}
      role="presentation"
    >
      {empty ? (
        <div className="h-full w-full bg-border-strong/60" />
      ) : (
        <>
          <div
            className="h-full bg-yes transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
          <div
            className="h-full bg-no transition-all duration-500"
            style={{ width: `${100 - pct}%` }}
          />
        </>
      )}
    </div>
  );
}
