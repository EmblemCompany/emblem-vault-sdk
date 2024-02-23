# Emblem Vault SDK

## Overview
The EmblemVault SDK provides developers with the tools needed to interact with the EmblemVault API, facilitating the seamless integration of EmblemVault functionalities into applications.

## Getting Started

### Installation
Install via npm or yarn:
- `npm install emblemvault-sdk`
- `yarn add emblemvault-sdk`

### Initialization
Initialize with your API key:
```javascript
import EmblemVaultSDK from 'emblemvault-sdk';
const emblemVaultSDK = new EmblemVaultSDK('YOUR_API_KEY');
```

## API Reference

### Asset Metadata Methods
- **getAssetMetadata(projectName, strict = false)**: Fetch metadata for assets by project name.
- **getAllAssetMetadata()**: Retrieve metadata for all assets.
- **getAllProjects()**: Get a list of all projects.

### Curated Collections Methods
- **fetchCuratedContracts(hideUnMintable = false, overrideFunc = false)**: Fetch curated contracts, with optional parameters to hide unmintable contracts or override the fetching function.
- **fetchCuratedContractByName(name, contracts = false)**: Fetch a curated contract by its name.

### Web3 Integration Methods
- **loadWeb3()**: Dynamically load Web3 and connect to MetaMask.

### Minting, Burning, and Claiming Methods
- **performMintChain(web3, tokenId, collectionName, callback = null)**: Perform the minting process for a specific token in a collection.
- **performBurn(web3, tokenId, callback = null)**: Burn a token.
- **performClaimChain(web3, tokenId, serialNumber, callback = null)**: Claim ownership of a token.

### Bitcoin Network Methods
- **getSatsConnectAddress()**: Generate a SatsConnect address for Bitcoin transactions.
- **generatePSBT(phrase, satsPerByte = 20)**: Generate a Partially Signed Bitcoin Transaction (PSBT).
- **getTaprootAddressFromMnemonic(phrase)**: Generate a Taproot address from a mnemonic phrase.

## Global Declaration
The `EmblemVaultSDK` is available globally in web applications through the `window` object.


## Simple Html Demo

View Live Demo Here(https://emblemcompany.github.io/emblem-vault-sdk/)
```
git clone https://github.com/EmblemCompany/emblem-vault-sdk.git
cd emblem-vault-sdk/docs
open index.html
```

### Visit our #Development channel on Discord
#development (https://discord.gg/UEkrya8usj)



