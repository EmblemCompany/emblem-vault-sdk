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
const utils_1 = require("./utils");
const SDK_VERSION = '1.4.8';
class EmblemVaultSDK {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        console.log('EmblemVaultSDK version:', SDK_VERSION);
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.baseUrl = baseUrl || 'https://v2.emblemvault.io';
    }
    // Example method structure
    generateUploadUrl() {
        // Implementation goes here
    }
    // ** Asset Metadata **
    //
    getAssetMetadata(projectName, strict = false) {
        (0, utils_1.genericGuard)(projectName, "string", "projectName");
        const NFT_DATA_ARR = (0, utils_1.metadataObj2Arr)(utils_1.NFT_DATA);
        let filtered = strict ?
            NFT_DATA_ARR.filter(item => item.projectName === projectName) :
            NFT_DATA_ARR.filter(item => item.projectName.toLowerCase() === projectName.toLowerCase());
        return filtered;
    }
    getAllProjects() {
        const NFT_DATA_ARR = (0, utils_1.metadataObj2Arr)(utils_1.NFT_DATA);
        const projects = (0, utils_1.metadataAllProjects)(NFT_DATA_ARR);
        return projects;
    }
    // ** Curated **
    //
    fetchCuratedContracts(hideUnMintable = false, overrideFunc = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `${this.baseUrl}/curated`;
            // Fetch using URL or override function
            let data = typeof overrideFunc === 'function' ? yield overrideFunc() : yield (0, utils_1.fetchData)(url, this.apiKey);
            // Filter out collections that are not mintable
            data = hideUnMintable ? data.filter((collection) => collection.mintable) : data;
            // Sort the data by the name property in ascending order
            data = data.sort((a, b) => a.name.localeCompare(b.name))
                // Map over the sorted data and generate a template for each item
                .map((item) => {
                const template = (0, utils_1.generateTemplate)(item);
                Object.keys(template).forEach(key => {
                    if (key != 'id' && key != 'created_at' && key != 'contracts' && key != 'imageHandler' && key != 'placeholderImages' && key != 'loadingImages')
                        item[key] = template[key];
                });
                // Return a new object that combines the properties of the item and the template
                // return { ...item, ...template };  
                return item;
            });
            return data;
        });
    }
    createCuratedVault(template) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.templateGuard)(template);
            let url = `${this.baseUrl}/create-curated`;
            let vaultCreationResponse = yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', template);
            return vaultCreationResponse.data;
        });
    }
    fetchMetadata(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.genericGuard)(tokenId, "string", "tokenId");
            let url = `${this.baseUrl}/meta/${tokenId}`;
            let metadata = yield (0, utils_1.fetchData)(url, this.apiKey);
            return metadata;
        });
    }
    fetchVaultsOfType(vaultType, address) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.genericGuard)(vaultType, "string", "vaultType");
            (0, utils_1.genericGuard)(address, "string", "address");
            let url = `${this.baseUrl}/myvaults/${address}?vaultType=${vaultType}`;
            let vaults = yield (0, utils_1.fetchData)(url, this.apiKey);
            return vaults;
        });
    }
    // ** Web3 **
    //
    // Function to load web3 dynamically and attach it to the window object
    loadWeb3() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Dynamically import the Web3 module
                const { default: Web3 } = yield Promise.resolve().then(() => __importStar(require('web3')));
                // Check if MetaMask (window.ethereum) is available
                if (window.ethereum) {
                    // Initialize Web3 with MetaMask's provider
                    const web3 = new Web3(window.ethereum);
                    // Attach Web3 to the window object
                    window.web3 = web3;
                    return web3;
                }
                else {
                    console.error('MetaMask is not installed!');
                    return undefined;
                }
            }
            catch (error) {
                console.error('Error loading Web3 or connecting to MetaMask', error);
                return undefined;
            }
        });
    }
}
if (typeof window !== 'undefined') {
    window.EmblemVaultSDK = EmblemVaultSDK;
}
exports.default = EmblemVaultSDK;
