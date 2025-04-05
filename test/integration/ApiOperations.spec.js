const { expect } = require('chai');
const { EmblemVaultSDK } = require('../../dist');

// Test constants
const API_KEY = process.env.API_KEY || 'DEMO_KEY';
const TEST_ADDRESS = "0xb0573e14D92755DE30281f7b10d0F3a5DD3e747B";

describe('API Operations Integration Tests', function() {
  const sdk = new EmblemVaultSDK(API_KEY);

  // Increase timeout for these tests as they make API calls
  this.timeout(15000);
  
  describe('Curated Contracts', function() {
    it('should fetch curated contracts from the API', async function() {
      const contracts = await sdk.fetchCuratedContracts();
      expect(contracts).to.be.an('array');
      expect(contracts.length).to.be.greaterThan(0);
      
      // Verify contract structure
      const firstContract = contracts[0];
      expect(firstContract).to.have.property('name');
      expect(firstContract).to.have.property('mintable');
    });
    
    it('should fetch a specific curated contract by name', async function() {
      // You may need to adjust this based on your actual data
      const contract = await sdk.fetchCuratedContractByName('Ethscription');
      
      // If using demo key, the contract might not be found
      if (API_KEY === 'DEMO_KEY' && !contract) {
        this.skip();
      } else {
        expect(contract).to.be.an('object');
        expect(contract).to.have.property('name');
        expect(contract.name).to.equal('Ethscription');
      }
    });
  });
  
  describe('Vault Operations', function() {
    it('should fetch vaults of a specific type', async function() {
      // Skip if using demo key
      if (API_KEY === 'DEMO_KEY') {
        this.skip();
      }
      
      const vaults = await sdk.fetchVaultsOfType("created", TEST_ADDRESS);
      expect(vaults).to.be.an('array');
      
      // If vaults exist, check their structure
      if (vaults.length > 0) {
        const firstVault = vaults[0];
        expect(firstVault).to.have.property('tokenId');
      }
    });
    
    it('should fetch vaults by address', async function() {
      // Skip if using demo key
      if (API_KEY === 'DEMO_KEY') {
        this.skip();
      }
      
      const vaults = await sdk.fetchVaultsOfAddress(TEST_ADDRESS);
      expect(vaults).to.be.an('array');
    });
  });
  
  describe('Asset Metadata', function() {
    it('should fetch asset metadata from the API', async function() {
      // Skip if using demo key
      if (API_KEY === 'DEMO_KEY') {
        this.skip();
      }
      
      const metadata = await sdk.getAssetMetadata('Bitcoin Ordinals');
      expect(metadata).to.be.an('array');
      
      if (metadata.length > 0) {
        expect(metadata[0]).to.have.property('projectName');
        expect(metadata[0].projectName.toLowerCase()).to.include('bitcoin ordinals');
      }
    });
    
    it('should fetch remote asset metadata project list', async function() {
      // Skip if using demo key
      if (API_KEY === 'DEMO_KEY') {
        this.skip();
      }
      
      const projects = await sdk.getRemoteAssetMetadataProjectList();
      expect(projects).to.be.an('array');
    });
  });
});
