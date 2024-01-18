import { CuratedCollectionsResponse, MetaData, Vault } from './types';
declare class EmblemVaultSDK {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string, baseUrl?: string);
    generateUploadUrl(): void;
    getAssetMetadata(projectName: string, strict?: boolean): any[];
    getAllProjects(): any[];
    fetchCuratedContracts(hideUnMintable?: boolean, overrideFunc?: Function | boolean): Promise<CuratedCollectionsResponse>;
    createCuratedVault(template: any): Promise<Vault>;
    fetchMetadata(tokenId: string): Promise<MetaData>;
    fetchVaultsOfType(vaultType: string, address: string): Promise<any>;
    loadWeb3(): Promise<any | undefined>;
}
declare global {
    interface Window {
        EmblemVaultSDK: any;
        web3: any;
        ethereum: any;
    }
}
export default EmblemVaultSDK;
