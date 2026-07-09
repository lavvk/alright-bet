"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useGroups } from "@/lib/group-context";
import { Popover } from "@/components/ui/Popover";
import { GroupAvatar } from "@/components/ui/GroupAvatar";
import { cn } from "@/lib/utils";

export function GroupSwitcher() {
  const { isConnected } = useAccount();
  const { myGroups, activeGroup, setActiveGroupId } = useGroups();
  const router = useRouter();

  if (!isConnected) return null;

  return (
    <Popover
      align="start"
      trigger={(open) => (
        <span
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-sm font-medium text-fg transition-colors hover:border-border-strong",
            open && "border-border-strong",
          )}
        >
          {activeGroup ? (
            <>
              <GroupAvatar name={activeGroup.name} size="sm" />
              <span className="max-w-[8rem] truncate">{activeGroup.name}</span>
            </>
          ) : (
            <span className="text-fg-muted">Groups</span>
          )}
          <Chevron />
        </span>
      )}
    >
      {(close) => (
        <div className="text-sm">
          {myGroups.length > 0 ? (
            <div className="max-h-72 overflow-y-auto">
              {myGroups.map((g) => (
                <button
                  key={g.id}
                  role="menuitem"
                  onClick={() => {
                    setActiveGroupId(g.id);
                    close();
                    router.push(`/groups/${g.id}`);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-surface-2",
                    activeGroup?.id === g.id && "bg-surface-2",
                  )}
                >
                  <GroupAvatar name={g.name} size="sm" />
                  <span className="flex-1 truncate font-medium">{g.name}</span>
                  <span className="text-xs text-fg-faint">
                    {g.members.length} member{g.members.length === 1 ? "" : "s"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-2.5 py-2 text-fg-muted">No groups yet.</p>
          )}
          <div className="my-1 h-px bg-border" />
          <button
            role="menuitem"
            onClick={() => {
              close();
              router.push("/groups/new");
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-accent hover:bg-accent-soft"
          >
            <PlusIcon /> New group
          </button>
          <button
            role="menuitem"
            onClick={() => {
              close();
              router.push("/groups");
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-fg-muted hover:bg-surface-2"
          >
            Manage all groups
          </button>
        </div>
      )}
    </Popover>
  );
}

function Chevron() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="text-fg-faint"
      aria-hidden
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
