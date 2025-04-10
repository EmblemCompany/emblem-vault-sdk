/**
 * Blockchain Provider Implementations
 *
 * This file contains concrete implementations of blockchain providers.
 * These implementations are NOT intended to be included in the bundle
 * to avoid conflicts with consumer libraries.
 */
import { BlockchainType, EthereumProvider, BlockchainProvider } from './provider-interfaces';
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
/**
 * Utility to detect the type of a provider based on its properties
 */
export declare function detectProviderType(provider: any): BlockchainType;
/**
 * Utility to check if a provider is of a specific type
 */
export declare function isProviderType<T extends BlockchainProvider>(provider: any, type: BlockchainType): provider is BlockchainProvider;
