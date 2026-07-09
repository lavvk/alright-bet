import { cn } from "@/lib/utils";

/**
 * Group identity mark: an initials monogram on an accent tile, derived from the
 * group name. Replaces the vestigial `Group.emoji` field — groups are never
 * rendered with an emoji.
 */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const sizes = {
  sm: "h-6 w-6 rounded-md text-[10px]",
  md: "h-9 w-9 rounded-lg text-xs",
  lg: "h-12 w-12 rounded-xl text-sm",
} as const;

export function GroupAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-accent-soft font-display font-bold text-accent-ink select-none",
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
