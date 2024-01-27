import { BigNumber } from '@ethersproject/bignumber'
import { Collection, CuratedCollectionsResponse, MetaData, Vault } from './types';
import { COIN_TO_NETWORK, NFT_DATA, checkContentType, evaluateFacts, fetchData, generateTemplate, genericGuard, getHandlerContract, getQuoteContractObject, metadataAllProjects, metadataObj2Arr, pad, templateGuard } from './utils';

const SDK_VERSION = '__SDK_VERSION__'; 
class EmblemVaultSDK {
    private baseUrl: string;

    constructor(private apiKey: string, baseUrl?: string) {
        console.log('EmblemVaultSDK version:', SDK_VERSION)
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
    getAssetMetadata(projectName: string, strict: boolean = false) {
        genericGuard(projectName, "string", "projectName");
        const NFT_DATA_ARR = metadataObj2Arr(NFT_DATA)
        let filtered = strict ? 
            NFT_DATA_ARR.filter(item => item.projectName === projectName) :
            NFT_DATA_ARR.filter(item => item.projectName.toLowerCase() === projectName.toLowerCase());
        return filtered
    }

    getAllAssetMetadata() {
        return metadataObj2Arr(NFT_DATA)
    }

    getAllProjects() {
        const NFT_DATA_ARR = metadataObj2Arr(NFT_DATA)
        const projects = metadataAllProjects(NFT_DATA_ARR)
        return projects
    }

    // ** Curated **
    //
    async fetchCuratedContracts(hideUnMintable: boolean = false, overrideFunc: Function | boolean = false): Promise<CuratedCollectionsResponse> {
        let url = `${this.baseUrl}/curated`;
        // Fetch using URL or override function
        let data = typeof overrideFunc === 'function' ? await overrideFunc() : await fetchData(url, this.apiKey);
        // Filter out collections that are not mintable
        data = hideUnMintable? data.filter((collection: Collection) => collection.mintable): data;
        
        // Sort the data by the name property in ascending order
        data = data.sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name))
            // Map over the sorted data and generate a template for each item
            .map((item: any) => {
                const template = generateTemplate(item);
                Object.keys(template).forEach(key => {
                    if (key != 'id' && key != 'created_at' && key != 'contracts' && key != 'imageHandler' && key != 'placeholderImages' && key != 'loadingImages' )
                    item[key] = template[key];
                });
                // Return a new object that combines the properties of the item and the template
                // return { ...item, ...template };  
                return item;
            });
        return data
    }

    async fetchCuratedContractByName(name: string, contracts: any = false): Promise<Collection | null> {
        !contracts ? contracts = await this.fetchCuratedContracts(): null
        let contract = contracts.find((contract: Collection) => contract.name === name);
        return contract || null;
    }
    
    async createCuratedVault(template: any, callback: any = null): Promise<Vault> {
        templateGuard(template);
        let url = `${this.baseUrl}/create-curated`;
        if (callback) { callback(`creating Vault for user`, template.toAddress)}     
        let vaultCreationResponse = await fetchData(url, this.apiKey, 'POST', template);
        if (callback) { callback(`created Vault tokenId`, vaultCreationResponse.data.tokenId)}    
        return vaultCreationResponse.data
    }

    async fetchMetadata(tokenId: string, callback: any = null): Promise<MetaData> {
        genericGuard(tokenId, "string", "tokenId");
        if (callback) { callback('getting Metadata')}  
        let url = `${this.baseUrl}/meta/${tokenId}`;
        let metadata = await fetchData(url, this.apiKey);
        if (callback) { callback('received Metadata', metadata.tokenId)}  
        return metadata;
    }

    async fetchVaultsOfType(vaultType: string, address: string): Promise<any> {
        genericGuard(vaultType, "string", "vaultType");
        genericGuard(address, "string", "address");
        let url = `${this.baseUrl}/myvaults/${address}?vaultType=${vaultType}`;
        let vaults = await fetchData(url, this.apiKey);
        return vaults;
    }

    async generateJumpReport(address: string, hideUnMintable: boolean = false) {
        let vaultType = "unclaimed"
        let curated = await this.fetchCuratedContracts();
        return new Promise(async (resolve, reject) => {
            try {
                let map: { [key: string]: any } = {};
                let vaults = await this.fetchVaultsOfType(vaultType, address);
                for (let vaultIndex = 0; vaultIndex < vaults.length; vaultIndex++) {
                    let item = vaults[vaultIndex];
                    let balances = item.ownership.balances || [];                        
                    if (item.targetContract) {
                        let vaultTargetContract: any = await this.fetchCuratedContractByName(item.targetContract.name, curated);
                        let to = [];
                        for (let contractIndex = 0; contractIndex < curated.length; contractIndex++) {                            
                            let contract: any = curated[contractIndex];
                            let allowed = contract.allowed(balances, vaultTargetContract);    
                            if (allowed && vaultTargetContract.name != contract.name) {
                                to.push(contract.name);
                            }
                        }
                        if (!hideUnMintable || to.length > 0) {
                            map[item.tokenId] = { from: item.targetContract.name, to: to };
                        }
                    } else if (!hideUnMintable) {
                        map[item.tokenId] = { from: "legacy", to: [] };
                    }
                }
    
                // Resolve the promise with the map
                resolve(map);
            } catch (error) {
                // Reject the promise in case of any error
                reject(error);
            }
        });
    }

    async generateMintReport(address: string, hideUnMintable: boolean = false) {
        let vaults = await this.fetchVaultsOfType("created", address)
        let curated = await this.fetchCuratedContracts();
        let map: { [key: string]: any } = {};
        return new Promise(async (resolve, reject) => {
            try {
                vaults.forEach(async (vault: any) => {
                    if (vault.targetContract) {                        
                        let targetVault: any = await this.fetchCuratedContractByName(vault.targetContract.name, curated);
                        let balance = vault.balances && vault.balances.length > 0 ? vault.balances : []
                        let allowed = targetVault.allowed(balance, targetVault)
                        if (allowed || !hideUnMintable) {
                            map[vault.tokenId] = { to: vault.targetContract.name, mintable: allowed};
                        }
                    } else {
                        if (!hideUnMintable) {
                            map[vault.tokenId] = { to: "legacy", mintable: false };
                        }
                    }
                })
                // Resolve the promise with the map
                resolve(map);
            } catch (error) {
                // Reject the promise in case of any error
                reject(error);
            }
        });
    }

    async generateMigrateReport(address: string, hideUnMintable: boolean = false) {
        let vaultType = "unclaimed"
        let curated = await this.fetchCuratedContracts();
        return new Promise(async (resolve, reject) => {
            try {
                let map: { [key: string]: any } = {};
                let vaults = await this.fetchVaultsOfType(vaultType, address);
                for (let vaultIndex = 0; vaultIndex < vaults.length; vaultIndex++) {
                    let item = vaults[vaultIndex];
                    let balances = item.ownership.balances || [];                        
                    if (!item.targetContract) {
                        // let vaultTargetContract: any = await this.fetchCuratedContractByName(item.targetContract.name, curated);
                        let to = [];
                        for (let contractIndex = 0; contractIndex < curated.length; contractIndex++) {                            
                            let contract: any = curated[contractIndex];
                            let allowed = contract.allowed(balances, contract);    
                            if (allowed) {
                                to.push(contract.name);
                            }
                        }
                        if (!hideUnMintable || to.length > 0) {
                            map[item.tokenId] = { from: "legacy", to: to };
                        }
                    } else if (!hideUnMintable) {
                        map[item.tokenId] = { from: item.targetContract.name, to: [] };
                    }
                }
    
                // Resolve the promise with the map
                resolve(map);
            } catch (error) {
                // Reject the promise in case of any error
                reject(error);
            }
        });
    }
    
    

    // ** Web3 **
    //
    // Function to load web3 dynamically and attach it to the window object
    async loadWeb3(): Promise<any | undefined> {
        try {
            // Dynamically import the Web3 module
            const { default: Web3 } = await import('web3');
    
            // Check if MetaMask (window.ethereum) is available
            if (window.ethereum) {                
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                // Initialize Web3 with MetaMask's provider
                const web3 = new Web3(window.ethereum);
                
                // Attach Web3 to the window object
                window.web3 = web3;
    
                return web3;
            } else {
                console.error('MetaMask is not installed!');
                return undefined;
            }
        } catch (error) {
            console.error('Error loading Web3 or connecting to MetaMask', error);
            return undefined;
        }
    }

    async performMintChain(web3: any, tokenId: string, collectionName: string, callback: any = null) {
        let collection = await this.fetchCuratedContractByName(collectionName);        
        let mintRequestSig = await this.requestLocalMintSignature(web3, tokenId, callback);
        let remoteMintSig = await this.requestRemoteMintSignature(web3, tokenId, mintRequestSig, callback);
        let quote = await this.getQuote(web3, collection? collection.price: 2000000000, callback);
        let mintResponse = await this.performMint(web3, quote, remoteMintSig, callback);
        return {mintResponse}
    }
    
    async requestLocalMintSignature(web3: any, tokenId: string, callback: any = null) {
        if (callback) { callback('requesting User Mint Signature')}
        const message = `Curated Minting: ${tokenId.toString()}`;
        const accounts = await web3.eth.getAccounts();
        const signature = await web3.eth.personal.sign(message, accounts[0], '');
        if (callback) { callback(`signature`, signature)}
        return signature;
    }

    async requestRemoteMintSignature(web3: any, tokenId: string, signature: string, callback: any = null) {
        if (callback) { callback('requesting Remote Mint signature')}  
        const chainId = await web3.eth.getChainId();
        let url = `${this.baseUrl}/mint-curated`;
        let remoteMintResponse = await fetchData(url, this.apiKey, 'POST',  {method: 'buyWithQuote', tokenId: tokenId, signature: signature, chainId: chainId.toString()});
        if (callback) { callback(`remote Mint signature`, remoteMintResponse)}
        return remoteMintResponse
    }    

    async getQuote(web3: any, amount: number, callback: any = null) {
        if (callback) { callback('requesting Quote')}
        let quoteContract = await getQuoteContractObject(web3);
        const accounts = await web3.eth.getAccounts();
        let quote = BigNumber.from(await quoteContract.methods.quoteExternalPrice(accounts[0], amount.toString()).call());
        if (callback) { callback(`quote`, quote.toString())}
        return quote
    }

    async performMint(web3: any, quote: any, remoteMintSig: any, callback: any = null) {
        if (callback) { callback('performing Mint')}
        const accounts = await web3.eth.getAccounts();
        let handlerContract = await getHandlerContract(web3);
        let mintResponse = await handlerContract.methods.buyWithQuote(remoteMintSig._nftAddress, remoteMintSig._price, remoteMintSig._to, remoteMintSig._tokenId, remoteMintSig._nonce, remoteMintSig._signature, remoteMintSig.serialNumber, 1).send({from: accounts[0], value: quote.toString()});
        if (callback) { callback('Mint Complete')}
        await this.fetchMetadata(remoteMintSig._tokenId);
        return mintResponse
    }

    async contentTypeReport(url: string) {
        return await checkContentType(url)
    }
}

declare global {
    interface Window {
        EmblemVaultSDK: any;
        web3: any;
        ethereum: any
    }
}

if (typeof window !== 'undefined') {
    window.EmblemVaultSDK = EmblemVaultSDK;
}

export default EmblemVaultSDK;
