#!/usr/bin/env node
/**
 * SDK probe harness — validate the SDK's *actual* read behavior instead of trusting docs.
 *
 * This is the tool an agent uses to ground claims about the SDK empirically. All probes
 * here are READ-ONLY (no signer, no writes, no gas) and safe to run against production.
 *
 * Usage:
 *   node probe.cjs                 # run all read-only probes, print findings
 *   node probe.cjs loadtypes       # run one probe by name (see PROBES below)
 *   node probe.cjs metadata 9260569240430531 # some probes take an argument (a tokenId)
 *
 * Setup (global install so the agent can require it from anywhere):
 *   npm install -g emblem-vault-sdk      # or: pnpm add -g emblem-vault-sdk
 *   # then run with the global modules on the path:
 *   NODE_PATH="$(npm root -g)" node probe.cjs
 *
 * How the agent should use this: pick the probe that targets the claim you're unsure about,
 * run it, read the raw output, and compare it to what the skill/docs say. If they disagree,
 * the SDK's live behavior wins — fix the skill. Add a new probe when you need to check a new
 * claim; keep every probe read-only.
 */
const S = require('emblem-vault-sdk').default;
const sdk = new S('demo'); // apiKey is a non-empty placeholder for read ops (see SKILL.md)

const ZERO = '0x0000000000000000000000000000000000000000';
const log = (...a) => console.log(...a);
const keys = (o, n = 12) => (o ? Object.keys(o).slice(0, n).join(', ') : '(none)');

// Find any real tokenId to inspect, without needing to know one up front.
async function anyTokenId() {
  const v = await sdk.fetchVaultsOfType('created', ZERO);
  if (Array.isArray(v) && v[0]) return String(v[0].tokenId);
  throw new Error('could not find a sample tokenId');
}

const PROBES = {
  // Which loadTypes actually exist, and how common each is.
  async loadtypes() {
    const contracts = await sdk.fetchCuratedContracts(false);
    const dist = {};
    contracts.forEach(c => (c.loadTypes || []).forEach(t => (dist[t] = (dist[t] || 0) + 1)));
    log(`${contracts.length} curated collections`);
    log('loadTypes distribution:', dist);
    log('(claim to validate: the SKILL should list every key shown here)');
  },

  // select collections expose an allow-list via getAssetMetadata(name).
  async select() {
    const contracts = await sdk.fetchCuratedContracts(false);
    const selects = contracts.filter(c => (c.loadTypes || []).includes('select'));
    log(`${selects.length} select collections`);
    selects.slice(0, 8).forEach(c => {
      const assets = sdk.getAssetMetadata(c.name);
      log(`  ${c.name}: ${assets.length} allowed assets | asset keys: ${keys(assets[0], 8)}`);
    });
    log('(claim to validate: select => non-empty allow-list; targetAsset must come from here)');
  },

  // The full read-only method surface, called with safe inputs; prints return shapes.
  async surface() {
    const contracts = await sdk.fetchCuratedContracts(false);
    log('fetchCuratedContracts ->', contracts.length, 'collections; keys:', keys(contracts[0]));
    log('getAllProjects ->', sdk.getAllProjects().length, 'projects');
    log('getAllAssetMetadata ->', sdk.getAllAssetMetadata().length, 'assets');
    const byName = await sdk.fetchCuratedContractByName(contracts[0].name, contracts);
    log('fetchCuratedContractByName ->', byName ? 'Collection' : 'null',
      '| helpers:', ['allowed', 'fillCreateVaultTemplate', 'generateCreateTemplate', 'address', 'generateVaultBody']
        .filter(h => typeof byName?.[h] === 'function').join(', '));
  },

  // Metadata/state fields on a real vault (pass a tokenId, or auto-pick one).
  async metadata(tokenId) {
    tokenId = tokenId || (await anyTokenId());
    const m = await sdk.fetchMetadata(tokenId);
    log('tokenId:', tokenId);
    log('metadata keys:', Object.keys(m).join(', '));
    log('state -> status:', m.status, '| live:', m.live, '| sealed:', m.sealed, '| claimedBy:', m.claimedBy);
    log('funded signal -> "values" present:', 'values' in m, '| values:', JSON.stringify(m.values));
    log('ciphertextV2 present:', 'ciphertextV2' in m, '(the sealed seed)');
  },

  // THE balance-shape probe: is refreshBalance a getter or a trigger? where does the balance live?
  async balance(tokenId) {
    tokenId = tokenId || (await anyTokenId());
    const rb = await sdk.refreshBalance(tokenId);
    log('tokenId:', tokenId);
    log('refreshBalance() return:', Array.isArray(rb) ? `array[${rb.length}]` : typeof rb, '=>', JSON.stringify(rb).slice(0, 160));
    const m = await sdk.fetchMetadata(tokenId);
    log('after refresh -> metadata.values:', JSON.stringify(m.values));
    log('after refresh -> metadata.balances:', JSON.stringify(m.balances), '(expected undefined — balances is NOT a metadata field)');
    log('funded (values.length > 0)?', Array.isArray(m.values) && m.values.length > 0);
    log('CONCLUSION: treat refreshBalance as a re-scan trigger; read funded state from metadata.values.');
  },

  // Navigate a user's vault holdings across the three vault types + their statuses.
  // Pass an owner address (0x...). This is how you build a "my vaults" view.
  async holdings(address) {
    if (!address) { log('usage: probe.cjs holdings <0xAddress>'); return; }
    log('owner:', address);
    for (const type of ['created', 'vaulted', 'unvaulted']) {
      const list = await sdk.fetchVaultsOfType(type, address);
      const arr = Array.isArray(list) ? list : list?.data || [];
      log(`\n  fetchVaultsOfType('${type}') -> ${arr.length} vault(s)`);
      if (arr[0]) log('    item keys:', keys(arr[0], 10));
      arr.slice(0, 8).forEach(v => {
        const st = v.status ?? v.ownership?.status ?? '?';
        const live = v.live ?? '?';
        log(`    tokenId ${v.tokenId} | status=${st} live=${live} | ${v.targetContract?.name || v.name || ''}`);
      });
    }
    log('\n  vault types: "created" (made, maybe unminted) | "vaulted" (minted/live, holds assets) | "unvaulted" (claimed/redeemed)');
  },

  // Find the first FUNDED vault an address holds and show its balance shape.
  // Used to close the positive-case balance question. Pass an owner address.
  async funded(address, max) {
    if (!address) { log('usage: probe.cjs funded <0xAddress> [maxToCheck]'); return; }
    const cap = Number(max) || 40;
    log('owner:', address, '| checking up to', cap, 'minted vaults (parallel)');
    // 'vaulted' = minted vaults that hold assets — the ones likely to be funded.
    const list = await sdk.fetchVaultsOfType('vaulted', address).catch(() => []);
    const arr = (Array.isArray(list) ? list : list?.data || []).slice(0, cap);
    const results = await Promise.allSettled(arr.map(async v => {
      const tokenId = String(v.tokenId);
      await sdk.refreshBalance(tokenId).catch(() => {}); // trigger; ignore its return
      const m = await sdk.fetchMetadata(tokenId);        // authoritative read
      return { tokenId, values: m.values, totalValue: m.totalValue, status: m.status, live: m.live };
    }));
    const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const errors = results.length - ok.length; // some testnet/legacy ids return non-JSON
    const found = ok.find(r => Array.isArray(r.values) && r.values.length > 0);
    log('vaults checked:', ok.length, '| skipped (errors):', errors);
    if (found) {
      log('FUNDED vault found:', found.tokenId, `(status=${found.status}, live=${found.live})`);
      log('metadata.values:', JSON.stringify(found.values).slice(0, 300));
      log('metadata.totalValue:', found.totalValue);
      log('=> POSITIVE CASE CONFIRMED: a funded vault populates metadata.values (length > 0).');
    } else {
      log('no funded vault found in the first', ok.length, 'minted vaults (raise the cap to check more).');
    }
  },

  // Bulk mint (v2.11.0+): show the batch message + the sig-request shape, read-only.
  // Pass comma-separated tokenIds; no signer, so it stops at the server sig-request.
  async bulk(ids) {
    if (typeof sdk.generateBulkMintMessage !== 'function') {
      log('bulk mint not present — installed SDK is', require('emblem-vault-sdk/package.json').version, '(need >= 2.11.0)');
      return;
    }
    const tokenIds = (ids || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!tokenIds.length) { log('usage: probe.cjs bulk <id1,id2,...>'); return; }
    const message = sdk.generateBulkMintMessage(tokenIds);
    log('input tokenIds:', tokenIds.join(', '));
    log('generateBulkMintMessage() ->', JSON.stringify(message), '(note: ids are SORTED)');
    log('requestBulkMintSignature validates a REAL wallet signature over that message;');
    log('with a placeholder it should be rejected — demonstrating the auth gate:');
    try {
      const r = await sdk.requestBulkMintSignature({
        vaults: tokenIds.map(tokenId => ({ tokenId })),
        contractAddress: '0x0000000000000000000000000000000000000000',
        contractName: 'probe', chainId: 1, userSignature: '0xPLACEHOLDER', message,
      });
      log('  result:', JSON.stringify(r).slice(0, 200));
    } catch (e) { log('  rejected (expected):', e.message); }
    log('next step (needs signer): performBulkMint(web3, contractAddress, bulkResponse) -> one buyWithSignedPriceBulk tx');
  },
};

async function main() {
  const [name, arg] = process.argv.slice(2);
  const names = name ? [name] : Object.keys(PROBES);
  for (const n of names) {
    if (!PROBES[n]) { log(`unknown probe "${n}". available: ${Object.keys(PROBES).join(', ')}`); continue; }
    log(`\n===== probe: ${n} =====`);
    try { await PROBES[n](arg); } catch (e) { log('PROBE ERROR:', e.message); }
  }
}
main().catch(e => { console.error(e); process.exit(1); });
