"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GroupSwitcher } from "@/components/GroupSwitcher";
import { WalletButton } from "@/components/WalletButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TestnetBadge } from "@/components/ui/TestnetBadge";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Trending" },
  { href: "/groups", label: "My Groups" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 whitespace-nowrap">
          <Logo />
          <span className="text-lg font-bold tracking-tight">
            Alright<span className="text-accent">,</span> Bet
          </span>
        </Link>

        <TestnetBadge className="hidden sm:inline-flex" />

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-surface-2 text-fg"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <GroupSwitcher />
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 border-t border-border px-4 py-1.5 md:hidden">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium",
                active ? "bg-surface-2 text-fg" : "text-fg-muted",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function Logo() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 13.5 9 18l11-12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
