"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { groupStore, GROUP_TYPE_META } from "@/lib/groups";
import { useGroups } from "@/lib/group-context";
import { ConnectGate } from "@/components/ConnectGate";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/icons";
import { GroupAvatar } from "@/components/ui/GroupAvatar";

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { address } = useAccount();
  const { refresh, setActiveGroupId } = useGroups();

  // Re-read on each render (cheap, localStorage) so it reflects joins.
  const group = useMemo(
    () => groupStore.getByInviteCode(code),
    [code],
  );

  const alreadyMember =
    !!address &&
    !!group &&
    group.members.some((m) => m.toLowerCase() === address.toLowerCase());

  function join() {
    if (!address || !group) return;
    const joined = groupStore.joinGroup(group.inviteCode, address);
    refresh();
    if (joined) {
      setActiveGroupId(joined.id);
      toast.success(`Joined "${joined.name}"`);
      router.push(`/groups/${joined.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      {!group ? (
        <EmptyState
          icon={<Icon name="link" />}
          title="Invite not found"
          description={`No group matches the code "${code}". Double-check the link or ask for a new one.`}
          action={<LinkButton href="/groups">Go to my groups</LinkButton>}
        />
      ) : (
        <Card className="p-8 text-center">
          <GroupAvatar
            name={group.name}
            size="lg"
            className="mx-auto h-16 w-16 rounded-2xl text-lg"
          />
          <p className="mt-4 text-sm text-fg-muted">You&apos;re invited to</p>
          <h1 className="mt-1 display-hero text-2xl">
            {group.name}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge tone="neutral">{GROUP_TYPE_META[group.type].label}</Badge>
            <Badge tone="neutral">
              {group.members.length} member
              {group.members.length === 1 ? "" : "s"}
            </Badge>
          </div>

          <div className="mt-8">
            <ConnectGate description="Connect your wallet to join this group.">
              {alreadyMember ? (
                <div className="space-y-3">
                  <p className="text-sm text-fg-muted">
                    You&apos;re already in this group.
                  </p>
                  <LinkButton
                    href={`/groups/${group.id}`}
                    size="lg"
                    className="w-full"
                  >
                    Go to group
                  </LinkButton>
                </div>
              ) : (
                <Button size="lg" className="w-full" onClick={join}>
                  Join with connected wallet
                </Button>
              )}
            </ConnectGate>
          </div>
        </Card>
      )}
    </div>
  );
}
