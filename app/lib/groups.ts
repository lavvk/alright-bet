import type { Address } from "viem";

/**
 * Off-chain group layer.
 *
 * Groups, membership and the group→market mapping live OFF-CHAIN (the contract
 * has no concept of groups). For now everything is persisted to localStorage,
 * but ALL storage access is funneled through the `GroupStore` interface below.
 * To move to a real backend later, implement `GroupStore` against your DB/API
 * and swap the exported `groupStore` — no call sites need to change.
 */

export type GroupType = "club" | "friends" | "family";

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  emoji: string;
  inviteCode: string;
  members: Address[];
  marketIds: number[];
  createdAt: number; // unix ms
}

export interface CreateGroupInput {
  name: string;
  type: GroupType;
  emoji: string;
  creator: Address;
}

export interface GroupStore {
  listGroups(): Group[];
  getGroup(id: string): Group | undefined;
  getByInviteCode(code: string): Group | undefined;
  listGroupsForMember(member: Address): Group[];
  getGroupForMarket(marketId: number): Group | undefined;
  createGroup(input: CreateGroupInput): Group;
  joinGroup(code: string, member: Address): Group | undefined;
  addMarketToGroup(groupId: string, marketId: number): void;
}

const STORAGE_KEY = "ab:groups";

function lc(a: Address): string {
  return a.toLowerCase();
}

function genId(): string {
  // Avoid Math.random-at-module-load concerns; called only on user action.
  return `g_${Math.random().toString(36).slice(2, 10)}`;
}

function genInviteCode(): string {
  // 6-char, unambiguous (no 0/O/1/I) — easy to read aloud / type.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++)
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

// ── localStorage-backed implementation ──────────────────────────────────────

function readAll(): Group[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Group[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(groups: Group[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  // Notify listeners in this tab (storage event only fires cross-tab).
  window.dispatchEvent(new Event("ab:groups-changed"));
}

class LocalStorageGroupStore implements GroupStore {
  listGroups(): Group[] {
    return readAll().sort((a, b) => b.createdAt - a.createdAt);
  }

  getGroup(id: string): Group | undefined {
    return readAll().find((g) => g.id === id);
  }

  getByInviteCode(code: string): Group | undefined {
    const c = code.trim().toUpperCase();
    return readAll().find((g) => g.inviteCode === c);
  }

  listGroupsForMember(member: Address): Group[] {
    const m = lc(member);
    return this.listGroups().filter((g) =>
      g.members.some((addr) => lc(addr) === m),
    );
  }

  getGroupForMarket(marketId: number): Group | undefined {
    return readAll().find((g) => g.marketIds.includes(marketId));
  }

  createGroup(input: CreateGroupInput): Group {
    const groups = readAll();
    let code = genInviteCode();
    while (groups.some((g) => g.inviteCode === code)) code = genInviteCode();
    const group: Group = {
      id: genId(),
      name: input.name.trim(),
      type: input.type,
      emoji: input.emoji,
      inviteCode: code,
      members: [input.creator],
      marketIds: [],
      createdAt: Date.now(),
    };
    writeAll([...groups, group]);
    return group;
  }

  joinGroup(code: string, member: Address): Group | undefined {
    const groups = readAll();
    const c = code.trim().toUpperCase();
    const idx = groups.findIndex((g) => g.inviteCode === c);
    if (idx === -1) return undefined;
    const m = lc(member);
    if (!groups[idx].members.some((a) => lc(a) === m))
      groups[idx].members.push(member);
    writeAll(groups);
    return groups[idx];
  }

  addMarketToGroup(groupId: string, marketId: number): void {
    const groups = readAll();
    const idx = groups.findIndex((g) => g.id === groupId);
    if (idx === -1) return;
    if (!groups[idx].marketIds.includes(marketId))
      groups[idx].marketIds.push(marketId);
    writeAll(groups);
  }
}

/** The active store. Swap this line to migrate to a backend. */
export const groupStore: GroupStore = new LocalStorageGroupStore();

export const GROUP_TYPE_META: Record<
  GroupType,
  { label: string; hint: string }
> = {
  club: { label: "Club", hint: "A campus club or org" },
  friends: { label: "Friends", hint: "Your group chat, basically" },
  family: { label: "Family", hint: "Keep it in the family" },
};
