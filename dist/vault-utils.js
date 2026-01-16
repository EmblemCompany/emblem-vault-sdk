"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isV2Vault = isV2Vault;
exports.requiresOnChainUnvault = requiresOnChainUnvault;
exports.getClaimIdentifier = getClaimIdentifier;
exports.getHandlerContractAddress = getHandlerContractAddress;
exports.getUnvaultingContractAddress = getUnvaultingContractAddress;
exports.getChainConfig = getChainConfig;
exports.isEvmChain = isEvmChain;
const constants_1 = require("./constants");
function isV2Vault(metadata) {
    var _a;
    return Boolean((_a = metadata.targetContract) === null || _a === void 0 ? void 0 : _a.name);
}
function requiresOnChainUnvault(metadata) {
    return metadata.status === 'unclaimed' && !metadata.sealed && Boolean(metadata.live);
}
/**
 * Get the claim identifier for signing claim messages.
 * This MUST match VaultActions.vue's getSerialNumber() logic:
 * - ERC1155: use targetContract.serialNumber
 * - ERC721a: use tokenId
 * - Legacy: use tokenId
 */
function getClaimIdentifier(metadata) {
    const { targetContract, ownershipInfo, tokenId } = metadata;
    // If no targetContract, fallback to tokenId
    if (!targetContract) {
        return tokenId || '';
    }
    // ERC1155: use serialNumber
    if (targetContract.collectionType === 'ERC1155' ||
        (ownershipInfo === null || ownershipInfo === void 0 ? void 0 : ownershipInfo.category) === 'erc1155') {
        return targetContract.serialNumber || tokenId || '';
    }
    // ERC721a: use tokenId (NOT serialNumber!)
    if (targetContract.collectionType === 'ERC721a' ||
        (ownershipInfo === null || ownershipInfo === void 0 ? void 0 : ownershipInfo.category) === 'erc721a') {
        return tokenId || '';
    }
    // Default: use targetContract.tokenId or tokenId
    return targetContract.tokenId || tokenId || '';
}
function getHandlerContractAddress(chainId) {
    const config = getChainConfig(chainId);
    if (!config.handlerContract) {
        throw new Error(`No handler contract configured for chain ${chainId}`);
    }
    return config.handlerContract;
}
function getUnvaultingContractAddress(chainId) {
    const config = getChainConfig(chainId);
    if (!config.unvaultingContract) {
        throw new Error(`No unvaulting contract configured for chain ${chainId}`);
    }
    return config.unvaultingContract;
}
function getChainConfig(chainId) {
    const config = constants_1.SUPPORTED_CHAINS[chainId];
    if (!config) {
        const supportedList = Object.entries(constants_1.SUPPORTED_CHAINS)
            .map(([id, cfg]) => `${cfg.name} (${id})`)
            .join(', ');
        throw new Error(`Unsupported chain: ${chainId}. Supported chains: ${supportedList}`);
    }
    return config;
}
function isEvmChain(chainId) {
    const config = constants_1.SUPPORTED_CHAINS[chainId];
    return (config === null || config === void 0 ? void 0 : config.type) === 'evm';
}
