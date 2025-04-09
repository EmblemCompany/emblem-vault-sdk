const { expect } = require('chai');
const { getSDK } = require('../helpers/sdkLoader');
// const dotenv = require('dotenv');
// const path = require('path');
const mocks = require('../mocks');

// Load environment variables
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Test constants
const API_KEY = 'DEMO_KEY';
const TEST_ADDRESS = "0xb0573e14D92755DE30281f7b10d0F3a5DD3e747B";

describe.skip('API Operations Integration Tests', function() {
  // Get SDK instance using the loader
  const sdk = getSDK();

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
      // Use override function with mock data when using demo key
      const contractName = 'Ethscription';
      // First get all contracts
      const contracts = await sdk.fetchCuratedContracts();
      // Then find the specific one by name
      const contract = await sdk.fetchCuratedContractByName(
        contractName, 
        contracts
      );
      
      expect(contract).to.be.an('object');
      expect(contract).to.have.property('name');
      expect(contract.name).to.equal('Ethscription');
    });
  });
  
  describe('Vault Operations', function() {
    it('should fetch vaults of a specific type', async function() {
      const vaults = await sdk.fetchVaultsOfType(
        "created", 
        TEST_ADDRESS,
        API_KEY === 'DEMO_KEY' ? () => mocks.sample_vaults : null
      );
      
      expect(vaults).to.be.an('array');
      
      // If vaults exist, check their structure
      if (vaults.length > 0) {
        const firstVault = vaults[0];
        expect(firstVault).to.have.property('tokenId');
      }
    });
    
    it('should fetch vaults for an address', async function() {
      // Using fetchVaultsOfType with "all" type to get all vaults for an address
      const vaults = await sdk.fetchVaultsOfType(
        "all", 
        TEST_ADDRESS,
        API_KEY === 'DEMO_KEY' ? () => mocks.sample_vaults : null
      );
      
      expect(vaults).to.be.an('array');
    });
  });
  
  describe('Asset Metadata', function() {
    it('should fetch asset metadata from the API', async function() {
      const metadata = await sdk.getAssetMetadata(
        'Bitcoin Ordinals',
        API_KEY === 'DEMO_KEY' ? () => mocks.bitcoin_ordinals_metadata : null
      );
      
      expect(metadata).to.be.an('array');
      
      if (metadata.length > 0) {
        expect(metadata[0]).to.have.property('projectName');
        expect(metadata[0].projectName.toLowerCase()).to.include('bitcoin ordinals');
      }
    });
    
    it('should fetch remote asset metadata project list', async function() {
      const projects = await sdk.getRemoteAssetMetadataProjectList(
        API_KEY === 'DEMO_KEY' ? () => mocks.project_list : null
      );
      
      expect(projects).to.be.an('array');
    });
  });
});
