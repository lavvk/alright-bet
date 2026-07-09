import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "yes" | "no" | "warning" | "trending";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-fg-muted border-border",
  accent: "bg-accent-soft text-accent border-transparent",
  yes: "bg-yes-soft text-yes border-transparent",
  no: "bg-no-soft text-no border-transparent",
  warning:
    "bg-amber-50 text-amber-700 border-transparent dark:bg-amber-500/10 dark:text-amber-400",
  trending:
    "bg-indigo-50 text-indigo-600 border-transparent dark:bg-indigo-500/10 dark:text-indigo-400",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
