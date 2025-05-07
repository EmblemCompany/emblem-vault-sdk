import { BigNumber } from '@ethersproject/bignumber';
import { AiVaultInfo, Balance, Collection, CuratedCollectionsResponse, MetaData, Ownership, v3LocalMintSignature, Vault } from './types';
import { BlockchainType } from './providers';
import { EmblemVaultWalletClient, EmblemVaultWalletClientConfig } from './clients/emblemVaultWalletClient';
import { EmblemVaultSolanaWalletClient, EmblemVaultSolanaWalletClientConfig } from './clients/emblemVaultSolanaWalletClient';
export declare class EmblemVaultSDK {
    private apiKey;
    private baseUrl;
    private v3Url;
    private sigUrl;
    private aiUrl;
    private aiApiKey?;
    private byoKey?;
    private providerManager;
    version: string;
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
     * Creates a Wallet Client instance powered by the Emblem Vault TEE signer.
     *
     * @param config - Configuration specific to the wallet client, like the walletId.
     * @returns An EmblemVaultWalletClient instance.
     */
    createWalletClient(config: Omit<EmblemVaultWalletClientConfig, 'sdk'>): EmblemVaultWalletClient;
    /**
     * Creates a Solana Wallet Client instance powered by the Emblem Vault TEE signer.
     *
     * @param config - Configuration specific to the Solana wallet client, like the walletId.
     * @returns An EmblemVaultSolanaWalletClient instance.
     */
    createSolanaWalletClient(config: Omit<EmblemVaultSolanaWalletClientConfig, 'sdk'>): EmblemVaultSolanaWalletClient;
    /**
     * Ethereum Convenience
     *
     * @param config - Configuration specific to the Solana wallet client, like the walletId.
     * @returns An EmblemVaultSolanaWalletClient instance.
     */
    getConnectedEthAccount(): Promise<string>;
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
    getBalanceCheckers(overrideFunc?: Function | null): Promise<any>;
    checkBalanceAtAddress(address: string, symbol: string, overrideFunc?: Function | null): Promise<any>;
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
    /**
     * Performs a mint operation on the blockchain.
     * @param web3 - The web3 instance to use for the transaction.
     * @param tokenId - The ID of the token to mint.
     * @param callback - Optional callback function to handle the transaction.
     * @returns A promise that resolves to the mint response.
     * @deprecated Use `performMintHelper` instead.
     */
    performMintChain(web3: any, tokenId: string, callback?: any): Promise<{
        mintResponse: any;
    }>;
    /**
     * Stub for new mint chain helper
     * @param amount - The amount of tokens to mint.
     * @param callback - Optional callback function to handle the transaction.
     * @returns A promise that resolves to the mint response.
     */
    performMintHelper(amount: number, callback?: any): Promise<BigNumber>;
    performClaimChain(web3: any, tokenId: string, serialNumber: any, callback?: any): Promise<any>;
    /**
     * Stub for new mint signature request
     * @param web3 - The web3 instance to use for the transaction.
     * @param tokenId - The ID of the token to mint.
     * @param callback - Optional callback function to handle the transaction.
     * @returns A promise that resolves to the mint signature.
     * @deprecated Use `requestV3LocalMintSignature` instead.
     */
    requestLocalMintSignature(web3: any, tokenId: string, callback?: any): Promise<any>;
    /**
     * Requests a signature for a curated minting operation. (ONLY ETHEREUM FOR NOW)
     * @param tokenId - The ID of the token to mint.
     * @param callback - Optional callback function to handle the transaction.
     * @param overrideFunc - Optional function to override the default behavior.
     * @returns A promise that resolves to the mint signature.
     */
    requestV3LocalMintSignature(tokenId: string, callback?: any, overrideFunc?: Function | null): Promise<v3LocalMintSignature>;
    /**
     * Requests a signature for a curated minting operation. (ONLY ETHEREUM FOR NOW)
     * @param tokenId - The ID of the token to mint.
     * @param signature - The signature for the curated minting operation.
     * @param callback - Optional callback function to handle the transaction.
     * @param overrideFunc - Optional function to override the default behavior.
     * @returns A promise that resolves to the remote mint signature.
     * @deprecated Use `requestV3RemoteMintSignature` instead.
     */
    requestRemoteMintSignature(web3: any, tokenId: string, signature: string, callback?: any, overrideFunc?: Function | null): Promise<any>;
    /**
     * Requests a signature for a curated minting operation. (ONLY ETHEREUM FOR NOW)
     * @param tokenId - The ID of the token to mint.
     * @param signature - The signature for the curated minting operation.
     * @param callback - Optional callback function to handle the transaction.
     * @param overrideFunc - Optional function to override the default behavior.
     * @returns A promise that resolves to the remote mint signature.
     */
    requestV3RemoteMintSignature(tokenId: string, signature: string, callback?: any, overrideFunc?: Function | null): Promise<any>;
    requestLocalClaimSignature(web3: any, tokenId: string, serialNumber: any, callback?: any): Promise<any>;
    requestRemoteClaimToken(web3: any, tokenId: string, signature: string, callback?: any, overrideFunc?: Function | null): Promise<any>;
    requestRemoteKey(tokenId: string, jwt: any, callback?: any, overrideFunc?: Function | null): Promise<any>;
    decryptVaultKeys(tokenId: string, dkeys: any, callback?: any, overrideFunc?: Function | null): Promise<any>;
    recoverSignerFromMessage(message: string, signature: string, overrideFunc?: Function | null): Promise<string>;
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
    performMint(web3: any, remoteMintSig: any, callback?: any): Promise<any>;
    performBurn(web3: any, tokenId: any, callback?: any): Promise<any>;
    contentTypeReport(url: string): Promise<unknown>;
    legacyBalanceFromContractByAddress(web3: any, address: string): Promise<number[]>;
    refreshLegacyOwnership(web3: any, address: string): Promise<void>;
    refreshERC1155Ownership(web3: any, contractAddress: string, address: string): Promise<number[]>;
    refreshERC721Ownership(web3: any, contractAddress: string, address: string): Promise<number[]>;
    getContractTokenIdsByTargetContractName(contractName: string, distinct: boolean): Promise<any>;
    getTokenIdInternalTokenIdMapByTargetContractName(contractName: string): Promise<any>;
    checkLiveliness(tokenId: string, chainId?: number): Promise<any>;
    checkLivelinessBulk(tokenIds: string[], chainId?: number): Promise<any[]>;
    sweepVaultUsingPhrase(phrase: string, satsPerByte?: number, broadcast?: boolean): Promise<unknown>;
}
declare global {
    interface Window {
        EmblemVaultSDK: any;
    }
}
