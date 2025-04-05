# Emblem Vault SDK Test Suite

This directory contains the tests for the Emblem Vault SDK. We have migrated from Jest to Mocha/Chai while maintaining backward compatibility.

## Directory Structure

```
/test
  ├── fixtures/           # Test fixtures (JSON, mock data)
  ├── unit/               # Unit tests for individual components
  ├── integration/        # Integration tests that interact with live API
  ├── utils/              # Test utilities including ResourceMonitor
  ├── helpers/            # Test helper functions and utilities
  ├── .mocharc.js         # Mocha configuration
  └── windsurf-rules.md   # Migration guidelines
```

## Test Categories

### Unit Tests

Unit tests focus on testing individual components in isolation:
- Do not make actual API calls
- Use mock data and override functions
- Run quickly and reliably
- Located in `/test/unit/`

### Integration Tests

Integration tests interact with the live Emblem Vault API:
- Make actual API calls to Emblem Vault services
- Require valid API keys to execute successfully
- Take longer to run than unit tests
- May create or modify real resources
- Located in `/test/integration/`

#### Integration Test Categories

The integration tests are organized into the following categories:

##### API Operations (`ApiOperations.spec.js`)

Tests for read-only API operations:
- Fetching curated contracts
- Retrieving vault information
- Getting asset metadata

##### Vault Creation (`VaultCreation.spec.js`)

Tests for operations that create or modify vaults:
- Creating empty vaults
- Creating vaults with specific assets
- Validating vault templates

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

### Integration Tests

To run the integration tests, you need a valid API key:

```bash
# Run with your API key
API_KEY=your_api_key npx mocha test/integration/**/*.spec.js

# Run a specific integration test file
API_KEY=your_api_key npx mocha test/integration/ApiOperations.spec.js
```

Without a valid API key, most integration tests will be skipped.

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

## ResourceMonitor for Memory Leak Detection

The SDK includes a ResourceMonitor utility for detecting memory leaks in tests:

```javascript
const { ResourceMonitor } = require('../utils/ResourceMonitor');

describe('Memory Usage Tests', function() {
  let monitor = new ResourceMonitor();
  
  beforeEach(() => {
    monitor.takeSnapshot('test-start');
  });
  
  afterEach(() => {
    monitor.takeSnapshot('test-end');
    console.log(monitor.generateReport());
  });
  
  it('should not leak memory during operations', async function() {
    // Test code here
    
    // Check if memory usage exceeds threshold
    const thresholdCheck = monitor.checkThreshold('test-start');
    expect(thresholdCheck.exceeded).to.be.false;
  });
});
```

### ResourceMonitor Features

- **Memory Snapshots**: Track memory usage at different points in test execution
- **Difference Calculation**: Measure memory changes between operations
- **Threshold Checking**: Set custom thresholds for acceptable memory growth
- **Detailed Reports**: Generate comprehensive memory usage reports
- **GC Support**: Trigger garbage collection when available (run with `--expose-gc`)

## Migration Status

We are gradually migrating tests from Jest to Mocha/Chai. The following tests have been migrated:

- [x] EmblemVaultSdk - Core SDK functionality
- [x] AllowedCounterparty - Counterparty collection tests
- [x] ResourceMonitor - Memory leak detection utility

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

## Best Practices

### For All Tests

1. **Never commit API keys** to the repository
2. Use environment variables for sensitive information
3. Use descriptive test names that indicate what's being tested
4. Follow the project's coding standards

### For Integration Tests

1. Keep integration tests isolated from each other
2. Add proper cleanup after tests that create resources
3. Set appropriate timeouts for tests that may take longer to complete
4. Skip tests when using demo keys or missing required credentials

## Writing New Tests

All new tests should be written using Mocha/Chai and placed in the appropriate directory:

- Unit tests go in `/test/unit/` with the naming convention `*.spec.js`
- Integration tests go in `/test/integration/` with the naming convention `*.spec.js`
- Fixtures should be placed in `/test/fixtures/` in an appropriate subdirectory

Example test structure:

```javascript
const { expect } = require('chai');
const { EmblemVaultSDK } = require('../../dist');

describe('Feature Name', () => {
  const sdk = new EmblemVaultSDK('DEMO_KEY');
  
  it('should do something specific', async () => {
    // Test code here
    expect(result).to.be.true;
  });
});
```

For more detailed migration guidelines, see the [windsurf-rules.md](./windsurf-rules.md) file.
