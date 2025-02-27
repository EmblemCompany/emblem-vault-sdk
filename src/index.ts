import { BigNumber } from '@ethersproject/bignumber'
import { Collection, CuratedCollectionsResponse, MetaData, Ownership, Vault } from './types';
import { COIN_TO_NETWORK, NFT_DATA, checkContentType, decryptKeys, evaluateFacts, fetchData, generateTemplate, genericGuard, getHandlerContract, getLegacyContract, getQuoteContractObject, getSatsConnectAddress, getTorusKeys, metadataAllProjects, metadataObj2Arr, pad, signPSBT, templateGuard } from './utils';
import { getAddress, BitcoinNetworkType, AddressPurpose, signTransaction } from "sats-connect";
import { generateTaprootAddressFromMnemonic, getPsbtTxnSize } from './derive';
const SDK_VERSION = '__SDK_VERSION__'; 

class EmblemVaultSDK {
    private baseUrl: string;
    private v3Url: string;
    private sigUrl: string;
    constructor(private apiKey: string, baseUrl?: string, v3Url?: string, sigUrl?: string) {
        console.log('EmblemVaultSDK version:', SDK_VERSION)
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

    getRemoteAssetMetadataProjectList() {
        return fetchData(`${this.v3Url}/asset_metadata/projects`, this.apiKey);
    }

    getRemoteAssetMetadata(asset_name: string) {
        return fetchData(`${this.v3Url}/asset_metadata/${asset_name}`, this.apiKey);
    }

    getRemoteAssetMetadataVaultedProjectList() {
        return fetchData(`${this.v3Url}/asset_metadata/projects/vaulted`, this.apiKey);
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
        template.chainId == 1? delete template.targetContract[5]: delete template.targetContract[1]
        let url = `${this.baseUrl}/create-curated`;
        if (callback) { callback(`creating Vault for user`, template.toAddress)}     
        let vaultCreationResponse = await fetchData(url, this.apiKey, 'POST', template);
        if (callback) { callback(`created Vault tokenId`, vaultCreationResponse.data.tokenId)}    
        return vaultCreationResponse.data
    }

    async refreshOwnershipForTokenId(tokenId: string, callback: any = null): Promise<Ownership[]> {
        genericGuard(tokenId, "string", "tokenId");
        let url = `${this.baseUrl}/refreshBalanceForTokenId`;
        let response = await fetchData(url, this.apiKey, 'POST', {tokenId});
        if (callback) { callback(`Refreshed ownership for`, tokenId)} 
        return response;
    }

    async refreshOwnershipForAccount(account: string, callback: any = null): Promise<Ownership[]> {
        genericGuard(account, "string", "account");
        let url = `${this.baseUrl}/refreshBalanceForAccount`;
        let response = await fetchData(url, this.apiKey, 'POST', {account});
        if (callback) { callback(`Refreshed ownership for`, account)} 
        return response;
    }

    async fetchMetadata(tokenId: string, callback: any = null): Promise<MetaData> {
        genericGuard(tokenId, "string", "tokenId");
        if (callback) { callback('getting Metadata')}  
        let url = `${this.baseUrl}/meta/${tokenId}`;
        let metadata = await fetchData(url, this.apiKey);
        if (callback) { callback('received Metadata', metadata.tokenId)}  
        return metadata;
    }

    async refreshBalance(tokenId: string, callback: any = null): Promise<MetaData> {
        genericGuard(tokenId, "string", "tokenId");
        if (callback) { callback('refreshing Balance')}  
        let url = `${this.v3Url}/vault/balance/${tokenId}?live=true`;
        let balance = await fetchData(url, this.apiKey);
        if (callback) { callback('received Balance', balance.balances)}
        return balance?.balances || [];
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
        let quote = await this.getQuote(web3, collection? collection.price: remoteMintSig._price/1000000, callback);
        let ethToSend = quote.mul(BigNumber.from(10).pow(6))
        let mintResponse = await this.performMint(web3, ethToSend, remoteMintSig, callback);
        return {mintResponse}
    }

    async performClaimChain(web3: any, tokenId: string, serialNumber: any, callback: any = null) {
        let sig = await this.requestLocalClaimSignature(web3, tokenId, serialNumber, callback)
        let jwt = await this.requestRemoteClaimToken(web3, tokenId, sig, callback)
        let dkeys = await this.requestRemoteKey(tokenId, jwt, callback)
        return await this.decryptVaultKeys(tokenId, dkeys, callback)
    }
    
    async requestLocalMintSignature(web3: any, tokenId: string, callback: any = null) {
        if (callback) { callback('requesting User Mint Signature')}
        const message = `Curated Minting: ${tokenId.toString()}`;
        const accounts = await web3.eth.getAccounts();
        const signature = await web3.eth.personal.sign(message, accounts[0], '');
        if (callback) { callback(`signature`, signature)}
        return signature;
    }

    async requestLocalClaimSignature(web3: any, tokenId: string, serialNumber: any, callback: any = null) {
        if (callback) { callback('requesting User Claim Signature')}
        const message = `Claim: ${serialNumber? serialNumber.toString(): tokenId.toString()}`;
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
        if (remoteMintResponse.error) {
            throw new Error(remoteMintResponse.error)
        }
        if (callback) { callback(`remote Mint signature`, remoteMintResponse)}
        return remoteMintResponse
    }    

    async requestRemoteClaimToken(web3: any, tokenId: string, signature: string, callback: any = null) {
        if (callback) { callback('requesting Remote Claim token')}
        const chainId = await web3.eth.getChainId();
        let url = `${this.sigUrl}/sign`;
        let remoteClaimResponse = await fetchData(url, this.apiKey, 'POST',  {signature: signature, tokenId: tokenId}, {chainid: chainId.toString()});
        if (callback) { callback(`remote Claim token`, remoteClaimResponse)}
        return remoteClaimResponse
    }

    async requestRemoteKey(tokenId: string, jwt: any, callback: any = null) {
        if (callback) { callback('requesting Remote Key')}
        let dkeys = await getTorusKeys(tokenId, jwt.token)
        if (callback) { callback(`remote Key`, dkeys)}
        return dkeys
    }

    async decryptVaultKeys(tokenId: string, dkeys: any, callback: any = null) {
        if (callback) { callback('decrypting Vault Keys')}
        let metadata: any = await this.fetchMetadata(tokenId);
        let ukeys = await decryptKeys(metadata.ciphertextV2, dkeys, metadata.addresses)
        if (callback) { callback(`remote Key`, ukeys)}
        return ukeys
    }

    async getQuote(web3: any, amount: number, callback: any = null) {
        if (callback) { callback('requesting Quote')}
        let quoteContract = await getQuoteContractObject(web3);
        const accounts = await web3.eth.getAccounts();
        let quote = BigNumber.from(await quoteContract.methods.quoteExternalPrice(accounts[0], Number(amount)/1000000).call());
        if (callback) { callback(`quote`, quote.toString())}
        return quote
    }

    async performMint(web3: any, quote: any, remoteMintSig: any, callback: any = null) {
    // async performMint(web3, quote, remoteMintSig, callback = null) {
        if (callback) { callback('performing Mint') }
        const accounts = await web3.eth.getAccounts();
        let handlerContract = await getHandlerContract(web3);
    
        // Get current gas price from the network
        const gasPrice = await web3.eth.getGasPrice();

        let createdTxObject = handlerContract.methods.buyWithQuote(
            remoteMintSig._nftAddress, 
            remoteMintSig._price, 
            remoteMintSig._to, 
            remoteMintSig._tokenId, 
            remoteMintSig._nonce, 
            remoteMintSig._signature, 
            remoteMintSig.serialNumber, 
            1
        )
        
        // Estimate gas limit for the transaction
        const gasLimit = await createdTxObject.estimateGas({ from: accounts[0], value: Number(quote) });
    
        // Execute the transaction with the specified gas price and estimated gas limit
        let mintResponse = await createdTxObject.send({ 
            from: accounts[0], 
            value: Number(quote),
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
        web3: any;
        ethereum: any
    }
}

if (typeof window !== 'undefined') {
    window.EmblemVaultSDK = EmblemVaultSDK;
}

export default EmblemVaultSDK;
