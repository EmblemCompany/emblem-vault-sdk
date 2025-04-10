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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.checkContentType = exports.metadataAllProjects = exports.NFT_DATA = exports.getSatsConnectAddress = exports.signPSBT = exports.getPsbtTxnSize = exports.generateTaprootAddressFromMnemonic = exports.getTorusKeys = exports.decryptKeys = exports.fetchData = exports.EmblemVaultSDK = void 0;
const utils_1 = require("./utils");
Object.defineProperty(exports, "NFT_DATA", { enumerable: true, get: function () { return utils_1.NFT_DATA; } });
Object.defineProperty(exports, "checkContentType", { enumerable: true, get: function () { return utils_1.checkContentType; } });
Object.defineProperty(exports, "decryptKeys", { enumerable: true, get: function () { return utils_1.decryptKeys; } });
Object.defineProperty(exports, "fetchData", { enumerable: true, get: function () { return utils_1.fetchData; } });
Object.defineProperty(exports, "getSatsConnectAddress", { enumerable: true, get: function () { return utils_1.getSatsConnectAddress; } });
Object.defineProperty(exports, "getTorusKeys", { enumerable: true, get: function () { return utils_1.getTorusKeys; } });
Object.defineProperty(exports, "metadataAllProjects", { enumerable: true, get: function () { return utils_1.metadataAllProjects; } });
Object.defineProperty(exports, "signPSBT", { enumerable: true, get: function () { return utils_1.signPSBT; } });
const derive_1 = require("./derive");
Object.defineProperty(exports, "generateTaprootAddressFromMnemonic", { enumerable: true, get: function () { return derive_1.generateTaprootAddressFromMnemonic; } });
Object.defineProperty(exports, "getPsbtTxnSize", { enumerable: true, get: function () { return derive_1.getPsbtTxnSize; } });
const providers_1 = require("./providers");
const emblemVaultWalletClient_1 = require("./clients/emblemVaultWalletClient");
// Note: We're excluding the Solana wallet client for browser compatibility
const SDK_VERSION = '__SDK_VERSION__';
/**
 * Browser-compatible version of the Emblem Vault SDK
 * Note: This version excludes Solana functionality for better browser compatibility
 */
class EmblemVaultSDK {
    constructor(apiKey, apiUrl = 'https://api.emblemvault.io', aiApiKey = '', aiApiUrl = 'https://ai.emblemvault.io') {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.aiApiKey = aiApiKey;
        this.aiApiUrl = aiApiUrl;
        this.providers = new Map();
    }
    // Copy all methods from the main SDK except for Solana-specific ones
    // Provider management
    registerProvider(type, provider) {
        this.providers.set(type, provider);
    }
    getProvider(type) {
        return this.providers.get(type);
    }
    hasProvider(type) {
        return this.providers.has(type);
    }
    getOrDetectProvider(type) {
        return __awaiter(this, void 0, void 0, function* () {
            // First check if we have a registered provider
            let provider = this.providers.get(type);
            if (provider)
                return provider;
            // If not, try to detect one in the environment
            if (typeof window !== 'undefined') {
                switch (type) {
                    case 'ethereum':
                        if (typeof window.ethereum !== 'undefined') {
                            try {
                                yield window.ethereum.request({ method: 'eth_requestAccounts' });
                                const { default: Web3 } = yield Promise.resolve().then(() => __importStar(require('web3')));
                                const web3Instance = new Web3(window.ethereum);
                                // Wrap the Web3 instance in our adapter
                                provider = new providers_1.Web3ProviderAdapter(web3Instance);
                                this.registerProvider('ethereum', provider);
                                return provider;
                            }
                            catch (error) {
                                console.error('Error connecting to Ethereum provider:', error);
                            }
                        }
                        else if (typeof window.web3 !== 'undefined') {
                            // Handle legacy web3 provider
                            try {
                                const { default: Web3 } = yield Promise.resolve().then(() => __importStar(require('web3')));
                                const web3Instance = new Web3(window.web3.currentProvider);
                                provider = new providers_1.Web3ProviderAdapter(web3Instance);
                                this.registerProvider('ethereum', provider);
                                return provider;
                            }
                            catch (error) {
                                console.error('Error connecting to legacy Web3 provider:', error);
                            }
                        }
                        break;
                    case 'bitcoin':
                        if (typeof window.bitcoin !== 'undefined') {
                            this.registerProvider('bitcoin', window.bitcoin);
                            return window.bitcoin;
                        }
                        break;
                    // Note: We're excluding the Solana case for browser compatibility
                }
            }
            throw new Error(`No provider found for blockchain type: ${type}`);
        });
    }
    // Wallet client creation (excluding Solana)
    createWalletClient(config) {
        return (0, emblemVaultWalletClient_1.createEmblemVaultWalletClient)(config);
    }
    // API methods
    getAssetMetadata(projectName_1) {
        return __awaiter(this, arguments, void 0, function* (projectName, strict = false, overrideFunc = false) {
            if (overrideFunc && typeof overrideFunc === 'function') {
                return yield overrideFunc();
            }
            const allMetadata = yield this.getAllAssetMetadata(overrideFunc);
            if (!projectName)
                return allMetadata;
            if (strict) {
                return allMetadata.filter(metadata => metadata.project === projectName);
            }
            else {
                return allMetadata.filter(metadata => metadata.project && metadata.project.toLowerCase() === projectName.toLowerCase());
            }
        });
    }
    getAllAssetMetadata() {
        return __awaiter(this, arguments, void 0, function* (overrideFunc = false) {
            if (overrideFunc && typeof overrideFunc === 'function') {
                return yield overrideFunc();
            }
            const url = `${this.apiUrl}/metadata`;
            const data = yield (0, utils_1.fetchData)(url, this.apiKey);
            return (0, utils_1.metadataObj2Arr)(data);
        });
    }
    getRemoteAssetMetadata() {
        return __awaiter(this, arguments, void 0, function* (overrideFunc = false) {
            if (overrideFunc && typeof overrideFunc === 'function') {
                return yield overrideFunc();
            }
            const url = `${this.apiUrl}/remote-asset-metadata`;
            return yield (0, utils_1.fetchData)(url, this.apiKey);
        });
    }
    fetchCuratedContracts() {
        return __awaiter(this, arguments, void 0, function* (overrideFunc = false) {
            if (overrideFunc && typeof overrideFunc === 'function') {
                return yield overrideFunc();
            }
            const url = `${this.apiUrl}/curated-contracts`;
            return yield (0, utils_1.fetchData)(url, this.apiKey);
        });
    }
    fetchCuratedContractByName(name_1) {
        return __awaiter(this, arguments, void 0, function* (name, overrideFunc = false) {
            if (overrideFunc && typeof overrideFunc === 'function') {
                return yield overrideFunc();
            }
            const collections = yield this.fetchCuratedContracts();
            if (!collections || collections.length === 0)
                return undefined;
            return collections.find(collection => collection.name.toLowerCase() === name.toLowerCase());
        });
    }
    fetchVaultsOfType(type_1) {
        return __awaiter(this, arguments, void 0, function* (type, overrideFunc = false) {
            if (overrideFunc && typeof overrideFunc === 'function') {
                return yield overrideFunc();
            }
            const url = `${this.apiUrl}/vaults/type/${type}`;
            return yield (0, utils_1.fetchData)(url, this.apiKey);
        });
    }
    fetchVaultsForAddress(address_1) {
        return __awaiter(this, arguments, void 0, function* (address, overrideFunc = false) {
            if (overrideFunc && typeof overrideFunc === 'function') {
                return yield overrideFunc();
            }
            const url = `${this.apiUrl}/vaults/address/${address}`;
            return yield (0, utils_1.fetchData)(url, this.apiKey);
        });
    }
    // Template generation
    makeTemplate(functions = {}, overrideFunc = false) {
        if (overrideFunc && typeof overrideFunc === 'function') {
            return overrideFunc();
        }
        return {
            generateTemplate: (assetName, assetData) => {
                // Create a merged record with the asset data and name
                const record = Object.assign(Object.assign({}, assetData), { name: assetName });
                return (0, utils_1.generateTemplate)(record);
            }
        };
    }
    // Web3 loading
    loadWeb3(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const providerInstance = yield this.getOrDetectProvider('ethereum');
                // Check if it's our adapter and return the raw Web3 instance
                if (providerInstance instanceof providers_1.Web3ProviderAdapter) {
                    return providerInstance.getWeb3();
                }
                // If it's a generic EIP-1193 provider, we might need to wrap it if direct Web3 usage is required
                // For now, let's assume the adapter covers the primary case (MetaMask)
                return providerInstance;
            }
            catch (error) {
                console.error('Could not load or detect Ethereum provider:', error);
                return undefined;
            }
        });
    }
    // AI methods
    getVaultInfo(vaultId_1) {
        return __awaiter(this, arguments, void 0, function* (vaultId, apiKey = '', overrideFunc = false) {
            if (overrideFunc && typeof overrideFunc === 'function') {
                return yield overrideFunc();
            }
            const key = apiKey || this.aiApiKey;
            if (!key) {
                throw new Error('AI API key is required for getVaultInfo');
            }
            const url = `${this.aiApiUrl}/vault-info/${vaultId}`;
            return yield (0, utils_1.fetchData)(url, key);
        });
    }
    // Version info
    getVersion() {
        return SDK_VERSION;
    }
}
exports.EmblemVaultSDK = EmblemVaultSDK;
//# sourceMappingURL=browser.js.map