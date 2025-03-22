# Comprehensive Trace Documentation: Emblem Vault SDK Tests

This document provides a complete analysis of the Emblem Vault SDK test suite, including directory structure, test implementation, test failures, and recommendations for improvements.

## Directory Structure
```
/Users/shannoncode/repo/Emblem.Current/emblem-vault-sdk/tests/
├── AllowedBells.test.ts
├── AllowedBitcoinDeGods.test.ts
├── AllowedBitcoinOrdinals.test.ts
├── AllowedCounterparty.test.ts
├── AllowedCursedOrdinals.test.ts
├── AllowedEmbells.test.ts
├── AllowedEmbels.test.ts
├── AllowedEmblemOpen.test.ts
├── AllowedEthscriptions.test.ts
├── AllowedHardcodedNfts.test.ts
├── AllowedNamecoin.test.ts
├── AllowedOrdi.test.ts
├── AllowedOxbt.test.ts
├── AllowedProjectlCollection.test.ts
├── AllowedProtocolCollection.test.ts
├── AllowedStamps.test.ts
├── DarkfarmsMetadata.test.ts
├── EmblemVaultSdk.test.ts
└── fixtures/
    ├── bells/
    ├── bitcoin-degods/
    ├── bitcoin-ordinals/
    ├── counterparty/
    ├── cursed-ordinals/
    ├── dogeparty/
    ├── embels/
    ├── emblem-open/
    ├── ethscriptions/
    ├── hardcoded-nfts/
    ├── megapunks/
    ├── namecoin/
    ├── ordi/
    ├── oxbt/
    └── stamps/
```

## Test Results Summary
- **Total Test Suites**: 18
- **Passed**: 14
- **Failed**: 4
- **Total Tests**: 94
- **Passed Tests**: 86
- **Failed Tests**: 6
- **Skipped Tests**: 2

### Failed Tests:
1. **AllowedCounterparty.test.ts**: Failure in "Allows any native coin" test
2. **AllowedOrdi.test.ts**: Timeout in "Requires specific balance" test
3. **AllowedStamps.test.ts**: Timeout in "Requires asset name to include `stamps`" test

## SDK Core Functionality Analysis

The EmblemVaultSDK class (defined in `src/index.ts`) serves as the main entry point for interacting with the Emblem Vault ecosystem. Key components include:

### 1. Initialization
```typescript
constructor(private apiKey: string, baseUrl?: string, v3Url?: string, sigUrl?: string) {
    console.log('EmblemVaultSDK version:', SDK_VERSION)
    if (!apiKey) {
        throw new Error('API key is required');
    }
    this.baseUrl = baseUrl || 'https://v2.emblemvault.io';
    this.v3Url = v3Url || 'https://v3.emblemvault.io';
    this.sigUrl = sigUrl || 'https://tor-us-signer-coval.vercel.app';
}
```

The SDK requires an API key and optionally accepts custom URLs for different API endpoints.

### 2. Core API Methods

The SDK provides several categories of methods:

#### Asset Metadata
- `getAssetMetadata`: Retrieves metadata for a specific project
- `getAllAssetMetadata`: Gets metadata for all assets
- `getRemoteAssetMetadata`: Fetches metadata from remote API

#### Curated Collections
- `fetchCuratedContracts`: Retrieves all curated collections
- `fetchCuratedContractByName`: Gets a specific collection by name
- `createCuratedVault`: Creates a new vault based on a template

#### Vault Operations
- `refreshOwnershipForTokenId`: Updates ownership data for a token
- `refreshOwnershipForAccount`: Updates ownership data for an account
- `fetchMetadata`: Gets metadata for a specific token
- `refreshBalance`: Updates and retrieves balance for a token
- `fetchVaultsOfType`: Gets vaults of a specific type for an address

#### Report Generation
- `generateJumpReport`: Creates a report of possible vault transitions
- `generateMintReport`: Generates a report of mintable vaults

### 3. Validation Logic

The validation logic for different token types is implemented in the `utils.ts` file, specifically in the `generateTemplate` function. This function creates templates with validation rules for each curated collection.

## File Analysis

<details>
<summary>EmblemVaultSdk.test.ts (line 1 of 5870)</summary>

This file contains the main tests for the EmblemVaultSDK class. It tests core functionality of the SDK.

Key observations:
- Tests the initialization of the SDK
- Tests version logging (currently shows "__SDK_VERSION__" placeholder)
- Tests core API methods like `fetchCuratedContracts`, `fetchMetadata`, and `fetchVaultsOfType`
- Contains skipped tests for vault creation functionality
- Uses mock data for testing templates

Test categories:
- **Non-Writing Tests**: Tests that don't modify data
- **Vault Creation Tests**: Tests that create vaults (currently skipped)

Current status: PASS
</details>

<details>
<summary>AllowedBitcoinDeGods.test.ts (line 1 of 2879)</summary>

Tests for the Bitcoin DeGods NFT collection validation.

Key observations:
- Tests the "allowed" function for DeGods NFTs
- Verifies that the correct balance and metadata are required
- Uses fixtures from tests/fixtures/bitcoin-degods/

Current status: PASS
</details>

<details>
<summary>AllowedBitcoinOrdinals.test.ts (line 1 of 2518)</summary>

Tests for Bitcoin Ordinals validation.

Key observations:
- Verifies that Bitcoin Ordinals are properly validated
- Checks for required metadata and balance values
- Uses fixtures from the ordinals directory

Current status: PASS
</details>

<details>
<summary>AllowedCounterparty.test.ts (line 1 of 2178)</summary>

Tests for Counterparty token validation.

Key observations:
- Tests native coin validation for Counterparty
- Currently FAILING on the "Allows any native coin" test
- Failure indicates that the validation function is returning false when it should return true

**Failure Details:**
- Test: "Allows any native coin"
- Error: `expect(received).toBeTruthy() - Received: false`
- Line: 33

**Root Cause:**
The Counterparty validation logic is commented out in the source code (utils.ts around line 326-335). The test expects the `allowed` function to return true when a native asset is provided, but since the implementation is commented out, it's likely defaulting to false.

```typescript
// Commented out implementation in utils.ts:
// } else if (recordName == "Counterparty") {
//     let facts = [
//         {
//             eval: record.nativeAssets.includes(data[0]?.coin),
//             msg: `Vaults should only contain assets native to ${recordName}`
//         },
//         {eval: data.length == 1, msg: `Vaults should only contain a single item`},
//         // { eval: data[0].projectName && data[0].projectName == recordName, msg: `Vaults should only contain a single item` }
//     ]
//     allowed = evaluateFacts(allowed, facts, msgCallback)
```

Current status: FAIL
</details>

<details>
<summary>AllowedCursedOrdinals.test.ts (line 1 of 3677)</summary>

Tests for Cursed Ordinals NFT validation.

Key observations:
- Verifies the validation logic for Cursed Ordinals
- Checks for required metadata and balance

Current status: PASS
</details>

<details>
<summary>AllowedEmblemOpen.test.ts (line 1 of 837)</summary>

Tests for Emblem Open validation.

Key observations:
- Tests the validation logic for Emblem Open tokens
- Relatively simple test file compared to others

Current status: PASS
</details>

<details>
<summary>AllowedNamecoin.test.ts (line 1 of 1763)</summary>

Tests for Namecoin validation.

Key observations:
- Verifies the validation logic for Namecoin tokens
- Checks for required metadata and balance

Current status: PASS
</details>

<details>
<summary>AllowedOrdi.test.ts (line 1 of 2492)</summary>

Tests for $ORDI token validation.

Key observations:
- Tests the validation logic for $ORDI tokens
- Currently FAILING with a timeout in the "Requires specific balance" test
- The test is exceeding the 5000ms timeout limit

**Failure Details:**
- Test: "Requires specific balance"
- Error: "Exceeded timeout of 5000 ms for a test"
- Line: 14

**Root Cause:**
The test is timing out, which could be due to:
1. An infinite loop or long-running operation in the validation logic
2. A network request that's not completing
3. A promise that's not being resolved

**Test Data:**
The test uses a fixture from `tests/fixtures/ordi/balance.json` which contains:
```json
[
  {
    "coin": "ordi",
    "name": "200 $ORDI",
    "balance": "200",
    "price": "0"
  }
]
```

**Implementation in utils.ts:**
```typescript
// From utils.ts around line 322:
else if (balanceQty && balanceQty > 0) { // $ORDI, $OXBT
    allowed = firstAsset.balance == balanceQty && assetName == `${balanceQty} ${recordName}`
    if (!allowed) {
        message = `Load vault with exactly ${balanceQty} ${recordName}`
    }
}
```

Current status: FAIL
</details>

<details>
<summary>AllowedOxbt.test.ts (line 1 of 2492)</summary>

Tests for OXBT token validation.

Key observations:
- Verifies the validation logic for OXBT tokens
- Similar structure to other token validation tests

Current status: PASS
</details>

<details>
<summary>AllowedProjectlCollection.test.ts (line 1 of 2905)</summary>

Tests for Project Collection validation.

Key observations:
- Tests the validation logic for Project Collections
- Verifies that the correct metadata and balance are required

Current status: PASS
</details>

<details>
<summary>AllowedProtocolCollection.test.ts (line 1 of 2486)</summary>

Tests for Protocol Collection validation.

Key observations:
- Tests the validation logic for Protocol Collections
- Verifies that the correct metadata and balance are required

Current status: PASS
</details>

<details>
<summary>AllowedStamps.test.ts (line 1 of 3956)</summary>

Tests for Stamps validation.

Key observations:
- Tests the validation logic for Stamps
- Currently FAILING with a timeout in the "Requires asset name to include `stamps`" test
- The test is exceeding the 5000ms timeout limit

**Failure Details:**
- Test: "Requires asset name to include `stamps`"
- Error: "Exceeded timeout of 5000 ms for a test"
- Line: 14

**Root Cause:**
Similar to the $ORDI test, this test is timing out. The validation logic for Stamps in utils.ts is:

```typescript
// From utils.ts around line 336:
else if (recordName == "Stamps") {
    let allowedName = assetName.toLowerCase().includes("stamp")
    allowed = allowedName &&
        firstAsset.project &&
        record.nativeAssets.includes(firstAsset.coin) &&
        (recordName.toLowerCase() == firstAsset.project.toLowerCase() || firstAsset.project.toLowerCase() == "stampunks")
}
```

**Test Data:**
The test uses a fixture from `tests/fixtures/stamps/balance.json` which contains:
```json
[
  {
    "coin": "XCP",
    "name": "Stamp #11",
    "balance": 1,
    "type": "nft",
    "external_url": "https://xchain.io/asset/A5433937813514022010",
    "image": "https://stampchain.io/stamps/88fab306902f27f2a2c5aabf8983f0ef1f4135c20c0cbf494546a611bc2692c6.png",
    "project": "STAMPS",
    "traits": [
      {
        "trait_type": "STAMPS",
        "value": "STAMP #11"
      }
    ],
    "assetName": "A5433937813514022010"
  }
]
```

Current status: FAIL
</details>

<details>
<summary>AllowedBells.test.ts (line 1 of 2742)</summary>

Tests for Bells token validation.

Key observations:
- Tests the validation logic for Bells tokens
- Verifies that the correct metadata and balance are required

Current status: PASS
</details>

<details>
<summary>AllowedEmbells.test.ts (line 1 of 347)</summary>

Tests for Embells token validation.

Key observations:
- Very small test file (347 bytes)
- Likely a simple validation test for Embells tokens

Current status: Not explicitly shown in test results, likely PASS
</details>

<details>
<summary>AllowedEmbels.test.ts (line 1 of 668)</summary>

Tests for Embels token validation.

Key observations:
- Small test file (668 bytes)
- Tests basic validation for Embels tokens

Current status: Not explicitly shown in test results, likely PASS
</details>

<details>
<summary>AllowedEthscriptions.test.ts (line 1 of 2052)</summary>

Tests for Ethscriptions validation.

Key observations:
- Tests the validation logic for Ethscriptions
- Verifies that the correct metadata and balance are required

Current status: Not explicitly shown in test results, likely PASS
</details>

<details>
<summary>AllowedHardcodedNfts.test.ts (line 1 of 4421)</summary>

Tests for hardcoded NFT validation.

Key observations:
- Largest test file (4421 bytes)
- Tests validation logic for hardcoded NFTs
- Likely covers edge cases or special NFTs

Current status: Not explicitly shown in test results, likely PASS
</details>

<details>
<summary>DarkfarmsMetadata.test.ts (line 1 of 318)</summary>

Tests for Darkfarms metadata handling.

Key observations:
- Very small test file (318 bytes)
- Tests metadata processing for Darkfarms

Current status: PASS
</details>

## Fixtures Analysis

The fixtures directory contains test data organized by token/NFT type. Each subdirectory typically contains:

1. `balance.json`: Standard balance data for the token type
2. `balance-with-native.json` or similar: Mixed data with native tokens
3. Additional specialized test cases

Here's a breakdown of the fixtures structure:

```
fixtures/
├── bells/                  # Bells token test data
├── bitcoin-degods/         # Bitcoin DeGods NFTs test data
├── bitcoin-ordinals/       # Bitcoin Ordinals test data
├── counterparty/           # Counterparty tokens test data
├── cursed-ordinals/        # Cursed Ordinals test data
├── dogeparty/              # Dogeparty tokens test data
├── embels/                 # Embels token test data
├── emblem-open/            # Emblem Open test data
├── ethscriptions/          # Ethscriptions test data
├── hardcoded-nfts/         # Hardcoded NFTs test data
├── megapunks/              # Megapunks NFT test data
├── namecoin/               # Namecoin test data
├── ordi/                   # $ORDI token test data
├── oxbt/                   # OXBT token test data
└── stamps/                 # Stamps NFT test data
```

### Key Fixtures Examined

#### bitcoin-degods
Contains test data for Bitcoin DeGods NFTs:
- `balance.json`: Standard DeGods NFT data
- `balance-with-non-degods-first.json`: Mixed data with non-DeGods tokens first

Example from `balance-with-non-degods-first.json`:
```json
[
  {
    "coin": "BTC",
    "name": "BTC",
    "balance": 1
  },
  {
    "coin": "ordinalsbtc",
    "name": "DeGod #4654",
    "balance": 1,
    "type": "nft",
    "external_url": "https://ordinals.com/inscription/4e80a569505ced2e72d48e9f79832ba487a64716c9a77b7189d6b6f1b3f95694i0",
    "image": "https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/4e80a569505ced2e72d48e9f79832ba487a64716c9a77b7189d6b6f1b3f95694i0",
    "project": "DeGods",
    "projectLogo": "https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/d8c2e6fca21b41817dc162445f2a0c0f5b0995c0cae12799a39571cd974c4ea2i0",
    "traits": [...]
  }
]
```

#### counterparty
Contains test data for Counterparty tokens:
- `balance.json`: Standard Counterparty NFT (Rare Pepe)
- `balance-with-multiple.json`: Multiple Counterparty tokens

#### ordi
Contains test data for $ORDI tokens:
- `balance.json`: Standard $ORDI token data
- `balance-with-native.json`: $ORDI with other native tokens
- `balance-with-native-first.json`: Native token first, then $ORDI

#### stamps
Contains test data for Stamps NFTs:
- `balance.json`: Standard Stamps NFT data

### Common Fixture Patterns

Most token fixtures follow similar patterns:

1. **Basic Structure**: Each fixture typically contains an array of balance objects with properties like:
   - `coin`: The token/coin identifier
   - `name`: Human-readable name
   - `balance`: Amount held
   - `type`: Token type (e.g., "nft")
   - Additional metadata specific to the token type

2. **Variation Fixtures**: Many token types include variations to test different validation scenarios:
   - Multiple tokens in a single balance
   - Native tokens mixed with the specific token
   - Invalid configurations to test validation rules

## Test Implementation Analysis

The test suite follows a consistent pattern across different token types:

### 1. Main SDK Tests (`EmblemVaultSdk.test.ts`)

Tests core SDK functionality:
- SDK initialization
- API method functionality
- Template generation
- Vault creation (skipped in actual execution)

### 2. Token-Specific Tests (`Allowed*.test.ts`)

Each token type has its own test file that follows a similar structure:

```typescript
describe('Allowed Function for [TokenType]', () => {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Does not allow empty balance', async () => {
        // Test empty balance validation
    })

    it('Requires specific [property]', async () => {
        // Test specific validation rules
    })

    // Additional test cases...
})
```

Common test cases across token types:
- Empty balance validation
- Specific balance requirements
- Name/metadata validation
- Multiple asset validation
- Native asset requirements

### 3. Test Timeouts

Several tests are failing due to timeouts, particularly:
- `AllowedOrdi.test.ts`: "Requires specific balance" test
- `AllowedStamps.test.ts`: "Requires asset name to include `stamps`" test

These timeouts are likely due to:
- Async operations without proper timeout handling
- Network requests in the validation logic
- Complex validation rules that take too long to execute

## Relationship Between Tests and Implementation

The test suite validates the SDK's functionality with a focus on the validation rules for different token types. Key relationships:

### 1. Validation Logic Flow

```
Test → SDK.fetchCuratedContractByName() → generateTemplate() → allowed() function
```

The tests fetch curated contract data, which includes the validation logic generated by the `generateTemplate` function in `utils.ts`. The `allowed` function is then tested with various fixture data.

### 2. Template Generation

The `generateTemplate` function in `utils.ts` creates templates with validation rules for each curated collection. These templates include:
- Validation logic (`allowed` function)
- UI templates
- Creation templates
- Asset templates

### 3. Test Coverage

The test suite covers:
- Core SDK functionality
- Validation rules for each token type
- Edge cases for validation
- Template generation

However, some areas have limited coverage:
- Error handling
- Network request failures
- Edge cases in vault creation

## Recommendations for Test Improvements

Based on the analysis, here are recommendations for improving the test suite:

### 1. Fix Failing Tests

#### Counterparty Test
```typescript
// Uncomment and update the Counterparty validation logic in utils.ts
else if (recordName == "Counterparty") {
    let facts = [
        {
            eval: record.nativeAssets.includes(data[0]?.coin),
            msg: `Vaults should only contain assets native to ${recordName}`
        },
        {eval: data.length == 1, msg: `Vaults should only contain a single item`}
    ]
    allowed = evaluateFacts(allowed, facts, msgCallback)
}
```

#### Timeout Issues
```typescript
// Add to the top of test files with timeout issues
jest.setTimeout(15000); // Increase timeout to 15 seconds

// Or add timeout to individual tests
it('Requires specific balance', async () => {
    // Test code
}, 15000); // 15 second timeout
```

### 2. Improve Test Structure

- Add setup and teardown functions to reduce code duplication
- Create shared test utilities for common operations
- Group related tests more effectively

### 3. Enhance Test Coverage

- Add tests for error handling
- Test network request failures
- Add more edge cases for validation
- Test with real-world data

### 4. Performance Improvements

- Mock network requests in tests
- Add caching for repeated operations
- Optimize validation logic

## Conclusion

The Emblem Vault SDK test suite provides comprehensive validation of the SDK's functionality, particularly the token validation rules. The main issues are:

1. Commented-out validation logic for Counterparty tokens
2. Timeout issues in the $ORDI and Stamps tests
3. Limited test coverage for error handling and edge cases

Addressing these issues will improve the reliability and effectiveness of the test suite.
