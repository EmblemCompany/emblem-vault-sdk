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
exports.EmblemVaultSDK = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("./utils");
const derive_1 = require("./derive");
const SDK_VERSION = '3.0.0';
class EmblemVaultSDK {
    constructor(apiKey, baseUrl, v3Url, sigUrl, aiUrl, aiApiKey, byoKey) {
        this.apiKey = apiKey;
        this.providers = new Map();
        console.log('EmblemVaultSDK version:', SDK_VERSION);
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.baseUrl = baseUrl || 'https://v2.emblemvault.io';
        this.v3Url = v3Url || 'https://v3.emblemvault.io';
        this.sigUrl = sigUrl || 'https://tor-us-signer-coval.vercel.app';
        this.aiUrl = aiUrl || 'https://api.emblemvault.ai';
        this.aiApiKey = aiApiKey || undefined;
        this.byoKey = byoKey || undefined;
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
     * Get or detect a provider for a specific blockchain type
     * If a provider is registered, it will be returned
     * Otherwise, it will try to detect a provider in the environment
     * @param type The blockchain type
     * @returns A promise that resolves to the provider instance
     * @throws Error if no provider is available
     */
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
                        if (window.ethereum) {
                            try {
                                yield window.ethereum.request({ method: 'eth_requestAccounts' });
                                const { default: Web3 } = yield Promise.resolve().then(() => __importStar(require('web3')));
                                const web3 = new Web3(window.ethereum);
                                // Use the adapter to make Web3 compatible with our provider interface
                                const { Web3ProviderAdapter } = yield Promise.resolve().then(() => __importStar(require('./providers')));
                                const adapter = new Web3ProviderAdapter(web3);
                                this.registerProvider('ethereum', adapter);
                                return adapter;
                            }
                            catch (error) {
                                console.error('Error connecting to Ethereum provider:', error);
                            }
                        }
                        break;
                    case 'solana':
                        if (window.solana) {
                            try {
                                yield window.solana.connect();
                                // Create a Solana provider adapter if needed
                                const solanaProvider = Object.assign(Object.assign({ type: 'solana' }, window.solana), { isConnected: () => __awaiter(this, void 0, void 0, function* () { return !!window.solana.publicKey; }) });
                                this.registerProvider('solana', solanaProvider);
                                return solanaProvider;
                            }
                            catch (error) {
                                console.error('Error connecting to Solana provider:', error);
                            }
                        }
                        break;
                    case 'bitcoin':
                        if (window.bitcoin) {
                            // Create a Bitcoin provider adapter if needed
                            const bitcoinProvider = Object.assign(Object.assign({ type: 'bitcoin' }, window.bitcoin), { isConnected: () => __awaiter(this, void 0, void 0, function* () { return true; }) // Implement proper connection check
                             });
                            this.registerProvider('bitcoin', bitcoinProvider);
                            return bitcoinProvider;
                        }
                        break;
                }
            }
            throw new Error(`No provider available for blockchain type: ${type}`);
        });
    }
    /**
     * @deprecated
     * This method is deprecated and will be removed in a future version.
     * Please use `getInventoryAssetMetadataProject` instead.
     */
    getRemoteAssetMetadataProjectList() {
        return __awaiter(this, arguments, void 0, function* (overrideFunc = null) {
            const url = `${this.v3Url}/asset_metadata/projects`;
            const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc(this.apiKey) : yield (0, utils_1.fetchData)(url, this.apiKey);
            return NFT_DATA_ARR;
        });
    }
    getInventoryAssetMetadataProject(projectName_1) {
        return __awaiter(this, arguments, void 0, function* (projectName, overrideFunc = null) {
            const url = `${this.v3Url}/asset_metadata/projects`;
            const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc(this.apiKey, { project: projectName }) : yield (0, utils_1.fetchData)(url, this.apiKey, projectName ? 'POST' : undefined, projectName ? { project: projectName } : undefined);
            NFT_DATA_ARR && (yield NFT_DATA_ARR).map((item) => { item.asset_name = item.assetName; }); // Backward compatibility
            return NFT_DATA_ARR;
        });
    }
    getInventoryAssetMetadata(asset_name_1) {
        return __awaiter(this, arguments, void 0, function* (asset_name, overrideFunc = null) {
            const url = `${this.v3Url}/asset_metadata/${asset_name}`;
            const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc(this.apiKey) : yield (0, utils_1.fetchData)(url, this.apiKey);
            return NFT_DATA_ARR;
        });
    }
    getInventoryAssetMetadataVaultedProjectList() {
        return __awaiter(this, arguments, void 0, function* (overrideFunc = null) {
            const url = `${this.v3Url}/asset_metadata/projects/vaulted`;
            const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc(this.apiKey) : yield (0, utils_1.fetchData)(url, this.apiKey);
            return NFT_DATA_ARR;
        });
    }
    getAllCuratedProjects(overrideFunc = null) {
        const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? (0, utils_1.metadataObj2Arr)(overrideFunc()) : (0, utils_1.metadataObj2Arr)(utils_1.NFT_DATA);
        const projects = (0, utils_1.metadataAllProjects)(NFT_DATA_ARR);
        return projects;
    }
    // ** Curated **
    //
    fetchCuratedContracts() {
        return __awaiter(this, arguments, void 0, function* (hideUnMintable = false, overrideFunc = null) {
            let url = `${this.baseUrl}/curated`;
            // Fetch using URL or override function
            let data = overrideFunc ? yield overrideFunc(this.apiKey) : yield (0, utils_1.fetchData)(url, this.apiKey);
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
                return Object.assign(Object.assign(Object.assign({}, item), template), { mintTemplate: template.generateCreateTemplate(item) });
                // return item;
            });
            return data;
        });
    }
    fetchCuratedContractByName(name_1) {
        return __awaiter(this, arguments, void 0, function* (name, contracts = false, overrideFunc = null) {
            !contracts ? contracts = overrideFunc ? yield overrideFunc(this.apiKey, { name }) : yield this.fetchCuratedContracts() : null;
            let contract = contracts.find((contract) => contract.name === name);
            return contract || null;
        });
    }
    createCuratedVault(template_1) {
        return __awaiter(this, arguments, void 0, function* (template, callback = null, overrideFunc = null) {
            (0, utils_1.templateGuard)(template);
            template.chainId == 1 ? delete template.targetContract[5] : delete template.targetContract[1];
            let url = `${this.baseUrl}/create-curated`;
            if (callback) {
                callback(`creating Vault for user`, template.toAddress);
            }
            let vaultCreationResponse = overrideFunc ? yield overrideFunc(this.apiKey, template) : yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', template);
            if (callback) {
                callback(`created Vault tokenId`, vaultCreationResponse.data.tokenId);
            }
            return vaultCreationResponse.data;
        });
    }
    refreshOwnershipForTokenId(tokenId_1) {
        return __awaiter(this, arguments, void 0, function* (tokenId, callback = null, overrideFunc = null) {
            (0, utils_1.genericGuard)(tokenId, "string", "tokenId");
            let url = `${this.baseUrl}/refreshBalanceForTokenId`;
            let response = overrideFunc ? yield overrideFunc(this.apiKey, { tokenId }) : yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', { tokenId });
            if (callback) {
                callback(`Refreshed ownership for`, tokenId);
            }
            return response;
        });
    }
    refreshOwnershipForAccount(account_1) {
        return __awaiter(this, arguments, void 0, function* (account, callback = null, overrideFunc = null) {
            (0, utils_1.genericGuard)(account, "string", "account");
            let url = `${this.baseUrl}/refreshBalanceForAccount`;
            let response = overrideFunc ? yield overrideFunc(this.apiKey, { account }) : yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', { account });
            if (callback) {
                callback(`Refreshed ownership for`, account);
            }
            return response;
        });
    }
    fetchMetadata(tokenId_1) {
        return __awaiter(this, arguments, void 0, function* (tokenId, callback = null, overrideFunc = null) {
            (0, utils_1.genericGuard)(tokenId, "string", "tokenId");
            if (callback) {
                callback('getting Metadata');
            }
            let url = `${this.baseUrl}/meta/${tokenId}`;
            let metadata = overrideFunc ? yield overrideFunc(this.apiKey, { tokenId }) : yield (0, utils_1.fetchData)(url, this.apiKey);
            if (callback) {
                callback('received Metadata', metadata.tokenId);
            }
            return metadata;
        });
    }
    refreshBalance(tokenId_1) {
        return __awaiter(this, arguments, void 0, function* (tokenId, callback = null, overrideFunc = null) {
            (0, utils_1.genericGuard)(tokenId, "string", "tokenId");
            if (callback) {
                callback('refreshing Balance');
            }
            let url = `${this.v3Url}/vault/balance/${tokenId}?live=true`;
            let balance = overrideFunc ? yield overrideFunc(this.apiKey, { tokenId }) : yield (0, utils_1.fetchData)(url, this.apiKey);
            if (callback) {
                callback('received Balance', balance.values);
            }
            return (balance === null || balance === void 0 ? void 0 : balance.values) || [];
        });
    }
    fetchVaultsOfType(vaultType_1, address_1) {
        return __awaiter(this, arguments, void 0, function* (vaultType, address, overrideFunc = null) {
            (0, utils_1.genericGuard)(vaultType, "string", "vaultType");
            (0, utils_1.genericGuard)(address, "string", "address");
            let url = `${this.baseUrl}/myvaults/${address}?vaultType=${vaultType}`;
            let vaults = overrideFunc ? yield overrideFunc(this.apiKey, { vaultType, address }) : yield (0, utils_1.fetchData)(url, this.apiKey);
            return vaults;
        });
    }
    generateJumpReport(address_1) {
        return __awaiter(this, arguments, void 0, function* (address, hideUnMintable = false, overrideFunc = null) {
            let vaultType = "unclaimed";
            let curated = yield this.fetchCuratedContracts();
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let map = {};
                    let vaults = overrideFunc ? yield overrideFunc(this.apiKey, { vaultType, address }) : yield this.fetchVaultsOfType(vaultType, address);
                    for (let vaultIndex = 0; vaultIndex < vaults.length; vaultIndex++) {
                        let item = vaults[vaultIndex];
                        let balances = item.ownership.balances || [];
                        if (item.targetContract) {
                            let vaultTargetContract = overrideFunc ? yield overrideFunc('curated_contract_by_name', this.apiKey, { name: item.targetContract.name }) : yield this.fetchCuratedContractByName(item.targetContract.name, curated);
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
    generateMintReport(address_1) {
        return __awaiter(this, arguments, void 0, function* (address, hideUnMintable = false, overrideFunc = null) {
            let vaults = yield this.fetchVaultsOfType("created", address, overrideFunc);
            let curated = yield this.fetchCuratedContracts();
            let map = {};
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    vaults.forEach((vault) => __awaiter(this, void 0, void 0, function* () {
                        if (vault.targetContract) {
                            let targetVault = overrideFunc ? yield overrideFunc(this.apiKey, { name: vault.targetContract.name }) : yield this.fetchCuratedContractByName(vault.targetContract.name, curated);
                            let balance = vault.balances && vault.balances.length > 0 ? vault.balances : vault.ownership && vault.ownership.balances && vault.ownership.balances.length > 0 ? vault.ownership.balances : [];
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
    generateMigrateReport(address_1) {
        return __awaiter(this, arguments, void 0, function* (address, hideUnMintable = false, overrideFunc = null) {
            let vaultType = "unclaimed";
            let curated = yield this.fetchCuratedContracts();
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let map = {};
                    let vaults = overrideFunc ? yield overrideFunc(this.apiKey, { vaultType, address }) : yield this.fetchVaultsOfType(vaultType, address);
                    for (let vaultIndex = 0; vaultIndex < vaults.length; vaultIndex++) {
                        let item = vaults[vaultIndex];
                        let balances = item.ownership.balances || [];
                        if (!item.targetContract) {
                            // let vaultTargetContract: any = await this.fetchCuratedContractByName(item.targetContract.name);
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
                // Try to get or detect an Ethereum provider
                const provider = yield this.getOrDetectProvider('ethereum');
                // If we have a provider, return it
                if (provider) {
                    return provider;
                }
                // If we don't have a provider but we're in a browser environment,
                // try to load Web3 directly
                if (typeof window !== 'undefined') {
                    // Dynamically import the Web3 module
                    const { default: Web3 } = yield Promise.resolve().then(() => __importStar(require('web3')));
                    // Check if MetaMask (window.ethereum) is available
                    if (window.ethereum) {
                        yield window.ethereum.request({ method: 'eth_requestAccounts' });
                        // Initialize Web3 with MetaMask's provider
                        const web3 = new Web3(window.ethereum);
                        // Register the provider for future use
                        const { Web3ProviderAdapter } = yield Promise.resolve().then(() => __importStar(require('./providers')));
                        const adapter = new Web3ProviderAdapter(web3);
                        this.registerProvider('ethereum', adapter);
                        return web3;
                    }
                }
                console.error('No Ethereum provider available');
                return undefined;
            }
            catch (error) {
                console.error('Error loading Web3 or connecting to provider', error);
                return undefined;
            }
        });
    }
    performMintChain(web3_1, tokenId_1, collectionName_1) {
        return __awaiter(this, arguments, void 0, function* (web3, tokenId, collectionName, callback = null) {
            let collection = yield this.fetchCuratedContractByName(collectionName);
            let mintRequestSig = yield this.requestLocalMintSignature(web3, tokenId, callback);
            let remoteMintSig = yield this.requestRemoteMintSignature(web3, tokenId, mintRequestSig, callback);
            let quote = yield this.getQuote(web3, collection ? collection.price : remoteMintSig._price / 1000000, callback);
            let ethToSend = quote.mul(bignumber_1.BigNumber.from(10).pow(6));
            let mintResponse = yield this.performMint(web3, ethToSend, remoteMintSig, callback);
            return { mintResponse };
        });
    }
    performClaimChain(web3_1, tokenId_1, serialNumber_1) {
        return __awaiter(this, arguments, void 0, function* (web3, tokenId, serialNumber, callback = null) {
            let sig = yield this.requestLocalClaimSignature(web3, tokenId, serialNumber, callback);
            let jwt = yield this.requestRemoteClaimToken(web3, tokenId, sig, callback);
            let dkeys = yield this.requestRemoteKey(tokenId, jwt, callback);
            return yield this.decryptVaultKeys(tokenId, dkeys, callback);
        });
    }
    requestLocalMintSignature(web3_1, tokenId_1) {
        return __awaiter(this, arguments, void 0, function* (web3, tokenId, callback = null) {
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
    requestLocalClaimSignature(web3_1, tokenId_1, serialNumber_1) {
        return __awaiter(this, arguments, void 0, function* (web3, tokenId, serialNumber, callback = null) {
            if (callback) {
                callback('requesting User Claim Signature');
            }
            const message = `Claim: ${serialNumber ? serialNumber.toString() : tokenId.toString()}`;
            const accounts = yield web3.eth.getAccounts();
            const signature = yield web3.eth.personal.sign(message, accounts[0], '');
            if (callback) {
                callback(`signature`, signature);
            }
            return signature;
        });
    }
    requestRemoteMintSignature(web3_1, tokenId_1, signature_1) {
        return __awaiter(this, arguments, void 0, function* (web3, tokenId, signature, callback = null, overrideFunc = null) {
            if (callback) {
                callback('requesting Remote Mint signature');
            }
            const chainId = yield web3.eth.getChainId();
            let url = `${this.baseUrl}/mint-curated`;
            let remoteMintResponse = overrideFunc ? yield overrideFunc(this.apiKey, { method: 'buyWithSignedPrice', tokenId: tokenId, signature: signature, chainId: chainId.toString() }) : yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', { method: 'buyWithSignedPrice', tokenId: tokenId, signature: signature, chainId: chainId.toString() });
            if (remoteMintResponse.error) {
                throw new Error(remoteMintResponse.error);
            }
            if (callback) {
                callback(`remote Mint signature`, remoteMintResponse);
            }
            return remoteMintResponse;
        });
    }
    requestRemoteClaimToken(web3_1, tokenId_1, signature_1) {
        return __awaiter(this, arguments, void 0, function* (web3, tokenId, signature, callback = null, overrideFunc = null) {
            if (callback) {
                callback('requesting Remote Claim token');
            }
            const chainId = yield web3.eth.getChainId();
            let url = `${this.sigUrl}/sign`;
            let remoteClaimResponse = overrideFunc ? yield overrideFunc(this.apiKey, { signature: signature, tokenId: tokenId, chainid: chainId.toString() }) : yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', { signature: signature, tokenId: tokenId }, { chainid: chainId.toString() });
            if (callback) {
                callback(`remote Claim token`, remoteClaimResponse);
            }
            return remoteClaimResponse;
        });
    }
    requestRemoteKey(tokenId_1, jwt_1) {
        return __awaiter(this, arguments, void 0, function* (tokenId, jwt, callback = null, overrideFunc = null) {
            if (callback) {
                callback('requesting Remote Key');
            }
            let dkeys = overrideFunc ? yield overrideFunc(this.apiKey, { tokenId: tokenId, jwt: jwt.token }) : yield (0, utils_1.getTorusKeys)(tokenId, jwt.token);
            if (callback) {
                callback(`remote Key`, dkeys);
            }
            return dkeys;
        });
    }
    decryptVaultKeys(tokenId_1, dkeys_1) {
        return __awaiter(this, arguments, void 0, function* (tokenId, dkeys, callback = null, overrideFunc = null) {
            if (callback) {
                callback('decrypting Vault Keys');
            }
            let metadata = overrideFunc ? yield overrideFunc(this.apiKey, { tokenId: tokenId }) : yield this.fetchMetadata(tokenId);
            let ukeys = yield (0, utils_1.decryptKeys)(metadata.ciphertextV2, dkeys, metadata.addresses);
            if (callback) {
                callback(`remote Key`, ukeys);
            }
            return ukeys;
        });
    }
    /**
     * ** Emblem Vault AI **
     *
     * Be sure to allow api key requests, or api_key_hash and auth sig (wallet, socialAuth, oAuth)
     * Here we will begin using the aiApiKey and the aiUrl to communicate with the ai vault system
     *
     */
    vaultInfoFromApiKey(aiApiKey_1, full_1) {
        return __awaiter(this, arguments, void 0, function* (aiApiKey, full, overrideFunc = null) {
            const url = `${this.aiUrl}/vault/${full ? 'info-complete' : 'info'}`;
            const selectedKey = aiApiKey ? aiApiKey : this.aiApiKey ? this.aiApiKey : '';
            const actionFunction = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc : utils_1.fetchData;
            const vaultDetails = yield actionFunction(url, selectedKey, 'POST', null);
            // vaultDetails.computedEthAddress = ethers.utils.computeAddress(vaultDetails.pkp.pub_key.replace('0x',''));
            return vaultDetails;
        });
    }
    /**
     * @deprecated This method is deprecated and will be removed in a future version.
     * Please use alternative methods for price quotation.
     */
    getQuote(web3_1, amount_1) {
        return __awaiter(this, arguments, void 0, function* (web3, amount, callback = null) {
            if (callback) {
                callback('requesting Quote');
            }
            let quoteContract = yield (0, utils_1.getQuoteContractObject)(web3);
            const accounts = yield web3.eth.getAccounts();
            let quote = bignumber_1.BigNumber.from(yield quoteContract.methods.quoteExternalPrice(accounts[0], Number(amount) / 1000000).call());
            if (callback) {
                callback(`quote`, quote.toString());
            }
            return quote;
        });
    }
    // todo add contract overrides
    performMint(web3OrQuote_1, quoteOrRemoteMintSig_1) {
        return __awaiter(this, arguments, void 0, function* (web3OrQuote, quoteOrRemoteMintSig, remoteMintSigOrCallback = null, callback = null) {
            // Handle different parameter patterns for backward compatibility
            let provider;
            let quote;
            let remoteMintSig;
            let callbackFn = null;
            // Determine which parameter pattern is being used
            if (typeof web3OrQuote === 'object' && web3OrQuote.eth) {
                // Legacy pattern: (web3, quote, remoteMintSig, callback)
                provider = web3OrQuote;
                quote = quoteOrRemoteMintSig;
                remoteMintSig = remoteMintSigOrCallback;
                callbackFn = callback;
            }
            else {
                // New pattern: (quote, remoteMintSig, callback)
                quote = web3OrQuote;
                remoteMintSig = quoteOrRemoteMintSig;
                callbackFn = remoteMintSigOrCallback;
                // Get the provider
                try {
                    provider = yield this.getOrDetectProvider('ethereum');
                }
                catch (error) {
                    throw new Error('No Ethereum provider available. Please register a provider or pass one explicitly.');
                }
            }
            if (callbackFn) {
                callbackFn('performing Mint');
            }
            const accounts = yield provider.eth.getAccounts();
            let handlerContract = yield (0, utils_1.getHandlerContract)(provider);
            // Get current gas price from the network
            const gasPrice = yield provider.eth.getGasPrice();
            let createdTxObject = handlerContract.methods.buyWithQuote(remoteMintSig._nftAddress, remoteMintSig._price, remoteMintSig._to, remoteMintSig._tokenId, remoteMintSig._nonce, remoteMintSig._signature, remoteMintSig.serialNumber, 1);
            // Estimate gas limit for the transaction
            const gasLimit = yield createdTxObject.estimateGas({ from: accounts[0], value: Number(quote) });
            // Execute the transaction with the specified gas price and estimated gas limit
            let mintResponse = yield createdTxObject.send({
                from: accounts[0],
                value: Number(quote),
                gasPrice: gasPrice, // Use the current gas price
                gas: gasLimit // Use the estimated gas limit
            }).on('transactionHash', (hash) => {
                if (callbackFn)
                    callbackFn(`Transaction submitted. Hash`, hash);
            })
                .on('confirmation', (confirmationNumber, receipt) => {
                if (callbackFn)
                    callbackFn(`Mint Complete. Confirmation Number`, confirmationNumber);
            })
                .on('error', (error) => {
                if (callbackFn)
                    callbackFn(`Transaction Error`, error.message);
            });
            if (callbackFn) {
                callbackFn('Mint Complete');
            }
            yield this.fetchMetadata(remoteMintSig._tokenId);
            return mintResponse;
        });
    }
    performBurn(web3OrTokenId_1) {
        return __awaiter(this, arguments, void 0, function* (web3OrTokenId, tokenIdOrCallback = null, callbackOrOverride = null, overrideFunc = null) {
            // Handle different parameter patterns for backward compatibility
            let provider;
            let tokenId;
            let callbackFn = null;
            let overrideFn = null;
            // Determine which parameter pattern is being used
            if (typeof web3OrTokenId === 'object' && web3OrTokenId.eth) {
                // Legacy pattern: (web3, tokenId, callback, overrideFunc)
                provider = web3OrTokenId;
                tokenId = tokenIdOrCallback;
                callbackFn = callbackOrOverride;
                overrideFn = overrideFunc;
            }
            else {
                // New pattern: (tokenId, callback, overrideFunc)
                tokenId = web3OrTokenId;
                callbackFn = tokenIdOrCallback;
                overrideFn = callbackOrOverride;
                // Get the provider
                try {
                    provider = yield this.getOrDetectProvider('ethereum');
                }
                catch (error) {
                    throw new Error('No Ethereum provider available. Please register a provider or pass one explicitly.');
                }
            }
            // Use override function if provided
            if (overrideFn && typeof overrideFn === 'function') {
                return yield overrideFn(provider, tokenId, callbackFn);
            }
            let metadata = yield this.fetchMetadata(tokenId);
            let targetContract = yield this.fetchCuratedContractByName(metadata.targetContract.name);
            if (callbackFn) {
                callbackFn('performing Burn');
            }
            const accounts = yield provider.eth.getAccounts();
            const chainId = yield provider.eth.getChainId();
            let handlerContract = yield (0, utils_1.getHandlerContract)(provider);
            // Dynamically fetch the current gas price
            const gasPrice = yield provider.eth.getGasPrice();
            let createdTxObject = handlerContract.methods.claim(targetContract[chainId], targetContract.collectionType == 'ERC721a' ? tokenId : targetContract.tokenId);
            // Estimate gas limit for the transaction
            const estimatedGas = yield createdTxObject.estimateGas({ from: accounts[0] });
            let burnResponse = yield createdTxObject.send({
                from: accounts[0],
                gasPrice: gasPrice,
                gas: estimatedGas
            }).on('transactionHash', (hash) => {
                if (callbackFn)
                    callbackFn(`Transaction submitted. Hash`, hash);
            })
                .on('confirmation', (confirmationNumber, receipt) => {
                if (callbackFn)
                    callbackFn(`Burn Complete. Confirmation Number`, confirmationNumber);
            })
                .on('error', (error) => {
                if (callbackFn)
                    callbackFn(`Transaction Error`, error.message);
            });
            if (callbackFn) {
                callbackFn('Burn Complete');
            }
            return burnResponse;
        });
    }
    contentTypeReport(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, utils_1.checkContentType)(url);
        });
    }
    legacyBalanceFromContractByAddress(web3OrAddress_1, address_1) {
        return __awaiter(this, arguments, void 0, function* (web3OrAddress, address, overrideFunc = null) {
            // Handle different parameter patterns for backward compatibility
            let ethAddress;
            let provider;
            if (typeof web3OrAddress === 'string') {
                // If first parameter is a string, it's the address
                ethAddress = web3OrAddress;
                // Try to get a registered or detected provider
                try {
                    provider = yield this.getOrDetectProvider('ethereum');
                }
                catch (error) {
                    throw new Error('No Ethereum provider available. Please register a provider or pass one explicitly.');
                }
            }
            else {
                // First parameter is the web3 instance (backward compatibility)
                provider = web3OrAddress;
                ethAddress = address;
            }
            // Use override function if provided
            if (overrideFunc && typeof overrideFunc === 'function') {
                return yield overrideFunc(provider, ethAddress);
            }
            // Get the legacy contract using the provider
            let legacyContract = yield (0, utils_1.getLegacyContract)(provider);
            let balance = yield legacyContract.methods.getOwnerNFTCount(ethAddress).call();
            let tokenIds = [];
            for (let index = 0; index < balance; index++) {
                let tokenId = yield legacyContract.methods.tokenOfOwnerByIndex(ethAddress, index).call();
                tokenIds.push(Number(tokenId));
            }
            return tokenIds;
        });
    }
    refreshLegacyOwnership(web3OrAddress_1, address_1) {
        return __awaiter(this, arguments, void 0, function* (web3OrAddress, address, overrideFunc = null) {
            // Handle different parameter patterns for backward compatibility
            let ethAddress;
            let provider;
            if (typeof web3OrAddress === 'string') {
                // If first parameter is a string, it's the address
                ethAddress = web3OrAddress;
                // Try to get a registered or detected provider
                try {
                    provider = yield this.getOrDetectProvider('ethereum');
                }
                catch (error) {
                    throw new Error('No Ethereum provider available. Please register a provider or pass one explicitly.');
                }
            }
            else {
                // First parameter is the web3 instance (backward compatibility)
                provider = web3OrAddress;
                ethAddress = address;
            }
            // Use override function if provided
            if (overrideFunc && typeof overrideFunc === 'function') {
                return yield overrideFunc(provider, ethAddress);
            }
            let tokenIds = yield this.legacyBalanceFromContractByAddress(provider, ethAddress);
            let url = `${this.baseUrl}/refreshLegacyOwnership`;
            let response = yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', { tokenIds, address: ethAddress });
            return response;
        });
    }
    checkLiveliness(tokenId_1) {
        return __awaiter(this, arguments, void 0, function* (tokenId, chainId = 1) {
            let url = `${this.baseUrl}/liveliness-curated/`;
            return yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', { tokenId: tokenId }, { chainid: chainId, "Content-Type": "application/json" });
        });
    }
    checkLivelinessBulk(tokenIds_1) {
        return __awaiter(this, arguments, void 0, function* (tokenIds, chainId = 1) {
            const chunkSize = 20;
            let results = [];
            let url = `${this.baseUrl}/batch_liveliness/`;
            let apiKey = this.apiKey;
            function processChunks() {
                return __awaiter(this, arguments, void 0, function* (i = 0, delay = 1000) {
                    if (i < tokenIds.length) {
                        let chunk = tokenIds.slice(i, i + chunkSize);
                        try {
                            let result = yield (0, utils_1.fetchData)(url, apiKey, 'POST', { tokenIds: chunk }, { chainid: chainId, "Content-Type": "application/json" });
                            results.push(result);
                            processChunks(i + chunkSize);
                        }
                        catch (error) {
                            console.error(`Error fetching data for chunk starting at index ${i}. Retrying in ${delay}ms...`, error);
                            setTimeout(() => processChunks(i, delay * 2), delay);
                        }
                    }
                });
            }
            processChunks();
            return results;
        });
    }
    // BTC
    sweepVaultUsingPhrase(phrase_1) {
        return __awaiter(this, arguments, void 0, function* (phrase, satsPerByte = 20, broadcast = false) {
            const { paymentAddress, paymentPublicKey, ordinalsAddress } = yield (0, utils_1.getSatsConnectAddress)();
            // change this to mainnet
            if (window.bitcoin) {
                let bitcoin = window.bitcoin;
                var network = bitcoin.networks.mainnet;
                // generate taproot address
                const { p2tr, pubKey, tweakedSigner } = yield (0, derive_1.generateTaprootAddressFromMnemonic)(phrase);
                const taprootAddress = p2tr.address;
                // build payment definition for payments address
                const p2wpkh = bitcoin.payments.p2wpkh({
                    pubkey: Buffer.from(paymentPublicKey, "hex"),
                    network,
                });
                const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network });
                console.log(taprootAddress);
                const getAddressUtxos = (address) => __awaiter(this, void 0, void 0, function* () {
                    const response = yield fetch(`https://mempool.space/api/address/${address}/utxo`);
                    const utxos = yield response.json();
                    return utxos;
                });
                const taprootUtxos = yield getAddressUtxos(taprootAddress);
                const paymentUtxos = yield getAddressUtxos(paymentAddress);
                // there should only be 1 utxo in this vault address
                const taprootUtxo = taprootUtxos[0];
                // construct PSBT
                const psbt = new bitcoin.Psbt({ network });
                // add input from taproot
                psbt.addInput({
                    hash: taprootUtxo.txid,
                    index: taprootUtxo.vout,
                    witnessUtxo: {
                        script: p2tr.output,
                        value: taprootUtxo.value,
                    },
                    tapInternalKey: pubKey,
                });
                // output to ordinalsAddress
                psbt.addOutput({
                    address: ordinalsAddress,
                    value: taprootUtxo.value,
                });
                // add inputs for fees from paymentAddress
                let totalFeeInput = 0;
                let size = 0;
                for (const utxo of paymentUtxos) {
                    psbt.addInput({
                        hash: utxo.txid,
                        index: utxo.vout,
                        witnessUtxo: {
                            script: p2sh.output,
                            value: utxo.value,
                        },
                        redeemScript: p2sh.redeem.output,
                    });
                    totalFeeInput += utxo.value;
                    size = (0, derive_1.getPsbtTxnSize)(phrase, psbt.toBase64());
                    if (totalFeeInput >= satsPerByte * size) {
                        break;
                    }
                }
                if (totalFeeInput < satsPerByte * size) {
                    throw new Error("Insufficient funds at desired fee rate");
                }
                // maybe add output for change if change is greater than 1000 sats (dust)
                if (satsPerByte * size > 1000) {
                    psbt.addOutput({
                        address: paymentAddress,
                        value: totalFeeInput - Math.ceil(satsPerByte * size),
                    });
                }
                // sign
                psbt.signInput(0, tweakedSigner);
                // send this to wallet to sign all indexes except the first one
                const psbtBase64 = psbt.toBase64();
                console.log(psbtBase64);
                let signedPsbt = yield (0, utils_1.signPSBT)(psbtBase64, paymentAddress, [...Array(paymentUtxos.length).keys()].map(i => i + taprootUtxos.length), broadcast);
                return signedPsbt;
            }
        });
    }
    getCuratedAssetMetadata(projectName, strict = false, overrideFunc = null) {
        return this.getAssetMetadata(projectName, strict, overrideFunc);
    }
    // @deprecated
    getAssetMetadata(projectName, strict = false, overrideFunc = null) {
        (0, utils_1.genericGuard)(projectName, "string", "projectName");
        const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? (0, utils_1.metadataObj2Arr)(overrideFunc()) : (0, utils_1.metadataObj2Arr)(utils_1.NFT_DATA);
        let filtered = strict ?
            NFT_DATA_ARR.filter((item) => item.projectName === projectName) :
            NFT_DATA_ARR.filter((item) => item.projectName.toLowerCase() === projectName.toLowerCase());
        return filtered;
    }
    getAllCuratedAssetMetadata(overrideFunc = null) {
        return this.getAllAssetMetadata(overrideFunc);
    }
    // @deprecated    
    getAllAssetMetadata(overrideFunc = null) {
        if (overrideFunc && typeof overrideFunc === 'function') {
            return overrideFunc();
        }
        const NFT_DATA_ARR = (0, utils_1.metadataObj2Arr)(utils_1.NFT_DATA);
        return NFT_DATA_ARR;
    }
}
exports.EmblemVaultSDK = EmblemVaultSDK;
if (typeof window !== 'undefined') {
    window.EmblemVaultSDK = EmblemVaultSDK;
}
//# sourceMappingURL=index.js.map