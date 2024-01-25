import { BigNumber } from '@ethersproject/bignumber';
import { Collection, CuratedCollectionsResponse, MetaData, Vault } from './types';
declare class EmblemVaultSDK {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string, baseUrl?: string);
    generateUploadUrl(): void;
    getAssetMetadata(projectName: string, strict?: boolean): any[];
    getAllAssetMetadata(): any[];
    getAllProjects(): any[];
    fetchCuratedContracts(hideUnMintable?: boolean, overrideFunc?: Function | boolean): Promise<CuratedCollectionsResponse>;
    fetchCuratedContractByName(name: string): Promise<Collection | null>;
    createCuratedVault(template: any, callback?: any): Promise<Vault>;
    fetchMetadata(tokenId: string, callback?: any): Promise<MetaData>;
    fetchVaultsOfType(vaultType: string, address: string): Promise<any>;
    loadWeb3(): Promise<any | undefined>;
    performMintChain(web3: any, tokenId: string, collectionName: string, callback?: any): Promise<{
        mintResponse: any;
    }>;
    requestLocalMintSignature(web3: any, tokenId: string, callback?: any): Promise<any>;
    requestRemoteMintSignature(web3: any, tokenId: string, signature: string, callback?: any): Promise<any>;
    getQuote(web3: any, amount: number, callback?: any): Promise<BigNumber>;
    performMint(web3: any, quote: any, remoteMintSig: any, callback?: any): Promise<any>;
    contentTypeReport(url: string): Promise<unknown>;
}
declare global {
    interface Window {
        EmblemVaultSDK: any;
        web3: any;
        ethereum: any;
    }
}
export default EmblemVaultSDK;
