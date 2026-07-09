import type { Address } from "viem";
import { alrightBetAbi } from "./abi";

/// Deployed AlrightBet address on Base Sepolia. Set after running the deploy
/// script (see contracts/script/Deploy.s.sol). Falls back to the zero address.
export const alrightBetAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as Address;

export const alrightBet = {
  address: alrightBetAddress,
  abi: alrightBetAbi,
} as const;
