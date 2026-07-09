import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GroupAvatar } from "@/components/ui/GroupAvatar";
import { GROUP_TYPE_META, type Group } from "@/lib/groups";

export function GroupCard({ group }: { group: Group }) {
  return (
    <Link href={`/groups/${group.id}`} className="block">
      <Card hover className="flex items-center gap-4 p-5">
        <GroupAvatar name={group.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-fg">{group.name}</h3>
            <Badge tone="neutral">{GROUP_TYPE_META[group.type].label}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-fg-muted">
            {group.members.length} member
            {group.members.length === 1 ? "" : "s"} ·{" "}
            {group.marketIds.length} market
            {group.marketIds.length === 1 ? "" : "s"}
          </p>
        </div>
        <span className="font-mono text-xs text-fg-faint">
          {group.inviteCode}
        </span>
      </Card>
    </Link>
  );
}
