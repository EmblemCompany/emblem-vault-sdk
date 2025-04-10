"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPsbtTxnSize = exports.generateTaprootAddressFromMnemonic = void 0;
const bip32_1 = require("bip32");
const bip39 = __importStar(require("bip39"));
// import bitcoin from "bitcoinjs-lib";
const ecc = __importStar(require("@bitcoin-js/tiny-secp256k1-asmjs"));
const bip32 = (0, bip32_1.BIP32Factory)(ecc);
const generateTaprootAddressFromMnemonic = (phrase) => __awaiter(void 0, void 0, void 0, function* () {
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
    const tweakedSigner = childNode.tweak(bitcoin.crypto.taggedHash("TapTweak", childNodeXOnlyPubkey));
    return { p2tr, tweakedSigner, pubKey: childNodeXOnlyPubkey, path, coin };
});
exports.generateTaprootAddressFromMnemonic = generateTaprootAddressFromMnemonic;
// this is a hack to get the virtual size of the transaction
// we sign it with a dummy key and then extract the transaction
// it should be very close to 100% accurate
const getPsbtTxnSize = (phrase, psbtBase64) => {
    var _a, _b;
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
    const tweakedSigner = rootNode.tweak(bitcoin.crypto.taggedHash("TapTweak", childNodeXOnlyPubkey));
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
            redeemScript: (_a = p2sh.redeem) === null || _a === void 0 ? void 0 : _a.output,
        });
    }
    const address = (_b = parsedPsbt.txOutputs[0]) === null || _b === void 0 ? void 0 : _b.address;
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
exports.getPsbtTxnSize = getPsbtTxnSize;
//# sourceMappingURL=derive.js.map