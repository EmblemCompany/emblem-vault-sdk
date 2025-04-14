/**
 * Blockchain Provider Abstraction
 *
 * This file defines interfaces and utilities for working with different blockchain providers
 * in a consistent way, regardless of the underlying implementation.
 */
/**
 * Supported blockchain types
 */
export type BlockchainType = 'ethereum' | 'solana' | 'bitcoin' | 'other';
/**
 * Base interface for all blockchain providers
 */
export interface BlockchainProviderBase {
    type: BlockchainType;
    isConnected(): Promise<boolean>;
}
/**
 * Ethereum provider interface
 * Compatible with EIP-1193 and Web3.js
 */
export interface EthereumProvider extends BlockchainProviderBase {
    type: 'ethereum';
    request(args: {
        method: string;
        params?: any[];
    }): Promise<any>;
    eth?: {
        Contract?: any;
        getAccounts?: () => Promise<string[]>;
        getChainId?: () => Promise<string>;
        getBalance?: (address: string) => Promise<string>;
        personal?: {
            sign?: (message: string, address: string, password?: string) => Promise<string>;
        };
    };
}
/**
 * Solana provider interface
 */
export interface SolanaProvider extends BlockchainProviderBase {
    type: 'solana';
    connect(): Promise<{
        publicKey: string;
    }>;
    disconnect(): Promise<void>;
    signTransaction?(transaction: any): Promise<any>;
    signAllTransactions?(transactions: any[]): Promise<any[]>;
    signMessage?(message: Uint8Array): Promise<{
        signature: Uint8Array;
    }>;
    publicKey?: any;
    connection?: any;
}
/**
 * Bitcoin provider interface
 */
export interface BitcoinProvider extends BlockchainProviderBase {
    type: 'bitcoin';
    getAddress?(): Promise<string>;
    signMessage?(message: string, address: string): Promise<string>;
    signPsbt?(psbtBase64: string): Promise<string>;
    network?: any;
}
/**
 * Union type of all provider interfaces
 */
export type BlockchainProvider = EthereumProvider | SolanaProvider | BitcoinProvider;
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
export declare function isProviderType<T extends BlockchainProvider>(provider: any, type: BlockchainType): provider is T;
export declare function asProvider(provider: BlockchainProvider): BlockchainProvider;
export {};
declare global {
    interface Window {
        ethereum?: any;
        solana?: any;
        web3?: any;
    }
}
