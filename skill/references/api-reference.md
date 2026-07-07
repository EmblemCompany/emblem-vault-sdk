# emblem-vault-sdk — API Reference

Source of truth: the `emblem-vault-sdk` package's own `types/index.d.ts` and `src/types.ts` (package `emblem-vault-sdk@2.10.x`). Methods grouped by lifecycle stage.

## Construction

```ts
new EmblemVaultSDK(apiKey: string, baseUrl?: string, v3Url?: string, sigUrl?: string)
```

`ProgressCallback = (message: string, data?: unknown) => void` — the optional trailing `callback` on most methods.

## Stage 1 — Discover

| Method | Signature | Returns |
|---|---|---|
| `fetchCuratedContracts` | `(hideUnMintable?: boolean, overrideFunc?: Function \| boolean)` | `Promise<CuratedCollectionsResponse>` (= `Collection[]`) |
| `fetchCuratedContractByName` | `(name: string, contracts?: any)` | `Promise<Collection \| null>` |

`Collection` helpers: `allowed(balance, collection)` (mintability), `fillCreateVaultTemplate(args, _this)`, `generateCreateTemplate(_this)`, `generateVaultBody(metadata, balance, _this, msgCallback)`, `address(addresses)` (picks the deposit address for the collection's chain), and `loadTypes: string[]`.

### Allowed-asset metadata (for `select` collections)

`loadTypes` includes `'select'` ⇒ the collection is a curated allow-list; the vault's `targetAsset` must be one of these. `'detailed'` ⇒ user-provided; otherwise ⇒ auto placeholder.

| Method | Signature | Returns |
|---|---|---|
| `getAssetMetadata` | `(projectName: string, strict = false)` | allowed assets for one collection (bundled) — `{ assetName, image, projectName, ... }[]`. Case-insensitive unless `strict`. |
| `getAllAssetMetadata` | `()` | all allowed assets across bundled collections |
| `getAllProjects` | `()` | collection/project names that have allow-lists |
| `getRemoteAssetMetadata` | `(asset_name)` | `Promise` — live v3 asset metadata |
| `getRemoteAssetMetadataProjectList` | `()` | `Promise` — live v3 project list |
| `getRemoteAssetMetadataVaultedProjectList` | `()` | `Promise` — live v3 vaulted-project list |

Bundled source is `NFT_DATA`; the `getRemote*` variants fetch the live equivalents from `v3Url`.

`FillCreateVaultTemplateArgs = { fromAddress, toAddress, chainId, targetAsset: { name, image, description?, ownedImage?, projectName? } }`

## Stage 2 — Create

| Method | Signature | Returns |
|---|---|---|
| `createCuratedVault` | `(template: any, callback?)` | `Promise<Vault>` |

`Vault = { name, version, basePath, pubkey, addresses: Address[], ciphertextV2, targetContract, targetAsset, tokenId, to, network, live }`
`Address = { address, coin, path?, derivationPath? }` — deposit addresses are here.

## Stage 3 — Fund, validate, mint

| Method | Signature | Returns |
|---|---|---|
| `refreshBalance` | `(tokenId, callback?)` | trigger to re-scan the chain — **don't rely on its return as the balance**; re-read via `fetchMetadata` and check `metadata.values` |
| `fetchMetadata` | `(tokenId, callback?)` | `Promise<MetaData>` — funded when `metadata.values.length > 0` (authoritative balance signal) |
| `loadWeb3` | `()` | `Promise<any>` (legacy browser web3) |
| `performMintChainWithClient` | `(client: EmblemVaultClient, tokenId, chainId?: number \| 'solana', callback?)` | `Promise<MintResult>` |
| `performMintChain` | `(web3, tokenId, collectionName, callback?)` | `Promise<{ mintResponse }>` (legacy) |

Manual mint primitives: `getQuote(web3, amount, cb?)` → `requestLocalMintSignature` / `requestRemoteMintSignature` → `performMint(web3, quote, remoteMintSig, cb?)`. Pricing helper: `getQuoteContractObject(web3)` then `quoteExternalPrice(account, usdPrice)`.

### Bulk mint (v2.11.0+) — mint many vaults in one tx (web3-only)

| Method | Signature | Returns |
|---|---|---|
| `generateBulkMintMessage` | `(tokenIds: string[])` | `string` — `"Curated Minting: <sorted,joined ids>"` (sorts the ids; sign exactly this) |
| `requestBulkMintSignature` | `(request: BulkMintRequest, callback?)` | `Promise<BulkMintResponse>` |
| `performBulkMint` | `(web3, nftAddress, bulkMintResponse, callback?)` | `Promise<any>` — one on-chain `buyWithSignedPriceBulk` tx |
| `isV2Contract` | `(metadata, chainId)` | `boolean` — collection is a V2 contract on that chain |

`BulkMintRequest = { vaults: any[], contractAddress, contractName, chainId, userSignature, message }`
`BulkMintResponse = { success, signature, hash, data: { payment, price, recipients, tokenIds, amounts, serialNumbers, nonce, value?, chainId } }`

No bulk-*create* method — create vaults in a loop (`createCuratedVault`); only minting is batched. No `*WithClient` variant yet — bulk mint is injected-web3 only.

`MintResult = { txHash, tokenId, chainId }`

## Stage 4 — Claim (unvault)

| Method | Signature | Returns |
|---|---|---|
| `performClaimChainWithClient` | `(client, tokenId, chainId?: number \| 'solana', callback?)` | `Promise<ClaimResult>` |
| `performClaimChain` | `(web3, tokenId, serialNumber, callback?)` | `Promise<any>` (legacy) |
| `requestLocalClaimSignature` | `(web3, tokenId, serialNumber, callback?)` | `Promise<any>` |
| `requestRemoteClaimToken` | `(web3, tokenId, signature, callback?)` | `Promise<any>` |
| `requestRemoteKey` | `(tokenId, jwt, callback?)` | `Promise<{ privateKey }>` |
| `decryptVaultKeys` | `(tokenId, dkeys, callback?)` | `Promise<any>` |
| `performBurn` | `(web3, tokenId, callback?)` | `Promise<any>` |
| `deleteVaultWithClient` | `(client, tokenId, chainId?, callback?)` | `Promise<boolean>` |
| `sweepVaultUsingPhrase` | `(phrase, satsPerByte?, broadcast?)` | `Promise<unknown>` |

`ClaimResult = { phrase?, privateKey? }` — **secrets. Never log/persist in plaintext.**

## Listing / ownership

| Method | Signature |
|---|---|
| `fetchVaultsOfType` | `(vaultType: 'vaulted'\|'unvaulted'\|'created', address, { page?, limit? }?)` |
| `fetchAllVaultsOfType` | `(vaultType, address, onProgress?: (page, totalPages, total) => void)` |
| `refreshOwnershipForTokenId` | `(tokenId, callback?)` → `Promise<Ownership[]>` |
| `refreshOwnershipForAccount` | `(account, callback?)` → `Promise<Ownership[]>` |
| `checkLiveliness` / `checkLivelinessBulk` | `(tokenId(s), chainId?)` |

## Remote signer (EmblemVaultClient)

The `*WithClient` methods accept an `EmblemVaultClient { toEthersWallet(provider?): Promise<EvmSigner> }` (e.g. from `emblem-vault-ai-signers`). `EvmSigner = { getAddress, signMessage, sendTransaction, setChainId? }`. This is the preferred path; the injected-`web3` methods above are deprecated.

**For the full signing contract, why it's shaped this way, and how to adapt any environment (wagmi/RainbowKit, injected wallet, hardware/MPC, relayer) into a client, see `signing-and-clients.md`.**

## Utilities

`generateUploadUrl()`, `generateAttributeTemplate(record)`, `generateImageTemplate(record)`, `generateTemplate(record)`, `templateGuard(input)`, `genericGuard(input, type, key)`, `checkContentType(url)` / `contentTypeReport(url)`, `getTorusKeys(verifierId, idToken, cb?)`, `decryptKeys(ciphertextV2, keys, addresses)`, `getSatsConnectAddress()`, `signPSBT(psbtBase64, paymentAddress, indexes, broadcast?)`. Reports: `generateJumpReport`, `generateMintReport`, `generateMigrateReport`.
