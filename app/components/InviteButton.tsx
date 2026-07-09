"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

/** Copies the shareable /join/[code] link to the clipboard. */
export function InviteButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/join/${code}`
        : `/join/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Invite link copied", { description: url });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.message("Share this code", { description: code });
    }
  }

  return (
    <Button variant="secondary" onClick={copy}>
      {copied ? "Copied ✓" : "Invite"}
    </Button>
  );
}
