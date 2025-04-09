import { BigNumber } from '@ethersproject/bignumber';
import { AiVaultInfo, Balance, Collection, CuratedCollectionsResponse, MetaData, Ownership, Vault } from './types';
import { BlockchainType } from './providers';
export declare class EmblemVaultSDK {
    private apiKey;
    private baseUrl;
    private v3Url;
    private sigUrl;
    private aiUrl;
    private aiApiKey?;
    private byoKey?;
    private providers;
    constructor(apiKey: string, baseUrl?: string, v3Url?: string, sigUrl?: string, aiUrl?: string, aiApiKey?: string, byoKey?: string);
    /**
     * Register a blockchain provider for a specific blockchain type
     * @param type The blockchain type
     * @param provider The provider instance
     */
    registerProvider(type: BlockchainType, provider: any): void;
    /**
     * Get a registered provider for a specific blockchain type
     * @param type The blockchain type
     * @returns The provider instance or undefined if not registered
     */
    getProvider(type: BlockchainType): any;
    /**
     * Check if a provider is registered for a specific blockchain type
     * @param type The blockchain type
     * @returns True if a provider is registered for the specified type
     */
    hasProvider(type: BlockchainType): boolean;
    /**
     * Get or detect a provider for a specific blockchain type
     * If a provider is registered, it will be returned
     * Otherwise, it will try to detect a provider in the environment
     * @param type The blockchain type
     * @returns A promise that resolves to the provider instance
     * @throws Error if no provider is available
     */
    getOrDetectProvider(type: BlockchainType): Promise<any>;
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
     * ** Emblem Vault AI **
     *
     * Be sure to allow api key requests, or api_key_hash and auth sig (wallet, socialAuth, oAuth)
     * Here we will begin using the aiApiKey and the aiUrl to communicate with the ai vault system
     *
     */
    vaultInfoFromApiKey(aiApiKey?: string, full?: boolean, overrideFunc?: Function | null): Promise<AiVaultInfo>;
    /**
     * @deprecated This method is deprecated and will be removed in a future version.
     * Please use alternative methods for price quotation.
     */
    getQuote(web3: any, amount: number, callback?: any): Promise<BigNumber>;
    performMint(web3OrQuote: any, quoteOrRemoteMintSig: any, remoteMintSigOrCallback?: any, callback?: any): Promise<any>;
    performBurn(web3OrTokenId: any, tokenIdOrCallback?: any, callbackOrOverride?: any, overrideFunc?: Function | null): Promise<any>;
    contentTypeReport(url: string): Promise<unknown>;
    legacyBalanceFromContractByAddress(web3OrAddress: any, address?: string, overrideFunc?: Function | null): Promise<any>;
    refreshLegacyOwnership(web3OrAddress: any, address?: string, overrideFunc?: Function | null): Promise<any>;
    checkLiveliness(tokenId: string, chainId?: number): Promise<any>;
    checkLivelinessBulk(tokenIds: string[], chainId?: number): Promise<any[]>;
    sweepVaultUsingPhrase(phrase: string, satsPerByte?: number, broadcast?: boolean): Promise<unknown>;
    getCuratedAssetMetadata(projectName: string, strict?: boolean, overrideFunc?: Function | null): any[];
    getAssetMetadata(projectName: string, strict?: boolean, overrideFunc?: Function | null): any[];
    getAllCuratedAssetMetadata(overrideFunc?: Function | null): any;
    getAllAssetMetadata(overrideFunc?: Function | null): any;
}
declare global {
    interface Window {
        EmblemVaultSDK: any;
    }
}
