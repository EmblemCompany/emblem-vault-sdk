import { BigNumber } from '@ethersproject/bignumber';
import { Balance, Collection, CuratedCollectionsResponse, MetaData, Ownership, Vault } from './types';
export declare class EmblemVaultSDK {
    private apiKey;
    private baseUrl;
    private v3Url;
    private sigUrl;
    constructor(apiKey: string, baseUrl?: string, v3Url?: string, sigUrl?: string);
    getCuratedAssetMetadata(projectName: string, strict?: boolean, overrideFunc?: Function | null): any[];
    getAssetMetadata(projectName: string, strict?: boolean, overrideFunc?: Function | null): any[];
    getAllCuratedAssetMetadata(overrideFunc?: Function | null): any;
    getAllAssetMetadata(overrideFunc?: Function | null): any;
    /**
     * @deprecated
     * This method is deprecated and will be removed in a future version.
     * Please use `getInventoryAssetMetadataProject` instead.
     */
    getRemoteAssetMetadataProjectList(overrideFunc?: Function | null): Promise<any>;
    getInventoryAssetMetadataProject(projectName?: string, overrideFunc?: Function | null): Promise<any>;
    getInventoryAssetMetadata(asset_name: string, overrideFunc?: Function | null): Promise<any>;
    getInventoryAssetMetadataVaultedProjectList(overrideFunc?: Function | null): Promise<any>;
    getAllCuratedProjects(overrideFunc?: Function | null): any[];
    fetchCuratedContracts(hideUnMintable?: boolean, overrideFunc?: Function | null): Promise<CuratedCollectionsResponse>;
    fetchCuratedContractByName(name: string, contracts?: any, overrideFunc?: Function | null): Promise<Collection | null>;
    createCuratedVault(template: any, callback?: any, overrideFunc?: Function | null): Promise<Vault>;
    refreshOwnershipForTokenId(tokenId: string, callback?: any, overrideFunc?: Function | null): Promise<Ownership[]>;
    refreshOwnershipForAccount(account: string, callback?: any, overrideFunc?: Function | null): Promise<Ownership[]>;
    fetchMetadata(tokenId: string, callback?: any, overrideFunc?: Function | null): Promise<MetaData>;
    refreshBalance(tokenId: string, callback?: any, overrideFunc?: Function | null): Promise<Balance[]>;
    fetchVaultsOfType(vaultType: string, address: string, overrideFunc?: Function | null): Promise<any>;
    generateJumpReport(address: string, hideUnMintable?: boolean, overrideFunc?: Function | null): Promise<unknown>;
    generateMintReport(address: string, hideUnMintable?: boolean, overrideFunc?: Function | null): Promise<unknown>;
    generateMigrateReport(address: string, hideUnMintable?: boolean, overrideFunc?: Function | null): Promise<unknown>;
    loadWeb3(): Promise<any | undefined>;
    performMintChain(web3: any, tokenId: string, collectionName: string, callback?: any): Promise<{
        mintResponse: any;
    }>;
    performClaimChain(web3: any, tokenId: string, serialNumber: any, callback?: any): Promise<any>;
    requestLocalMintSignature(web3: any, tokenId: string, callback?: any): Promise<any>;
    requestLocalClaimSignature(web3: any, tokenId: string, serialNumber: any, callback?: any): Promise<any>;
    requestRemoteMintSignature(web3: any, tokenId: string, signature: string, callback?: any, overrideFunc?: Function | null): Promise<any>;
    requestRemoteClaimToken(web3: any, tokenId: string, signature: string, callback?: any, overrideFunc?: Function | null): Promise<any>;
    requestRemoteKey(tokenId: string, jwt: any, callback?: any, overrideFunc?: Function | null): Promise<any>;
    decryptVaultKeys(tokenId: string, dkeys: any, callback?: any, overrideFunc?: Function | null): Promise<any>;
    /**
     * @deprecated This method is deprecated and will be removed in a future version.
     * Please use alternative methods for price quotation.
     */
    getQuote(web3: any, amount: number, callback?: any): Promise<BigNumber>;
    performMint(web3: any, quote: any, remoteMintSig: any, callback?: any): Promise<any>;
    performBurn(web3: any, tokenId: any, callback?: any): Promise<any>;
    contentTypeReport(url: string): Promise<unknown>;
    legacyBalanceFromContractByAddress(web3: any, address: string): Promise<number[]>;
    refreshLegacyOwnership(web3: any, address: string): Promise<void>;
    checkLiveliness(tokenId: string, chainId?: number): Promise<any>;
    checkLivelinessBulk(tokenIds: string[], chainId?: number): Promise<any[]>;
    sweepVaultUsingPhrase(phrase: string, satsPerByte?: number, broadcast?: boolean): Promise<unknown>;
}
declare global {
    interface Window {
        EmblemVaultSDK: any;
        web3: any;
        ethereum: any;
    }
}
