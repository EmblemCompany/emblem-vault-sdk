export declare const NFT_DATA: any;
export declare const pad: (num: string | any[], size: number) => string | null;
export declare const evaluateFacts: (allowed: boolean, facts: {
    eval: any;
    msg: string;
}[], msgCallback: any) => boolean;
export declare const metadataObj2Arr: (data: any) => any[];
export declare const metadataAllProjects: (projects: any[]) => any[];
export declare const fetchData: (url: string, apiKey: string, method?: string, body?: any) => Promise<any>;
export declare function generateAttributeTemplate(record: any): any;
export declare function generateImageTemplate(record: any): any;
export declare function generateTemplate(record: any): any;
export declare function templateGuard(input: {
    [x: string]: any;
    hasOwnProperty: (arg0: string) => any;
}): void;
export declare function genericGuard(input: any, type: string, key: string): void;
export declare function getQuoteContractObject(web3: any): Promise<any>;
export declare function getHandlerContract(web3: any): Promise<any>;
export declare function getLegacyContract(web3: any): Promise<any>;
export declare function checkContentType(url: string): Promise<unknown>;
export declare const COIN_TO_NETWORK: any;
