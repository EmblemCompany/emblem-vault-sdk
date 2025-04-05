# Integration Tests for Emblem Vault SDK

This directory contains integration tests that interact with the live Emblem Vault API. These tests are separated from unit tests because they:

1. Make actual API calls to the Emblem Vault services
2. Require valid API keys to execute successfully
3. Take longer to run than unit tests
4. May create or modify real resources

## Running Integration Tests

To run the integration tests, you need a valid API key:

```bash
# Run with your API key
API_KEY=your_api_key npx mocha test/integration/**/*.spec.js

# Run a specific integration test file
API_KEY=your_api_key npx mocha test/integration/ApiOperations.spec.js
```

Without a valid API key, most tests will be skipped.

## Test Categories

The integration tests are organized into the following categories:

### API Operations (`ApiOperations.spec.js`)

Tests for read-only API operations:
- Fetching curated contracts
- Retrieving vault information
- Getting asset metadata

### Vault Creation (`VaultCreation.spec.js`)

Tests for operations that create or modify vaults:
- Creating empty vaults
- Creating vaults with specific assets
- Validating vault templates

## ResourceMonitor for Memory Leak Detection

These tests can be used with the ResourceMonitor utility to detect memory leaks during API operations:

```javascript
const { ResourceMonitor } = require('../utils/ResourceMonitor');

describe('API Memory Usage', function() {
  let monitor = new ResourceMonitor();
  
  beforeEach(() => {
    monitor.takeSnapshot('test-start');
  });
  
  afterEach(() => {
    monitor.takeSnapshot('test-end');
    console.log(monitor.generateReport());
  });
  
  it('should not leak memory during API operations', async function() {
    // Test code here
  });
});
```

## Best Practices

1. **Never commit API keys** to the repository
2. Use environment variables for sensitive information
3. Keep integration tests isolated from each other
4. Add proper cleanup after tests that create resources
5. Use descriptive test names that indicate what's being tested
6. Set appropriate timeouts for tests that may take longer to complete
