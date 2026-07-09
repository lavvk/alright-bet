"use client";

import { useEffect, useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { Toaster } from "sonner";
import { config } from "@/lib/wagmi";
import { GroupProvider } from "@/lib/group-context";

const ACCENT = "#0f766e";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10_000, retry: 1 },
        },
      }),
  );

  // Keep RainbowKit's modal theme in sync with our class-based dark mode.
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDark(el.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const rkTheme = dark
    ? darkTheme({ accentColor: "#2dd4bf", borderRadius: "medium" })
    : lightTheme({ accentColor: ACCENT, borderRadius: "medium" });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rkTheme} modalSize="compact">
          <GroupProvider>{children}</GroupProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--fg)",
              },
            }}
            theme={dark ? "dark" : "light"}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
