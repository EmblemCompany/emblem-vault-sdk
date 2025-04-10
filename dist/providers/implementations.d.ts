/**
 * Blockchain Provider Implementations
 *
 * This file contains concrete implementations of blockchain providers.
 * These implementations should be excluded from the main bundle
 * to avoid conflicts with consumer libraries.
 */
import { EthereumProvider } from './interfaces';
/**
 * Web3 provider adapter
 * This wraps a Web3 instance to make it conform to our EthereumProvider interface
 */
export declare class Web3ProviderAdapter implements EthereumProvider {
    private web3;
    type: 'ethereum';
    constructor(web3: any);
    request(args: {
        method: string;
        params?: any[];
    }): Promise<any>;
    isConnected(): Promise<boolean>;
    get eth(): any;
    getRawWeb3(): any;
}
