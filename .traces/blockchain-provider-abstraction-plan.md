# Blockchain Provider Abstraction Plan

## Overview

This document outlines the plan for implementing a flexible blockchain provider abstraction in the Emblem Vault SDK. The goal is to create a system that allows the SDK to work with multiple blockchain ecosystems (Ethereum, Solana, Bitcoin) without directly depending on specific implementations, while maintaining backward compatibility with existing code.

## Current State

Currently, the SDK:
- Has direct dependencies on web3.js for Ethereum interactions
- Uses window.ethereum for browser wallet connections
- Requires passing web3 instances to methods that need blockchain interaction
- Has hard-coded references to blockchain-specific functionality

## Goals

1. **Provider Registration**: Allow developers to register providers for different blockchain types
2. **Auto-Detection**: Automatically detect and use available providers in the environment
3. **Method Simplification**: Methods should not require passing providers directly
4. **Backward Compatibility**: Maintain support for existing code that passes web3 instances
5. **Testing Support**: Continue supporting the override function pattern for testing
6. **Environment Agnostic**: Work in browser, Node.js, or any JavaScript environment

## Implementation Plan

### 1. Provider Interface

```typescript
export type BlockchainType = 'ethereum' | 'solana' | 'bitcoin' | 'other';

export class EmblemVaultSDK {
  private providers: Map<BlockchainType, any> = new Map();
  
  // Register a provider for a specific blockchain type
  registerProvider(type: BlockchainType, provider: any): void {
    this.providers.set(type, provider);
  }
  
  // Get a registered provider by type
  getProvider(type: BlockchainType): any {
    return this.providers.get(type);
  }
}
```

### 2. Auto-Detection Mechanism

```typescript
// Auto-detect and use available providers in the environment
private async getOrDetectProvider(type: BlockchainType): Promise<any> {
  // First check if we have a registered provider
  let provider = this.providers.get(type);
  if (provider) return provider;
  
  // If not, try to detect one in the environment
  if (typeof window !== 'undefined') {
    switch (type) {
      case 'ethereum':
        if (window.ethereum) {
          // Connect to MetaMask or other injected provider
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const { default: Web3 } = await import('web3');
          provider = new Web3(window.ethereum);
          this.registerProvider('ethereum', provider);
          return provider;
        }
        break;
      case 'solana':
        if (window.solana) {
          // Connect to Phantom or other Solana wallet
          await window.solana.connect();
          this.registerProvider('solana', window.solana);
          return window.solana;
        }
        break;
      case 'bitcoin':
        if (window.bitcoin) {
          this.registerProvider('bitcoin', window.bitcoin);
          return window.bitcoin;
        }
        break;
    }
  }
  
  throw new Error(`No provider available for blockchain type: ${type}`);
}
```

### 3. Method Updates

Update all methods that currently require a web3 instance to use the provider abstraction:

```typescript
// Before
async legacyBalanceFromContractByAddress(web3: any, address: string) {
  let legacyContract = await getLegacyContract(web3);
  // ...
}

// After
async legacyBalanceFromContractByAddress(
  address: string, 
  overrideFunc: Function | null = null
) {
  // If override function is provided, use it
  if (overrideFunc && typeof overrideFunc === 'function') {
    return await overrideFunc(this.apiKey, { address });
  }
  
  // Get or detect an Ethereum provider
  const provider = await this.getOrDetectProvider('ethereum');
  
  // Use the provider
  let legacyContract = await getLegacyContract(provider);
  // ...
}
```

### 4. Backward Compatibility

To maintain backward compatibility, we'll:

1. Keep the `loadWeb3` method for existing code
2. Add detection for when a web3 instance is passed directly to methods
3. Update utility functions like `getLegacyContract` to work with both web3 instances and providers

```typescript
// Update utility functions to handle both web3 and providers
export async function getLegacyContract(web3OrProvider: any) {
  // If it's a web3 instance
  if (web3OrProvider.eth && web3OrProvider.eth.Contract) {
    return new web3OrProvider.eth.Contract(ABI, CONTRACT_ADDRESS);
  }
  
  // If it's an EIP-1193 provider
  if (web3OrProvider.request) {
    const { default: Web3 } = await import('web3');
    const web3 = new Web3(web3OrProvider);
    return new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
  }
  
  throw new Error('Invalid provider or web3 instance');
}
```

### 5. Global Type Declarations

```typescript
declare global {
  interface Window {
    ethereum: any;
    solana: any;
    bitcoin: any;
    web3: any;
  }
}
```

## Implementation Phases

### Phase 1: Core Infrastructure (Completed)

1. Add provider registration and retrieval methods
2. Implement auto-detection mechanism
3. Update global type declarations
4. Create utility functions for provider detection and conversion

### Phase 2: Method Updates (In Progress)

1. Update Ethereum-specific methods to use the provider abstraction
   - Added `performMintHelper` to replace web3-dependent `performMintChain`
2. Add Solana-specific methods
3. Add Bitcoin-specific methods
4. Ensure backward compatibility with existing code

### Phase 3: Signing Implementation (Next Focus)

1. Create a consistent interface for transaction and message signing
2. Implement adapters for different provider types
3. Add methods for signing transactions and messages

### Phase 4: Testing and Documentation

1. Update tests to use the new provider abstraction
2. Add tests for auto-detection
3. Update documentation with examples
4. Create migration guide for existing users

## Current Implementation Status

### Provider Abstraction Progress

1. **Core Infrastructure (Completed)**:
   - Provider registration and retrieval methods have been implemented
   - Type detection for Ethereum, Solana, and Bitcoin providers is working
   - Web3ProviderAdapter successfully bridges legacy Web3 instances to the new abstraction

2. **Provider Types (Implemented)**:
   - `ethereum`: Support for Web3.js and EIP-1193 providers
   - `solana`: Support for Phantom-like wallets and Solana Connection objects
   - `bitcoin`: Basic type detection implemented
   - `other`: Fallback for unrecognized providers

3. **SDK Integration (Partially Complete)**:
   - `registerProvider()` method for registering blockchain providers
   - `getProvider()` and `hasProvider()` for provider management
   - `getOrDetectProvider()` for auto-detection with fallback
   - `loadWeb3()` for backward compatibility

4. **Method Migration (In Progress)**:
   - Added `performMintHelper` stub as a provider-abstracted replacement for `performMintChain`
   - Updated deprecation notices to point to new methods

5. **Solana-Specific Features (Implemented)**:
   - Added `createSolanaWalletClient()` method for Solana wallet integration
   - Implemented detection for Phantom wallets and Solana Connection objects
   - Proper type detection for Solana providers

6. **AI Integration (Implemented)**:
   - Added AI-specific functionality
   - Implemented `vaultInfoFromApiKey()` with proper API key handling
   - Added AI URL and API key configuration in the SDK constructor

## Usage Examples

### Lazy Developer (No Provider Registration)

```typescript
// The SDK will auto-detect and use available providers
const sdk = new EmblemVaultSDK('YOUR_API_KEY');

// Use Ethereum methods (will auto-detect MetaMask if available)
const balance = await sdk.legacyBalanceFromContractByAddress('0x123...');
```

### Server-Side with Explicit Provider

```typescript
// In Node.js environment
const sdk = new EmblemVaultSDK('YOUR_API_KEY');
const Web3 = require('web3');
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_KEY');

// Register the provider once
sdk.registerProvider('ethereum', web3);

// Use Ethereum methods (will use the registered provider)
const balance = await sdk.legacyBalanceFromContractByAddress('0x123...');
```

### Using with WalletConnect

```typescript
// Using with WalletConnect
const sdk = new EmblemVaultSDK('YOUR_API_KEY');

// Create a WalletConnect provider
const walletConnectProvider = await EthereumProvider.init({
  projectId: 'YOUR_PROJECT_ID',
  chains: [1],
  showQrModal: true
});

// Register it once
sdk.registerProvider('ethereum', walletConnectProvider);

// Use Ethereum methods (will use WalletConnect)
const balance = await sdk.legacyBalanceFromContractByAddress('0x123...');
```

### Testing with Override Functions

```typescript
// Testing with override functions
const sdk = new EmblemVaultSDK('YOUR_API_KEY');

// Mock data for testing
const mockData = [1, 2, 3];

// Use override function (no provider needed)
const balance = await sdk.legacyBalanceFromContractByAddress(
  '0x123...',
  () => mockData
);
```

## Benefits

1. **Developer-Friendly**: Developers don't need to worry about providers unless they want to
2. **Environment-Aware**: Works in browser, Node.js, or any JavaScript environment
3. **Register Once, Use Everywhere**: Register providers once and use them across all methods
4. **Auto-Detection**: Automatically detects and uses available providers
5. **Blockchain-Specific Methods**: Each method is designed for a specific blockchain
6. **Override Function Pattern**: Maintains the established pattern for testing
7. **Backward Compatibility**: Works with existing code through the loadWeb3 method

## Next Steps

1. Complete the implementation of `performMintHelper` and other signing-related methods
2. Add tests for the new signing functionality
3. Update documentation with examples of using the provider abstraction
4. Create a migration guide for existing users
