const { expect } = require('chai');
const { getSDK } = require('../helpers/sdkLoader');

// Test constants
const TEST_ADDRESS = "0xb0573e14D92755DE30281f7b10d0F3a5DD3e747B";
const CONTRACT_NAME = "EmblemOpen";

describe.skip('Vault Creation Integration Tests', function() {
  // Get SDK instance using the loader
  const sdk = getSDK();
  
  // Increase timeout for these tests as they make API calls
  this.timeout(155000);
  
  it('should create vault using contract template', async () => {
    // Get all contracts
    const contracts = await sdk.fetchCuratedContracts();
    expect(contracts).to.be.an('array');
    expect(contracts.length).to.be.greaterThan(0);
    
    // Find the Emblem Open contract
    const contract = contracts.find(contract => contract.name === CONTRACT_NAME);
    expect(contract).to.be.an('object');
    
    // Generate a template using the contract's generateCreateTemplate function
    const template = contract.generateCreateTemplate(contract);
    expect(template).to.be.an('object');
    
    // Populate the template with test data
    template.fromAddress = TEST_ADDRESS
    template.toAddress = TEST_ADDRESS
    template.chainId = "1" // Add Ethereum mainnet chainId
    template.targetAsset.name = "Test Asset"
    template.targetAsset.image = "https://emblem.finance/stamps.png"
    template.targetAsset.description = "Test Asset Description"
    template.targetAsset.ownedImage = "https://emblem.finance/stamps.png" // Add required ownedImage field
    
    // Create the vault using the populated template
    const vault = await sdk.createCuratedVault(template);
    
    // Verify the created vault
    expect(vault).to.be.an('object');
    expect(vault).to.have.property('tokenId');
  });
  
  it('should create vault with asset details', async () => {
    // Get all contracts
    const contracts = await sdk.fetchCuratedContracts();
    expect(contracts).to.be.an('array');
    
    // Find the Emblem Open contract
    const contract = contracts.find(contract => contract.name === CONTRACT_NAME);
    expect(contract).to.be.an('object');
    
    // Generate a template using the contract's generateCreateTemplate function
    const template = contract.generateCreateTemplate(contract);
    expect(template).to.be.an('object');
    
    // Populate the template with test data
    template.name = `Test Vault with Asset ${Date.now()}`;
    template.description = 'Test vault with asset created by integration tests';
    template.fromAddress = TEST_ADDRESS;
    template.toAddress = TEST_ADDRESS;
    template.chainId = "1"; // Ethereum mainnet
    
    // Add asset details
    template.targetAsset = {
      name: "Test Asset",
      image: "https://emblem.finance/stamps.png",
      description: "Test Asset Description",
      ownedImage: "https://emblem.finance/stamps.png"
    };
    
    // Create the vault using the populated template
    const vault = await sdk.createCuratedVault(template);
    
    // Verify the created vault
    expect(vault).to.be.an('object');
    expect(vault).to.have.property('tokenId');
    expect(vault.targetAsset.name).to.equal("Test Asset");
    expect(vault.targetAsset.image).to.equal("https://emblem.finance/stamps.png");
    expect(vault.targetAsset.description).to.equal("Test Asset Description");
  });
  
  it('should fetch vault details after creation', async () => {
    // Fetch vaults for the test address
    const vaults = await sdk.fetchVaultsOfType("created", TEST_ADDRESS);
    expect(vaults).to.be.an('array');
    
    if (vaults.length > 0) {
      const firstVault = vaults[0];
      expect(firstVault).to.have.property('tokenId');
    }
  });
});
