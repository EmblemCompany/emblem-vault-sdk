import { ChainConfig, SUPPORTED_CHAINS } from "./constants";

export function isV2Vault(metadata: { targetContract?: { name?: string } }): boolean {
    return Boolean(metadata.targetContract?.name);
}

export function requiresOnChainUnvault(metadata: { status?: string; sealed?: boolean; live?: boolean }): boolean {
    return metadata.status === 'unclaimed' && !metadata.sealed && Boolean(metadata.live);
}

/**
 * Get the claim identifier for signing claim messages.
 * This MUST match VaultActions.vue's getSerialNumber() logic:
 * - ERC1155: use targetContract.serialNumber
 * - ERC721a: use tokenId
 * - Legacy: use tokenId
 */
export function getClaimIdentifier(metadata: { 
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
}): string {
    const { targetContract, ownershipInfo, tokenId } = metadata;
    
    // If no targetContract, fallback to tokenId
    if (!targetContract) {
        return tokenId || '';
    }
    
    // ERC1155: use serialNumber
    if (
        targetContract.collectionType === 'ERC1155' ||
        ownershipInfo?.category === 'erc1155'
    ) {
        return targetContract.serialNumber || tokenId || '';
    }
    
    // ERC721a: use tokenId (NOT serialNumber!)
    if (
        targetContract.collectionType === 'ERC721a' ||
        ownershipInfo?.category === 'erc721a'
    ) {
        return tokenId || '';
    }
    
    // Default: use targetContract.tokenId or tokenId
    return targetContract.tokenId || tokenId || '';
}

export function getHandlerContractAddress(chainId: number): string {
    const config = getChainConfig(chainId);
    if (!config.handlerContract) {
        throw new Error(`No handler contract configured for chain ${chainId}`);
    }
    return config.handlerContract;
}

export function getUnvaultingContractAddress(chainId: number): string {
    const config = getChainConfig(chainId);
    if (!config.unvaultingContract) {
        throw new Error(`No unvaulting contract configured for chain ${chainId}`);
    }
    return config.unvaultingContract;
}

export function getChainConfig(chainId: number | string): ChainConfig {
    const config = SUPPORTED_CHAINS[chainId];
    if (!config) {
        const supportedList = Object.entries(SUPPORTED_CHAINS)
            .map(([id, cfg]) => `${cfg.name} (${id})`)
            .join(', ');
        throw new Error(
            `Unsupported chain: ${chainId}. Supported chains: ${supportedList}`
        );
    }
    return config;
}

export function isEvmChain(chainId: number | string): boolean {
    const config = SUPPORTED_CHAINS[chainId];
    return config?.type === 'evm';
}