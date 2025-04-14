import { BIP32Factory } from "bip32";
import * as bip39 from "bip39";
// import bitcoin from "bitcoinjs-lib";

import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'

const bip32 = BIP32Factory(ecc);

// let mainnet: any = {"messagePrefix":"\u0018Bitcoin Signed Message:\n","bech32":"bc","bip32":{"public":76067358,"private":76066276},"pubKeyHash":0,"scriptHash":5,"wif":128}
// declare global {
//     interface Window {
//       bitcoin: any;
//     }
//   }
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