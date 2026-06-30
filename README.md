# Alright, Bet

On-chain binary prediction markets. Users pool ETH on a yes/no outcome, a
per-market resolver settles it, and winners pull their pro-rata share of the
pool. Built for **Base Sepolia**.

```
alright-bet/
├─ contracts/   Foundry project (Solidity, forge-std, OpenZeppelin)
└─ app/         Next.js App Router frontend (wagmi + viem + RainbowKit)
```

## Contracts

The core contract is [`contracts/src/AlrightBet.sol`](contracts/src/AlrightBet.sol):

- `createMarket(question, resolveBy, resolver) → marketId`
- `placeBet(marketId, outcome) payable` — pools the stake in the contract
- `resolveMarket(marketId, outcome)` — gated by the per-market `resolver`
  (placeholder for a future group-vote mechanism)
- `claimWinnings(marketId)` — pro-rata payout, pull-over-push, `ReentrancyGuard`

Payout = `winnerStake * totalPool / winningPool`.

### Build & test

```bash
cd contracts
forge build
forge test -vvv   # includes a reentrancy-attack test that must not drain funds
```

### Deploy to Base Sepolia

Copy `contracts/.env.example` to `contracts/.env` and fill it in, then:

```bash
cd contracts
source .env
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$BASE_SEPOLIA_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast --verify --etherscan-api-key "$ETHERSCAN_API_KEY"
```

The deployed address is printed at the end of the run.

## Frontend

Next.js (App Router, TypeScript, Tailwind) with wagmi, viem, TanStack Query and
RainbowKit, configured for Base Sepolia.

```bash
cd app
cp .env.example .env.local   # set WalletConnect project id + deployed address
npm install
npm run dev
```

Key files:

- `app/lib/wagmi.ts` — wagmi/RainbowKit config for Base Sepolia
- `app/app/providers.tsx` — `WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider`
- `app/components/Header.tsx` — branded header + wallet connect
- `app/app/page.tsx` — lists markets and places bets via `useWriteContract`
- `app/lib/abi.ts` — contract ABI (regenerate after contract changes, see below)

### Regenerating the ABI

After changing the contract, rebuild and copy the ABI into the app:

```bash
cd contracts && forge build
node -e "require('fs').writeFileSync('../app/lib/abi.ts','export const alrightBetAbi = '+JSON.stringify(require('./out/AlrightBet.sol/AlrightBet.json').abi,null,2)+' as const;\n')"
```

## Environment variables

| File                  | Variable                            | Purpose                              |
| --------------------- | ----------------------------------- | ------------------------------------ |
| `contracts/.env`      | `BASE_SEPOLIA_RPC_URL`              | RPC for deploy                       |
|                       | `PRIVATE_KEY`                        | Deployer key                         |
|                       | `ETHERSCAN_API_KEY`                  | BaseScan verification                |
| `app/.env.local`      | `NEXT_PUBLIC_WC_PROJECT_ID`         | WalletConnect Cloud project id       |
|                       | `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL`  | RPC used by the frontend             |
|                       | `NEXT_PUBLIC_CONTRACT_ADDRESS`      | Deployed AlrightBet address          |

> Note: `create-next-app@latest` scaffolds the current Next.js (16) App Router.
> The structure and APIs used here (App Router, server/client components) match
> the Next 14 App Router conventions requested.
# alright-bet
