"use strict";
/**
 * Blockchain Provider Implementations
 *
 * This file contains concrete implementations of blockchain providers.
 * These implementations are NOT intended to be included in the bundle
 * to avoid conflicts with consumer libraries.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3ProviderAdapter = void 0;
exports.detectProviderType = detectProviderType;
exports.isProviderType = isProviderType;
/**
 * Web3 provider adapter
 * This wraps a Web3 instance to make it conform to our EthereumProvider interface
 */
class Web3ProviderAdapter {
    constructor(web3) {
        this.web3 = web3;
        this.type = 'ethereum';
    }
    request(args) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            switch (args.method) {
                case 'eth_accounts':
                    return this.web3.eth.getAccounts();
                case 'eth_chainId':
                    return this.web3.eth.getChainId();
                case 'eth_getBalance':
                    return this.web3.eth.getBalance((_a = args.params) === null || _a === void 0 ? void 0 : _a[0]);
                case 'personal_sign':
                    return this.web3.eth.personal.sign((_b = args.params) === null || _b === void 0 ? void 0 : _b[0], (_c = args.params) === null || _c === void 0 ? void 0 : _c[1], (_d = args.params) === null || _d === void 0 ? void 0 : _d[2]);
                default:
                    throw new Error(`Method ${args.method} not implemented`);
            }
        });
    }
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accounts = yield this.web3.eth.getAccounts();
                return Array.isArray(accounts) && accounts.length > 0;
            }
            catch (error) {
                return false;
            }
        });
    }
    // Expose the original web3 instance
    get eth() {
        return this.web3.eth;
    }
    // Get the raw web3 instance
    getRawWeb3() {
        return this.web3;
    }
}
exports.Web3ProviderAdapter = Web3ProviderAdapter;
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
//# sourceMappingURL=provider-implementations.js.map