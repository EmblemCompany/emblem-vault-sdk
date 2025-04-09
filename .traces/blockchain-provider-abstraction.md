# Blockchain Provider Abstraction Implementation

## Overview

This implementation adds a flexible blockchain provider abstraction to the Emblem Vault SDK, enabling:

1. **Multiple blockchain support** - Ethereum, Solana, and Bitcoin
2. **Provider registration** - Register providers once and use them across methods
3. **Auto-detection** - Automatically detect available providers in browser environments
4. **Backward compatibility** - Maintain support for existing code that passes web3 instances
5. **Override function pattern** - Continue supporting the established testing pattern

## Key Components

### Provider Interfaces

We've defined interfaces for different blockchain providers in `src/providers.ts`:

- `BlockchainProviderBase` - Base interface for all providers
- `EthereumProvider` - For Ethereum providers (compatible with EIP-1193 and Web3.js)
- `SolanaProvider` - For Solana providers
- `BitcoinProvider` - For Bitcoin providers

### Provider Management

The SDK now includes methods for provider management:

```typescript
// Register a provider
sdk.registerProvider('ethereum', provider);

// Check if a provider is registered
const hasProvider = sdk.hasProvider('ethereum');

// Get a registered provider
const provider = sdk.getProvider('ethereum');

// Get or detect a provider (uses registered provider or auto-detects)
const provider = await sdk.getOrDetectProvider('ethereum');
```

### Web3 Adapter

We've created a `Web3ProviderAdapter` to make Web3 instances compatible with our provider interface:

```typescript
const web3 = new Web3(window.ethereum);
const adapter = new Web3ProviderAdapter(web3);
sdk.registerProvider('ethereum', adapter);
```

## Updated Methods

The following methods have been updated to use the provider abstraction:

1. `loadWeb3()` - Now uses the provider system
2. `legacyBalanceFromContractByAddress()` - Updated to support both provider patterns
3. `refreshLegacyOwnership()` - Updated to support both provider patterns
4. `performMint()` - Updated to support both provider patterns
5. `performBurn()` - Updated to support both provider patterns and override functions

## Usage Examples

### For Lazy Developers (Auto-detection)

```javascript
const sdk = new EmblemVaultSDK(API_KEY);

// SDK will auto-detect available providers when needed
const tokenIds = await sdk.legacyBalanceFromContractByAddress('0x123...');
```

### For Server-side Usage (Explicit Provider Registration)

```javascript
const sdk = new EmblemVaultSDK(API_KEY);
const provider = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_KEY');
const adapter = new Web3ProviderAdapter(provider);

sdk.registerProvider('ethereum', adapter);

// Now use the SDK methods without passing the provider
const tokenIds = await sdk.legacyBalanceFromContractByAddress('0x123...');
```

### With WalletConnect

```javascript
const sdk = new EmblemVaultSDK(API_KEY);
const provider = await EthereumProvider.init({
  projectId: 'YOUR_PROJECT_ID',
  chains: [1],
  showQrModal: true
});
await provider.enable();

sdk.registerProvider('ethereum', provider);

// Now use the SDK methods
const tokenIds = await sdk.legacyBalanceFromContractByAddress('0x123...');
```

### For Testing with Override Functions

```javascript
it('should use override function for legacyBalanceFromContractByAddress', async () => {
  const sdk = new EmblemVaultSDK(API_KEY);
  const mockTokenIds = [1, 2, 3];
  const overrideFunc = async () => mockTokenIds;
  
  const result = await sdk.legacyBalanceFromContractByAddress('0x123...', null, overrideFunc);
  expect(result).to.deep.equal(mockTokenIds);
});
```

## Backward Compatibility

All methods maintain backward compatibility with existing code that passes web3 instances:

```javascript
// Old pattern still works
const web3 = await sdk.loadWeb3();
const tokenIds = await sdk.legacyBalanceFromContractByAddress(web3, '0x123...');

// New pattern also works
const tokenIds = await sdk.legacyBalanceFromContractByAddress('0x123...');
```

## Next Steps

1. Update remaining methods to use the provider abstraction
2. Add more comprehensive tests for the provider system
3. Document the provider abstraction in the SDK documentation
