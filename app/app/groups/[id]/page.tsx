"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGroups } from "@/lib/group-context";
import { groupStore, GROUP_TYPE_META } from "@/lib/groups";
import { useMarkets } from "@/lib/hooks/reads";
import { MarketCard } from "@/components/MarketCard";
import { InviteButton } from "@/components/InviteButton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/icons";
import { GroupAvatar } from "@/components/ui/GroupAvatar";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { truncateAddress } from "@/lib/utils";

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  // Read reactively so membership/market changes reflect immediately.
  const { myGroups } = useGroups();
  const group = useMemo(
    () => myGroups.find((g) => g.id === id) ?? groupStore.getGroup(id),
    [myGroups, id],
  );

  const marketIds = group?.marketIds ?? [];
  const { markets, isLoading } = useMarkets(marketIds);

  // Groups live in localStorage, unavailable during SSR. Gate on mount so the
  // server and first client render agree (no hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <EmptyState
          icon={<Icon name="question" />}
          title="Group not found"
          description="This group doesn't exist on this device, or you haven't joined it yet."
          action={<LinkButton href="/groups">Back to groups</LinkButton>}
        />
      </div>
    );
  }

  const active = markets.filter((m) => !m.resolved);
  const resolved = markets.filter((m) => m.resolved);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Group header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start gap-4">
          <GroupAvatar name={group.name} size="lg" className="h-14 w-14 rounded-2xl text-base" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-2xl font-bold tracking-tight">
                {group.name}
              </h1>
              <Badge tone="neutral">{GROUP_TYPE_META[group.type].label}</Badge>
            </div>
            <p className="mt-1 text-sm text-fg-muted">
              {group.members.length} member
              {group.members.length === 1 ? "" : "s"} · {marketIds.length}{" "}
              market{marketIds.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex gap-2">
            <InviteButton code={group.inviteCode} />
            <LinkButton href={`/groups/${group.id}/new-market`}>
              Call a bet
            </LinkButton>
          </div>
        </div>

        {/* Members */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-5">
          {group.members.map((m) => (
            <span
              key={m}
              className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-xs text-fg-muted"
            >
              {truncateAddress(m)}
            </span>
          ))}
          <DeleteGroupButton groupId={group.id} groupName={group.name} />
        </div>
      </Card>

      {/* Markets */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold">Open bets</h2>
        {isLoading && marketIds.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {marketIds.map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : active.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((m) => (
              <MarketCard key={m.id} market={m} groupName={group.name} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Icon name="trend" />}
            title="No open bets"
            description="Kick things off — call your crew's first bet."
            action={
              <LinkButton href={`/groups/${group.id}/new-market`}>
                Call a bet
              </LinkButton>
            }
          />
        )}
      </section>

      {resolved.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-lg font-semibold">Settled</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resolved.map((m) => (
              <MarketCard key={m.id} market={m} groupName={group.name} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Deletes a group locally (localStorage). Two-step inline confirm so a stray
 * click can't wipe a crew. On-chain markets are unaffected.
 */
function DeleteGroupButton({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  const router = useRouter();
  const { refresh, activeGroup, setActiveGroupId } = useGroups();
  const [confirming, setConfirming] = useState(false);

  function remove() {
    groupStore.deleteGroup(groupId);
    if (activeGroup?.id === groupId) setActiveGroupId(null);
    refresh();
    toast.success(`Deleted "${groupName}"`);
    router.push("/groups");
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-fg-faint transition-colors hover:bg-no-soft hover:text-no"
      >
        <Icon name="alert" className="h-3.5 w-3.5" />
        Delete group
      </button>
    );
  }

  return (
    <div className="ml-auto flex items-center gap-2">
      <span className="text-xs text-fg-muted">Delete this group?</span>
      <Button variant="danger" size="sm" onClick={remove}>
        Delete
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
