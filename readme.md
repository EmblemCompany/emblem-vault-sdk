# Emblem Vault SDK

This SDK provides a set of tools to interact with the Emblem Vault API. It includes methods for fetching curated contracts, creating vaults, and fetching metadata.

## Installation

```
npm i emblem-vault-sdk
```

## Getting Started
```
const EmblemVaultSDK = require('emblem-vault-sdk');
// import EmblemVaultSDK from 'emblem-vault-sdk'
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

// Fetch Vaults of type ____ owned by ____
const TEST_ADDRESS = "0x9dE9ffB62c159A10cbcC19BdAc7962e9C19a1baa"
sdk.fetchVaultsOfType("created", TEST_ADDRESS).then(vaults => {
    console.log(vaults);
});

// Get all projects that contain Asset Metadata
projects = sdk.getAllProjects()
// [
//     "Emblem Test",
//     "Age of Chains",
//     "Age of Rust",
//     "..."
// ]

// Get asset metadata
const projectName = projects[1]; // valid item from getAllProjects() above
assets = sdk.getAssetMetadata(projectName)
console.log(assets)
// [
//     {
//     "image":"ELECTRUMCARD.jpg",
//     "projectName":"Age of Chains",
//     "projectLogo":"age-of-chains.jpg",
//     "projectSite":"https://www.ageofchains.com/",
//     "assetName":"ELECTRUMCARD"
//     },...
// ]

```

## Simple Html Demo

View Live Demo Here(https://emblemcompany.github.io/emblem-vault-sdk/)
```
git clone https://github.com/EmblemCompany/emblem-vault-sdk.git
cd emblem-vault-sdk/docs
open index.html
```

### Visit our #Development channel on Discord
#development (https://discord.gg/UEkrya8usj)



