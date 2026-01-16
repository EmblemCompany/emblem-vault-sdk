import { ChainConfig } from "./constants";
export declare function isV2Vault(metadata: {
    targetContract?: {
        name?: string;
    };
}): boolean;
export declare function requiresOnChainUnvault(metadata: {
    status?: string;
    sealed?: boolean;
    live?: boolean;
}): boolean;
/**
 * Get the claim identifier for signing claim messages.
 * This MUST match VaultActions.vue's getSerialNumber() logic:
 * - ERC1155: use targetContract.serialNumber
 * - ERC721a: use tokenId
 * - Legacy: use tokenId
 */
export declare function getClaimIdentifier(metadata: {
    ownershipInfo?: {
        serialNumber?: string;
        category?: string;
    };
    tokenId?: string;
    targetContract?: {
        serialNumber?: string;
        collectionType?: string;
        tokenId?: string;
    };
}): string;
export declare function getHandlerContractAddress(chainId: number): string;
export declare function getUnvaultingContractAddress(chainId: number): string;
export declare function getChainConfig(chainId: number | string): ChainConfig;
export declare function isEvmChain(chainId: number | string): boolean;
