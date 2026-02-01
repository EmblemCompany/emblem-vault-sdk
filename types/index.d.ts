import { BigNumber } from '@ethersproject/bignumber';
import type { Collection, CuratedCollectionsResponse, MetaData, Ownership, Vault, ProgressCallback, MintResult, ClaimResult, EmblemVaultClient } from './types';
declare class EmblemVaultSDK {
    private apiKey;
    private baseUrl;
    private v3Url;
    private sigUrl;
    constructor(apiKey: string, baseUrl?: string, v3Url?: string, sigUrl?: string);
    generateUploadUrl(): void;
    getAssetMetadata(projectName: string, strict?: boolean): any[];
    getAllAssetMetadata(): any[];
    getRemoteAssetMetadataProjectList(): Promise<any>;
    getRemoteAssetMetadata(asset_name: string): Promise<any>;
    getRemoteAssetMetadataVaultedProjectList(): Promise<any>;
    getAllProjects(): any[];
    fetchCuratedContracts(hideUnMintable?: boolean, overrideFunc?: Function | boolean): Promise<CuratedCollectionsResponse>;
    fetchCuratedContractByName(name: string, contracts?: any): Promise<Collection | null>;
    createCuratedVault(template: any, callback?: any): Promise<Vault>;
    refreshOwnershipForTokenId(tokenId: string, callback?: any): Promise<Ownership[]>;
    refreshOwnershipForAccount(account: string, callback?: any): Promise<Ownership[]>;
    fetchMetadata(tokenId: string, callback?: any): Promise<MetaData>;
    refreshBalance(tokenId: string, callback?: any): Promise<MetaData>;
    /**
     * Fetch vaults of a specific type for an address.
     * @param vaultType - The vault type: "vaulted", "unvaulted", or "created"
     * @param address - The wallet address to fetch vaults for
     * @param options - Optional pagination options
     * @param options.page - Page number (1-indexed). If provided, returns paginated response.
     * @param options.limit - Number of results per page (default: 100)
     * @returns Array of vaults (unpaginated) or { data, pagination } object (paginated)
     */
    fetchVaultsOfType(vaultType: string, address: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<any>;
    /**
     * Fetch all vaults of a specific type, automatically handling pagination.
     * @param vaultType - The vault type: "vaulted", "unvaulted", or "created"
     * @param address - The wallet address to fetch vaults for
     * @param onProgress - Optional callback for progress updates (page, totalPages, total)
     * @returns Array of all vaults
     */
    fetchAllVaultsOfType(vaultType: string, address: string, onProgress?: (page: number, totalPages: number, total: number) => void): Promise<any[]>;
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
    private getSdkContext;
    performMintChainWithClient(client: EmblemVaultClient, tokenId: string, chainId?: number | 'solana', callback?: ProgressCallback): Promise<MintResult>;
    performClaimChainWithClient(client: EmblemVaultClient, tokenId: string, chainId?: number | 'solana', callback?: ProgressCallback): Promise<ClaimResult>;
    deleteVaultWithClient(client: EmblemVaultClient, tokenId: string, chainId?: number | 'solana', callback?: ProgressCallback): Promise<boolean>;
    sweepVaultUsingPhrase(phrase: string, satsPerByte?: number, broadcast?: boolean): Promise<unknown>;
}
declare global {
    interface Window {
        EmblemVaultSDK: any;
        web3: any;
        ethereum: any;
    }
}
export default EmblemVaultSDK;
