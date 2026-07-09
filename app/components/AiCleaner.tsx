"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/icons";

export interface CleanResult {
  question: string;
  optionA: string;
  optionB: string;
  description: string;
}

/**
 * Optional helper: turns messy input into a crisp market question via the
 * server's /api/clean route. The route reports availability (it returns 501
 * when ANTHROPIC_API_KEY is unset) — when unavailable, this renders nothing,
 * so it can never block manual market creation.
 */
export function AiCleaner({
  onResult,
}: {
  onResult: (r: CleanResult) => void;
}) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/clean")
      .then((r) => r.json())
      .then((d: { available?: boolean }) => {
        if (!cancelled) setAvailable(Boolean(d.available));
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!available) return null;

  async function clean() {
    if (input.trim().length < 4) return;
    setLoading(true);
    try {
      const res = await fetch("/api/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) throw new Error("AI is unavailable right now");
      const data = (await res.json()) as CleanResult;
      onResult(data);
      toast.success("Cleaned up — review and tweak as needed");
      setOpen(false);
      setInput("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't clean that up");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        <Icon name="sparkle" className="h-4 w-4" /> Clean up with AI
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-accent/40 bg-accent-soft/50 p-3">
      <label className="mb-1.5 block text-sm font-medium text-fg">
        Describe the bet in plain words
      </label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="priya says she won't be late to dinner again"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={clean}
          disabled={loading || input.trim().length < 4}
        >
          {loading ? "Thinking…" : "Generate"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
