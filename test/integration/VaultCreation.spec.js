const { expect } = require('chai');
const { EmblemVaultSDK } = require('../../dist');
const mocks = require('../../test/mocks');

// Test constants
const API_KEY = process.env.API_KEY || 'DEMO_KEY';
const TEST_ADDRESS = "0xb0573e14D92755DE30281f7b10d0F3a5DD3e747B";

describe('Vault Creation Integration Tests', function() {
  let sdk;
  
  before(function() {
    sdk = new EmblemVaultSDK(API_KEY);
  });
  
  // Increase timeout for these tests as they make API calls
  this.timeout(15000);
  
  beforeEach(function() {
    // Skip vault creation tests when using demo key
    if (API_KEY === 'DEMO_KEY') {
      this.skip();
    }
  });
  
  it('should create vault (load type empty)', async () => {        
    const contracts = await sdk.fetchCuratedContracts();
    let populatedTemplate = JSON.parse(JSON.stringify(mocks.empty_create_template));
    populatedTemplate.fromAddress = TEST_ADDRESS;
    populatedTemplate.toAddress = TEST_ADDRESS;
    populatedTemplate.chainId = "1"; // Add Ethereum mainnet chainId
    
    let vault = await sdk.createCuratedVault(populatedTemplate);
    expect(vault).to.be.an('object');
  });
  
  // Add more integration tests for other vault creation scenarios
  it('should fetch vault details after creation', async () => {
    // This test depends on the previous test creating a vault
    // In a real integration test, you might want to create a vault first
    // and then use its ID to fetch details
    
    // For now, we'll just check if fetchVaultsOfAddress works
    const vaults = await sdk.fetchVaultsOfAddress(TEST_ADDRESS);
    expect(vaults).to.be.an('array');
    
    if (vaults.length > 0) {
      const firstVault = vaults[0];
      expect(firstVault).to.have.property('tokenId');
    }
  });
});
