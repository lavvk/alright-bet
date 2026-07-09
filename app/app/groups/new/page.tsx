"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { ConnectGate } from "@/components/ConnectGate";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GroupAvatar } from "@/components/ui/GroupAvatar";
import {
  groupStore,
  GROUP_TYPE_META,
  type GroupType,
} from "@/lib/groups";
import { useGroups } from "@/lib/group-context";
import { cn } from "@/lib/utils";

export default function NewGroupPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">Create a group</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Spin up a private space for your crew to make markets.
      </p>
      <div className="mt-8">
        <ConnectGate description="Connect a wallet to create a group.">
          <CreateGroupForm />
        </ConnectGate>
      </div>
    </div>
  );
}

function CreateGroupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const prefillQuestion = params.get("q");
  const { address } = useAccount();
  const { setActiveGroupId, refresh } = useGroups();

  const [name, setName] = useState("");
  const [type, setType] = useState<GroupType>("friends");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    if (name.trim().length < 2) {
      setError("Give your group a name (at least 2 characters).");
      return;
    }
    const group = groupStore.createGroup({
      name,
      type,
      creator: address,
    });
    refresh();
    setActiveGroupId(group.id);
    toast.success(`"${group.name}" created`, {
      description: `Invite code: ${group.inviteCode}`,
    });
    // Carry a trending prefill straight into market creation.
    if (prefillQuestion) {
      router.push(
        `/groups/${group.id}/new-market?q=${encodeURIComponent(prefillQuestion)}`,
      );
    } else {
      router.push(`/groups/${group.id}`);
    }
  }

  return (
    <form onSubmit={submit}>
      <Card className="space-y-6 p-6">
        <Field label="Group name">
          <div className="flex items-center gap-3">
            <GroupAvatar name={name || "?"} size="lg" />
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Econ Club, The Roommates, Smith Family"
              maxLength={40}
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <p className="mt-1.5 text-xs text-fg-faint">
            Your group gets a monogram from its name.
          </p>
        </Field>

        <Field label="Type">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(GROUP_TYPE_META) as GroupType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                  type === t
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-surface hover:border-border-strong",
                )}
              >
                {GROUP_TYPE_META[t].label}
              </button>
            ))}
          </div>
        </Field>

        {error && <p className="text-sm text-no">{error}</p>}

        <Button type="submit" size="lg" className="w-full">
          Create group
        </Button>
      </Card>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
    </div>
  );
}
