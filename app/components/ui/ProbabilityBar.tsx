import { cn } from "@/lib/utils";

/**
 * YES/NO probability bar. `yes` is a fraction 0..1.
 * Fills animate via `transform: scaleX` (GPU-composited, never layout `width`).
 * When there's no volume yet, renders a neutral placeholder.
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
  const frac = Math.max(0, Math.min(1, yes));
  return (
    <div
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-surface-2",
        className,
      )}
      role="presentation"
    >
      {empty ? (
        <div className="h-full w-full bg-border-strong/60" />
      ) : (
        <>
          <div
            className="absolute inset-0 origin-left bg-yes transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${frac})` }}
          />
          <div
            className="absolute inset-0 origin-right bg-no transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${1 - frac})` }}
          />
        </>
      )}
    </div>
  );
}
