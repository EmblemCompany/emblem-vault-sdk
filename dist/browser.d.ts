import { AiVaultInfo, Collection, MetaData, Vault } from './types';
import { NFT_DATA, checkContentType, decryptKeys, fetchData, getSatsConnectAddress, getTorusKeys, metadataAllProjects, signPSBT } from './utils';
import { generateTaprootAddressFromMnemonic, getPsbtTxnSize } from './derive';
import { BlockchainProvider, BlockchainType } from './providers';
import { EmblemVaultWalletClient, EmblemVaultWalletClientConfig } from './clients/emblemVaultWalletClient';
/**
 * Browser-compatible version of the Emblem Vault SDK
 * Note: This version excludes Solana functionality for better browser compatibility
 */
export declare class EmblemVaultSDK {
    apiKey: string;
    apiUrl: string;
    aiApiKey: string;
    aiApiUrl: string;
    providers: Map<BlockchainType, BlockchainProvider>;
    constructor(apiKey: string, apiUrl?: string, aiApiKey?: string, aiApiUrl?: string);
    registerProvider(type: BlockchainType, provider: BlockchainProvider): void;
    getProvider(type: BlockchainType): BlockchainProvider | undefined;
    hasProvider(type: BlockchainType): boolean;
    getOrDetectProvider(type: BlockchainType): Promise<any>;
    createWalletClient(config: EmblemVaultWalletClientConfig): EmblemVaultWalletClient;
    getAssetMetadata(projectName: string, strict?: boolean, overrideFunc?: Function | boolean): Promise<MetaData[]>;
    getAllAssetMetadata(overrideFunc?: Function | boolean): Promise<MetaData[]>;
    getRemoteAssetMetadata(overrideFunc?: Function | boolean): Promise<any>;
    fetchCuratedContracts(overrideFunc?: Function | boolean): Promise<Collection[]>;
    fetchCuratedContractByName(name: string, overrideFunc?: Function | boolean): Promise<Collection | undefined>;
    fetchVaultsOfType(type: string, overrideFunc?: Function | boolean): Promise<Vault[]>;
    fetchVaultsForAddress(address: string, overrideFunc?: Function | boolean): Promise<Vault[]>;
    makeTemplate(functions?: any, overrideFunc?: Function | boolean): any;
    loadWeb3(provider: any): Promise<any | undefined>;
    getVaultInfo(vaultId: string, apiKey?: string, overrideFunc?: Function | boolean): Promise<AiVaultInfo>;
    getVersion(): string;
}
export { fetchData, decryptKeys, getTorusKeys, generateTaprootAddressFromMnemonic, getPsbtTxnSize, signPSBT, getSatsConnectAddress, NFT_DATA, metadataAllProjects, checkContentType };
