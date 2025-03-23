# Emblem Vault SDK Documentation

The Emblem Vault SDK is a TypeScript/JavaScript library that provides functionality for interacting with Emblem Vaults, including creating vaults, refreshing balances, and performing minting operations.

## Table of Contents
- [Installation](#installation)
- [Initialization](#initialization)
- [TypeScript Support](#typescript-support)
- [Emblem Vault Workflow](#emblem-vault-workflow)
- [Fetching Curated Contracts](#fetching-curated-contracts)
- [Creating a Vault Template](#creating-a-vault-template)
- [Creating a Vault](#creating-a-vault)
- [Refreshing Vault Balance](#refreshing-vault-balance)
- [Validating Mintability](#validating-mintability)
- [Performing a Mint](#performing-a-mint)
- [Asset Metadata Functions](#asset-metadata-functions)
- [V3 API Methods](#v3-api-methods)
- [Bitcoin Functionality](#bitcoin-functionality)
- [UI Integration Examples](#ui-integration-examples)
- [Collection-specific Workflows](#collection-specific-workflows)
- [Multiple Vault Creation](#multiple-vault-creation)
- [Data Structures and Types](#data-structures-and-types)
- [Dependencies](#dependencies)
- [Example Usage](#example-usage)

## Installation

To use the Emblem Vault SDK in your project, include the `bundle.js` file in your HTML file:

```html
<script src="./bundle.js"></script>
```

Or use within NodeJS by `npm install emblem-vault-sdk`

```javascript
let EmblemVaultSDK = require('emblem-vault-sdk').default
```

## Initialization

To initialize the SDK, create an instance of the `EmblemVaultSDK` class:

```javascript
const sdk = new EmblemVaultSDK('your-api-key');
```

The constructor accepts the following parameters:
- `apiKey` (required): Your API key for accessing the Emblem Vault services
- `baseUrl` (optional): Base URL for the API (default: 'https://v2.emblemvault.io')
- `v3Url` (optional): V3 API URL (default: 'https://v3.emblemvault.io')
- `sigUrl` (optional): Signature URL (default: 'https://tor-us-signer-coval.vercel.app')

## TypeScript Support

The Emblem Vault SDK is written in TypeScript and provides type definitions for all its functions and data structures. When using TypeScript, you can import the types from the SDK:

```typescript
import EmblemVaultSDK, { Vault, VaultAddress, VaultBalance, Metadata } from 'emblem-vault-sdk';

// Create an instance of the SDK with TypeScript type checking
const sdk: EmblemVaultSDK = new EmblemVaultSDK('your-api-key');

// Use the SDK with type checking
const fetchVaults = async (address: string): Promise<Vault[]> => {
  return await sdk.fetchVaults(address);
};
```

## Emblem Vault Workflow

The Emblem Vault SDK follows a standard workflow for creating, funding, and minting vaults. This section provides a high-level overview of the key concepts and typical process.

### Key Concepts

- **Curated Collection**: A predefined collection of vault types with specific rules and properties. Each collection has validation rules that determine what assets can be stored in vaults of that collection.
  
  A Collection includes:
  - **Identification**: `id`, `name`, `description`
  - **Asset Rules**: `nativeAssets` (allowed asset types), `collectionChain` (target blockchain)
  - **Minting Controls**: `mintable`, `price`, `purchaseMethod`
  - **Display Properties**: `loadingImages`, `placeholderImages`, `showBalance`
  - **Functional Handlers**: `generateVaultBody` and `generateCreateTemplate` functions
  - **Validation Logic**: Rules for checking if a vault's contents are valid for the collection
  - **Load Types**: `loadTypes` (detailed, select, empty)

- **Vault**: A digital container that can hold various crypto assets. Each vault has a unique deposit address where assets can be sent, and a corresponding NFT that represents ownership of the vault and its contents.

- **Vault Balance**: The assets currently stored in a vault. A vault can contain multiple assets of different types, depending on the rules of its curated collection.

- **Template**: A configuration object that defines the properties of a vault to be created, including target contract, chain ID, and user addresses.

- **Mint**: The process of converting a created and funded vault into an NFT on the blockchain, making it tradable and transferable.

- **Claim**: The process of extracting the contents or private keys from a vault, allowing the owner to access the underlying assets.

### Contract Types and Collection Types

#### Contract Types

- **ERC1155**: These contracts support semi-fungible tokens that can stack (have multiple copies). In Emblem Vault:
  - Used for collections where each item can have multiple editions
  - For example, in a collection "DiamondHands", there might be a total supply of 10 "Yeet" items and 2 "Jeet" items
  - To maintain ERC1155 compliance while ensuring uniqueness, Emblem introduced **serial numbers**
  - Each serial number links back to a specific vault record in a 1:1 relationship
  - This approach makes each item both unique and fungible at the same time

- **ERC721/ERC721a**: These contracts support non-fungible tokens (NFTs) that do not stack and are completely unique:
  - Each token has a 1:1 link back to a vault record ID
  - For ERC721, on-chain IDs include the chain ID at the end (e.g., vault ID 1337 becomes 13371 for Ethereum mainnet)
  - For ERC721a (which mint sequentially for gas efficiency), the serial number links back to a specific vault record
  - This preserves the linkage between the on-chain token and the underlying vault data

#### Collection Types

Different collection types have specific rules for what assets they can contain and how they're validated:

- **Protocol Collections**: These collections require assets from a specific blockchain protocol
- **Standard Collections**: These enforce specific asset types and quantities
- **Open Collections**: These allow more flexibility in what assets can be stored
- **Specialized Collections**: These have unique rules for specific use cases (e.g., Embels, Bitcoin Ordinals)

The collection type determines the validation rules applied when checking if a vault is mintable, and influences how the vault is displayed and interacted with.

### Workflow Overview

#### 1. Creating a Vault

The vault creation process begins with selecting a curated collection and generating a template. The SDK provides methods to fetch available curated contracts and create a template based on the selected contract. The template is then used to create a vault, which generates a unique deposit address for receiving assets.

When a vault is created, the SDK returns a comprehensive metadata record that includes:
- **Basic Information**: `name`, `description`, `image`, `tokenId`
- **Deposit Information**: `addresses` array containing blockchain addresses for depositing assets
- **Contract Details**: `targetContract` and `targetAsset` information
- **Status Information**: `status`, `live`, `sealed`, etc.
- **Security Elements**: `ciphertextV2` for encrypted data, `signature` for verification

This metadata record is essential for subsequent operations like checking balances and minting.

#### 2. Checking Vault Balance

After creating a vault, the next step is to fund it by sending assets to the deposit address. The SDK provides methods to refresh and check the vault's balance to verify that assets have been successfully deposited. Different curated collections may have specific requirements for what assets must be deposited.

#### 3. Minting the Vault

Once the vault has been funded with the appropriate assets, it can be minted as an NFT on the blockchain. The minting process involves:
- Verifying that the vault contains the correct assets according to the curated collection's rules
- Obtaining signatures from both the user and the Emblem server
- Getting a price quote for the minting fee
- Executing the mint transaction on the blockchain

#### 4. Claiming Vault Contents

Vault owners can claim the contents of their vaults to access the underlying assets. The claiming process involves:
- Authenticating the owner through wallet signatures
- Obtaining a claim token from the Emblem server
- Retrieving and decrypting the vault's private keys
- Using these keys to access or transfer the vault's contents

This workflow provides a secure way to package, transfer, and trade digital assets using the Emblem Vault system. The specific implementation details for each step can be found in the respective sections of this documentation.

## Fetching Curated Contracts
To fetch the curated contracts, use the fetchCuratedContracts method:
```javascript
sdk.fetchCuratedContracts(false).then(curatedContracts => {
    // Use the curated contracts
});
```

Parameters:
- `hideUnMintable` (optional): Boolean to filter out non-mintable contracts (default: false)
- `overrideFunc` (optional): Function to override the default behavior (for testing or using on server side with an alternate data feed)

Returns:
- A Promise that resolves to an array of curated contract objects

To fetch a specific curated contract by name:
```javascript
sdk.fetchCuratedContractByName('Bitcoin DeGods').then(contractObject => {
    // Use the contract object
});
```

## Creating a Vault Template
To create a vault, first prepare a contract template object. There are two ways to create a template:

### Method 1: Manual Template Creation
```javascript
let contractTemplate = {
    fromAddress: null,
    toAddress: null,
    chainId: 1,
    experimental: true,
    targetContract: {
        "1": "0x345eF9d7E75aEEb979053AA41BB6330683353B7b",
        "5": "0x582699d2c58A38056Cf02875540705137f0bbbF7",
        name: "Bitcoin DeGods",
        description: "Bitcoin DeGods is a collection of 535 Bitcoin Ordinals inscribed in the 77236 to 77770 range. This collection is curated by Emblem Vault."
    },
    targetAsset: {
        image: "https://emblem.finance/btcdegods.jpg",
        name: "Loading...",
        xtra: "anything else you need here"
    }
};
```

### Method 2: Using generateCreateTemplate
Often it's easier to generate a template from an existing contract and then populate it:

```javascript
// Generate template from selected contract
contractTemplate = selectedContract.generateCreateTemplate(selectedContract);

// Note on template field types:
// - "user-provided": Fields that must be filled in by the developer/user
// - "selection-provided": Fields that are restricted to specific pre-defined values from the collection
//
// Example of a template with selection-provided fields and user provided fields:

{
  "fromAddress": {"type": "user-provided"},
  "toAddress": {"type": "user-provided"},
  "chainId": {"type": "user-provided"},
  "experimental": true,
  "targetContract": { ... }, // pre-filled by the collection
  "targetAsset": {
    "name": {"type": "selection-provided"},
    "image": {"type": "selection-provided"},
    "projectName": "Dank Rares" // pre-filled by the collection
  }
}
```

In this example, "selection-provided" indicates that the collection only allows specific assets with pre-defined names and images within the collection. The user cannot freely set these values.

## Getting Assets for Selection-Provided Templates

When populating a template that requires "selection-provided" values, you must get the list of items the particular collection supports. Use the `getAssetMetadata` method to retrieve available assets:

```javascript
// Get available assets for a specific collection
const assets = await sdk.getAssetMetadata(collectionName);

// Example usage
const assets = await sdk.getAssetMetadata("Dank Rares");
console.log(assets);

// Sample output structure:
/*
[
  {
    assetName: "Asset 1",
    image: "https://example.com/asset1.jpg",
    description: "Description for Asset 1",
    // other metadata...
  },
  {
    assetName: "Asset 2",
    image: "https://example.com/asset2.jpg",
    description: "Description for Asset 2",
    // other metadata...
  }
]
*/

// To use a selected asset in your template:
const selectedAssetIndex = 0; // Index of the selected asset
const selectedAsset = assets[selectedAssetIndex];

// Update your template with the selected asset
if (contractTemplate.targetAsset) {
  contractTemplate.targetAsset.name = selectedAsset.assetName;
  contractTemplate.targetAsset.image = selectedAsset.image;
  // Add other properties as needed
}
```

## Creating a Vault
After preparing your template, call the createCuratedVault method to create the vault:

```javascript
vaultData = await sdk.createCuratedVault(contractTemplate, updateLogCallback);
```

Parameters:
- `template`: The template object containing vault creation details
- `callback` (optional): A callback function to handle progress updates

Returns:
- A Promise that resolves to a Vault object

## Refreshing Vault Balance
To refresh the balance of a vault, use the refreshBalance method:

```javascript
vaultBalance = await sdk.refreshBalance(vaultData.tokenId, updateLogCallback);
```

Parameters:
- `tokenId`: The ID of the vault token
- `callback` (optional): A callback function to handle progress updates

Returns:
- A Promise that resolves to an array of Balance objects

Example of a Balance object:
```javascript
{
  "coin": "ETH",       // Blockchain/network
  "name": "Chickencoin", // Token name
  "balance": 3947058.6768, // Numerical balance
  "symbol": "CHKN",    // Token symbol
  "address": "0xd55210bb6898c021a19de1f58d27b71f095921ee", // Contract address
  "type": "token",     // Asset type
  "image": "https://static.alchemyapi.io/images/assets/29999.png" // Token image URL
}
```

## Validating Mintability
To validate if a vault is mintable, use the allowed method of the curated contract object:

```javascript
let contractObject = await sdk.fetchCuratedContractByName(contractTemplate.targetContract.name);
let mintable = contractObject.allowed(vaultBalance, contractObject);
```

## Performing a Mint
To perform a mint, use the performMintChain method:

```javascript
sdk.performMintChain(web3, vaultData.tokenId, contractTemplate.targetContract.name, updateLogCallback)
    .then(result => {
        // Handle success
    })
    .catch(error => {
        // Handle error
    });
```

Parameters:
- `web3`: The Web3 instance
- `tokenId`: The ID of the vault token
- `collectionName`: The name of the collection
- `callback` (optional): A callback function to handle progress updates

Returns:
- A Promise that resolves to the mint response

## Asset Metadata Functions

The SDK provides several functions for working with asset metadata:

### getAssetMetadata(projectName: string)
Gets metadata for a specific project. This is an asynchronous method that retrieves asset information for collections that require selection-provided values.

Parameters:
- `projectName`: The name of the project

Returns:
- A Promise that resolves to an array of asset metadata objects

```javascript
// Example usage
const assets = await sdk.getAssetMetadata("Dank Rares");
console.log(assets);

// Sample output structure:
/*
[
  {
    assetName: "Asset 1",
    image: "https://example.com/asset1.jpg",
    description: "Description for Asset 1",
    // other metadata...
  },
  {
    assetName: "Asset 2",
    image: "https://example.com/asset2.jpg",
    description: "Description for Asset 2",
    // other metadata...
  }
]
*/
```

### getAllAssetMetadata()
Gets all asset metadata.

Returns:
- An object containing all asset metadata

```javascript
const allMetadata = sdk.getAllAssetMetadata();
```

### getRemoteAssetMetadataProjectList()
Gets the project list from the remote API.

Returns:
- A Promise that resolves to an array of project names

```javascript
sdk.getRemoteAssetMetadataProjectList().then(projectList => {
    // Use the project list
});
```

### getRemoteAssetMetadata(asset: string)
Gets asset metadata for a specific asset from the remote API.

Parameters:
- `asset`: The asset name

Returns:
- A Promise that resolves to the asset metadata

```javascript
sdk.getRemoteAssetMetadata('Bitcoin DeGods').then(metadata => {
    // Use the metadata
});
```

## V3 API Methods

The SDK provides several methods for interacting with the V3 API:

### fetchVaultsByQueryV3(query: string, callback: any = null)
Fetches vaults by query using the V3 API.

Parameters:
- `query`: The query string
- `callback` (optional): A callback function to handle progress updates

Returns:
- A Promise that resolves to an array of Vault objects

```javascript
sdk.fetchVaultsByQueryV3('bitcoin').then(vaults => {
    // Use the vaults
});
```

### fetchVaultsByAddressV3(address: string, callback: any = null)
Fetches vaults by address using the V3 API.

Parameters:
- `address`: The address to fetch vaults for
- `callback` (optional): A callback function to handle progress updates

Returns:
- A Promise that resolves to an array of Vault objects

```javascript
sdk.fetchVaultsByAddressV3('0x123...').then(vaults => {
    // Use the vaults
});
```

### fetchVaultsByTokenIdsV3(tokenIds: string[], callback: any = null)
Fetches vaults by token IDs using the V3 API.

Parameters:
- `tokenIds`: An array of token IDs
- `callback` (optional): A callback function to handle progress updates

Returns:
- A Promise that resolves to an array of Vault objects

```javascript
sdk.fetchVaultsByTokenIdsV3(['123', '456']).then(vaults => {
    // Use the vaults
});
```

### fetchMetadataV3(tokenId: string, callback: any = null)
Fetches metadata using the V3 API.

Parameters:
- `tokenId`: The ID of the token
- `callback` (optional): A callback function to handle progress updates

Returns:
- A Promise that resolves to the metadata

```javascript
sdk.fetchMetadataV3('123').then(metadata => {
    // Use the metadata
});
```

### refreshBalanceV3(tokenId: string, callback: any = null)
Refreshes balance using the V3 API.

Parameters:
- `tokenId`: The ID of the token
- `callback` (optional): A callback function to handle progress updates

Returns:
- A Promise that resolves to the balance data

```javascript
sdk.refreshBalanceV3('123').then(balance => {
    // Use the balance
});
```

## Bitcoin Functionality

The SDK provides functions for working with Bitcoin:

### generateTaprootAddressFromMnemonic(phrase: string)
Generates a Taproot address from a mnemonic phrase.

Parameters:
- `phrase`: The mnemonic phrase

Returns:
- An object containing p2tr, tweakedSigner, pubKey, path, and coin properties

```javascript
const taprootAddress = await sdk.generateTaprootAddressFromMnemonic('your mnemonic phrase');
```

### getPsbtTxnSize(phrase: string, psbtBase64: string)
Gets the virtual size of a PSBT transaction.

Parameters:
- `phrase`: The mnemonic phrase
- `psbtBase64`: The base64-encoded PSBT

Returns:
- The virtual size of the transaction

```javascript
const txnSize = await sdk.getPsbtTxnSize('your mnemonic phrase', 'base64-encoded-psbt');
```

## Utility Functions

#### `fetchData(url: string, apiKey: string, method: string = 'GET', body: any = null)`

Fetches data from an API endpoint.

Parameters:
- `url`: The URL to fetch data from
- `apiKey`: The API key for authentication
- `method` (optional): The HTTP method to use (default: 'GET')
- `body` (optional): The request body for POST requests

Returns:
- A Promise that resolves to the parsed JSON response

```javascript
const data = await sdk.fetchData('https://api.example.com/endpoint', 'your-api-key', 'GET');
```

#### `generateAttributeTemplate(record: any)`

Generates an attribute template based on the provided record.

* Parameters:
    * `record`: The record object containing information about the asset.
* Returns:
    * An array of attribute templates.

#### `generateImageTemplate(record: any)`

Generates an image template based on the provided record.

* Parameters:
    * `record`: The record object containing information about the asset.
* Returns:
    * An object containing image template properties.

#### `generateTemplate(record: any)`

Generates a template for a given curated collection record.

* Parameters:
    * `record`: The curated collection record.
* Returns:
A template object containing rules and utilities for the curated collection.

#### `templateGuard(input: { [x: string]: any; hasOwnProperty: (arg0: string) => any; })`

Validates the provided template input and throws an error if any required fields are missing or invalid.

* Parameters:
    * `input`: The template input object to validate.

#### `genericGuard(input: any, type: string, key: string)`

Validates the provided input against the specified type and key.

* Parameters:
    * `input`: The input value to validate.
    * `type`: The expected type of the input.
    * `key`: The key or name of the input.

#### `getQuoteContractObject(web3: any)`

Retrieves the quote contract object using the provided Web3 instance. Used to calculate the amount in BASE CURRENCY to charge for an operation

* Parameters:
    * web3: The Web3 instance.
* Returns:
    * A promise that resolves to the quote contract object.

Example
```javascript
    let USDPrice = 25;
    ...
        const quoteContract = await sdk.getQuoteContractObject(web3);
    ...
        // Get the current user's account    
        const userAccount = accounts[0];

        // Call the quoteExternalPrice method on the quote contract
        const quote = await quoteContract.methods.quoteExternalPrice(userAccount, USDPrice).call();

        console.log('Quote:', quote);
    } catch (error) {
        console.error('Error getting quote:', error);
    }

```


#### `getHandlerContract(web3: any)`

Retrieves the handler contract object using the provided Web3 instance.

* Parameters:
    * `web3`: The Web3 instance.
* Returns:
    * A promise that resolves to the handler contract object.

#### `getLegacyContract(web3: any)`

Retrieves the legacy contract object using the provided Web3 instance.

* Parameters:
    * `web3`: The Web3 instance.
* Returns:
    * A promise that resolves to the legacy contract object.

#### `checkContentType(url: string)`

Checks the content type of the provided URL by making a HEAD request.

* Parameters:
    * `url`: The URL to check the content type of.
* Returns:
    * A promise that resolves to an object containing the content type information.

#### `getTorusKeys(verifierId: string, idToken: any, cb: any = null)`

Retrieves the Torus keys using the provided verifier ID and ID token.

* Parameters:
    * `verifierId`: The verifier ID.
    * `idToken`: The ID token.
    * `cb` (optional): A callback function to handle the retrieved keys.
* Returns:
    * A promise that resolves to an object containing the private key.

#### `decryptKeys(vaultCiphertextV2: any, keys: any, addresses: any[])`

Decrypts the vault keys using the provided ciphertext, keys, and addresses.

* Parameters:
    * `vaultCiphertextV2`: The vault ciphertext to decrypt.
    * `keys`: The keys used for decryption.
    * `addresses`: An array of addresses associated with the vault.
* Returns:
    * A promise that resolves to the decrypted payload.

#### `getSatsConnectAddress()`

Retrieves the Sats Connect address.

* Returns:
    * A promise that resolves to an object containing the payment address, payment public key, and ordinals address.

#### `signPSBT(psbtBase64: any, paymentAddress: any, indexes: number[], broadcast: boolean = false)`

Signs a Partially Signed Bitcoin Transaction (PSBT) using the provided PSBT base64 data, payment address, and input indexes.

* Parameters:
    * `psbtBase64`: The base64-encoded PSBT data.
    * `paymentAddress`: The payment address.
    * `indexes`: An array of input indexes to sign.
    * `broadcast` (optional): A boolean indicating whether to broadcast the transaction after signing (default: false).
* Returns:
    * A promise that resolves to the signed PSBT response.

## UI Integration Examples

The SDK can be integrated with UI components to provide a seamless user experience. Here are some examples:

### Basic UI Integration

For a simple integration of the SDK into a web application, you can create basic UI elements that allow users to interact with the core functionality.

For a complete working example of a basic implementation, refer to the [index.html](./docs/index.html) file included in the SDK. This example demonstrates:

- Setting up the SDK with your API key
- Creating UI elements for vault operations
- Handling user interactions through event listeners
- Providing feedback through a logging area
- Implementing the core vault creation, balance checking, and minting functions

This basic approach provides a foundation that you can customize and extend to suit your specific application needs.

### Step-by-Step UI Integration

For a more guided user experience, you can implement a step-by-step UI flow that walks users through the process of creating, funding, and minting a vault. This approach provides clear guidance and feedback at each stage of the process.

For a complete working example of a step-by-step implementation, refer to the [steps.html](./docs/steps.html) file included in the SDK. This example demonstrates:

- Creating UI elements for each step
- Managing button states based on progress
- Providing user feedback through logging
- Handling the complete vault creation, funding, and minting workflow

The step-by-step approach is particularly useful for applications where users may be unfamiliar with the vault creation process or where you want to provide a more structured experience.

## Collection-specific Workflows

The SDK supports simplified workflows for specific collections. Here's an example for the "Embels" collection:

```javascript
// Initialize the SDK
const sdk = new EmblemVaultSDK('your-api-key');

// Define the template for Embels
let embelsTemplate = {
    "fromAddress": null,
    "toAddress": null,
    "chainId": 1,
    "experimental": true,
    "targetContract": {
        "1": "0x25e6CfD042294a716FF60603ca01e92555cA9426",
        "name": "Embels",
        "description": "EmBells is a collection of 10,000 Bellinals from the Bellscoin blockchain. Art is created by Viva La Vandal and this collection is curated by Emblem Vault."
    },
    "targetAsset": {
        "name": "Inscribing...",
        "image": "https://emblem.finance/embells.png"
    }
};

// Combined create and mint function
async function performCreateAndMint() {
    // Load Web3 if needed
    if (!defaultAccount) {
        await sdk.loadWeb3();
        defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]);
    }
    
    // Populate the template
    embelsTemplate.toAddress = defaultAccount;
    embelsTemplate.fromAddress = defaultAccount;
    
    // Create a vault
    let vaultData = await sdk.createCuratedVault(embelsTemplate, updateLogCallback);
    
    if (vaultData.tokenId) {
        // Perform Mint steps
        sdk.performMintChain(web3, vaultData.tokenId, embelsTemplate.targetContract.name, updateLogCallback)
            .then(result => {
                updateLogCallback('Minting success', 'tokenId: ' + vaultData.tokenId);
            })
            .catch(error => {
                updateLogCallback('', error.message);
            });
    }
}
```

## Multiple Vault Creation

The SDK supports creating multiple vaults in sequence:

```javascript
// Initialize the SDK
const sdk = new EmblemVaultSDK('your-api-key');

// Create multiple vaults
async function createMultipleVaults(index = 0, vaultCount = 5) {
    if (index < vaultCount) {
        try {
            // Create a single vault
            let vault = await sdk.createCuratedVault(template);
            console.log(`Vault ${index + 1} created successfully.`);
            
            // Store the vault data
            vaults.push(vault);
            
            // Update UI or data as needed
            updateVaultData();
            
            // Create the next vault
            createMultipleVaults(index + 1, vaultCount);
        } catch (error) {
            console.error(`Failed to create vault at index ${index + 1}:`, error);
        }
    }
}

// Function to update UI or data
function updateVaultData() {
    // Generate CSV or update UI
    let csvData = 'Token ID, Deposit Address\n';
    vaults.forEach(vault => {
        csvData += `${vault.tokenId}, ${getDepositAddress(vault)}\n`;
    });
    
    // Update UI
    document.getElementById('csvData').textContent = csvData;
}

// Start creating multiple vaults
createMultipleVaults(0, document.getElementById('vaultCount').value);
```

## Data Structures and Types

The SDK provides TypeScript type definitions for all its data structures. Here are the key types:

### Vault
Represents a vault with properties like tokenId, addresses, and metadata.

```typescript
interface Vault {
    tokenId: string;
    addresses: VaultAddress[];
    metadata: Metadata;
    // Other properties...
}
```

### VaultAddress
Represents an address in a vault with properties like coin, address, and balance.

```typescript
interface VaultAddress {
    coin: string;
    address: string;
    balance?: number;
    // Other properties...
}
```

### VaultBalance
Represents a balance in a vault with properties like coin, balance, and usd.

```typescript
interface VaultBalance {
    coin: string;
    balance: number;
    usd?: number;
    // Other properties...
}
```

### Metadata
Represents metadata for a vault with properties like name, description, and image.

```typescript
interface Metadata {
    name: string;
    description: string;
    image: string;
    attributes: MetadataAttribute[];
    // Other properties...
}
```

### CuratedContract
Represents a curated contract with properties like name, description, and address.

```typescript
interface CuratedContract {
    name: string;
    description: string;
    address: (addresses: any[]) => string;
    // Other properties...
}
```

## Dependencies

The SDK depends on the following libraries:

- **Web3**: For Ethereum blockchain interactions
- **ethers**: For Ethereum utilities
- **bip32** and **bip39**: For Bitcoin key derivation
- **@bitcoin-js/tiny-secp256k1-asmjs**: For elliptic curve operations
- **sats-connect**: For Bitcoin wallet connections
- **axios** or **node-fetch**: For HTTP requests

Browser Requirements:
- The SDK requires a browser environment for some functionality, particularly for Bitcoin operations that use the global `window.bitcoin` object.
- For Node.js environments, additional configuration may be required.

## Example Usage
Here's an example of how to use the Emblem Vault SDK to create a vault, refresh its balance, validate mintability, and perform a mint:    
```javascript
async function Step1() {
    if (!defaultAccount) {
        await sdk.loadWeb3();
        defaultAccount = await web3.eth.getAccounts().then(accounts => accounts[0]).catch(err => console);
    }
    if (!vaultData) {
        let chainId = Number(await web3.eth.net.getId());
        contractTemplate.toAddress = defaultAccount;
        contractTemplate.fromAddress = defaultAccount;
        contractTemplate.chainId = chainId;
        vaultData = await sdk.createCuratedVault(contractTemplate, updateLogCallback).catch(err => console.log(err));
        if (!vaultData || vaultData.err) {
            setTimeout(Step1, 1000);
        } else {
            updateLogCallback("deposit Address", vaultData.addresses.find(address => { return address.coin == 'TAP' }).address);
        }
    }
}

async function Step2() {
    if (vaultData) {
        vaultBalance = await sdk.refreshBalance(vaultData.tokenId, updateLogCallback).catch(err => console);
    }
}

async function Step3() {
    if (vaultBalance.length > 0) {
        let contractObject = await sdk.fetchCuratedContractByName(contractTemplate.targetContract.name);
        let mintable = contractObject.allowed(vaultBalance, contractObject);
        if (mintable) {
            performMint();
        }
    }
}

async function performMint() {
    if (vaultData.tokenId) {
        sdk.performMintChain(web3, vaultData.tokenId, contractTemplate.targetContract.name, updateLogCallback)
            .then(result => {
                updateLogCallback('Minting success', 'tokenId: ' + vaultData.tokenId);
            })
            .catch(error => {
                updateLogCallback('', error.message);
            });
    }
}
```
This example demonstrates the step-by-step process of creating a vault, refreshing its balance, validating mintability, and performing a mint using the Emblem Vault SDK.
