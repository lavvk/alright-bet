"use client";

import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { shortError } from "@/lib/utils";

interface TxLabels {
  pending: string; // shown while awaiting wallet + confirmation
  success: string;
  error?: string;
}

/**
 * Shared transaction lifecycle: drives sonner toasts through
 * wallet-prompt → mining → confirmed/failed, and exposes status flags.
 * Returns the write fn plus the confirmed receipt (needed for event parsing).
 */
export function useContractTx(labels: TxLabels) {
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  const toastId = useRef<string | number | undefined>(undefined);

  // Wallet prompt / submitted.
  useEffect(() => {
    if (isPending) {
      toastId.current = toast.loading("Confirm in your wallet…", {
        id: toastId.current,
      });
    }
  }, [isPending]);

  // Submitted, now mining.
  useEffect(() => {
    if (hash && isConfirming) {
      toastId.current = toast.loading(labels.pending, { id: toastId.current });
    }
  }, [hash, isConfirming, labels.pending]);

  // Confirmed.
  useEffect(() => {
    if (isSuccess) {
      toast.success(labels.success, { id: toastId.current });
      toastId.current = undefined;
    }
  }, [isSuccess, labels.success]);

  // Errored (wallet rejection or revert).
  useEffect(() => {
    const err = writeError ?? confirmError;
    if (err) {
      toast.error(labels.error ?? shortError(err), {
        id: toastId.current,
        description: labels.error ? shortError(err) : undefined,
      });
      toastId.current = undefined;
    }
  }, [writeError, confirmError, labels.error]);

  return {
    writeContract,
    hash,
    receipt,
    isPending,
    isConfirming,
    isSubmitting: isPending || isConfirming,
    isSuccess,
    error: writeError ?? confirmError,
    reset,
  };
}
