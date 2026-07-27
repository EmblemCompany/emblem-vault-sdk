#!/usr/bin/env node
/**
 * get_vaults.cjs — general-purpose: list vaults for a collection (the whole catalog).
 *
 * Collection-scoped, NOT address-scoped. Backed by the v3 catalog endpoint
 *   GET /vaults?project=<name>[&status=<status>]
 * (the same endpoint the emblem-vault-site "curated explorer" uses). It returns FULL
 * vault rows — tokenid, status, contract, externalTokenId, serialNumber, category,
 * asset_name, owner, claimedBy, and the stored `balances` inline — for every vault in
 * the collection (not a random sample). This is the building block for auditing a
 * collection's vaults / balance checker.
 *
 * READ-ONLY. Needs an x-api-key (the /vaults route is requireApiKey). Pass it with
 * --key, or set EMBLEM_API_KEY in the env. Without a key the endpoint returns nothing.
 *
 * Usage:
 *   EMBLEM_API_KEY=... node get_vaults.cjs --name "NodeMonkes" [options]
 *
 * Options:
 *   --name <collection>   collection/project name (required), as stored in curatedCollections
 *   --status <s>          filter: minted | unminted | claimed (default: all)
 *   --n <count>           cap rows returned (default: all)
 *   --fields <a,b,c>      only these fields per row (default: a useful subset)
 *   --key <apiKey>        x-api-key (else uses $EMBLEM_API_KEY)
 *   --v3 <url>            v3 base (default https://v3.emblemvault.io)
 *   --counts              print only status counts for the collection, then exit
 *   --json                emit JSON (default: TSV lines)
 *
 * Examples:
 *   node get_vaults.cjs --name NodeMonkes --counts
 *   node get_vaults.cjs --name NodeMonkes --status minted --json
 *   node get_vaults.cjs --name "Rare Pepe" --status minted --n 5 --fields tokenid,asset_name,balances
 */

const https = require('https');
const { URL } = require('url');

const DEFAULT_FIELDS = ['tokenid', 'status', 'network', 'category', 'asset_name', 'externalTokenId', 'serialNumber'];

function parseArgs(argv) {
  const o = { name: null, status: null, n: 0, fields: null, key: process.env.EMBLEM_API_KEY || '', v3: 'https://v3.emblemvault.io', counts: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--name') o.name = argv[++i];
    else if (a === '--status') o.status = argv[++i];
    else if (a === '--n') o.n = parseInt(argv[++i], 10) || 0;
    else if (a === '--fields') o.fields = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--key') o.key = argv[++i];
    else if (a === '--v3') o.v3 = argv[++i];
    else if (a === '--counts') o.counts = true;
    else if (a === '--json') o.json = true;
  }
  return o;
}

function get(url, apiKey, timeoutMs = 60000) {
  return new Promise((resolve) => {
    let done = false; const finish = (v) => { if (!done) { done = true; resolve(v); } };
    try {
      const u = new URL(url);
      const req = https.get(u, { headers: apiKey ? { 'x-api-key': apiKey } : {} }, (res) => {
        let body = ''; res.on('data', (c) => (body += c));
        res.on('end', () => { let j = null; try { j = JSON.parse(body); } catch {} finish({ status: res.statusCode, json: j, raw: body }); });
      });
      req.on('error', (e) => finish({ status: 0, json: null, error: e.message }));
      req.setTimeout(timeoutMs, () => { req.destroy(); finish({ status: 0, json: null, error: `timeout ${timeoutMs}ms` }); });
    } catch (e) { finish({ status: 0, json: null, error: e.message }); }
  });
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (!o.name) { console.error('--name <collection> is required'); process.exit(2); }
  if (!o.key) console.error('WARN: no api key (--key or $EMBLEM_API_KEY); /vaults may return nothing');

  // /vaults?project=X returns the whole collection; the &status param is ignored when
  // combined with project, so we filter status client-side.
  const url = `${o.v3}/vaults?project=${encodeURIComponent(o.name)}`;
  const res = await get(url, o.key);
  if (res.status !== 200) { console.error(`ERROR: /vaults HTTP ${res.status}${res.error ? ' ' + res.error : ''} — ${(res.raw || '').slice(0, 120)}`); process.exit(1); }

  let rows = Array.isArray(res.json) ? res.json : (res.json?.data || res.json?.vaults || []);

  if (o.counts) {
    const by = {};
    for (const r of rows) by[r.status] = (by[r.status] || 0) + 1;
    console.log(JSON.stringify({ collection: o.name, total: rows.length, byStatus: by }, null, 2));
    return;
  }

  if (o.status) rows = rows.filter((r) => r.status === o.status);
  if (o.n) rows = rows.slice(0, o.n);
  const fields = o.fields || DEFAULT_FIELDS;

  if (o.json) {
    console.log(JSON.stringify(rows.map((r) => Object.fromEntries(fields.map((f) => [f, r[f]]))), null, 2));
    return;
  }
  if (!rows.length) { console.error(`(no vaults for "${o.name}"${o.status ? ' status=' + o.status : ''})`); return; }
  console.log(fields.join('\t'));
  for (const r of rows) {
    console.log(fields.map((f) => {
      const v = r[f];
      return v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v));
    }).join('\t'));
  }
}

main().catch((e) => { console.error('ERROR:', e && e.stack ? e.stack : e); process.exit(1); });
