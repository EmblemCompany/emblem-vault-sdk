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
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("./utils");
const derive_1 = require("./derive");
const SDK_VERSION = '2.5.0';
class EmblemVaultSDK {
    constructor(apiKey, baseUrl, v3Url, sigUrl) {
        this.apiKey = apiKey;
        console.log('EmblemVaultSDK version:', SDK_VERSION);
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.baseUrl = baseUrl || 'https://v2.emblemvault.io';
        this.v3Url = v3Url || 'https://v3.emblemvault.io';
        this.sigUrl = sigUrl || 'https://tor-us-signer-coval.vercel.app';
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
    getRemoteAssetMetadataProjectList() {
        return (0, utils_1.fetchData)(`${this.v3Url}/asset_metadata/projects`, this.apiKey);
    }
    getRemoteAssetMetadata(asset_name) {
        return (0, utils_1.fetchData)(`${this.v3Url}/asset_metadata/${asset_name}`, this.apiKey);
    }
    getRemoteAssetMetadataVaultedProjectList() {
        return (0, utils_1.fetchData)(`${this.v3Url}/asset_metadata/projects/vaulted`, this.apiKey);
    }
    getAllProjects() {
        const NFT_DATA_ARR = (0, utils_1.metadataObj2Arr)(utils_1.NFT_DATA);
        const projects = (0, utils_1.metadataAllProjects)(NFT_DATA_ARR);
        return projects;
    }
    // ** Curated **
    //
    fetchCuratedContracts() {
        return __awaiter(this, arguments, void 0, function* (hideUnMintable = false, overrideFunc = false) {
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
    fetchCuratedContractByName(name_1) {
        return __awaiter(this, arguments, void 0, function* (name, contracts = false) {
            !contracts ? contracts = yield this.fetchCuratedContracts() : null;
            let contract = contracts.find((contract) => contract.name === name);
            return contract || null;
        });
    }
    createCuratedVault(template_1) {
        return __awaiter(this, arguments, void 0, function* (template, callback = null) {
            (0, utils_1.templateGuard)(template);
            template.chainId == 1 ? delete template.targetContract[5] : delete template.targetContract[1];
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
    refreshOwnershipForTokenId(tokenId_1) {
        return __awaiter(this, arguments, void 0, function* (tokenId, callback = null) {
            (0, utils_1.genericGuard)(tokenId, "string", "tokenId");
            let url = `${this.baseUrl}/refreshBalanceForTokenId`;
            let response = yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', { tokenId });
            if (callback) {
                callback(`Refreshed ownership for`, tokenId);
            }
            return response;
        });
    }
    refreshOwnershipForAccount(account_1) {
        return __awaiter(this, arguments, void 0, function* (account, callback = null) {
            (0, utils_1.genericGuard)(account, "string", "account");
            let url = `${this.baseUrl}/refreshBalanceForAccount`;
            let response = yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', { account });
            if (callback) {
                callback(`Refreshed ownership for`, account);
            }
            return response;
        });
    }
    fetchMetadata(tokenId_1) {
        return __awaiter(this, arguments, void 0, function* (tokenId, callback = null) {
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
    refreshBalance(tokenId_1) {
        return __awaiter(this, arguments, void 0, function* (tokenId, callback = null) {
            (0, utils_1.genericGuard)(tokenId, "string", "tokenId");
            if (callback) {
                callback('refreshing Balance');
            }
            let url = `${this.v3Url}/vault/balance/${tokenId}?live=true`;
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
    generateJumpReport(address_1) {
        return __awaiter(this, arguments, void 0, function* (address, hideUnMintable = false) {
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
    generateMintReport(address_1) {
        return __awaiter(this, arguments, void 0, function* (address, hideUnMintable = false) {
            let vaults = yield this.fetchVaultsOfType("created", address);
            let curated = yield this.fetchCuratedContracts();
            let map = {};
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    vaults.forEach((vault) => __awaiter(this, void 0, void 0, function* () {
                        if (vault.targetContract) {
                            let targetVault = yield this.fetchCuratedContractByName(vault.targetContract.name, curated);
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
        return __awaiter(this, arguments, void 0, function* (address, hideUnMintable = false) {
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
        return __awaiter(this, arguments, void 0, function* (web3, tokenId, signature, callback = null) {
            if (callback) {
                callback('requesting Remote Mint signature');
            }
            const chainId = yield web3.eth.getChainId();
            let url = `${this.baseUrl}/mint-curated`;
            let remoteMintResponse = yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', { method: 'buyWithQuote', tokenId: tokenId, signature: signature, chainId: chainId.toString() });
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
        return __awaiter(this, arguments, void 0, function* (web3, tokenId, signature, callback = null) {
            if (callback) {
                callback('requesting Remote Claim token');
            }
            const chainId = yield web3.eth.getChainId();
            let url = `${this.sigUrl}/sign`;
            let remoteClaimResponse = yield (0, utils_1.fetchData)(url, this.apiKey, 'POST', { signature: signature, tokenId: tokenId }, { chainid: chainId.toString() });
            if (callback) {
                callback(`remote Claim token`, remoteClaimResponse);
            }
            return remoteClaimResponse;
        });
    }
    requestRemoteKey(tokenId_1, jwt_1) {
        return __awaiter(this, arguments, void 0, function* (tokenId, jwt, callback = null) {
            if (callback) {
                callback('requesting Remote Key');
            }
            let dkeys = yield (0, utils_1.getTorusKeys)(tokenId, jwt.token);
            if (callback) {
                callback(`remote Key`, dkeys);
            }
            return dkeys;
        });
    }
    decryptVaultKeys(tokenId_1, dkeys_1) {
        return __awaiter(this, arguments, void 0, function* (tokenId, dkeys, callback = null) {
            if (callback) {
                callback('decrypting Vault Keys');
            }
            let metadata = yield this.fetchMetadata(tokenId);
            let ukeys = yield (0, utils_1.decryptKeys)(metadata.ciphertextV2, dkeys, metadata.addresses);
            if (callback) {
                callback(`remote Key`, ukeys);
            }
            return ukeys;
        });
    }
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
    performMint(web3_1, quote_1, remoteMintSig_1) {
        return __awaiter(this, arguments, void 0, function* (web3, quote, remoteMintSig, callback = null) {
            // async performMint(web3, quote, remoteMintSig, callback = null) {
            if (callback) {
                callback('performing Mint');
            }
            const accounts = yield web3.eth.getAccounts();
            let handlerContract = yield (0, utils_1.getHandlerContract)(web3);
            // Get current gas price from the network
            const gasPrice = yield web3.eth.getGasPrice();
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
                if (callback)
                    callback(`Transaction submitted. Hash`, hash);
            })
                .on('confirmation', (confirmationNumber, receipt) => {
                if (callback)
                    callback(`Mint Complete. Confirmation Number`, confirmationNumber);
            })
                .on('error', (error) => {
                if (callback)
                    callback(`Transaction Error`, error.message);
            });
            if (callback) {
                callback('Mint Complete');
            }
            yield this.fetchMetadata(remoteMintSig._tokenId);
            return mintResponse;
        });
    }
    performBurn(web3_1, tokenId_1) {
        return __awaiter(this, arguments, void 0, function* (web3, tokenId, callback = null) {
            let metadata = yield this.fetchMetadata(tokenId);
            let targetContract = yield this.fetchCuratedContractByName(metadata.targetContract.name);
            if (callback) {
                callback('performing Burn');
            }
            const accounts = yield web3.eth.getAccounts();
            const chainId = yield web3.eth.getChainId();
            let handlerContract = yield (0, utils_1.getHandlerContract)(web3);
            // Dynamically fetch the current gas price
            const gasPrice = yield web3.eth.getGasPrice();
            let createdTxObject = handlerContract.methods.claim(targetContract[chainId], targetContract.collectionType == 'ERC721a' ? tokenId : targetContract.tokenId);
            // Estimate gas limit for the transaction
            const estimatedGas = yield createdTxObject.estimateGas({ from: accounts[0] });
            let burnResponse = yield createdTxObject.send({
                from: accounts[0],
                gasPrice: gasPrice,
                gas: estimatedGas
            }).on('transactionHash', (hash) => {
                if (callback)
                    callback(`Transaction submitted. Hash`, hash);
            })
                .on('confirmation', (confirmationNumber, receipt) => {
                if (callback)
                    callback(`Burn Complete. Confirmation Number`, confirmationNumber);
            })
                .on('error', (error) => {
                if (callback)
                    callback(`Transaction Error`, error.message);
            });
            if (callback) {
                callback('Burn Complete');
            }
            return burnResponse;
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
}
if (typeof window !== 'undefined') {
    window.EmblemVaultSDK = EmblemVaultSDK;
}
exports.default = EmblemVaultSDK;
