import { cn } from "@/lib/utils";

export function Card({
  className,
  hover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-sm",
        hover &&
          "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-border-strong",
        className,
      )}
      {...props}
    />
  );
}
