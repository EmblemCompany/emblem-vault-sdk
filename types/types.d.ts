export type ContractDetails = {
    [key: string]: string;
};
export type Collection = {
    id: number;
    created_at: string;
    contracts: ContractDetails;
    name: string;
    nativeAssets: string[];
    mintable: boolean;
    autoLoad: boolean;
    addressChain: string;
    collectionType: string;
    loadTypes: string[];
    description: string;
    purchaseMethod: string;
    showBalance: boolean;
    balanceUrl: string;
    price: number;
    collectionChain: string;
    balanceQty: number | null;
    imageHandler: string;
    loadingImages: string[];
    placeholderImages: string[] | null;
    balanceAfterLive: boolean;
    balanceCheckers: string[] | null;
    tokenIdScheme: string | null;
    generateVaultBody: Function;
    /**
     * Returns a template ready to send to the create vault API
     *
     * @param {FillCreateVaultTemplateArgs} args - Arguments to fill the template
     * @param {_this: Collection} _this - The collection context
     * @returns {Object} - Filled create vault template
     */
    fillCreateVaultTemplate: (args: FillCreateVaultTemplateArgs, _this: Collection) => Object;
    generateCreateTemplate: Function;
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
    to?: string;
    is_dynamic?: boolean;
    platform?: string;
    curation_status?: string;
    origDescription?: string;
    sealed?: boolean;
    collectionAddress?: string;
    targetAsset?: any;
    targetContract?: any;
    mintLocked?: boolean;
    mintLockBlock?: number;
    curatedIds?: any;
    ownedBy?: string;
    fraud?: boolean;
    batchId?: number;
    batch_index?: number;
    success?: boolean;
    coverImage?: string;
    move_targetContract?: any;
    move_targetAsset?: any;
    project?: any;
    background_color?: string;
    ownershipInfo?: any;
    alpha?: boolean;
}
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
};
export type CuratedCollectionsResponse = Collection[];
export type ChainIdentifier = number | 'solana';
export type ProgressCallback = (message: string, data?: unknown) => void;
export interface MintResult {
    txHash: string;
    tokenId: string;
    chainId: ChainIdentifier;
}
export interface ClaimResult {
    phrase?: string;
    privateKey?: string;
}
export interface RemoteMintSignature {
    _nftAddress: string;
    _price: {
        hex: string;
    } | string | number;
    _to: string;
    _tokenId: {
        hex: string;
    } | string | number;
    _nonce: {
        hex: string;
    } | string | number;
    _signature: string;
    serialNumber: string;
    error?: string;
}
export interface RemoteUnvaultSignature {
    success: boolean;
    _nftAddress: string;
    _tokenId: {
        hex: string;
    } | string | number;
    _nonce: {
        hex: string;
    } | string | number;
    _price: {
        hex: string;
    } | string | number;
    _timestamp: {
        hex: string;
    } | string | number;
    _signature: string;
    msg?: string;
    err?: string;
}
export interface EvmSigner {
    getAddress(): Promise<string>;
    signMessage(message: string | Uint8Array): Promise<string>;
    sendTransaction(tx: unknown): Promise<{
        hash: string;
        wait(): Promise<unknown>;
    }>;
    setChainId?(chainId: number): void;
}
export interface EmblemVaultClient {
    toEthersWallet(provider?: unknown): Promise<EvmSigner>;
}
export interface SdkContext {
    apiKey: string;
    baseUrl: string;
    v3Url: string;
    sigUrl: string;
    fetchMetadata: (tokenId: string, callback?: ProgressCallback) => Promise<MetaData>;
    requestRemoteKey: (tokenId: string, jwt: unknown, callback?: ProgressCallback) => Promise<unknown>;
    decryptVaultKeys: (tokenId: string, dkeys: unknown, callback?: ProgressCallback) => Promise<ClaimResult>;
}
export interface FillCreateVaultTemplateArgs {
    fromAddress: string;
    toAddress: string;
    targetAsset: {
        name: string;
        image: string;
        description?: string;
        ownedImage?: string;
        projectName?: string;
    };
    chainId: number;
}
