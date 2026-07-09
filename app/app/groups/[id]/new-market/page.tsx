"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAccount } from "wagmi";
import { parseEventLogs, type Address } from "viem";
import { groupStore } from "@/lib/groups";
import { useGroups } from "@/lib/group-context";
import { alrightBet } from "@/lib/contract";
import { alrightBetAbi } from "@/lib/abi";
import { useContractTx } from "@/lib/hooks/writes";
import { ConnectGate } from "@/components/ConnectGate";
import { AiCleaner } from "@/components/AiCleaner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/** datetime-local string in the user's tz, default = now + `days`. */
function defaultDeadline(days = 7): string {
  const d = new Date(Date.now() + days * 86_400_000);
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

const schema = z.object({
  question: z
    .string()
    .trim()
    .min(8, "Make the question a bit more specific (8+ chars).")
    .max(160, "Keep it under 160 characters."),
  deadline: z.string().refine((v) => {
    const t = new Date(v).getTime();
    return Number.isFinite(t) && t > Date.now();
  }, "Pick a resolve-by time in the future."),
  resolver: z
    .string()
    .trim()
    // Plain regex (not isAddress) so the inferred type stays `string`.
    .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid wallet address."),
});

type FormValues = z.infer<typeof schema>;

export default function NewMarketPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Call a bet
      </h1>
      <p className="mt-1 text-sm text-fg-muted">
        Put a yes/no question on the record. Your crew pools testnet ETH on a
        side, and the resolver settles it.
      </p>
      <div className="mt-8">
        <ConnectGate description="Connect a wallet to call a bet.">
          <NewMarketForm groupId={id} />
        </ConnectGate>
      </div>
    </div>
  );
}

function NewMarketForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { address } = useAccount();
  const { refresh } = useGroups();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      question: params.get("q") ?? "",
      deadline: defaultDeadline(),
      resolver: (address ?? "") as string,
    },
  });

  // Default the resolver to the connected wallet once known.
  useEffect(() => {
    if (address) setValue("resolver", address);
  }, [address, setValue]);

  const tx = useContractTx({
    pending: "Putting it on the record…",
    success: "Bet's on — let your crew pick a side",
  });

  // After confirmation, pull the new marketId from the event and record it.
  useEffect(() => {
    if (!tx.isSuccess || !tx.receipt) return;
    const logs = parseEventLogs({
      abi: alrightBetAbi,
      eventName: "MarketCreated",
      logs: tx.receipt.logs,
    });
    const created = logs[0];
    if (created) {
      const marketId = Number(created.args.marketId);
      groupStore.addMarketToGroup(groupId, marketId);
      refresh();
      router.push(`/market/${marketId}`);
    } else {
      // Fallback: couldn't decode the event — send them to the group.
      router.push(`/groups/${groupId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx.isSuccess, tx.receipt]);

  function onSubmit(values: FormValues) {
    const resolveBy = BigInt(
      Math.floor(new Date(values.deadline).getTime() / 1000),
    );
    tx.writeContract({
      ...alrightBet,
      functionName: "createMarket",
      args: [values.question.trim(), resolveBy, values.resolver as Address],
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="space-y-5 p-6">
        <div className="flex justify-end">
          <AiCleaner
            onResult={(r) => {
              setValue("question", r.question, { shouldValidate: true });
            }}
          />
        </div>

        <Field label="Question" error={errors.question?.message}>
          <textarea
            {...register("question")}
            rows={2}
            placeholder="Will our team ship the demo before Friday?"
            className="w-full resize-none rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-[var(--ring)]"
          />
        </Field>

        <Field label="Resolve by" error={errors.deadline?.message}>
          <input
            type="datetime-local"
            {...register("deadline")}
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-[var(--ring)]"
          />
        </Field>

        <Field
          label="Resolver"
          error={errors.resolver?.message}
          hint="Who decides the outcome. Defaults to you."
        >
          <input
            {...register("resolver")}
            spellCheck={false}
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 font-mono text-sm outline-none focus:border-accent focus:ring-2 focus:ring-[var(--ring)]"
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={tx.isSubmitting}
        >
          {tx.isPending
            ? "Confirm in wallet…"
            : tx.isConfirming
              ? "Calling it…"
              : "Call the bet"}
        </Button>
        <p className="text-center text-xs text-fg-faint">
          Calling a bet is a free on-chain transaction (testnet gas only).
        </p>
      </Card>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-fg-faint">{hint}</p>
      )}
      {error && <p className="mt-1 text-xs text-no">{error}</p>}
    </div>
  );
}
