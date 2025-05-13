import { BigNumber } from '@ethersproject/bignumber'
import { AiVaultInfo, Balance, Collection, CuratedCollectionsResponse, MetaData, Ownership, v3LocalMintSignature, Vault } from './types';
import { NFT_DATA, checkContentType, decryptKeys, fetchData, generateTemplate, genericGuard, getERC1155Contract, getERC721AContract, getHandlerContract, getLegacyContract, getQuoteContractObject, getSatsConnectAddress, getTorusKeys, metadataAllProjects, metadataObj2Arr, signPSBT, templateGuard } from './utils';
import { generateTaprootAddressFromMnemonic, getPsbtTxnSize } from './derive';
import { BlockchainProvider, BlockchainType, detectProviderType, EthereumProvider, Web3ProviderAdapter } from './providers';
import { ProviderManager } from './providers/ProviderManager';
import { createEmblemVaultWalletClient, EmblemVaultWalletClient, EmblemVaultWalletClientConfig } from './clients/emblemVaultWalletClient';
import { createEmblemVaultSolanaWalletClient, EmblemVaultSolanaWalletClient, EmblemVaultSolanaWalletClientConfig } from './clients/emblemVaultSolanaWalletClient';

const SDK_VERSION = '__SDK_VERSION__'; 

export class EmblemVaultSDK {
    private baseUrl: string;
    private v3Url: string;
    private sigUrl: string;
    private aiUrl: string;
    private aiApiKey?: string;
    private byoKey?: string;
    private providerManager: ProviderManager;
    version: string;
    
    constructor(private apiKey: string, baseUrl?: string, v3Url?: string, sigUrl?: string, aiUrl?: string, aiApiKey?: string, byoKey?: string) {
        // console.log('EmblemVaultSDK version:', SDK_VERSION)
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.baseUrl = baseUrl || 'https://v2.emblemvault.io';
        this.v3Url = v3Url || 'https://v3.emblemvault.io';
        this.sigUrl = sigUrl || 'https://tor-us-signer-coval.vercel.app';
        this.aiUrl = aiUrl || 'https://api.emblemvault.ai';
        this.aiApiKey = aiApiKey || undefined;
        this.byoKey = byoKey || undefined;
        this.version = SDK_VERSION;
        this.providerManager = new ProviderManager();
    }

    /**
     * Register a blockchain provider for a specific blockchain type
     * @param type The blockchain type
     * @param provider The provider instance
     */
    registerProvider(type: BlockchainType, provider: any): void {
        this.providerManager.registerProvider(type, provider);
    }

    /**
     * Get a registered provider for a specific blockchain type
     * @param type The blockchain type
     * @returns The provider instance or undefined if not registered
     */
    getProvider(type: BlockchainType): any {
        return this.providerManager.getProvider(type);
    }

    /**
     * Check if a provider is registered for a specific blockchain type
     * @param type The blockchain type
     * @returns True if a provider is registered for the specified type
     */
    hasProvider(type: BlockchainType): boolean {
        return this.providerManager.hasProvider(type);
    }

    /**
     * Get or detect a provider for a specific blockchain type
     * If a provider is registered, it will be returned
     * Otherwise, it will try to detect a provider in the environment
     * @param type The blockchain type
     * @returns A promise that resolves to the provider instance
     * @throws Error if no provider is available
     */
    async getOrDetectProvider(type: BlockchainType): Promise<any> {
        return this.providerManager.getOrDetectProvider(type);
    }

    /**
     * Creates a Wallet Client instance powered by the Emblem Vault TEE signer.
     *
     * @param config - Configuration specific to the wallet client, like the walletId.
     * @returns An EmblemVaultWalletClient instance.
     */
    createWalletClient(config: Omit<EmblemVaultWalletClientConfig, 'sdk'>): EmblemVaultWalletClient {
        if (!this.apiKey) {
            throw new Error("SDK must be initialized with an API key before creating a wallet client.");
        }
        return createEmblemVaultWalletClient({
            ...config,
            sdk: this, // Pass the current SDK instance
        });
    }

    /**
     * Creates a Solana Wallet Client instance powered by the Emblem Vault TEE signer.
     *
     * @param config - Configuration specific to the Solana wallet client, like the walletId.
     * @returns An EmblemVaultSolanaWalletClient instance.
     */
    createSolanaWalletClient(config: Omit<EmblemVaultSolanaWalletClientConfig, 'sdk'>): EmblemVaultSolanaWalletClient {
        if (!this.apiKey) {
            throw new Error("SDK must be initialized with an API key before creating a wallet client.");
        }
        return createEmblemVaultSolanaWalletClient({
            ...config,
            sdk: this, // Pass the current SDK instance
        });
    }

    /**
     * Ethereum Convenience
     *
     * @param config - Configuration specific to the Solana wallet client, like the walletId.
     * @returns An EmblemVaultSolanaWalletClient instance.
     */
    async getConnectedEthAccount(): Promise<string> {
        if (!this.hasProvider("ethereum")) {
            await this.getOrDetectProvider("ethereum");
        }
        return (await this.getProvider("ethereum").eth.getAccounts())[0];
    }

    // ** Asset Metadata **
    //
    getCuratedAssetMetadata(projectName: string, strict: boolean = false, overrideFunc: Function | null = null) {
        return this.getAssetMetadata(projectName, strict, overrideFunc);
    }
    // @deprecated
    getAssetMetadata(projectName: string, strict: boolean = false, overrideFunc: Function | null = null) {
        genericGuard(projectName, "string", "projectName");
        const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? metadataObj2Arr(overrideFunc()) : metadataObj2Arr(NFT_DATA);
        let filtered = strict ? 
            NFT_DATA_ARR.filter((item: any) => item.projectName === projectName) :
            NFT_DATA_ARR.filter((item: any) => item.projectName.toLowerCase() === projectName.toLowerCase());
        return filtered
    }

    getAllCuratedAssetMetadata(overrideFunc: Function | null = null) {
        return this.getAllAssetMetadata(overrideFunc);
    }
    // @deprecated    
    getAllAssetMetadata(overrideFunc: Function | null = null) {
        if (overrideFunc && typeof overrideFunc === 'function') {
            return overrideFunc();
        }
        const NFT_DATA_ARR = metadataObj2Arr(NFT_DATA);
        return NFT_DATA_ARR
    }

    /**
     * @deprecated 
     * This method is deprecated and will be removed in a future version. 
     * Please use `getInventoryAssetMetadataProject` instead.
     */
    async getRemoteAssetMetadataProjectList(overrideFunc: Function | null = null) {
        const url = `${this.v3Url}/asset_metadata/projects`;
        const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc(this.apiKey) : await fetchData(url, this.apiKey);
        return NFT_DATA_ARR
    }

    async getInventoryAssetMetadataProject(projectName?: string, overrideFunc: Function | null = null) {
        const url = `${this.v3Url}/asset_metadata/projects`;
        const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc(this.apiKey, {project: projectName}) : await fetchData(url, this.apiKey, projectName?'POST':undefined, projectName? {project: projectName}:undefined);
        NFT_DATA_ARR && (await NFT_DATA_ARR).map((item: any) => { item.asset_name = item.assetName; }); // Backward compatibility
        return NFT_DATA_ARR
    }

    async getInventoryAssetMetadata(asset_name: string, overrideFunc: Function | null = null) {
        const url = `${this.v3Url}/asset_metadata/${asset_name}`;
        const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc(this.apiKey) : await fetchData(url, this.apiKey);
        return NFT_DATA_ARR
    }

    async getInventoryAssetMetadataVaultedProjectList(overrideFunc: Function | null = null) {
        const url = `${this.v3Url}/asset_metadata/projects/vaulted`;
        const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc(this.apiKey) : await fetchData(url, this.apiKey);
        return NFT_DATA_ARR
    }

    getAllCuratedProjects(overrideFunc: Function | null = null) {
        const NFT_DATA_ARR = overrideFunc && typeof overrideFunc === 'function' ? metadataObj2Arr(overrideFunc()) : metadataObj2Arr(NFT_DATA)
        const projects = metadataAllProjects(NFT_DATA_ARR)
        return projects
    }

    async getBalanceCheckers(overrideFunc: Function | null = null) {
        let url = `${this.v3Url}/v3/balanceCheckers`;
        const balanceCheckers = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc(this.apiKey) : await fetchData(url, this.apiKey);
        return balanceCheckers
    }

    async checkBalanceAtAddress(address: string, symbol: string, overrideFunc: Function | null = null) {
        let url = `${this.v3Url}/balance/${symbol}/${address}`;
        const balance = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc(this.apiKey) : await fetchData(url, this.apiKey);
        return balance
    }

    // ** Curated **
    //
    async fetchCuratedContracts(hideUnMintable: boolean = false, overrideFunc: Function | null = null): Promise<CuratedCollectionsResponse> {
        let url = `${this.baseUrl}/curated`;
        // Fetch using URL or override function
        let data = overrideFunc? await overrideFunc(this.apiKey) : await fetchData(url, this.apiKey);
        // Filter out collections that are not mintable
        data = hideUnMintable? data.filter((collection: Collection) => collection.mintable): data;
        
        // Sort the data by the name property in ascending order
        data = data.sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name))
            // Map over the sorted data and generate a template for each item
            .map((item: Collection & Record<string, any>) => {
                const template = generateTemplate(item);
                Object.keys(template).forEach(key => {
                    if (key != 'id' && key != 'created_at' && key != 'contracts' && key != 'imageHandler' && key != 'placeholderImages' && key != 'loadingImages' )
                    item[key] = template[key];
                });
                // Return a new object that combines the properties of the item and the template
                return { ...item, ...template, mintTemplate: template.generateCreateTemplate(item) };
                // return item;
            });
        return data
    }

    async fetchCuratedContractByName(name: string, contracts: any = false, overrideFunc: Function | null = null): Promise<Collection | null> {
        !contracts ? contracts = overrideFunc? await overrideFunc(this.apiKey, {name}) : await this.fetchCuratedContracts(): null
        let contract = contracts.find((contract: Collection) => contract.name === name);
        return contract || null;
    }
    
    async createCuratedVault(template: any, callback: any = null, overrideFunc: Function | null = null): Promise<Vault> {
        templateGuard(template);
        template.chainId == 1? delete template.targetContract[5]: delete template.targetContract[1]
        let url = `${this.baseUrl}/create-curated`;
        if (callback) { callback(`creating Vault for user`, template.toAddress)}     
        let vaultCreationResponse = overrideFunc? await overrideFunc(this.apiKey, template): await fetchData(url, this.apiKey, 'POST', template);
        if (callback) { callback(`created Vault tokenId`, vaultCreationResponse.data.tokenId)}    
        return vaultCreationResponse.data
    }

    async upsertCuratedCollection(collection: Collection, overrideFunc: Function | null = null) {
        const url = `${this.v3Url}/v3/upsertCuratedCollection`;
        return overrideFunc? await overrideFunc(this.apiKey, collection): await fetchData(url, this.apiKey, 'POST', collection);
    }

    async deleteCuratedCollection(projectId: string | number, overrideFunc: Function | null = null) {
        const url = `${this.v3Url}/v3/deleteCuratedCollection`;
        // For DELETE requests with a body, we need to ensure the body is properly sent
        return overrideFunc? await overrideFunc(this.apiKey, {id: projectId}): await fetchData(url, this.apiKey, 'DELETE', {id: projectId});
    }

    // ** Deployments **
    async getDeployedContractAddresses(chainId?: number, overrideFunc: Function | null = null) {
        const url = `${this.baseUrl}/v3/chainDeployments/${chainId? chainId: ''}`;
        return overrideFunc? await overrideFunc(this.apiKey, chainId): await fetchData(url, this.apiKey);
    }

    async addChainDeployment(chainId: number, address: string, name: string, type: string, network: string, overrideFunc: Function | null = null) {
        const url = `${this.baseUrl}/v3/chainDeployment`;
        return overrideFunc? await overrideFunc(this.apiKey, {chainId, address, name, type, network}): await fetchData(url, this.apiKey, 'POST', {chainId, address, name, type, network});
    }

    async refreshOwnershipForTokenId(tokenId: string, callback: any = null, overrideFunc: Function | null = null): Promise<Ownership[]> {
        genericGuard(tokenId, "string", "tokenId");
        let url = `${this.baseUrl}/refreshBalanceForTokenId`;
        let response = overrideFunc? await overrideFunc(this.apiKey, {tokenId}):  await fetchData(url, this.apiKey, 'POST', {tokenId});
        if (callback) { callback(`Refreshed ownership for`, tokenId)} 
        return response;
    }

    async refreshOwnershipForAccount(account: string, callback: any = null, overrideFunc: Function | null = null): Promise<Ownership[]> {
        genericGuard(account, "string", "account");
        let url = `${this.baseUrl}/refreshBalanceForAccount`;
        let response = overrideFunc? await overrideFunc(this.apiKey, {account}):  await fetchData(url, this.apiKey, 'POST', {account});
        if (callback) { callback(`Refreshed ownership for`, account)} 
        return response;
    }

    async fetchMetadata(tokenId: string, callback: any = null, overrideFunc: Function | null = null): Promise<MetaData> {
        genericGuard(tokenId, "string", "tokenId");
        if (callback) { callback('getting Metadata')}  
        let url = `${this.baseUrl}/meta/${tokenId}`;
        let metadata = overrideFunc? await overrideFunc(this.apiKey, {tokenId}): await fetchData(url, this.apiKey);
        if (callback) { callback('received Metadata', metadata.tokenId)}  
        return metadata;
    }

    async refreshBalance(tokenId: string, callback: any = null, overrideFunc: Function | null = null): Promise<Balance[]> {
        genericGuard(tokenId, "string", "tokenId");
        if (callback) { callback('refreshing Balance')}  
        let url = `${this.v3Url}/vault/balance/${tokenId}?live=true`;
        let balance = overrideFunc? await overrideFunc(this.apiKey, {tokenId}): await fetchData(url, this.apiKey);
        if (callback) { callback('received Balance', balance.values)}
        return balance?.values || [];
    }

    async fetchVaultsOfType(vaultType: string, address: string, overrideFunc: Function | null = null): Promise<any> {
        genericGuard(vaultType, "string", "vaultType");
        genericGuard(address, "string", "address");
        let url = `${this.baseUrl}/myvaults/${address}?vaultType=${vaultType}`;
        let vaults = overrideFunc? await overrideFunc(this.apiKey, {vaultType, address}): await fetchData(url, this.apiKey);
        return vaults;
    }

    async generateJumpReport(address: string, hideUnMintable: boolean = false, overrideFunc: Function | null = null) {
        let vaultType = "unclaimed"
        let curated = await this.fetchCuratedContracts();
        return new Promise(async (resolve, reject) => {
            try {
                let map: { [key: string]: any } = {};
                let vaults = overrideFunc? await overrideFunc('vaults_of_type', this.apiKey, {vaultType, address}): await this.fetchVaultsOfType(vaultType, address);
                for (let vaultIndex = 0; vaultIndex < vaults.length; vaultIndex++) {
                    let item = vaults[vaultIndex];
                    let balances = item.ownership.balances || [];                        
                    if (item.targetContract) {
                        let vaultTargetContract: any = overrideFunc? await overrideFunc('curated_contract_by_name', this.apiKey, {name: item.targetContract.name}): await this.fetchCuratedContractByName(item.targetContract.name, curated);
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

    async generateMintReport(address: string, hideUnMintable: boolean = false, overrideFunc: Function | null = null) {
        let vaults = await this.fetchVaultsOfType("created", address, overrideFunc)
        let curated = await this.fetchCuratedContracts();
        let map: { [key: string]: any } = {};
        return new Promise(async (resolve, reject) => {
            try {
                vaults.forEach(async (vault: any) => {
                    if (vault.targetContract) {
                        let targetVault: any = overrideFunc? await overrideFunc(this.apiKey, {name: vault.targetContract.name}): await this.fetchCuratedContractByName(vault.targetContract.name, curated);
                        let balance = vault.balances && vault.balances.length > 0 ? vault.balances : vault.ownership && vault.ownership.balances && vault.ownership.balances.length > 0? vault.ownership.balances: []
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

    async generateMigrateReport(address: string, hideUnMintable: boolean = false, overrideFunc: Function | null = null) {
        let vaultType = "unclaimed"
        let curated = await this.fetchCuratedContracts();
        return new Promise(async (resolve, reject) => {
            try {
                let map: { [key: string]: any } = {};
                let vaults = overrideFunc? await overrideFunc(this.apiKey, {vaultType, address}): await this.fetchVaultsOfType(vaultType, address);
                for (let vaultIndex = 0; vaultIndex < vaults.length; vaultIndex++) {
                    let item = vaults[vaultIndex];
                    let balances = item.ownership.balances || [];                        
                    if (!item.targetContract) {
                        // let vaultTargetContract: any = await this.fetchCuratedContractByName(item.targetContract.name);
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
            const provider = await this.getOrDetectProvider('ethereum') as EthereumProvider;
            // Check if it's our adapter and return the raw Web3 instance
            if (provider instanceof Web3ProviderAdapter) {
                return provider.getRawWeb3();
            }
            // If it's a generic EIP-1193 provider, we might need to wrap it if direct Web3 usage is required
            // For now, let's assume the adapter covers the primary case (MetaMask)
            console.warn('loadWeb3: Detected Ethereum provider is not a Web3 instance. Returning the provider object itself.');
            return provider; 
        } catch (error) {
            console.error('Could not load or detect Ethereum provider:', error);
            return undefined;
        }
    }

    /**
     * Performs a mint operation on the blockchain.
     * @param web3 - The web3 instance to use for the transaction.
     * @param tokenId - The ID of the token to mint.
     * @param callback - Optional callback function to handle the transaction.
     * @returns A promise that resolves to the mint response.
     * @deprecated Use `performMintHelper` instead.
     */
    async performMintChain(web3: any, tokenId: string, callback: any = null) {
        let mintRequestSig = await this.requestLocalMintSignature(web3, tokenId, callback);
        let remoteMintSig = await this.requestRemoteMintSignature(web3, tokenId, mintRequestSig, callback);    
        let mintResponse = await this.performMint(web3, remoteMintSig, callback);
        return {mintResponse}
    }

    /**
     * Stub for new mint chain helper
     * @param amount - The amount of tokens to mint.
     * @param callback - Optional callback function to handle the transaction.
     * @returns A promise that resolves to the mint response.
     */
    async performMintHelper( amount: number, callback?: any): Promise<BigNumber> {
        const v3LocalMintSignature = await this.requestV3LocalMintSignature(amount.toString(), callback);
        const v3RemoteMintSignature = await this.requestV3RemoteMintSignature(v3LocalMintSignature.signature, callback);
        return BigNumber.from(v3RemoteMintSignature);
    }

    async performClaimChain(web3: any, tokenId: string, serialNumber: any, callback: any = null) {
        let sig = await this.requestLocalClaimSignature(web3, tokenId, serialNumber, callback)
        let jwt = await this.requestRemoteClaimToken(web3, tokenId, sig, callback)
        let dkeys = await this.requestRemoteKey(tokenId, jwt, callback)
        return await this.decryptVaultKeys(tokenId, dkeys, callback)
    }
    
    /**
     * Stub for new mint signature request
     * @param web3 - The web3 instance to use for the transaction.
     * @param tokenId - The ID of the token to mint.
     * @param callback - Optional callback function to handle the transaction.
     * @returns A promise that resolves to the mint signature.
     * @deprecated Use `requestV3LocalMintSignature` instead.
     */
    async requestLocalMintSignature(web3: any, tokenId: string, callback: any = null) {
        if (callback) { callback('requesting User Mint Signature')}
        const message = `Curated Minting: ${tokenId.toString()}`;
        const accounts = await web3.eth.getAccounts();
        const signature = await web3.eth.personal.sign(message, accounts[0], '');
        if (callback) { callback(`signature`, signature)}
        return signature;
    }

    /**
     * Requests a signature for a curated minting operation. (ONLY ETHEREUM FOR NOW)
     * @param tokenId - The ID of the token to mint.
     * @param callback - Optional callback function to handle the transaction.
     * @param overrideFunc - Optional function to override the default behavior.
     * @returns A promise that resolves to the mint signature.
     */
    async requestV3LocalMintSignature(tokenId: string, callback: any = null, overrideFunc: Function | null = null): Promise<v3LocalMintSignature> {
        if (callback) { callback('requesting Owner Mint Signature')}
        const provider = await this.getOrDetectProvider('ethereum');
        const rawBlockNumber = await provider.eth.getBlockNumber();
        const blockNumber = Number(rawBlockNumber).toString();
        const message = `Curated Minting: ${tokenId.toString()} \n\nat Block# ${blockNumber}`;
        const account = await this.getConnectedEthAccount();
        if (!account) {
            throw new Error('No connected wallet found');
        }
        const signature = overrideFunc? await overrideFunc(message, account): await provider.eth.personal.sign(message, account, callback? callback: '');
        if (callback) { callback(`signature`, signature)}
        return {message, signature};
    }

    /**
     * Requests a signature for a curated minting operation. (ONLY ETHEREUM FOR NOW)
     * @param tokenId - The ID of the token to mint.
     * @param signature - The signature for the curated minting operation.
     * @param callback - Optional callback function to handle the transaction.
     * @param overrideFunc - Optional function to override the default behavior.
     * @returns A promise that resolves to the remote mint signature.
     * @deprecated Use `requestV3RemoteMintSignature` instead.
     */
    async requestRemoteMintSignature(web3: any, tokenId: string, signature: string, callback: any = null, overrideFunc: Function | null = null) {
        if (callback) { callback('requesting Remote Mint signature')}  
        const chainId = await web3.eth.getChainId();
        let url = `${this.baseUrl}/mint-curated`;
        let mintRequestBody = {method: 'buyWithSignedPrice', tokenId: tokenId, signature: signature, chainId: chainId.toString()}
        let remoteMintResponse = overrideFunc? await overrideFunc(url, this.apiKey, 'POST', mintRequestBody): await fetchData(url, this.apiKey, 'POST', mintRequestBody);
        if (remoteMintResponse.error) {
            throw new Error(remoteMintResponse.error)
        }
        if (callback) { callback(`remote Mint signature`, remoteMintResponse)}
        return remoteMintResponse
    }

    /**
     * Requests a signature for a curated minting operation. (ONLY ETHEREUM FOR NOW)
     * @param tokenId - The ID of the token to mint.
     * @param signature - The signature for the curated minting operation.
     * @param callback - Optional callback function to handle the transaction.
     * @param overrideFunc - Optional function to override the default behavior.
     * @returns A promise that resolves to the remote mint signature.
     */
    async requestV3RemoteMintSignature(tokenId: string, signature: string, callback: any = null, overrideFunc: Function | null = null) {
        if (callback) { callback('requesting Remote Mint signature')}  
        const chainId = (await this.getOrDetectProvider('ethereum')).eth.getChainId();
        let url = `${this.baseUrl}/mint-curated`;
        const mintRequestBody = {method: 'buyWithSignedPrice', tokenId: tokenId, signature: signature, chainId: chainId.toString(), enhanced: true};
        let remoteMintResponse = overrideFunc? await overrideFunc(url, this.apiKey, 'POST', mintRequestBody): await fetchData(url, this.apiKey, 'POST', mintRequestBody);
        if (remoteMintResponse.error) {
            throw new Error(remoteMintResponse.error)
        }
        if (callback) { callback(`remote Mint signature`, remoteMintResponse)}
        return remoteMintResponse
    }

    async requestLocalClaimSignature(web3: any, tokenId: string, serialNumber: any, callback: any = null) {
        if (callback) { callback('requesting User Claim Signature')}
        const message = `Claim: ${serialNumber? serialNumber.toString(): tokenId.toString()}`;
        const accounts = await web3.eth.getAccounts();
        const signature = await web3.eth.personal.sign(message, accounts[0], '');
        if (callback) { callback(`signature`, signature)}
        return signature;
    }

    async requestRemoteClaimToken(web3: any, tokenId: string, signature: string, callback: any = null, overrideFunc: Function | null = null) {
        if (callback) { callback('requesting Remote Claim token')}
        const chainId = await web3.eth.getChainId();
        let url = `${this.sigUrl}/sign`;
        let remoteClaimResponse = overrideFunc? await overrideFunc(this.apiKey, {signature: signature, tokenId: tokenId, chainid: chainId.toString()}): await fetchData(url, this.apiKey, 'POST',  {signature: signature, tokenId: tokenId}, {chainid: chainId.toString()});
        if (callback) { callback(`remote Claim token`, remoteClaimResponse)}
        return remoteClaimResponse
    }

    async requestRemoteKey(tokenId: string, jwt: any, callback: any = null, overrideFunc: Function | null = null) {
        if (callback) { callback('requesting Remote Key')}
        let dkeys = overrideFunc? await overrideFunc(this.apiKey, {tokenId: tokenId, jwt: jwt.token}): await getTorusKeys(tokenId, jwt.token)
        if (callback) { callback(`remote Key`, dkeys)}
        return dkeys
    }

    async decryptVaultKeys(tokenId: string, dkeys: any, callback: any = null, overrideFunc: Function | null = null) {
        if (callback) { callback('decrypting Vault Keys')}
        let metadata: any = overrideFunc? await overrideFunc(this.apiKey, {tokenId: tokenId}): await this.fetchMetadata(tokenId);
        let ukeys = await decryptKeys(metadata.ciphertextV2, dkeys, metadata.addresses)
        if (callback) { callback(`remote Key`, ukeys)}
        return ukeys
    }

    async recoverSignerFromMessage(message: string, signature: string, overrideFunc: Function | null = null): Promise<string> {
        const provider = await this.getOrDetectProvider('ethereum');
        return overrideFunc? await overrideFunc(message, signature): await provider.eth.personal.recover(message, signature);
    }

    /**
     * ** Emblem Vault AI **
     *
     * Be sure to allow api key requests, or api_key_hash and auth sig (wallet, socialAuth, oAuth)
     * Here we will begin using the aiApiKey and the aiUrl to communicate with the ai vault system
     * 
     */

    async vaultInfoFromApiKey(aiApiKey?: string, full?: boolean, overrideFunc: Function | null = null): Promise<AiVaultInfo> {
        const url = `${this.aiUrl}/vault/${full ? 'info-complete' : 'info'}`;
        const selectedKey = aiApiKey ? aiApiKey : this.aiApiKey ? this.aiApiKey : '';
        const actionFunction = overrideFunc && typeof overrideFunc === 'function' ? overrideFunc: fetchData;
        const vaultDetails =  await actionFunction(url, selectedKey, 'POST', null);
        // vaultDetails.computedEthAddress = ethers.utils.computeAddress(vaultDetails.pkp.pub_key.replace('0x',''));
        return vaultDetails;
    }

    /**
     * @deprecated This method is deprecated and will be removed in a future version.
     * Please use alternative methods for price quotation.
     */
    async getQuote(web3: any, amount: number, callback: any = null) {
        if (callback) { callback('requesting Quote')}
        let quoteContract = await getQuoteContractObject(web3);
        const accounts = await web3.eth.getAccounts();
        let quote = BigNumber.from(await quoteContract.methods.quoteExternalPrice(accounts[0], Number(amount)/1000000).call());
        if (callback) { callback(`quote`, quote.toString())}
        return quote
    }

    // todo add contract overrides
    async performMint(web3: any, remoteMintSig: any, callback: any = undefined) {
    // async performMint(web3, quote, remoteMintSig, callback = null) {
        if (callback) { callback('performing Mint') }
        const accounts = await web3.eth.getAccounts();
        let handlerContract = await getHandlerContract(web3);
    
        // Get current gas price from the network
        const gasPrice = await web3.eth.getGasPrice();

        let createdTxObject = handlerContract.methods.buyWithSignedPrice(
            remoteMintSig._nftAddress,
            '0x0000000000000000000000000000000000000000',
            remoteMintSig._price.hex,
            remoteMintSig._to, 
            remoteMintSig._tokenId, 
            remoteMintSig._nonce, 
            remoteMintSig._signature, 
            remoteMintSig.serialNumber, 
            1
        )
        
        // Estimate gas limit for the transaction
        const gasLimit = await createdTxObject.estimateGas({ from: accounts[0], value: remoteMintSig._price.hex });
    
        // Execute the transaction with the specified gas price and estimated gas limit
        let mintResponse = await createdTxObject.send({ 
            from: accounts[0], 
            value: remoteMintSig._price.hex,
            gasPrice: gasPrice, // Use the current gas price
            gas: gasLimit // Use the estimated gas limit
        }).on('transactionHash', (hash: any) => {
            if (callback) callback(`Transaction submitted. Hash`, hash);
        })
        .on('confirmation', (confirmationNumber: any, receipt: any) => {
            if (callback) callback(`Mint Complete. Confirmation Number`, confirmationNumber);
        })
        .on('error', (error: { message: any; }) => {
            if (callback) callback(`Transaction Error`, error.message );
        });
    
        if (callback) { callback('Mint Complete') }
        await this.fetchMetadata(remoteMintSig._tokenId);
        return mintResponse
    }
        

    async performBurn(web3: any, tokenId: any, callback: any = null) {
        let metadata: any = await this.fetchMetadata(tokenId);
        let targetContract: any = await this.fetchCuratedContractByName(metadata.targetContract.name);
        if (callback) { callback('performing Burn')}
        const accounts = await web3.eth.getAccounts();
        const chainId = await web3.eth.getChainId();
        let handlerContract = await getHandlerContract(web3);
    
        // Dynamically fetch the current gas price
        const gasPrice = await web3.eth.getGasPrice();
        
        let createdTxObject = handlerContract.methods.claim(targetContract[chainId], targetContract.collectionType == 'ERC721a' ? tokenId : targetContract.tokenId) 
        // Estimate gas limit for the transaction
        const estimatedGas = await createdTxObject.estimateGas({from: accounts[0]});
    
        let burnResponse = await createdTxObject.send({
            from: accounts[0],
            gasPrice: gasPrice,
            gas: estimatedGas
        }).on('transactionHash', (hash: any) => {
            if (callback) callback(`Transaction submitted. Hash`, hash);
        })
        .on('confirmation', (confirmationNumber: any, receipt: any) => {
            if (callback) callback(`Burn Complete. Confirmation Number`, confirmationNumber);
        })
        .on('error', (error: { message: any; }) => {
            if (callback) callback(`Transaction Error`, error.message );
        });
    
        if (callback) { callback('Burn Complete')}
        return burnResponse;
    }
    

    async contentTypeReport(url: string) {
        return await checkContentType(url)
    }

    async legacyBalanceFromContractByAddress(web3: any, address: string) {
        let legacyContract =await getLegacyContract(web3)
        let balance = await legacyContract.methods.getOwnerNFTCount(address).call();
        let tokenIds = []
        for (let index = 0; index < balance; index++) {
            let tokenId = await legacyContract.methods.tokenOfOwnerByIndex(address, index).call();
            tokenIds.push(Number(tokenId))
        }
        return tokenIds
    }

    async refreshLegacyOwnership(web3: any, address: string) {
        let myLegacy = await this.legacyBalanceFromContractByAddress(web3, address)
        myLegacy.forEach(async item=>{
            let meta = await this.fetchMetadata(item.toString())
        })
    }

    async refreshERC1155Ownership(web3: any, contractAddress: string, address: string) {
        let erc1155Contract = await getERC1155Contract(web3, contractAddress)
        let balance = await erc1155Contract.methods.balanceOf(address).call();
        let tokenIds = []
        for (let index = 0; index < balance; index++) {
            let tokenId = await erc1155Contract.methods.tokenOfOwnerByIndex(address, index).call();
            tokenIds.push(Number(tokenId))
        }
        return tokenIds
    }

    async refreshERC721Ownership(web3: any, contractAddress: string, address: string) {
        let erc721Contract = await getERC721AContract(web3, contractAddress)
        let balance = await erc721Contract.methods.balanceOf(address).call();
        let tokenIds = []
        for (let index = 0; index < balance; index++) {
            let tokenId = await erc721Contract.methods.tokenOfOwnerByIndex(address, index).call();
            tokenIds.push(Number(tokenId))
        }
        return tokenIds
    }

    async getContractTokenIdsByTargetContractName(contractName: string, distinct: boolean) {
        let url = `${this.v3Url}/contractTokenIds/${contractName}?distinct=${distinct}`;
        return await fetchData(url, this.apiKey, 'GET');
    }

    async getTokenIdInternalTokenIdMapByTargetContractName(contractName: string) {
        let url = `${this.v3Url}/tokenIdInternalTokenIdMap/${contractName}`;
        return await fetchData(url, this.apiKey, 'GET');
    }

    async checkLiveliness(tokenId: string, chainId: number = 1) {
        let url = `${this.baseUrl}/liveliness-curated/`;
        return await fetchData(url, this.apiKey, 'POST', {tokenId: tokenId}, {chainid: chainId, "Content-Type":"application/json"});
    }

    async checkLivelinessBulk(tokenIds: string[], chainId: number = 1){
        const chunkSize = 20;
        let results: any[] = [];
        let url = `${this.baseUrl}/batch_liveliness/`;
        let apiKey = this.apiKey;
        async function processChunks(i = 0, delay = 1000) {
            if (i < tokenIds.length) {
                let chunk = tokenIds.slice(i, i + chunkSize);
                
                try {
                    let result = await fetchData(url, apiKey, 'POST', {tokenIds: chunk}, {chainid: chainId, "Content-Type":"application/json"});
                    results.push(result);
                    processChunks(i + chunkSize);
                } catch (error) {
                    console.error(`Error fetching data for chunk starting at index ${i}. Retrying in ${delay}ms...`, error);
                    setTimeout(() => processChunks(i, delay * 2), delay);
                }
            }
        }
        processChunks();
        return results;
    }

    // BTC

    async sweepVaultUsingPhrase(phrase: string, satsPerByte: number = 20, broadcast: boolean = false) {     

        const { paymentAddress, paymentPublicKey, ordinalsAddress } = await getSatsConnectAddress();

        // change this to mainnet
        if (window.bitcoin) {
            let bitcoin = window.bitcoin;
            var network = bitcoin.networks.mainnet;

            // generate taproot address
            const { p2tr, pubKey, tweakedSigner } = await generateTaprootAddressFromMnemonic(phrase);
            const taprootAddress = p2tr.address;

            // build payment definition for payments address
            const p2wpkh = bitcoin.payments.p2wpkh({
                pubkey: Buffer.from(paymentPublicKey, "hex"),
                network,
            });
            const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network });

            console.log(taprootAddress);

            const getAddressUtxos = async (address: string) => {
                const response = await fetch(
                    `https://mempool.space/api/address/${address}/utxo`
                );
                const utxos = await response.json();
                return utxos;
            };

            const taprootUtxos = await getAddressUtxos(taprootAddress);
            const paymentUtxos = await getAddressUtxos(paymentAddress);

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

                size = getPsbtTxnSize(phrase, psbt.toBase64());

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
            
            let signedPsbt = await signPSBT(psbtBase64, paymentAddress, [...Array(paymentUtxos.length).keys()].map(i => i + taprootUtxos.length), broadcast);
            return signedPsbt;
        }

    }

}

declare global {
    interface Window {
        EmblemVaultSDK: any;
        // web3: any;
        // ethereum: any
    }
}

if (typeof window !== 'undefined') {
    window.EmblemVaultSDK = EmblemVaultSDK;
}
