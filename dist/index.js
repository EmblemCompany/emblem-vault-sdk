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
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("./utils");
const SDK_VERSION = '1.8.1';
class EmblemVaultSDK {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        console.log('EmblemVaultSDK version:', SDK_VERSION);
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.v1Url = 'https://api2.emblemvault.io';
        this.baseUrl = baseUrl || 'https://v2.emblemvault.io';
        this.v3Url = 'https://emblemvault-io-v3-6156a7b1ac82.herokuapp.com';
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
    getAllAssetMetadata() {
        return (0, utils_1.metadataObj2Arr)(utils_1.NFT_DATA);
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
    fetchCuratedContractByName(name, contracts = false) {
        return __awaiter(this, void 0, void 0, function* () {
            !contracts ? contracts = yield this.fetchCuratedContracts() : null;
            let contract = contracts.find((contract) => contract.name === name);
            return contract || null;
        });
    }
    createCuratedVault(template, callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.templateGuard)(template);
            let url = `${this.baseUrl}/create-curated`;
            if (callback) {
                callback(`creating Vault for user`, template.toAddress);
            }
            let vaultCreationResponse = yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', template);
            if (callback) {
                callback(`created Vault tokenId`, vaultCreationResponse.data.tokenId);
            }
            return vaultCreationResponse.data;
        });
    }
    fetchMetadata(tokenId, callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.genericGuard)(tokenId, "string", "tokenId");
            if (callback) {
                callback('getting Metadata');
            }
            let url = `${this.baseUrl}/meta/${tokenId}`;
            let metadata = yield (0, utils_1.fetchData)(url, this.apiKey);
            if (callback) {
                callback('received Metadata', metadata.tokenId);
            }
            return metadata;
        });
    }
    refreshBalance(tokenId, callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.genericGuard)(tokenId, "string", "tokenId");
            if (callback) {
                callback('refreshing Balance');
            }
            let url = `${this.v1Url}/vault/balance/${tokenId}?live=true`;
            let balance = yield (0, utils_1.fetchData)(url, this.apiKey);
            if (callback) {
                callback('received Balance', balance.balances);
            }
            return (balance === null || balance === void 0 ? void 0 : balance.balances) || [];
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
    generateJumpReport(address, hideUnMintable = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let vaultType = "unclaimed";
            let curated = yield this.fetchCuratedContracts();
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let map = {};
                    let vaults = yield this.fetchVaultsOfType(vaultType, address);
                    for (let vaultIndex = 0; vaultIndex < vaults.length; vaultIndex++) {
                        let item = vaults[vaultIndex];
                        let balances = item.ownership.balances || [];
                        if (item.targetContract) {
                            let vaultTargetContract = yield this.fetchCuratedContractByName(item.targetContract.name, curated);
                            let to = [];
                            for (let contractIndex = 0; contractIndex < curated.length; contractIndex++) {
                                let contract = curated[contractIndex];
                                let allowed = contract.allowed(balances, vaultTargetContract);
                                if (allowed && vaultTargetContract.name != contract.name) {
                                    to.push(contract.name);
                                }
                            }
                            if (!hideUnMintable || to.length > 0) {
                                map[item.tokenId] = { from: item.targetContract.name, to: to };
                            }
                        }
                        else if (!hideUnMintable) {
                            map[item.tokenId] = { from: "legacy", to: [] };
                        }
                    }
                    // Resolve the promise with the map
                    resolve(map);
                }
                catch (error) {
                    // Reject the promise in case of any error
                    reject(error);
                }
            }));
        });
    }
    generateMintReport(address, hideUnMintable = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let vaults = yield this.fetchVaultsOfType("created", address);
            let curated = yield this.fetchCuratedContracts();
            let map = {};
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    vaults.forEach((vault) => __awaiter(this, void 0, void 0, function* () {
                        if (vault.targetContract) {
                            let targetVault = yield this.fetchCuratedContractByName(vault.targetContract.name, curated);
                            let balance = vault.balances && vault.balances.length > 0 ? vault.balances : [];
                            let allowed = targetVault.allowed(balance, targetVault);
                            if (allowed || !hideUnMintable) {
                                map[vault.tokenId] = { to: vault.targetContract.name, mintable: allowed };
                            }
                        }
                        else {
                            if (!hideUnMintable) {
                                map[vault.tokenId] = { to: "legacy", mintable: false };
                            }
                        }
                    }));
                    // Resolve the promise with the map
                    resolve(map);
                }
                catch (error) {
                    // Reject the promise in case of any error
                    reject(error);
                }
            }));
        });
    }
    generateMigrateReport(address, hideUnMintable = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let vaultType = "unclaimed";
            let curated = yield this.fetchCuratedContracts();
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let map = {};
                    let vaults = yield this.fetchVaultsOfType(vaultType, address);
                    for (let vaultIndex = 0; vaultIndex < vaults.length; vaultIndex++) {
                        let item = vaults[vaultIndex];
                        let balances = item.ownership.balances || [];
                        if (!item.targetContract) {
                            // let vaultTargetContract: any = await this.fetchCuratedContractByName(item.targetContract.name, curated);
                            let to = [];
                            for (let contractIndex = 0; contractIndex < curated.length; contractIndex++) {
                                let contract = curated[contractIndex];
                                let allowed = contract.allowed(balances, contract);
                                if (allowed) {
                                    to.push(contract.name);
                                }
                            }
                            if (!hideUnMintable || to.length > 0) {
                                map[item.tokenId] = { from: "legacy", to: to };
                            }
                        }
                        else if (!hideUnMintable) {
                            map[item.tokenId] = { from: item.targetContract.name, to: [] };
                        }
                    }
                    // Resolve the promise with the map
                    resolve(map);
                }
                catch (error) {
                    // Reject the promise in case of any error
                    reject(error);
                }
            }));
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
                    yield window.ethereum.request({ method: 'eth_requestAccounts' });
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
    performMintChain(web3, tokenId, collectionName, callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let collection = yield this.fetchCuratedContractByName(collectionName);
            let mintRequestSig = yield this.requestLocalMintSignature(web3, tokenId, callback);
            let remoteMintSig = yield this.requestRemoteMintSignature(web3, tokenId, mintRequestSig, callback);
            let quote = yield this.getQuote(web3, collection ? collection.price : 2000000000, callback);
            let mintResponse = yield this.performMint(web3, quote, remoteMintSig, callback);
            return { mintResponse };
        });
    }
    requestLocalMintSignature(web3, tokenId, callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (callback) {
                callback('requesting User Mint Signature');
            }
            const message = `Curated Minting: ${tokenId.toString()}`;
            const accounts = yield web3.eth.getAccounts();
            const signature = yield web3.eth.personal.sign(message, accounts[0], '');
            if (callback) {
                callback(`signature`, signature);
            }
            return signature;
        });
    }
    requestRemoteMintSignature(web3, tokenId, signature, callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (callback) {
                callback('requesting Remote Mint signature');
            }
            const chainId = yield web3.eth.getChainId();
            let url = `${this.baseUrl}/mint-curated`;
            let remoteMintResponse = yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', { method: 'buyWithQuote', tokenId: tokenId, signature: signature, chainId: chainId.toString() });
            if (callback) {
                callback(`remote Mint signature`, remoteMintResponse);
            }
            return remoteMintResponse;
        });
    }
    getQuote(web3, amount, callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (callback) {
                callback('requesting Quote');
            }
            let quoteContract = yield (0, utils_1.getQuoteContractObject)(web3);
            const accounts = yield web3.eth.getAccounts();
            let quote = bignumber_1.BigNumber.from(yield quoteContract.methods.quoteExternalPrice(accounts[0], amount.toString()).call());
            if (callback) {
                callback(`quote`, quote.toString());
            }
            return quote;
        });
    }
    performMint(web3, quote, remoteMintSig, callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (callback) {
                callback('performing Mint');
            }
            const accounts = yield web3.eth.getAccounts();
            let handlerContract = yield (0, utils_1.getHandlerContract)(web3);
            let mintResponse = yield handlerContract.methods.buyWithQuote(remoteMintSig._nftAddress, remoteMintSig._price, remoteMintSig._to, remoteMintSig._tokenId, remoteMintSig._nonce, remoteMintSig._signature, remoteMintSig.serialNumber, 1).send({ from: accounts[0], value: quote.toString() });
            if (callback) {
                callback('Mint Complete');
            }
            yield this.fetchMetadata(remoteMintSig._tokenId);
            return mintResponse;
        });
    }
    contentTypeReport(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, utils_1.checkContentType)(url);
        });
    }
    legacyBalanceFromContractByAddress(web3, address) {
        return __awaiter(this, void 0, void 0, function* () {
            let legacyContract = yield (0, utils_1.getLegacyContract)(web3);
            let balance = yield legacyContract.methods.getOwnerNFTCount(address).call();
            let tokenIds = [];
            for (let index = 0; index < balance; index++) {
                let tokenId = yield legacyContract.methods.tokenOfOwnerByIndex(address, index).call();
                tokenIds.push(Number(tokenId));
            }
            return tokenIds;
        });
    }
    refreshLegacyOwnership(web3, address) {
        return __awaiter(this, void 0, void 0, function* () {
            let myLegacy = yield this.legacyBalanceFromContractByAddress(web3, address);
            myLegacy.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                let meta = yield this.fetchMetadata(item.toString());
            }));
        });
    }
}
if (typeof window !== 'undefined') {
    window.EmblemVaultSDK = EmblemVaultSDK;
}
exports.default = EmblemVaultSDK;
