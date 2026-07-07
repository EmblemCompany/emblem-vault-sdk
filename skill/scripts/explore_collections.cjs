#!/usr/bin/env node
/**
 * Smoke test for emblem-vault-sdk: lists curated collections.
 *
 *   node explore_collections.cjs [apiKey] [nameFilter]
 *
 * apiKey defaults to 'demo'. The value is arbitrary — the SDK only requires it be
 * non-empty and forwards it as x-api-key; it doesn't validate it or gate on it.
 * nameFilter optionally fetches one collection by name and prints its detail.
 *
 * Requires `emblem-vault-sdk` to be resolvable. Install it globally first
 * (`npm install -g emblem-vault-sdk`) and run with NODE_PATH="$(npm root -g)".
 */
const EmblemVaultSDK = require('emblem-vault-sdk').default;

async function main() {
  const apiKey = process.argv[2] || 'demo';
  const nameFilter = process.argv[3];
  const sdk = new EmblemVaultSDK(apiKey);

  const contracts = await sdk.fetchCuratedContracts(false);
  console.log(`Found ${contracts.length} curated collection(s):\n`);
  for (const c of contracts) {
    console.log(`  [${c.id}] ${c.name}  (chain: ${c.collectionChain}, mintable: ${c.mintable})`);
  }

  if (nameFilter) {
    const collection = await sdk.fetchCuratedContractByName(nameFilter, contracts);
    console.log(`\nDetail for "${nameFilter}":`);
    console.log(JSON.stringify(collection, (k, v) => (typeof v === 'function' ? '[fn]' : v), 2));
  }
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
