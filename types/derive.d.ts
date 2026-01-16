declare global {
    interface Window {
        bitcoin: any;
    }
}
export declare const generateTaprootAddressFromMnemonic: (phrase: string) => Promise<{
    p2tr: any;
    tweakedSigner: import("bip32/types/bip32").Signer;
    pubKey: Buffer;
    path: string;
    coin: string;
}>;
export declare const getPsbtTxnSize: (phrase: string, psbtBase64: string) => any;
