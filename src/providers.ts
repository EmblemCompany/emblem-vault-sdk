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
  request(args: { method: string; params?: any[] }): Promise<any>;
  // For Web3.js compatibility
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
  connect(): Promise<{ publicKey: string }>;
  disconnect(): Promise<void>;
  signTransaction?(transaction: any): Promise<any>;
  signAllTransactions?(transactions: any[]): Promise<any[]>;
  signMessage?(message: Uint8Array): Promise<{ signature: Uint8Array }>;
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
export class Web3ProviderAdapter implements EthereumProvider {
  type: 'ethereum' = 'ethereum';
  
  constructor(private web3: any) {}
  
  async request(args: { method: string; params?: any[] }): Promise<any> {
    switch (args.method) {
      case 'eth_accounts':
        return this.web3.eth.getAccounts();
      case 'eth_chainId':
        return this.web3.eth.getChainId();
      case 'eth_getBalance':
        return this.web3.eth.getBalance(args.params?.[0]);
      case 'personal_sign':
        return this.web3.eth.personal.sign(
          args.params?.[0],
          args.params?.[1],
          args.params?.[2]
        );
      default:
        throw new Error(`Method ${args.method} not implemented`);
    }
  }
  
  async isConnected(): Promise<boolean> {
    try {
      const accounts = await this.web3.eth.getAccounts();
      return Array.isArray(accounts) && accounts.length > 0;
    } catch (error) {
      return false;
    }
  }
  
  // Expose the original web3 instance
  get eth() {
    return this.web3.eth;
  }
  
  // Get the raw web3 instance
  getRawWeb3() {
    return this.web3;
  }
}

/**
 * Utility to detect the type of a provider based on its properties
 */
export function detectProviderType(provider: any): BlockchainType {
  if (!provider) return 'other';
  
  if (provider.eth || (provider.request && typeof provider.request === 'function')) {
    return 'ethereum';
  }
  
  if (provider.publicKey || provider.connection || provider.isPhantom || (provider.signAllTransactions && typeof provider.signAllTransactions === 'function') || (provider.signTransaction && typeof provider.signTransaction === 'function')) {
    return 'solana';
  }
  
  if (provider.network || 
      (provider.signPsbt && typeof provider.signPsbt === 'function')) {
    return 'bitcoin';
  }
  
  return 'other';
}

/**
 * Utility to check if a provider is of a specific type
 */
export function isProviderType<T extends BlockchainProvider>(provider: any, type: BlockchainType): provider is T {
  return detectProviderType(provider) === type;
}

export function asProvider(provider: BlockchainProvider): BlockchainProvider {
  return provider as BlockchainProvider;
}

// We need to modify how we declare global types to avoid conflicts
// with existing declarations in other files
export {}; // Make this file a module

// Extend the Window interface instead of redeclaring it
declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    // bitcoin?: any;
    web3?: any;
  }
}
