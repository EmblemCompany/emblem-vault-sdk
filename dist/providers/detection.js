"use strict";
/**
 * Blockchain Provider Detection Utilities
 *
 * This file contains utility functions for detecting provider types.
 * These implementations should be excluded from the main bundle
 * to avoid conflicts with consumer libraries.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectProviderType = detectProviderType;
exports.isProviderType = isProviderType;
/**
 * Utility to detect the type of a provider based on its properties
 */
function detectProviderType(provider) {
    if (!provider)
        return 'other';
    // Ethereum provider detection
    if (provider.eth ||
        (provider.request && typeof provider.request === 'function') ||
        provider.isMetaMask ||
        provider.isWalletConnect) {
        return 'ethereum';
    }
    // Solana provider detection
    if (
    // Standard Solana wallet properties
    provider.publicKey ||
        provider.isPhantom ||
        provider.isSolflare ||
        // Solana Connection object properties
        (provider._commitment && provider._rpcEndpoint) ||
        // Solana transaction signing methods
        (provider.signTransaction && typeof provider.signTransaction === 'function') ||
        (provider.signAllTransactions && typeof provider.signAllTransactions === 'function') ||
        // Solana message signing
        (provider.signMessage && typeof provider.signMessage === 'function') ||
        // Our EmblemVaultSolanaWalletClient
        (provider.type === 'emblemVaultSolanaWalletClient') ||
        // Check for Solana Connection methods
        (provider.getAccountInfo && typeof provider.getAccountInfo === 'function' &&
            provider.getRecentBlockhash && typeof provider.getRecentBlockhash === 'function')) {
        return 'solana';
    }
    // Bitcoin provider detection
    if (provider.network ||
        (provider.signPsbt && typeof provider.signPsbt === 'function')) {
        return 'bitcoin';
    }
    return 'other'; // Return 'other' for unknown providers
}
/**
 * Utility to check if a provider is of a specific type
 */
function isProviderType(provider, type) {
    return detectProviderType(provider) === type;
}
//# sourceMappingURL=detection.js.map