import { BIP32Factory } from "bip32";
import * as bip39 from "bip39";
// import bitcoin from "bitcoinjs-lib";

import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { hmac } from "@noble/hashes/hmac";
import { sha512 } from "@noble/hashes/sha512";
import { ed25519 } from "@noble/curves/ed25519";
// bs58@4 ships no type declarations; require it (CJS) to avoid TS7016.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bs58: { encode: (b: Uint8Array) => string; decode: (s: string) => Uint8Array } = require("bs58");

const bip32 = BIP32Factory(ecc);

// --- Solana (ed25519 SLIP-0010) HD derivation ---
// Solana uses ed25519, NOT secp256k1, so bip32/bitcoinjs can't derive it. We do the
// SLIP-0010 ed25519 derivation via @noble (browser-safe, already a dependency; NOT
// @solana/web3.js — that heavy dep is the conflict that got SOL derivation disabled).
// Path m/44'/501'/0'/0' (all hardened) is the Phantom/Solflare standard. This matches
// the serverless vault-creation derivation byte-for-byte, so a claimed vault's SOL key
// re-derives to the stored address.
const SOLANA_PATH = "m/44'/501'/0'/0'";

function slip10DeriveEd25519Seed(pathStr: string, seed: Uint8Array): Uint8Array {
  let I = hmac(sha512, new TextEncoder().encode("ed25519 seed"), seed);
  let key = I.slice(0, 32);
  let chain = I.slice(32);
  for (const seg of pathStr.split("/").slice(1)) {
    const idx = ((parseInt(seg, 10) | 0x80000000) >>> 0); // all segments hardened
    const data = new Uint8Array(1 + 32 + 4);
    data[0] = 0;
    data.set(key, 1);
    data[33] = (idx >>> 24) & 255;
    data[34] = (idx >>> 16) & 255;
    data[35] = (idx >>> 8) & 255;
    data[36] = idx & 255;
    I = hmac(sha512, chain, data);
    key = I.slice(0, 32);
    chain = I.slice(32);
  }
  return key; // 32-byte ed25519 seed
}

// Derive the Solana address + Phantom-importable secret key from a vault mnemonic.
// Returns { address (base58 pubkey), secretKey (base58 of the 64-byte secret), path, coin }.
export const deriveSolanaFromMnemonic = (phrase: string) => {
  const seed = bip39.mnemonicToSeedSync(phrase);
  const priv = slip10DeriveEd25519Seed(SOLANA_PATH, new Uint8Array(seed));
  const pub = ed25519.getPublicKey(priv);
  const secret = new Uint8Array(64);
  secret.set(priv, 0);
  secret.set(pub, 32);
  return {
    address: bs58.encode(pub),
    secretKey: bs58.encode(secret), // 64-byte secret, base58 — import into Phantom/Solflare
    path: SOLANA_PATH,
    coin: "SOL",
  };
};

// let mainnet: any = {"messagePrefix":"\u0018Bitcoin Signed Message:\n","bech32":"bc","bip32":{"public":76067358,"private":76066276},"pubKeyHash":0,"scriptHash":5,"wif":128}
declare global {
    interface Window {
      bitcoin: any;
    }
  }
export const generateTaprootAddressFromMnemonic = async (phrase: string) => {
  let bitcoin = window.bitcoin;
  let mainnet = bitcoin.networks.mainnet;
  bitcoin.initEccLib(ecc);
  const seed = bip39.mnemonicToSeedSync(phrase);

  const rootKey = bip32.fromSeed(seed, mainnet);

  const path = `m/86'/0'/0'/0/0`;
  const coin = "TAP";
  const childNode = rootKey.derivePath(path);
  const childNodeXOnlyPubkey = childNode.publicKey.slice(1);
  const p2tr = bitcoin.payments.p2tr({
    internalPubkey: childNodeXOnlyPubkey,
    network: mainnet,
  });

  const tweakedSigner = childNode.tweak(
    bitcoin.crypto.taggedHash("TapTweak", childNodeXOnlyPubkey)
  );

  return { p2tr, tweakedSigner, pubKey: childNodeXOnlyPubkey, path, coin };
};

// this is a hack to get the virtual size of the transaction
// we sign it with a dummy key and then extract the transaction
// it should be very close to 100% accurate
export const getPsbtTxnSize = (phrase: string, psbtBase64: string) => {
    let bitcoin = window.bitcoin;
    let mainnet = bitcoin.networks.mainnet;
  const parsedPsbt = bitcoin.Psbt.fromBase64(psbtBase64);

  const psbt = new bitcoin.Psbt();

  const seed = bip39.mnemonicToSeedSync(phrase);
  const rootNode = bip32.fromSeed(seed, mainnet);

  // we know first one is the taproot input
  const childNodeXOnlyPubkey = rootNode.publicKey.slice(1);
  const p2tr = bitcoin.payments.p2tr({
    internalPubkey: childNodeXOnlyPubkey,
    network: mainnet,
  });

  const tweakedSigner = rootNode.tweak(
    bitcoin.crypto.taggedHash("TapTweak", childNodeXOnlyPubkey)
  );

  psbt.addInput({
    hash: "0000000000000000000000000000000000000000000000000000000000000000",
    index: 0,
    witnessUtxo: {
      script: p2tr.output || Buffer.alloc(0),
      value: 1000,
    },
    tapInternalKey: childNodeXOnlyPubkey,
  });

  // and the rest are p2sh inputs
  const p2wpkh = bitcoin.payments.p2wpkh({
    pubkey: rootNode.publicKey,
    network: mainnet,
  });
  const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network: mainnet });

  for (let i = 1; i < parsedPsbt.inputCount; i++) {
    psbt.addInput({
      hash: "0000000000000000000000000000000000000000000000000000000000000000",
      index: i,
      witnessUtxo: {
        script: p2sh.output || Buffer.alloc(0),
        value: 100000,
      },
      redeemScript: p2sh.redeem?.output,
    });
  }
  const address = parsedPsbt.txOutputs[0]?.address;
  if (!address) {
    throw new Error("Address is undefined");
  }

  psbt.addOutput({
    address,
    value: 1000,
  });

  psbt.addOutput({
    script: p2sh.output || Buffer.alloc(0),
    value: 10000,
  });

  // sign inputs
  psbt.signInput(0, tweakedSigner);
  for (let i = 1; i < psbt.inputCount; i++) {
    psbt.signInput(i, rootNode);
  }

  psbt.finalizeAllInputs();

  return psbt.extractTransaction().virtualSize();
};