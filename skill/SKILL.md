---
name: emblem-vault-sdk
description: Understand and build on Emblem Vaults via the emblem-vault-sdk (the curated-collection NFT vault SDK, NOT the Emblem AI / agent-wallet SDK). Teaches what a vault is (an NFT wrapping an encrypted wallet), the full lifecycle — discover a curated collection, create a vault, fund and mint it, and the two-step claim/unvault ceremony (on-chain burn then off-chain key reveal) — plus curated `select` allow-lists, vault metadata/state, and the signer-client model for adapting any wallet environment. Use when a user wants to browse collections, create/fund/mint a vault, claim/reveal keys, or reason about vault state. Covers EVM and Solana, the modern EmblemVaultClient (remote-signer) flow and the legacy web3 flow.
---

# Emblem Vault SDK

## Overview

`emblem-vault-sdk` (published on npm as `emblem-vault-sdk`) wraps the Emblem Vault platform: an Emblem Vault is an NFT that *owns* a set of underlying blockchain addresses (BTC, TAP, Ordinals, SOL, etc.). You create a vault, deposit assets into its derived addresses, mint the NFT that represents it, and later **claim** (unvault) to reveal the private keys and take custody of the contents.

> **Disambiguation.** This is the **vault** SDK (`new EmblemVaultSDK(apiKey)`, curated collections, `createCuratedVault`, `performClaimChain`). It is *not* `emblem-ai` / `emblemai-agentwallet` (wallet auth + AI crypto assistant). If the user wants chat tools, multi-chain login, or token-migration data, use the AI skill instead.

The vault lifecycle has four stages — **Discover → Create → Fund & Mint → Claim**. Walk them in order.

Anything that changes chain state (mint, claim, delete) needs a **signer**. The SDK does not care *which* wallet library produces that signer — it depends only on a small structural contract. Understand that contract (**Signing model**, below) before wiring an integration, because it's what lets you adapt *any* environment to this SDK.

## What a vault *is* — the mental model

Before the API, understand the thing you're manipulating. Getting this right is what separates an integration that works from one that fights the SDK.

**A vault is an NFT wrapped around a freshly-generated wallet.** When you create a vault, the platform generates a brand-new key pair (a seed phrase) and derives blockchain addresses from it for one or more coins (BTC, ETH, SOL, TAP, Ordinals, …). The **NFT is the ownership token for that wallet.** Whoever holds the NFT controls whatever sits at those derived addresses. So a vault is a way to make "the contents of a wallet" into a single transferable on-chain object — you can sell/move the NFT, and the assets inside move with it, without anyone touching the underlying addresses.

**The seed is sealed inside the metadata, encrypted.** The vault's private seed phrase is AES-encrypted and stored on the vault's metadata as **`ciphertextV2`**. Nobody can read it — not even the owner — until they go through the claim/reveal ceremony (below). Everything else about the vault (its target collection, its deposit `addresses`, its image/name, its `status`, whether it's `live`, `sealed`, `claimedBy`, etc.) lives in that same metadata object, fetched via `fetchMetadata(tokenId)`.

**"Curated" means the vault belongs to a collection with rules.** A vault isn't free-floating; it's created *into* a curated collection (a target contract) — e.g. "Bitcoin DeGods", "Rare Pepe". The collection decides what a valid vault in it looks like: which asset it may represent (see `select` allow-lists), what counts as a mintable balance (`collection.allowed(...)`), and how the target asset is chosen (`loadTypes`). This is why Discover comes first — the collection defines the shape of everything downstream.

### The life of a vault (birth → death)

Think of a vault as moving through states. Each SDK operation is a transition; the vault's `metadata.status` / `live` / `claimedBy` fields tell you where it is.

1. **Created** — `createCuratedVault(...)`. The key pair is generated, addresses are derived, `ciphertextV2` is sealed. The vault exists as a record but the NFT is **not yet minted on-chain**. You now have deposit `addresses`.
2. **Funded** — the user sends the real asset to the vault's deposit address (off-SDK). `refreshBalance(tokenId)` re-reads the chain until the balance shows up. Until it's funded, there's nothing worth minting.
3. **Minted** — `performMintChainWithClient(...)`. The NFT is minted on-chain; the vault becomes `live` (transferable, tradeable). It now genuinely "contains" the funded asset, represented by an NFT someone can own or sell.
4. **Claimed / Unvaulted** — the owner ends the vault's life to take direct custody. **This is two operations, not one** (see Stage 4): first an on-chain step that burns/unlocks the NFT (`status` → `claimed`), then an off-chain step that decrypts `ciphertextV2` and hands back the seed/keys. After this, the NFT is spent and the keys are exposed — the wallet is now plain, no longer wrapped.

Not every vault walks the whole path in one session, and that's the crucial subtlety: a vault you encounter may already be at any state. **Always branch on the metadata** — `live`, `status`, `claimedBy` — rather than assuming a fresh vault. The claim flow in particular does different work (and may cost gas or not) depending on whether the vault is still `live` or already `claimed`.

## Setup

```javascript
let EmblemVaultSDK = require('emblem-vault-sdk').default   // CommonJS
// import EmblemVaultSDK from 'emblem-vault-sdk'           // ESM

const sdk = new EmblemVaultSDK('demo');                    // the value is arbitrary — see note below
```

- Constructor: `new EmblemVaultSDK(apiKey, baseUrl?, v3Url?, sigUrl?)`. The **only** requirement is that `apiKey` be non-empty — the constructor does `if (!apiKey) throw 'API key is required'` and nothing more.
- **The apiKey is not a credential for anything a consumer does.** The constructor only requires it be non-empty (`if (!apiKey) throw 'API key is required'`); the value is never checked for the vault lifecycle. `'demo'` (docs) and `'DEMO_KEY'` (tests) are just placeholders — pass any non-empty string. A real key is only ever needed for internal admin operations, which consumers of this SDK will never call.
- **This does not mean the operations are unprotected.** Create/mint/claim are authenticated by the **signatures** exchanged between the user's signer and the server (see **Signing model**) — that's where authorization actually happens. The apiKey is not part of that; don't conflate the two, and don't tell users they need a "real" apiKey to mint or claim.
- Many methods take an optional trailing `callback` (a `ProgressCallback: (message, data?) => void`) used to stream progress to the UI. Always pass one for long-running chains so the user sees deposit addresses, signature steps, and tx hashes.
- Browser builds expose `window.EmblemVaultSDK` from `dist/bundle.js`.

## Signing model — read this before integrating

There are **two ways** to give the SDK signing power. They are not equals.

### The client path (preferred)

The signing methods that matter (`performMintChainWithClient`, `performClaimChainWithClient`, `deleteVaultWithClient`) take a **client** — an object that can hand the SDK a signer. The SDK's dependency is deliberately tiny; this is the *entire* interface it relies on:

```ts
interface EmblemVaultClient {
  toEthersWallet(provider?): Promise<EvmSigner>;   // hand me something signer-shaped
}

interface EvmSigner {
  getAddress(): Promise<string>;
  signMessage(message: string | Uint8Array): Promise<string>;
  sendTransaction(tx): Promise<{ hash: string; wait(): Promise<unknown> }>;
  setChainId?(chainId: number): void;
}
```

That's it. Internally the chained flows do exactly one thing to get signing power: `const wallet = await client.toEthersWallet(provider)`, then they only ever call `wallet.setChainId()`, `wallet.getAddress()`, `wallet.signMessage()`, and `wallet.sendTransaction()`. **The SDK never imports or touches a wallet library itself.** It talks only to this shape.

**Why it's built this way.** The reference client (`emblem-vault-ai-signers`, exported as `EmblemVaultClient` / `createEmblemClient`) is a *remote signer*: it holds no private key. Each method like `signMessage`/`sendTransaction` POSTs to the Emblem signer API (`/sign-eth-message`, etc.) with a `vaultId` + auth (JWT or apiKey), and the vault signs server-side. The local "wallet" is just a typed proxy. That same client can re-cast itself to several libraries — `toViemAccount()`, `toEthersWallet()`, `toWeb3Adapter()`, `toSolanaWeb3Signer()`, `toSolanaKitSigner()` — because all of them ultimately satisfy the same signing contract.

### Adapting *your* environment (the key skill)

Because the contract is structural, **anything that can produce those four behaviors can drive the SDK** — you are not limited to the reference client. If a builder is in some arbitrary environment (a wagmi/RainbowKit connector, an injected browser wallet, a hardware/MPC signer, a backend KMS, a custom relayer), you adapt it by writing a client whose `toEthersWallet()` returns an object satisfying `EvmSigner`:

- `getAddress()` → resolve the account address from that environment.
- `signMessage(msg)` → route to that environment's message-signing (personal_sign / `signMessage` / an API call). Accept both `string` and `Uint8Array`.
- `sendTransaction(tx)` → submit the tx **and return `{ hash, wait() }`**. `hash` is the tx hash; `wait()` resolves once mined. The SDK awaits `wait()`, so if your environment is sign-only, `sendTransaction` must broadcast (via a provider/RPC/relayer you supply) before returning.
- `setChainId(id)` (optional but expected) → the SDK calls this to target the right chain before signing; store it and use it when signing/broadcasting.

Concretely: `const client = { async toEthersWallet() { return myEnvSignerImplementingEvmSigner } }`, then `await sdk.performMintChainWithClient(client, tokenId, chainId)`. If the environment already yields an ethers `Signer` (RainbowKit/wagmi can), it usually satisfies `EvmSigner` directly and the adapter is a one-liner; the only thing to verify is that `sendTransaction` returns the `{ hash, wait() }` shape and that a `setChainId` exists (add a wrapper if it doesn't). See `references/signing-and-clients.md` for a full adapter skeleton and per-environment notes.

### The injected-web3 path (deprecated)

The older methods take a `web3` instance you construct and inject yourself — `performMintChain(web3, …)`, `performClaimChain(web3, …)`, plus the granular primitives (`getQuote`, `requestLocalMintSignature`, `performMint`, `performBurn`). **Treat this path as deprecated.** It requires the builder to pull in and wire an external web3 library, it's browser/EVM-oriented, and it is a *separate implementation* from the client path (so it drifts and lacks the multi-chain routing). Prefer the client path for every new integration.

The one trade-off to state plainly: the client path is an **all-in-one chain** — you hand it a client and it runs quote → sign → submit for you; you can't interleave your own steps mid-flow the way the granular web3 primitives allow. That's the intended design. The right response to "I need custom logic between steps" is to **put that logic inside your client's signer** (e.g. a `sendTransaction` that consults a paymaster/relayer), not to fall back to the deprecated primitives.

## Stage 1 — Discover curated collections

A vault is always created *into* a curated collection (a target contract). List them first.

```javascript
const contracts = await sdk.fetchCuratedContracts(/* hideUnMintable */ false);
const collection = await sdk.fetchCuratedContractByName('Bitcoin DeGods', contracts);
```

`fetchCuratedContractByName` returns a `Collection` with helpers: `fillCreateVaultTemplate(args, _this)`, `generateCreateTemplate(_this)`, `address(addresses)`, `generateVaultBody(...)`, and an `allowed(balance, collection)` mintability check. It also carries a `loadTypes: string[]` — **read this before creating a vault** (next section), because it decides how the vault's target asset must be set.

## Collection load types & allowed assets (`select`)

Every curated collection declares `collection.loadTypes`, which controls where the vault's `targetAsset` (name/image) comes from:

- **`select`** — the collection is a **curated allow-list**: a vault in it may only hold one of a specific, pre-approved set of assets. You must let the user *pick* from that list, and the picked asset fills `targetAsset`. (Live probe: 15 of 74 collections are `select`, with allow-lists ranging from 1 to ~1970 assets.)
- **`detailed`** — the user supplies the asset name/image/description themselves (free-form).
- **`input`** — a user-input variant (rare; 1 collection observed). Treat like `detailed` (user-provided) unless a probe shows otherwise.
- **`empty`** / none — the SDK auto-fills a placeholder (`"Loading..."` + the collection's loading image); the real asset resolves after funding. (`empty` is the most common — 57 of 74.)

*(The definitive list of `loadTypes` values is whatever the live data shows — run `scripts/probe.cjs loadtypes` to re-check; see **Validating SDK behavior**.)*

**Fetching what a `select` collection allows.** The allow-list metadata *is* exposed by the SDK — this is the piece most integrations miss:

```javascript
const allowed = sdk.getAssetMetadata(collection.name);   // array of allowed assets for this collection
// each item: { assetName, image, projectName, ... }
```

`getAssetMetadata(projectName, strict=false)` filters the SDK's bundled asset metadata (`NFT_DATA`) by project; case-insensitive unless `strict`. Related:
- `getAllAssetMetadata()` — every allowed asset across all bundled collections.
- `getAllProjects()` — the list of project (collection) names that have allow-lists.
- `getRemoteAssetMetadata(assetName)` / `getRemoteAssetMetadataProjectList()` — the **live** v3 equivalents (async, fetched from the backend) when you don't want the bundled snapshot.

**Using it (the `select` create flow, mirrors the SDK demo):**

```javascript
if (collection.loadTypes.includes('select')) {
  const allowed = sdk.getAssetMetadata(collection.name);   // show these as the user's only choices
  const chosen  = allowed[userSelectionIndex];             // user picks one from the allow-list
  template.targetAsset.name  = chosen.assetName;
  template.targetAsset.image = chosen.image;
}
// then createCuratedVault(template) as in Stage 2
```

For `select` collections, do **not** invent a `targetAsset` — only values from `getAssetMetadata(collection.name)` are mintable; anything else will fail the collection's `allowed()` check at mint time.

## Stage 2 — Create a curated vault

**Preferred (modern): build the template from the collection**, so chain/contract fields are filled correctly. Two equivalent builders:

```javascript
// (a) generateCreateTemplate — what the SDK demo uses; returns a ready template you then fill:
const template = collection.generateCreateTemplate(collection);
template.chainId     = 1;
template.fromAddress = userAddress;
template.toAddress   = toAddress || userAddress;
// For a `select` collection, set targetAsset from getAssetMetadata() (see previous section):
// template.targetAsset.name = chosen.assetName; template.targetAsset.image = chosen.image;

// (b) fillCreateVaultTemplate — pass the args in one call:
const template2 = collection.fillCreateVaultTemplate({
  fromAddress: userAddress, toAddress: userAddress, chainId: 1,
  targetAsset: { name: 'Loading...', image: 'https://emblem.finance/btcdegods.jpg' }
}, collection);

const vaultData = await sdk.createCuratedVault(template, callback);
```

If the collection's `loadTypes` includes `select`, the `targetAsset` **must** come from that collection's allow-list — see **Collection load types & allowed assets** above.

**Legacy/explicit template** (still supported — what the README shows):

```javascript
const contractTemplate = {
  fromAddress: userAddress, toAddress: userAddress, chainId: 1, experimental: true,
  targetContract: { "1": "0x345eF9d7E75aEEb979053AA41BB6330683353B7b", name: "Bitcoin DeGods", description: "..." },
  targetAsset:    { image: "https://emblem.finance/btcdegods.jpg", name: "Loading...", xtra: "..." }
};
const vaultData = await sdk.createCuratedVault(contractTemplate, callback);
```

`vaultData` (a `Vault`) contains `tokenId`, and `addresses[]` — the **deposit addresses** the user funds. Surface the right one to the user, e.g.:

```javascript
const depositAddr = vaultData.addresses.find(a => a.coin === 'TAP').address;
```

## Stage 3 — Fund, validate, and mint

1. **User deposits** the asset into the vault's deposit address (off-SDK).
2. **Refresh, then re-read the metadata to see the balance.** This is a two-call pattern, and the ordering is the part people get wrong:
   - `refreshBalance(tokenId)` is a **trigger**, not a getter — it asks the backend to re-scan the chain for this vault. **Do not rely on its return value as the balance.** Call it and move on.
   - The authoritative balance lives on the **metadata** you fetch *after* refreshing. A vault is funded when `metadata.values` is a non-empty array.
   ```javascript
   await sdk.refreshBalance(tokenId, callback);           // fire-and-forget: "please re-scan"
   const metadata = await sdk.fetchMetadata(tokenId);     // re-read the record
   const funded   = Array.isArray(metadata.values) && metadata.values.length > 0;
   ```
   Deposits don't confirm instantly, so **poll**: repeat this pair on an interval (e.g. every ~5s, with a max-attempts cap) until `funded` is true, then proceed. This is exactly how `Emblem-Collab/bulk-vault` does it (`Step2SendNFT.tsx` / `Step3Mint.tsx`) — it refreshes, fetches metadata, and checks `metadata.values.length`, never trusting `refreshBalance`'s return.

   Verified live against real vaults (`scripts/probe.cjs`): on an **unfunded** vault, `refreshBalance()` returns `[]`, `metadata.values` is `[]`, and `metadata.balances` is `undefined` — `balances` is **not** a metadata field (it only appears on `refreshBalance`'s raw return). On a **funded** vault, `metadata.values` populates with entries like `{ coin, name, balance, type, image, external_url }` (confirmed on a live vault holding an Ordinal). So `metadata.values.length > 0` is the authoritative funded signal, both ways.

3. **Validate mintability** (pass the balance the collection expects — `metadata.values`):
   ```javascript
   const mintable = collection.allowed(metadata.values, collection);
   ```
4. **Mint** — use the client path (see **Signing model**):
   ```javascript
   const result = await sdk.performMintChainWithClient(client, vaultData.tokenId, chainId /* number | 'solana' */, callback);
   // -> MintResult { txHash, tokenId, chainId }
   ```
   `client` is anything satisfying the `EmblemVaultClient` contract — the reference `emblem-vault-ai-signers` client, or your own adapter around whatever wallet environment you're in.

   *Deprecated:* the injected-web3 path `sdk.performMintChain(web3, vaultData.tokenId, collection.name, callback)` (and the granular `getQuote`/`requestRemoteMintSignature`/`performMint` primitives in `references/api-reference.md`) still work but require you to construct and wire an external web3 library. Prefer the client path.

## Stage 4 — Claim (unvault): a *two-step* ceremony

This is the most misunderstood part of the lifecycle, so understand the shape before the call. **Ending a vault's life is two distinct operations**, and whether the first one runs depends on the vault's state.

**Step 1 — On-chain claim/unvault (may cost gas).** While the vault is `live`, the NFT is transferable, so the keys can't be revealed yet — that would let someone sell a vault whose keys are already exposed. So first the NFT must be spent on-chain: this burns/unlocks it and flips `metadata.status` to `claimed`. This step is skipped entirely if the vault is already claimed (or was never minted).

**Step 2 — Off-chain key reveal (no gas, repeatable).** Only after the vault is claimed does the SDK decrypt `ciphertextV2` and hand back the seed phrase / private keys. This is a pure off-chain decryption — no transaction. Because it doesn't change chain state, an owner of an already-claimed vault can perform *just this step* again to re-reveal the keys.

**The SDK does both for you, gated on state.** You don't orchestrate the two steps or think about endpoints — `performClaimChainWithClient` reads the vault's metadata, runs Step 1 only if needed (`live`/`status`/`claimedBy`), then always runs Step 2:

```javascript
const claim = await sdk.performClaimChainWithClient(client, tokenId, chainId, callback);
// -> ClaimResult { phrase?, privateKey? }
```

What this means for you as an integrator:
- **Claiming a `live` vault costs gas** (Step 1 is a real transaction — the signer's `sendTransaction` fires). **Claiming an already-`claimed` vault is free** (Step 2 only). Branch your UX/messaging on `metadata.status` so the user isn't surprised by a wallet prompt — or its absence.
- The user will be asked to **sign** in both steps (an authorization message; in Step 1 that signature is also what authorizes the on-chain spend). Use the `callback` to narrate ("signing…", "submitting on-chain unvault…", "decrypting keys…") so the two-phase nature is visible.
- **Re-revealing keys** on a vault that's already claimed is expected and gas-free — don't force a fresh burn.

*Deprecated variant:* `sdk.performClaimChain(web3, tokenId, serialNumber, callback)` (injected-web3, EVM-only) skips Step 1 and does **only** the off-chain reveal — it assumes an already-claimed / non-`live` vault. Prefer the client path, which handles both steps and the state gate for you.

After claiming a BTC-family vault you can sweep the recovered funds with `sweepVaultUsingPhrase(phrase, satsPerByte?, broadcast?)`.

> **Security:** Step 2 returns real private keys / seed phrases (`ClaimResult.phrase` / `.privateKey`). Handle as secrets — never log or persist them in plaintext (treat them like the EMBLEM keypair files). Confirm intent with the user before running a claim, since Step 1 is irreversible.

## Navigating a user's vault holdings

A major use of the SDK is building a "my vaults" view — listing what an address owns and where each vault sits in its lifecycle. Vaults are partitioned into **three types**, which map directly onto the lifecycle states:

| `vaultType` | Lifecycle state |
|---|---|
| `'created'` | made but **not yet minted** on-chain |
| `'vaulted'` | **minted / live**, holds its assets (the NFT exists and is tradeable) |
| `'unvaulted'` | **claimed / redeemed** — keys revealed, NFT spent |

(The exact `status` strings each vault reports vary by view — see **Status vocabulary** below.)

```javascript
const created   = await sdk.fetchVaultsOfType('created',   address);   // unminted
const vaulted   = await sdk.fetchVaultsOfType('vaulted',   address);   // minted / live
const unvaulted = await sdk.fetchVaultsOfType('unvaulted', address);   // claimed
```

Each returned item carries `tokenId`, `name`, `targetContract`, `targetAsset`, `addresses`, `image`, `network`, and an `ownership` object. In the **list** view the status lives on **`item.ownership.status`** (the top-level `item.status` is `undefined` here). That status is what you render per row and branch claim logic on. See **Status vocabulary** below — the field and its wording differ between the list and metadata views.

**Pagination** — these lists get large (a single address in the wild had 165 created, 376 vaulted, 82 unvaulted). Page it, or auto-paginate:

```javascript
const page = await sdk.fetchVaultsOfType('created', address, { page: 1, limit: 100 }); // -> { data, pagination }
const all  = await sdk.fetchAllVaultsOfType('created', address, (p, tp, total) => {     // fetches every page
  console.log(`page ${p}/${tp} — ${total} total`);
});
```

**Balances/contents of a listed vault** — the list gives you identity and status, not contents. To see what a vault *holds*, take its `tokenId` and follow the Stage 3 pattern: `refreshBalance(tokenId)` (trigger) → `fetchMetadata(tokenId)` → read `metadata.values`. Only `vaulted` (minted) vaults meaningfully hold assets.

*Related read-ops:* `refreshOwnershipForAccount(address)` / `refreshOwnershipForTokenId(tokenId)` return `Ownership[]` records; `checkLiveliness(tokenId, chainId?)` / `checkLivelinessBulk([...])` report on-chain liveness. Use `scripts/probe.cjs holdings <address>` to inspect all three types and their statuses live.

### Status vocabulary (the field *and* the words differ by view)

The same vault reports its lifecycle state through **different fields with different spellings** depending on how you fetched it. This is a real gotcha — don't hardcode one field/word and assume it holds everywhere. Verified live:

| Lifecycle state | `vaultType` (which list it's in) | List view: `ownership.status` | Metadata view: `metadata.status` | `metadata.live` |
|---|---|---|---|---|
| created, not minted | `created` | `unminted` | `unminted` / `unclaimed` | `false` |
| minted, holds assets | `vaulted` | `minted` | `unclaimed` (a.k.a. "minted, not yet claimed") | `true` |
| claimed / redeemed | `unvaulted` | `claimed` | `claimed` (`claimedBy` is set) | usually `false` |

Key points, so an agent doesn't get tripped:
- **List view:** read `ownership.status` — top-level `item.status` is `undefined` in list responses.
- **Metadata view:** read `metadata.status` (top-level) — and note it uses **`unclaimed`** where the list said `minted`. `unclaimed`/`minted` describe the *same* live-but-not-yet-redeemed state; the metadata just names it by "has it been claimed yet."
- **`unminted` vs `unclaimed`** for a fresh vault: both have been observed on `metadata.status` for created vaults — treat "not `claimed` and `live: false`" as the reliable "not yet minted" test rather than trusting one exact word.
- **Most robust signal:** combine `metadata.live` (minted?) + `metadata.status`/`claimedBy` (claimed?) rather than string-matching a single status field. `live: true` = minted & tradeable; `claimedBy` set (or `status === 'claimed'`) = redeemed.
- The **`vaultType` you queried** is itself the most reliable partition (`created`/`vaulted`/`unvaulted`) — the status fields are per-row detail within it.

## Guardrails

- **Order matters:** create → fund → refresh until balance is non-empty → validate `allowed()` → mint. Minting before the deposit confirms will fail.
- **Never log or persist `ClaimResult.privateKey` / `phrase`** in plaintext output. Treat claim output like the EMBLEM keypair files — secrets.
- **Always use the client path (`*WithClient`) for new code.** The injected-`web3` methods are deprecated. To fit a new environment, write a client adapter (see **Signing model**), don't reach for the web3 primitives.
- A "client" is defined by behavior, not by package: if your object's `toEthersWallet()` returns something with `getAddress` / `signMessage` / `sendTransaction`(→`{hash,wait()}`) / `setChainId`, the SDK will drive it. That's the whole contract.
- The constructor `apiKey` only needs to be non-empty — pass `'demo'`. It's not a credential for anything a consumer does (a real key is for internal admin operations only, which consumers never call), so don't tell users they need a "real key" to mint or claim. Authorization for those operations comes from the **signatures** exchanged with the server, not the apiKey. (Separate from the *remote signer's* auth in `emblem-vault-ai-signers`, where the JWT/apiKey on `EmblemRemoteConfig` is a genuine credential for the signing API.)

## Running the SDK yourself (probe it, don't trust it)

The SDK's docs, demos, and even this skill can drift from what the code actually does — the `refreshBalance` return shape and the `input` loadType are examples we caught this way. When you're unsure about a claim, **run the live SDK** instead of guessing. Read operations are safe against production (no signer is wired, so writes/mint/claim can't run anyway).

**One-time setup** — globally install the published SDK so the scripts can require it from anywhere:

```bash
npm install -g emblem-vault-sdk      # or: pnpm add -g emblem-vault-sdk
```

(No repo or build step needed — `emblem-vault-sdk` is published on npm. If you happen to be working inside the SDK source instead, `npm install && npm run build && npm install -g .` from the package root does the same.)

### `scripts/sdk.cjs` — the general-purpose runner (use this first)

`sdk.cjs` boots the SDK, puts it in scope as `sdk`, runs **whatever code you give it**, and prints the result as JSON. This is the tool for *anything* in the SDK — you write the snippet, it's not a fixed menu.

```bash
# inline expression
NODE_PATH="$(npm root -g)" node scripts/sdk.cjs --quiet -e "(await sdk.fetchCuratedContracts(false)).length"
NODE_PATH="$(npm root -g)" node scripts/sdk.cjs --quiet -e "(await sdk.fetchMetadata('9260569240430531')).status"

# multi-line snippet on stdin (needs an explicit `return`)
echo "const c = await sdk.fetchCuratedContracts(false);
      return c.filter(x => (x.loadTypes||[]).includes('select')).length" \
  | NODE_PATH="$(npm root -g)" node scripts/sdk.cjs --quiet

# or from a file
NODE_PATH="$(npm root -g)" node scripts/sdk.cjs --quiet snippet.js
```

In your snippet: `sdk` (the instance), `EmblemVaultSDK` (the class), and `require` are all in scope; the body is `async` so you can `await`. Return a value (single expressions auto-return) or just `console.log`. Flags: `--quiet` hides the SDK banner, `--key <k>` sets the constructor key (default `'demo'`), `--raw` dumps with `console.dir` (keeps functions/BigInts). If you can write JS against the SDK, you can run it here — no need to author a new script.

### `scripts/probe.cjs` — canned examples built on the same idea

A small menu of ready-made read-only checks, handy when you want a labeled answer without writing a snippet: `loadtypes`, `select`, `surface`, `metadata <tokenId>`, `balance <tokenId>`, `holdings <address>`, `funded <address> [max]`. Each prints live output next to the claim it validates.

```bash
NODE_PATH="$(npm root -g)" node scripts/probe.cjs holdings 0xYourAddress
```

**How to use these as an agent:** when a task hinges on SDK behavior you're unsure of, reach for `sdk.cjs` and run the exact call, read the raw output, and treat the live result as ground truth — if it disagrees with the skill, fix the skill. Use `probe.cjs` for the common pre-baked checks. Both are ESM-safe `.cjs`, so they run regardless of the surrounding project's module type.

## Reference files

- `references/api-reference.md` — every public method grouped by lifecycle stage, with signatures and types.
- `references/signing-and-clients.md` — the signer/client contract and how to adapt any wallet environment.
- `scripts/sdk.cjs` — **general-purpose runner**: hand it any JS snippet and it runs it against a booted `sdk` instance, printing JSON (see **Running the SDK yourself**).
- `scripts/probe.cjs` — canned read-only checks built on the same idea (loadtypes/select/holdings/funded/…).
- `scripts/explore_collections.cjs` — minimal runnable script that lists curated collections (quick smoke test).
