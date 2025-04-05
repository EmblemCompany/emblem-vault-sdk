# Emblem Vault SDK Test Migration

This directory contains the new Mocha/Chai tests for the Emblem Vault SDK. We are in the process of migrating tests from Jest to Mocha/Chai while maintaining backward compatibility.

## Directory Structure

```
/test
  ├── fixtures/           # Test fixtures (JSON, mock data)
  ├── unit/               # Unit tests for individual components
  ├── integration/        # Integration tests for combined functionality
  ├── helpers/            # Test helper functions and utilities
  ├── .mocharc.js         # Mocha configuration
  └── windsurf-rules.md   # Migration guidelines
```

## Running Tests

### Mocha Tests

Run all Mocha tests:

```bash
npm run test:mocha
```

Run Mocha tests in watch mode (useful during development):

```bash
npm run test:mocha:watch
```

Run Mocha tests with coverage:

```bash
npm run test:mocha:coverage
```

### Legacy Jest Tests

The legacy Jest tests are still available and can be run with:

```bash
npm test          # Runs Jest tests after building
npm run test:node # Runs Jest tests in Node environment
npm run test:browser # Runs Jest tests in browser environment
```

### Running All Tests

To run both Jest and Mocha tests:

```bash
npm run test:all:both
```

## Migration Status

We are gradually migrating tests from Jest to Mocha/Chai. The following tests have been migrated:

- [x] EmblemVaultSdk - Core SDK functionality
- [x] AllowedCounterparty - Counterparty collection tests

Remaining tests to migrate:
- [ ] AllowedBells
- [ ] AllowedBitcoinDeGods
- [ ] AllowedBitcoinOrdinals
- [ ] AllowedCursedOrdinals
- [ ] AllowedEmbells
- [ ] AllowedEmbels
- [ ] AllowedEmblemOpen
- [ ] AllowedEthscriptions
- [ ] AllowedHardcodedNfts
- [ ] AllowedNamecoin
- [ ] AllowedOrdi
- [ ] AllowedOxbt
- [ ] AllowedProjectlCollection
- [ ] AllowedProtocolCollection
- [ ] AllowedStamps
- [ ] DarkfarmsMetadata
- [ ] ResourceMonitor

## Migration Guidelines

See the [windsurf-rules.md](./windsurf-rules.md) file for detailed migration guidelines and coding standards.

## Writing New Tests

All new tests should be written using Mocha/Chai and placed in the appropriate directory:

- Unit tests go in `/test/unit/` with the naming convention `*.spec.ts`
- Integration tests go in `/test/integration/` with the naming convention `*.integration.spec.ts`
- Fixtures should be placed in `/test/fixtures/` in an appropriate subdirectory

Example test structure:

```typescript
import EmblemVaultSDK from '../../src/';
import { expect, API_KEY } from '../helpers/setup';

describe('Feature Name', () => {
  const sdk = new EmblemVaultSDK(API_KEY);
  
  it('should do something specific', async () => {
    // Test code here
    expect(result).to.be.true;
  });
});
```
