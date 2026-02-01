# Emblem Vault SDK Documentation

The Emblem Vault SDK is a JavaScript library that provides functionality for interacting with Emblem Vaults, including creating vaults, refreshing balances, and performing minting operations.

## Table of Contents
- [Installation](#installation)
- [Initialization](#initialization)
- [Fetching Curated Contracts](#fetching-curated-contracts)
- [Creating a Vault](#creating-a-vault)
- [Refreshing Vault Balance](#refreshing-vault-balance)
- [Fetching Vaults by Type](#fetching-vaults-by-type)
- [Validating Mintability](#validating-mintability)
- [Performing a Mint](#performing-a-mint)
- [Utility Functions](#utility-functions)
  - [generateUploadUrl()](#generateuploadurl)
  - [generateAttributeTemplate(record: any)](#generateattributetemplaterecord-any)
  - [generateImageTemplate(record: any)](#generateimagetemplaterecord-any)
  - [generateTemplate(record: any)](#generatetemplaterecord-any)
  - [templateGuard(input: { [x: string]: any; hasOwnProperty: (arg0: string) => any; })](#templateguardinput--x-string-any-hasownproperty-arg0-string--any-)
  - [genericGuard(input: any, type: string, key: string)](#genericguardinput-any-type-string-key-string)
  - [getQuoteContractObject(web3: any)](#getquotecontractobjectweb3-any)
  - [getHandlerContract(web3: any)](#gethandlercontractweb3-any)
  - [getLegacyContract(web3: any)](#getlegacycontractweb3-any)
  - [checkContentType(url: string)](#checkcontenttypeurl-string)
  - [getTorusKeys(verifierId: string, idToken: any, cb: any = null)](#gettoruskeysveriferid-string-idtoken-any-cb-any--null)
  - [decryptKeys(vaultCiphertextV2: any, keys: any, addresses: any[])](#decryptkeysvaultciphertextv2-any-keys-any-addresses-any)
  - [getSatsConnectAddress()](#getsatsconnectaddress)
  - [signPSBT(psbtBase64: any, paymentAddress: any, indexes: number[], broadcast: boolean = false)](#signpsbtpsbtbase64-any-paymentaddress-any-indexes-number-broadcast-boolean--false)
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

const sdk = new EmblemVaultSDK('demo');
```

## Fetching Curated Contracts
To fetch the curated contracts, use the fetchCuratedContracts method:
```javascript
sdk.fetchCuratedContracts(false).then(curatedContracts => {
    // Use the curated contracts
});
```

## Creating a Vault
To create a vault, prepare a contract template object and call the createCuratedVault method:

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

vaultData = await sdk.createCuratedVault(contractTemplate, updateLogCallback);
```
## Refreshing Vault Balance
To refresh the balance of a vault, use the refreshBalance method:

```javascript
vaultBalance = await sdk.refreshBalance(vaultData.tokenId, updateLogCallback);
```

## Fetching Vaults by Type
To fetch vaults owned by an address, use the `fetchVaultsOfType` method:

```javascript
// Fetch all vaults (returns full array)
const vaults = await sdk.fetchVaultsOfType('created', '0xYourAddress');

// Vault types: "vaulted", "unvaulted", "created"
```

### Pagination Support
For large collections, use pagination to fetch vaults in pages:

```javascript
// Fetch a specific page (returns { data, pagination } object)
const result = await sdk.fetchVaultsOfType('created', '0xYourAddress', { page: 1, limit: 100 });

console.log(result.data);       // Array of vaults for this page
console.log(result.pagination); // { page: 1, limit: 100, total: 500, totalPages: 5 }
```

### Fetching All Vaults with Progress
To automatically fetch all pages with progress tracking:

```javascript
const allVaults = await sdk.fetchAllVaultsOfType('created', '0xYourAddress', (page, totalPages, total) => {
    console.log(`Fetched page ${page}/${totalPages} (${total} total vaults)`);
});
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
## Utility Functions
#### `generateUploadUrl()`

Generates a URL for uploading files.

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

