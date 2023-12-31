import { Collection, CuratedCollectionsResponse, MetaData, Vault } from './types';
import { COIN_TO_NETWORK, NFT_DATA, evaluateFacts, fetchData, generateTemplate, genericGuard, metadataAllProjects, metadataObj2Arr, pad, templateGuard } from './utils';

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

    getAllProjects() {
        const NFT_DATA_ARR = metadataObj2Arr(NFT_DATA)
        const projects = metadataAllProjects(NFT_DATA_ARR)
        return projects
    }

    // ** Curated **
    //
    async fetchCuratedContracts(hideUnMintable: boolean = false): Promise<CuratedCollectionsResponse> {
        let url = `${this.baseUrl}/curated`;
        let data = await fetchData(url, this.apiKey);

        // Filter out collections that are not mintable
        data = hideUnMintable? data.filter((collection: Collection) => collection.mintable): data;
        
        // Sort the data by the name property in ascending order
        data = data.sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name))
            // Map over the sorted data and generate a template for each item
            .map((item: any) => {
                const template = generateTemplate(item);
                // Return a new object that combines the properties of the item and the template
                return { ...item, ...template };
            });
        return data
    }
    
    async createCuratedVault(template: any): Promise<Vault> {
        templateGuard(template);
        let url = `${this.baseUrl}/create-curated`;        
        let vaultCreationResponse = await fetchData(url, this.apiKey, 'POST', template);
        return vaultCreationResponse.data
    }

    async fetchMetadata(tokenId: string): Promise<MetaData> {
        genericGuard(tokenId, "string", "tokenId");
        let url = `${this.baseUrl}/meta/${tokenId}`;
        let metadata = await fetchData(url, this.apiKey);
        return metadata;
    }

    async fetchVaultsOfType(vaultType: string, address: string): Promise<any> {
        genericGuard(vaultType, "string", "vaultType");
        genericGuard(address, "string", "address");
        let url = `${this.baseUrl}/myvaults/${address}?vaultType=${vaultType}`;
        let vaults = await fetchData(url, this.apiKey);
        return vaults;
    }

}

declare global {
    interface Window {
        EmblemVaultSDK: any;
    }
}

if (typeof window !== 'undefined') {
    window.EmblemVaultSDK = EmblemVaultSDK;
}

export default EmblemVaultSDK;
