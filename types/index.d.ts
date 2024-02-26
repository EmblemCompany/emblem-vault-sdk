/// <reference types="node" />
import { BigNumber } from '@ethersproject/bignumber';
import { Collection, CuratedCollectionsResponse, MetaData, Vault } from './types';
interface SatsConnectAddress {
    paymentAddress: string;
    paymentPublicKey: string;
    ordinalsAddress: string;
}
declare class EmblemVaultSDK {
    private apiKey;
    private baseUrl;
    private v3Url;
    private v1Url;
    private sigUrl;
    constructor(apiKey: string, baseUrl?: string);
    generateUploadUrl(): void;
    getAssetMetadata(projectName: string, strict?: boolean): any[];
    getAllAssetMetadata(): any[];
    getAllProjects(): any[];
    fetchCuratedContracts(hideUnMintable?: boolean, overrideFunc?: Function | boolean): Promise<CuratedCollectionsResponse>;
    fetchCuratedContractByName(name: string, contracts?: any): Promise<Collection | null>;
    createCuratedVault(template: any, callback?: any): Promise<Vault>;
    fetchMetadata(tokenId: string, callback?: any): Promise<MetaData>;
    refreshBalance(tokenId: string, callback?: any): Promise<MetaData>;
    fetchVaultsOfType(vaultType: string, address: string): Promise<any>;
    generateJumpReport(address: string, hideUnMintable?: boolean): Promise<unknown>;
    generateMintReport(address: string, hideUnMintable?: boolean): Promise<unknown>;
    generateMigrateReport(address: string, hideUnMintable?: boolean): Promise<unknown>;
    loadWeb3(): Promise<any | undefined>;
    performMintChain(web3: any, tokenId: string, collectionName: string, callback?: any): Promise<{
        mintResponse: any;
    }>;
    performClaimChain(web3: any, tokenId: string, serialNumber: any, callback?: any): Promise<any>;
    requestLocalMintSignature(web3: any, tokenId: string, callback?: any): Promise<any>;
    requestLocalClaimSignature(web3: any, tokenId: string, serialNumber: any, callback?: any): Promise<any>;
    requestRemoteMintSignature(web3: any, tokenId: string, signature: string, callback?: any): Promise<any>;
    requestRemoteClaimToken(web3: any, tokenId: string, signature: string, callback?: any): Promise<any>;
    requestRemoteKey(tokenId: string, jwt: any, callback?: any): Promise<{
        privateKey: any;
    }>;
    decryptVaultKeys(tokenId: string, dkeys: any, callback?: any): Promise<any>;
    getQuote(web3: any, amount: number, callback?: any): Promise<BigNumber>;
    performMint(web3: any, quote: any, remoteMintSig: any, callback?: any): Promise<any>;
    performBurn(web3: any, tokenId: any, callback?: any): Promise<any>;
    contentTypeReport(url: string): Promise<unknown>;
    legacyBalanceFromContractByAddress(web3: any, address: string): Promise<number[]>;
    refreshLegacyOwnership(web3: any, address: string): Promise<void>;
    checkLiveliness(tokenId: string, chainId?: number): Promise<any>;
    checkLivelinessBulk(tokenIds: string[], chainId?: number): Promise<any[]>;
    getSatsConnectAddress(): Promise<SatsConnectAddress>;
    generatePSBT(phrase: string, satsPerByte?: number): Promise<void>;
    getTaprootAddressFromMnemonic(phrase: string): Promise<{
        p2tr: any;
        tweakedSigner: import("bip32/types/bip32").Signer;
        pubKey: Buffer;
        path: string;
        coin: string;
    }>;
}
declare global {
    interface Window {
        EmblemVaultSDK: any;
        web3: any;
        ethereum: any;
    }
}
export default EmblemVaultSDK;
