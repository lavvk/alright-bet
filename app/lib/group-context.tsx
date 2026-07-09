"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAccount } from "wagmi";
import { groupStore, type Group } from "./groups";

const ACTIVE_KEY = "ab:active-group";

interface GroupContextValue {
  /** Groups the connected wallet belongs to. */
  myGroups: Group[];
  /** Currently selected group (header switcher), if any. */
  activeGroup: Group | undefined;
  setActiveGroupId: (id: string | null) => void;
  /** Force a re-read after a mutation. */
  refresh: () => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export function GroupProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const [version, setVersion] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  // Re-read whenever the store changes (this tab or another).
  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener("ab:groups-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ab:groups-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  // Load persisted active group on mount.
  useEffect(() => {
    try {
      setActiveId(localStorage.getItem(ACTIVE_KEY));
    } catch {}
  }, []);

  const myGroups = useMemo(() => {
    if (!address) return [];
    return groupStore.listGroupsForMember(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, version]);

  const setActiveGroupId = useCallback((id: string | null) => {
    setActiveId(id);
    try {
      if (id) localStorage.setItem(ACTIVE_KEY, id);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {}
  }, []);

  // Keep the active selection valid for the current wallet.
  const activeGroup = useMemo(() => {
    if (!myGroups.length) return undefined;
    return myGroups.find((g) => g.id === activeId) ?? myGroups[0];
  }, [myGroups, activeId]);

  const value: GroupContextValue = {
    myGroups,
    activeGroup,
    setActiveGroupId,
    refresh,
  };

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
}

export function useGroups(): GroupContextValue {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error("useGroups must be used within <GroupProvider>");
  return ctx;
}
