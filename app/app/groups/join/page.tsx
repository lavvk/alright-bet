"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { groupStore } from "@/lib/groups";
import { useGroups } from "@/lib/group-context";
import { ConnectGate } from "@/components/ConnectGate";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function JoinByCodePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">Join a group</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Enter the 6-character invite code your friend shared.
      </p>
      <div className="mt-8">
        <ConnectGate description="Connect a wallet to join a group.">
          <JoinForm />
        </ConnectGate>
      </div>
    </div>
  );
}

function JoinForm() {
  const router = useRouter();
  const { address } = useAccount();
  const { refresh, setActiveGroupId } = useGroups();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    const group = groupStore.getByInviteCode(code);
    if (!group) {
      setError("No group matches that code.");
      return;
    }
    const joined = groupStore.joinGroup(group.inviteCode, address);
    refresh();
    if (joined) {
      setActiveGroupId(joined.id);
      toast.success(`Joined "${joined.name}"`);
      router.push(`/groups/${joined.id}`);
    }
  }

  return (
    <form onSubmit={submit}>
      <Card className="space-y-4 p-6">
        <input
          autoFocus
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="ABC123"
          maxLength={6}
          className="w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-center font-mono text-lg tracking-[0.3em] uppercase outline-none focus:border-accent focus:ring-2 focus:ring-[var(--ring)]"
        />
        {error && <p className="text-sm text-no">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={code.length < 6}>
          Join group
        </Button>
      </Card>
    </form>
  );
}
