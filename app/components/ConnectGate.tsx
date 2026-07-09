"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { EmptyState } from "@/components/ui/EmptyState";
import { WalletButton } from "@/components/WalletButton";

/**
 * Renders children only when a wallet is connected; otherwise a prompt.
 * `mounted` guard avoids hydration mismatch from wagmi's SSR state.
 */
export function ConnectGate({
  children,
  title = "Connect your wallet",
  description = "Connect to create groups, place bets, and pull receipts.",
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <EmptyState
        icon="👛"
        title={title}
        description={description}
        action={<WalletButton />}
      />
    );
  }
  return <>{children}</>;
}
