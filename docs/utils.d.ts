export declare const NFT_DATA: any;
export declare const pad: (num: string | any[], size: number) => string | null;
export declare const evaluateFacts: (allowed: boolean, facts: {
    eval: any;
    msg: string;
}[], msgCallback: any) => boolean;
export declare const metadataObj2Arr: (data: any) => any[];
export declare const metadataAllProjects: (projects: any[]) => any[];
export declare const fetchData: (url: string, apiKey: string, method?: string, body?: any, headers?: any) => Promise<any>;
export declare function generateAttributeTemplate(record: any): any;
export declare function generateImageTemplate(record: any): any;
/**
 * generateTemplate defines rules and utilitites for a given curated
 * collection. This is used by callers, like emblem.finance website
 * to display vaults belonging to a curated collection with appropriate
 * data and actions.
 *
 * @param record is a curated collection record as defined in
 * the Emblem database.
 */
export declare function generateTemplate(record: any): any;
export declare function templateGuard(input: {
    [x: string]: any;
    hasOwnProperty: (arg0: string) => any;
}, options?: {
    throwError?: boolean;
    returnErrors?: boolean;
}): {
    valid: boolean;
    errors: any[];
};
export declare function genericGuard(input: any, type: string, key: string): void;
export declare function getQuoteContractObject(web3: any): Promise<any>;
export declare function getHandlerContract(web3: any): Promise<any>;
export declare function getLegacyContract(web3: any): Promise<any>;
export declare function getERC1155Contract(web3: any, address: string): Promise<any>;
export declare function getERC721AContract(web3: any, address: string): Promise<any>;
export declare function checkContentType(url: string): Promise<unknown>;
export declare const COIN_TO_NETWORK: any;
export declare function getTorusKeys(verifierId: string, idToken: any, cb?: any): Promise<{
    privateKey: any;
}>;
export declare function decryptKeys(vaultCiphertextV2: any, keys: any, addresses: any[]): Promise<any>;
interface SatsConnectAddress {
    paymentAddress: string;
    paymentPublicKey: string;
    ordinalsAddress: string;
}
export declare function getSatsConnectAddress(): Promise<SatsConnectAddress>;
export declare function signPSBT(psbtBase64: any, paymentAddress: any, indexes: number[], broadcast?: boolean): Promise<unknown>;
export {};
