"use client";

import Link from "next/link";
import { useGroups } from "@/lib/group-context";
import { ConnectGate } from "@/components/ConnectGate";
import { GroupCard } from "@/components/GroupCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/Button";

export default function GroupsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">My Groups</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Your clubs, friend groups, and family pools.
          </p>
        </div>
        <LinkButton href="/groups/new">New group</LinkButton>
      </div>

      <div className="mt-8">
        <ConnectGate description="Connect to see the groups you belong to.">
          <GroupList />
        </ConnectGate>
      </div>
    </div>
  );
}

function GroupList() {
  const { myGroups } = useGroups();

  if (myGroups.length === 0) {
    return (
      <EmptyState
        icon={<Icon name="dice" />}
        title="No groups yet"
        description="Create a group for your club, friends, or family — or join one with an invite code."
        action={
          <div className="flex gap-2">
            <LinkButton href="/groups/new">Create a group</LinkButton>
            <Link
              href="/groups/join"
              className="inline-flex h-10 items-center rounded-xl border border-border bg-surface-2 px-4 text-sm font-medium hover:border-border-strong"
            >
              Join with a code
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {myGroups.map((g) => (
        <GroupCard key={g.id} group={g} />
      ))}
      <Link
        href="/groups/join"
        className="block pt-2 text-center text-sm font-medium text-accent hover:underline"
      >
        Have an invite code? Join a group →
      </Link>
    </div>
  );
}
