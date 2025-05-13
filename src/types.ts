import { BlockchainType } from './providers';

export type ContractDetails = {
    [key: string]: string;
};

/**
 * Type that exactly matches the database schema for curated collections
 */
export type Collection = {
    id?: number;
    created_at: string;
    contracts: ContractDetails;
    name: string;
    nativeAssets: string[];
    mintable: boolean;
    autoLoad: boolean;
    addressChain: string;
    collectionType: string;
    loadTypes: string[];
    description: string | null;
    purchaseMethod: string | null;
    showBalance: boolean;
    balanceUrl: string | null;
    price: number | null;
    collectionChain: string;
    balanceQty: number | null;
    imageHandler: string | null;
    loadingImages: string[] | null;
    placeholderImages: string[] | null;
    balanceAfterLive: boolean | null;
    balanceCheckers: string[] | null;
    tokenIdScheme: string | null;
    vaultCollectionType: string;
    launch_ready: boolean;
    marketplace_ready: boolean;
    fusion: boolean;
    // These are not in the database but added during runtime
    generateVaultBody?: Function;
    generateCreateTemplate?: Function;
};

export interface MetaData {
    collection_name?: string;
    animation_url?: any;
    _id?: any;
    name?: any;
    ipfs?: any;
    tokenId?: any;
    description?: any;
    image?: any;
    image_ipfs?: any;
    ownedImage?: any;
    addresses?: any;
    network?: any;
    attributes?: any[];
    values?: any;
    totalValue?: number;
    private?: boolean;
    external_url?: string;
    status?: string;
    claimedBy?: string;
    youtube_url?: string;
    ciphertextV2?: string;
    live?: boolean;
    nonce?: number;
    signature?: string;
    to?: string,
    is_dynamic?: boolean,
    platform?: string,
    curation_status?: string,
    origDescription?: string,
    sealed?: boolean,
    collectionAddress?: string,
    targetAsset?: any,
    targetContract?: any,
    mintLocked?: boolean,
    mintLockBlock?: number,
    curatedIds?: any,
    ownedBy?: string,
    fraud?: boolean,
    batchId?: number;
    batch_index?: number;
    success?: boolean,
    coverImage?: string,
    move_targetContract?: any,
    move_targetAsset?: any,
    project?: any,
    background_color?: string,
    ownershipInfo?: any,
    alpha? : boolean
}

export type Balance = {
    coin: string;
    name?: string;
    balance: number;
    symbol?: string;
    address: string;
    type?: string;
    image?: string;
    qty?: number;
};

export type Address = {
    path?: string;
    address: string;
    coin: string;
    derivationPath?: string;
};

export type ContentType = {
    valid: boolean;
    contentType: string;
    extension: string;
    embed: boolean;
};

export type TargetContract = {
    "1": string;
    name: string;
    description?: string;
    tokenId?: string;
};

export type TargetAsset = {
    name: string;
    image: string;
    ownedImage: string;
    contentType?: ContentType;
    description?: string;
};

export type Vault = {
    name: string;
    version: number;
    basePath: string;
    pubkey: string;
    addresses: Address[];
    ciphertextV2: string;
    targetContract: TargetContract;
    targetAsset: TargetAsset;
    tokenId: string;
    to: string;
    network: string;
    live: boolean;
};

export type Ownership = {
    id: number;
    created_at: string;
    tokenId: string;
    owner: string;
    internalTokenId: string;
    serialNumber: string | null;
    contract: string;
    category: string;
    blockUpdated: string;
    createdBy: string;
    status: string;
    claimedBy: string | null;
    network: string;
}


export type CuratedCollectionsResponse = Collection[];

export type AiVaultInfo = {
    address: string;
    vaultId: string;
};

export type v3LocalMintSignature = {
    message: string;
    signature: string;
};

export interface WalletConfig {
    priority?: string[]; // Array of wallet identifiers (e.g., ['phantom', 'metamask'])
    autoConnectWallets?: BlockchainType[]; // Optional array of wallet types to auto-connect
}

// Extend Window interface globally
declare global {
    interface Window {
        ethereum?: any;
        phantom?: any;
        solflare?: any;
        trustWallet?: any;
        coinbaseWalletExtension?: any;
        bitcoin?: any; // Keep commented or remove if causing conflicts // window.HiroWalletProvider, btc, btc_providers
        HiroWalletProvider?: any;
        // Adjusted solana declaration
        solana?: any & {
            isPhantom?: boolean;
            isSolflare?: boolean;
            connect?: (options?: { onlyIfTrusted?: boolean }) => Promise<any>;
            set?: (config: Record<string, any>) => void;
        };
        // ... other potential wallet providers
        web3?: any; // Added based on providers.ts usage
    }
}
