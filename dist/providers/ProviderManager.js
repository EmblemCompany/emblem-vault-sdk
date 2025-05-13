"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.ProviderManager = void 0;
const providers_1 = require("../providers");
class ProviderManager {
    constructor(walletConfig) {
        this.providers = new Map();
        this.selectedProvider = null; // Allow null and initialize
        this.walletConfig = walletConfig;
        this.applyAutoConnectSettings(); // Call the new method
    }
    /**
     * Applies auto-connect settings based on the wallet configuration.
     * Defaults to auto-connect off unless specified in config.
     */
    applyAutoConnectSettings() {
        // Default: Turn off known auto-connect behaviors if possible
        // We might not need an explicit 'set autoConnect false' if the default is already false
        // or if connect({ onlyIfTrusted: true }) is used later. Let's refine as needed.
        var _a;
        // Apply specific auto-connect settings from config
        if (((_a = this.walletConfig) === null || _a === void 0 ? void 0 : _a.autoConnectWallets) && Array.isArray(this.walletConfig.autoConnectWallets)) {
            this.walletConfig.autoConnectWallets.forEach((walletType) => {
                switch (walletType) {
                    case 'solana': // Use string literal
                        // Attempt to enable auto-connect for Solana wallets if supported
                        // Note: Direct 'autoConnect: true' might not be standard.
                        // Often, auto-connect happens if the wallet was previously connected/trusted.
                        // This might be handled during the actual connect() call later.
                        console.log("Attempting to configure Solana for potential auto-connect (behavior depends on wallet implementation)");
                        break;
                    case 'ethereum': // Use string literal
                        // MetaMask/Ethereum auto-connect is usually handled by checking
                        // accounts on page load and potentially calling eth_requestAccounts.
                        console.log("Ethereum auto-connect enabled in config. Actual connection attempt should happen later.");
                        break;
                    case 'bitcoin': // Use string literal
                        // Bitcoin wallet auto-connect mechanisms vary greatly.
                        console.log("Bitcoin auto-connect enabled in config. Actual connection attempt should happen later.");
                        break;
                    // Add cases for other blockchain types as needed
                    default:
                        console.warn(`Auto-connect configuration not implemented for type: ${walletType}`);
                }
            });
        }
        // If no config is provided, or the array is empty, the default behavior (typically auto-connect off) applies.
    }
    /**
     * Disconnects the currently selected wallet provider, if applicable.
     */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.selectedProvider) {
                console.log("No provider currently selected to disconnect.");
                return;
            }
            console.log(`Disconnecting from ${this.selectedProvider.type} provider...`);
            // Check if the provider has a specific disconnect method (e.g., Solana)
            if (typeof this.selectedProvider.disconnect === 'function') {
                try {
                    yield this.selectedProvider.disconnect(); // Cast to SolanaProvider for type safety if needed
                    console.log(`${this.selectedProvider.type} provider disconnected successfully.`);
                }
                catch (error) {
                    console.error(`Error disconnecting ${this.selectedProvider.type} provider:`, error);
                    // Decide if we should still nullify the provider even if disconnect fails
                }
            }
            else {
                console.log(`Provider type ${this.selectedProvider.type} does not have a specific disconnect method. Clearing selection.`);
                // For providers like Ethereum/Metamask, there's often no explicit 'disconnect' API.
                // The app usually manages connection state by no longer using the provider.
            }
            // Always clear the selected provider reference
            this.selectedProvider = null;
            console.log("Provider selection cleared.");
            // Optionally, emit an event here
            // this.emit('disconnected');
        });
    }
    /**
     * Register a blockchain provider for a specific blockchain type
     * @param type The blockchain type
     * @param provider The provider instance
     */
    registerProvider(type, provider) {
        this.providers.set(type, provider);
    }
    /**
     * Get a registered provider for a specific blockchain type
     * @param type The blockchain type
     * @returns The provider instance or undefined if not registered
     */
    getProvider(type) {
        return this.providers.get(type);
    }
    /**
     * Check if a provider is registered for a specific blockchain type
     * @param type The blockchain type
     * @returns True if a provider is registered for the specified type
     */
    hasProvider(type) {
        return this.providers.has(type);
    }
    /**
     * Try to connect to a specific wallet by its identifier.
     * @param walletId The identifier of the wallet (e.g., 'phantom', 'metamask').
     * @param type The blockchain type ('solana' or 'ethereum').
     * @returns The provider instance if connection is successful, otherwise null.
     */
    tryConnectWalletById(walletId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (typeof window === 'undefined')
                return null;
            let specificProvider = null; // Corrected type
            // Mapping walletId to potential provider objects in window
            const walletProviderMap = {
                'phantom': (_a = window.phantom) === null || _a === void 0 ? void 0 : _a.solana, // Access the solana property if phantom exists
                'solflare': window.solflare,
                'metamask': window.ethereum, // Assuming MetaMask uses window.ethereum
                'trust': window.trustWallet,
                'coinbase': window.coinbaseWalletExtension,
                'bitcoin': window.HiroWalletProvider, // Add mappings for other wallets as needed
            };
            const targetProvider = walletProviderMap[walletId.toLowerCase()];
            if (targetProvider) {
                try {
                    if (type === 'ethereum' && (targetProvider.isMetaMask || targetProvider.isCoinbaseWallet)) { // Check for common ethereum wallet flags
                        yield targetProvider.request({ method: 'eth_requestAccounts' });
                        const { default: Web3 } = yield Promise.resolve().then(() => __importStar(require('web3')));
                        specificProvider = new providers_1.Web3ProviderAdapter(new Web3(targetProvider));
                    }
                    else if (type === 'solana' && (targetProvider.isPhantom || targetProvider.isSolflare)) {
                        yield targetProvider.connect({ onlyIfTrusted: false }); // Force prompt
                        // Ensure the connected provider matches the SolanaProvider interface structure
                        if ('publicKey' in targetProvider && 'signTransaction' in targetProvider) {
                            specificProvider = targetProvider;
                        }
                        else {
                            console.warn(`Detected Solana provider ${walletId} does not fully match SolanaProvider interface.`);
                        }
                    }
                    // Add conditions for other wallets and types
                    if (specificProvider) {
                        console.log(`Successfully connected to prioritized wallet: ${walletId}`);
                        return specificProvider;
                    }
                }
                catch (error) {
                    console.warn(`Failed to connect to prioritized wallet ${walletId}:`, error);
                }
            }
            return null;
        });
    }
    /**
     * Get or detect a provider for a specific blockchain type
     * If a provider is registered, it will be returned
     * Otherwise, it will try to detect a provider in the environment, respecting priority config.
     * @param type The blockchain type
     * @returns A promise that resolves to the provider instance
     * @throws Error if no provider is available
     */
    getOrDetectProvider(type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let provider = this.providers.get(type);
            if (provider)
                return provider;
            // Try connecting prioritized wallets first
            if ((_b = (_a = this.walletConfig) === null || _a === void 0 ? void 0 : _a.priority) === null || _b === void 0 ? void 0 : _b.length) {
                for (const walletId of this.walletConfig.priority) {
                    const prioritizedProvider = yield this.tryConnectWalletById(walletId, type);
                    if (prioritizedProvider) {
                        console.log(`Using prioritized wallet: ${walletId} for type: ${type}`);
                        this.registerProvider(type, prioritizedProvider); // Type should now match
                        this.selectedProvider = prioritizedProvider; // Set the selected provider
                        return prioritizedProvider;
                    }
                }
                console.log(`Prioritized wallets (${this.walletConfig.priority.join(', ')}) not found or connection failed. Proceeding with general detection.`);
            }
            // If prioritized connection failed or no priority set, proceed with general detection
            const detectedProvider = yield this._detectGenericProvider(type); // Assign to a new const
            if (detectedProvider) { // Check if not null
                this.registerProvider(type, detectedProvider); // Register the non-null provider
                this.selectedProvider = detectedProvider; // Set the selected provider
                return detectedProvider; // Return the non-null provider
            }
            throw new Error(`No provider available for ${type}`);
        });
    }
    /**
     * Helper function for general provider detection.
     * @param type The blockchain type
     * @returns A promise that resolves to the detected provider instance or null.
     */
    _detectGenericProvider(type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (typeof window === 'undefined')
                return null;
            let detectedProvider = null;
            try {
                switch (type) {
                    case 'ethereum':
                        if (window.ethereum) {
                            yield window.ethereum.request({ method: 'eth_requestAccounts' });
                            const { default: Web3 } = yield Promise.resolve().then(() => __importStar(require('web3')));
                            detectedProvider = new providers_1.Web3ProviderAdapter(new Web3(window.ethereum));
                        }
                        else if (window.web3) { // Handle legacy web3
                            const { default: Web3 } = yield Promise.resolve().then(() => __importStar(require('web3')));
                            detectedProvider = new providers_1.Web3ProviderAdapter(new Web3(window.web3.currentProvider));
                        }
                        break;
                    case 'solana':
                        // Prefer Phantom, then Solflare, etc. Add more detections if needed.
                        if ((_b = (_a = window.phantom) === null || _a === void 0 ? void 0 : _a.solana) === null || _b === void 0 ? void 0 : _b.isPhantom) {
                            yield window.phantom.solana.connect({ onlyIfTrusted: false });
                            detectedProvider = window.phantom.solana;
                        }
                        else if ((_c = window.solflare) === null || _c === void 0 ? void 0 : _c.isSolflare) {
                            yield window.solflare.connect({ onlyIfTrusted: false });
                            detectedProvider = window.solflare;
                        }
                        // Add more Solana wallet detections here
                        break;
                    case 'bitcoin':
                        // Example: Check for a specific Bitcoin provider like Xverse or Leather
                        // if (window.btcProvider?.isXverse) { ... }
                        // For now, just return null if no specific provider detected
                        console.warn("Generic Bitcoin provider detection not implemented yet.");
                        break;
                    default:
                        console.warn(`Generic detection for type ${type} not implemented.`);
                        break;
                }
            }
            catch (error) {
                console.error(`Error during generic detection for ${type}:`, error);
                // Don't throw here, let getOrDetectProvider handle the final error
            }
            return detectedProvider;
        });
    }
}
exports.ProviderManager = ProviderManager;
//# sourceMappingURL=ProviderManager.js.map