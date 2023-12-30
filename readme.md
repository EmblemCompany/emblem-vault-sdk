# Emblem Vault SDK

This SDK provides a set of tools to interact with the Emblem Vault API. It includes methods for fetching curated contracts, creating vaults, and fetching metadata.

## Installation

```
npm i emblem-vault-sdk
```

## Getting Started
```
const EmblemVaultSDK = require('emblem-vault-sdk');
const apiKey = 'YOUR_API_KEY'; // replace with your actual API key

const sdk = new EmblemVaultSDK(apiKey);
```

## SDK Methods
```javascript
// Fetch curated contracts
sdk.fetchCuratedContracts().then(contracts => {
    console.log(contracts);
});

// Select a contract create template
sdk.fetchCuratedContracts().then(contracts => {
    const contract = contracts.find(contract => contract.name === "Ethscriptions");
    const template = contract.generateCreateTemplate(contract);
    console.log(template);
});

// Create a curated vault
const template = {}; // replace with your actual template
sdk.createCuratedVault(template).then(vault => {
    console.log(vault);
});

// Fetch metadata
const tokenId = 'YOUR_TOKEN_ID'; // replace with your actual token id
sdk.fetchMetadata(tokenId).then(metadata => {
    console.log(metadata);
});
```

## Simple Html Demo

<a href="./demos/index.html">Simple HTML Demo</a>




