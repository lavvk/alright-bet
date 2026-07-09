"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/Button";

/** RainbowKit connect flow, restyled to match our design (no default purple). */
export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button size="sm" onClick={openConnectModal}>
                    Connect wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button size="sm" variant="danger" onClick={openChainModal}>
                    Wrong network
                  </Button>
                );
              }
              return (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={openAccountModal}
                  className="font-mono"
                >
                  <span className="h-2 w-2 rounded-full bg-yes" />
                  {account.displayName}
                </Button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
