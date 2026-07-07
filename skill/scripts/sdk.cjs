#!/usr/bin/env node
/**
 * emblem-vault-sdk runner — a general-purpose wrapper an agent uses to run ARBITRARY
 * SDK code and see the result. This is NOT a fixed menu of probes; you write the code.
 *
 * The SDK is booted for you and exposed as `sdk` (an EmblemVaultSDK instance). Your
 * snippet runs in an async scope, so you can `await` directly. Whatever you return (or
 * whatever your final expression evaluates to) is printed as pretty JSON. `console.log`
 * inside your snippet also works. Everything here is your code — keep it READ-ONLY if
 * you're probing production (no signer is wired, so writes/mint/claim can't run anyway).
 *
 * Setup (once): globally install the published SDK so this can require it from anywhere:
 *   npm install -g emblem-vault-sdk      # or: pnpm add -g emblem-vault-sdk
 *
 * Invoke with NODE_PATH pointing at the global modules:
 *
 *   # 1) inline expression (-e):
 *   NODE_PATH="$(npm root -g)" node sdk.cjs -e "await sdk.fetchCuratedContracts(false)"
 *   NODE_PATH="$(npm root -g)" node sdk.cjs -e "(await sdk.fetchMetadata('9260569240430531')).status"
 *
 *   # 2) multi-line snippet from a file:
 *   NODE_PATH="$(npm root -g)" node sdk.cjs path/to/snippet.js
 *
 *   # 3) snippet piped on stdin:
 *   echo "return sdk.getAllProjects().length" | NODE_PATH="$(npm root -g)" node sdk.cjs
 *
 * Options:
 *   -e, --eval <code>   run <code> as the snippet (instead of a file/stdin)
 *   --key <apiKey>      SDK constructor key (default 'demo'; any non-empty string works for reads)
 *   --raw               print the result with console.dir depth:null instead of JSON
 *                       (use when the result has functions/BigInts/circular refs)
 *   --quiet             suppress the SDK's own version banner
 *
 * Notes for the agent:
 *   - `sdk` is in scope. So are `EmblemVaultSDK` (the class) and `require` (to pull in helpers).
 *   - Prefer returning a value; if you only console.log, that's fine too.
 *   - Results are JSON-serialized by default — functions are dropped, BigInts stringified.
 *     Use --raw for a structural dump that keeps those.
 *   - This wrapper is the general tool; the older probe.cjs is just canned examples built on
 *     the same idea. When you need something new, write a snippet here rather than editing probe.cjs.
 */
const fs = require('fs');

function parseArgs(argv) {
  const o = { key: 'demo', raw: false, quiet: false, eval: null, file: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-e' || a === '--eval') o.eval = argv[++i];
    else if (a === '--key') o.key = argv[++i];
    else if (a === '--raw') o.raw = true;
    else if (a === '--quiet') o.quiet = true;
    else if (!o.file && !a.startsWith('-')) o.file = a;
  }
  return o;
}

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

// JSON that survives BigInt and drops functions; keeps output readable.
function toJson(v) {
  return JSON.stringify(v, (_k, val) => (typeof val === 'bigint' ? val.toString() : val), 2);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  // Resolve the snippet from -e, a file, or stdin (in that order).
  let code = opts.eval;
  if (!code && opts.file) code = fs.readFileSync(opts.file, 'utf8');
  if (!code && !process.stdin.isTTY) code = readStdin();
  if (!code || !code.trim()) {
    console.error('No code to run. Use -e "<code>", a file arg, or pipe a snippet on stdin. See header for usage.');
    process.exit(2);
  }

  // Silence the SDK banner if asked (it console.logs its version on construct).
  let restore;
  if (opts.quiet) {
    const orig = console.log;
    console.log = (...a) => { if (!(typeof a[0] === 'string' && a[0].startsWith('EmblemVaultSDK version'))) orig(...a); };
    restore = () => (console.log = orig);
  }

  const EmblemVaultSDK = require('emblem-vault-sdk').default;
  const sdk = new EmblemVaultSDK(opts.key);
  restore && restore();

  // Wrap the snippet in an async function with sdk/EmblemVaultSDK/require in scope.
  // If the snippet has no explicit `return`, we still capture its last expression by
  // trying it as a returned expression first, then falling back to statement mode.
  const AsyncFn = Object.getPrototypeOf(async function () {}).constructor;
  let result, ran = false;
  try {
    const fn = new AsyncFn('sdk', 'EmblemVaultSDK', 'require', `return (${code}\n);`);
    result = await fn(sdk, EmblemVaultSDK, require);
    ran = true;
  } catch (_) {
    // Not a single expression — run as a statement block (needs its own `return`).
  }
  if (!ran) {
    const fn = new AsyncFn('sdk', 'EmblemVaultSDK', 'require', code);
    result = await fn(sdk, EmblemVaultSDK, require);
  }

  if (result === undefined) return; // snippet only printed via console.log
  if (opts.raw) console.dir(result, { depth: null });
  else console.log(toJson(result));
}

main().catch(e => { console.error('ERROR:', e && e.stack ? e.stack : e); process.exit(1); });
