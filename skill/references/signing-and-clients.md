# Signing & Clients — the contract, and how to adapt any environment

This doc explains the signing abstraction in enough depth that you can take an **arbitrary** wallet environment (wagmi/RainbowKit, injected `window.ethereum`, a hardware or MPC signer, a backend KMS, a relayer) and make it drive the vault SDK's chained signing functions — without a per-environment recipe.

## The contract (all the SDK actually depends on)

From `emblem-vault-sdk/src/types.ts`:

```ts
interface EmblemVaultClient {
  toEthersWallet(provider?: unknown): Promise<EvmSigner>;
}

interface EvmSigner {
  getAddress(): Promise<string>;
  signMessage(message: string | Uint8Array): Promise<string>;
  sendTransaction(tx: unknown): Promise<{ hash: string; wait(): Promise<unknown> }>;
  setChainId?(chainId: number): void;
}
```

The chained functions (`performMintChainWithClient`, `performClaimChainWithClient`, `deleteVaultWithClient`) call **exactly these**, in this order:

1. `wallet = await client.toEthersWallet(provider)` — once, up front.
2. `wallet.setChainId(chainId)` — to target the chain.
3. `wallet.getAddress()` — to know who's acting.
4. `wallet.signMessage(msg)` — to authorize the operation (the SDK builds the message; you just sign it; accept `string` **and** `Uint8Array`).
5. `wallet.sendTransaction(tx)` — for on-chain steps (V2 unvault, some mints/burns). The SDK then `await`s the returned `.wait()`.

Nothing else. No library type escapes into the SDK. This is why the abstraction is portable: **satisfy the shape and you're a valid client.**

## Why remote-signing looks like this

The reference client (`emblem-vault-ai-signers`) holds no key. Its `EmblemEthersWallet` implements `signMessage`/`sendTransaction` by POSTing to the Emblem signer API (`/sign-eth-message`, etc.) with `{ vaultId }` + auth, and the vault signs server-side. It's constructed from an `EmblemRemoteConfig`:

```ts
type EmblemRemoteConfig = {
  apiKey?: string;
  jwt?: string;
  getJwt?: () => Promise<string | null | undefined> | string | null | undefined;
  getAuthHeaders?: () => Promise<Record<string,string>> | Record<string,string>;
  sdk?: { getSession: () => { authToken?: string | null } | null };
  baseUrl?: string; // default https://api.emblemvault.ai
};
```

The same client re-casts to many libraries — `toViemAccount()`, `toEthersWallet()`, `toWeb3Adapter()`, `toSolanaWeb3Signer()`, `toSolanaKitSigner()` — all funneling into the same signing contract. **Your adapter is just another caster** into that contract; it doesn't have to be remote — it can wrap a local/browser/hardware signer just as validly.

## Adapter skeleton (adapt anything)

```ts
import type { EmblemVaultClient, EvmSigner } from 'emblem-vault-sdk';

function makeClient(env): EmblemVaultClient {
  return {
    async toEthersWallet(/* provider */): Promise<EvmSigner> {
      let chainId = 1;
      return {
        setChainId(id) { chainId = id; },                    // remember target chain
        async getAddress() { return env.getAddress(); },     // account in this env
        async signMessage(message) {
          // message may be string OR Uint8Array — normalize to your env's signer
          return env.signMessage(message);                    // personal_sign / signMessage / API call
        },
        async sendTransaction(tx) {
          // MUST broadcast and MUST return { hash, wait() }.
          const hash = await env.send({ ...tx, chainId });    // submit via provider/RPC/relayer
          return { hash, wait: () => env.waitForReceipt(hash) };
        },
      };
    },
  };
}

await sdk.performMintChainWithClient(makeClient(env), tokenId, chainId, cb);
```

### Per-environment notes (apply the contract, don't memorize recipes)

- **wagmi / RainbowKit / viem:** you typically already have a signer/wallet client. Either return an ethers signer directly (RainbowKit can give you one, and an ethers `Signer` already matches `EvmSigner` closely), or wrap the viem `WalletClient`: map `signMessage` → `walletClient.signMessage`, and `sendTransaction` → `walletClient.sendTransaction` + `publicClient.waitForTransactionReceipt` to build `{ hash, wait() }`. Add a `setChainId` wrapper if the underlying object lacks one.
- **Injected `window.ethereum` (MetaMask, etc.):** `signMessage` → `personal_sign`; `sendTransaction` → `eth_sendTransaction` then poll `eth_getTransactionReceipt` for `wait()`.
- **Sign-only signers (hardware / MPC / KMS):** these produce signatures but don't broadcast. Your `sendTransaction` must sign **and then** push the signed tx through a provider/relayer you supply, so it can still return `{ hash, wait() }`.
- **Account abstraction / paymaster / relayer:** hide it inside `sendTransaction` — submit a userOp/meta-tx, return the resulting tx hash and a `wait()` that resolves on inclusion. The SDK stays unaware; this is the intended extension point instead of the deprecated step-by-step primitives.

### The one shape to get right

`sendTransaction` **must** return `{ hash, wait() }` and `wait()` must resolve when the tx is mined — the SDK awaits it before proceeding. Most adaptation bugs are here (returning a bare hash, or a promise that never resolves). If your environment can't broadcast, it isn't a complete client for on-chain steps; give it a provider so it can.

## Deprecated: the injected-web3 path

`performMintChain(web3, …)`, `performClaimChain(web3, …)`, `getQuote`, `requestLocalMintSignature`, `requestRemoteMintSignature`, `performMint`, `performBurn`, `requestLocalClaimSignature`, `requestRemoteClaimToken` — all require a `web3` instance you build and inject, are EVM/browser-oriented, and are a separate implementation from the client path (no multi-chain routing, prone to drift). Documented in `api-reference.md` for maintenance of existing integrations only. **Do not build new integrations on them** — write a client adapter instead.

## Known rough edges (context for anyone extending the SDK)

- The client interface's single door is `toEthersWallet()` — ethers-shaped by name. Non-ethers signers work only because the reference client down-converts them to an ethers-shaped `EvmSigner` first. A future-neutral interface would be `getSigner()` returning a library-agnostic capability set.
- `EvmSigner.sendTransaction` assumes sign-*and*-broadcast returning an ethers-style response, which is awkward for sign-only and AA flows (workable via the adapter, but the shape leaks EVM/ethers assumptions).
- `chainId: number | 'solana'` is accepted by the chained functions, but the EVM operations path only ever calls `toEthersWallet` — Solana routing through the reference client's `toSolanaWeb3Signer` is not fully wired at the vault-SDK layer. Treat non-EVM as EVM-only until verified.
