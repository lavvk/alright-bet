"use client";

import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { alrightBet } from "@/lib/contract";
import { useContractTx } from "@/lib/hooks/writes";
import type { Market } from "@/lib/payouts";
import { Button } from "@/components/ui/Button";
import { cn, formatEth, isPast } from "@/lib/utils";

const QUICK = ["0.01", "0.05", "0.1"];

export function StakeForm({
  market,
  stakeYes,
  stakeNo,
  onUpdated,
}: {
  market: Market;
  stakeYes: bigint;
  stakeNo: bigint;
  onUpdated: () => void;
}) {
  const { isConnected } = useAccount();
  const closed = isPast(market.resolveBy);

  // One side per wallet: lock to whichever side they're already on.
  const lockedSide =
    stakeYes > 0n ? true : stakeNo > 0n ? false : null;
  const [side, setSide] = useState<boolean>(lockedSide ?? true);
  const [amount, setAmount] = useState("0.01");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (lockedSide !== null) setSide(lockedSide);
  }, [lockedSide]);

  const tx = useContractTx({
    pending: "Locking in your bet…",
    success: "You're in — bet locked",
  });

  useEffect(() => {
    if (tx.isSuccess) onUpdated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx.isSuccess]);

  function submit() {
    let value: bigint;
    try {
      value = parseEther(amount);
    } catch {
      setErr("Enter a valid amount.");
      return;
    }
    if (value <= 0n) {
      setErr("Amount must be greater than zero.");
      return;
    }
    setErr(null);
    tx.writeContract({
      ...alrightBet,
      functionName: "placeBet",
      args: [BigInt(market.id), side],
      value,
    });
  }

  if (closed) {
    return (
      <div className="rounded-xl border border-border bg-surface-2 p-4 text-center text-sm text-fg-muted">
        Betting has closed. Waiting on the resolver to settle this market.
      </div>
    );
  }

  return (
    <div>
      {lockedSide !== null && (
        <p className="mb-2 text-xs text-fg-muted">
          You&apos;ve backed <strong>{lockedSide ? "Yes" : "No"}</strong> — add
          more to the same side.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <SideButton
          active={side}
          tone="yes"
          disabled={lockedSide === false}
          onClick={() => setSide(true)}
          label="Yes"
        />
        <SideButton
          active={!side}
          tone="no"
          disabled={lockedSide === true}
          onClick={() => setSide(false)}
          label="No"
        />
      </div>

      <div className="mt-3 flex gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setAmount(q)}
            className={cn(
              "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
              amount === q
                ? "border-accent bg-accent-soft text-accent"
                : "border-border hover:border-border-strong",
            )}
          >
            {q}
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center rounded-xl border border-border bg-bg px-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-[var(--ring)]">
        <input
          type="number"
          min="0"
          step="0.001"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setErr(null);
          }}
          className="w-full bg-transparent py-2.5 text-sm outline-none tabular"
          aria-label="Stake amount in ETH"
        />
        <span className="text-sm font-medium text-fg-muted">ETH</span>
      </div>
      {err && <p className="mt-1 text-xs text-no">{err}</p>}

      <Button
        variant={side ? "yes" : "no"}
        size="lg"
        className="mt-3 w-full"
        onClick={submit}
        disabled={!isConnected || tx.isSubmitting}
      >
        {tx.isPending
          ? "Confirm in wallet…"
          : tx.isConfirming
            ? "Locking in…"
            : `Lock it in · ${side ? "Yes" : "No"}`}
      </Button>

      {(stakeYes > 0n || stakeNo > 0n) && (
        <p className="mt-3 text-center text-xs text-fg-muted">
          Your position: {formatEth(stakeYes > 0n ? stakeYes : stakeNo)} ETH on{" "}
          {stakeYes > 0n ? "Yes" : "No"}
        </p>
      )}
    </div>
  );
}

function SideButton({
  active,
  tone,
  label,
  disabled,
  onClick,
}: {
  active: boolean;
  tone: "yes" | "no";
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-xl border-2 py-3 text-sm font-semibold transition-all disabled:opacity-40",
        active
          ? tone === "yes"
            ? "border-yes bg-yes-soft text-yes"
            : "border-no bg-no-soft text-no"
          : "border-border bg-surface text-fg-muted hover:border-border-strong",
      )}
    >
      {label}
    </button>
  );
}
