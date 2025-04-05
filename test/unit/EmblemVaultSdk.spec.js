/**
 * Emblem Vault SDK Unit Tests
 * Core functionality tests for the SDK
 */

const { EmblemVaultSDK } = require('../../dist/index');
const { expect } = require('chai');

// Test constants
const API_KEY = 'DEMO_KEY';
const TEST_ADDRESS = '0x0000000000000000000000000000000000000000';

// We'll get the actual templates from the SDK rather than hardcoding them
let mocks = {};

/**
 * Unit tests for the EmblemVaultSDK
 * 
 * Note: Tests that require live API calls have been moved to the integration test suite:
 * - test/integration/ApiOperations.spec.js
 * - test/integration/VaultCreation.spec.js
 */
describe('EmblemVaultSDK', () => {
  describe('Non Writing Operations', () => {
    let sdk = new EmblemVaultSDK(API_KEY);
    
    // before(() => {
    //   sdk = new EmblemVaultSDK(API_KEY);
    // });
    
    it('should create a valid SDK instance with an API key', () => {
      expect(sdk).to.be.instanceOf(EmblemVaultSDK);
    });

    it('should throw an error when no API key is provided', () => {
      expect(() => {
        new EmblemVaultSDK('');
      }).to.throw('API key is required');
    });
    
    it('should get all asset metadata', () => {
      const metadata = sdk.getAllAssetMetadata();
      expect(metadata).to.be.an('array');
      expect(metadata.length).to.be.greaterThan(0);
      // Check that the metadata has the expected structure
      expect(metadata[0]).to.have.property('projectName');
    });
    
    it('should get all asset metadata using an override function', () => {
      // Create a mock override function that returns predefined data
      const mockData = [
        { projectName: 'Project1', description: 'Description 1' },
        { projectName: 'Project2', description: 'Description 2' },
        { projectName: 'Project3', description: 'Description 3' }
      ];
      
      const overrideFunc = () => mockData;
      
      // Call getAllAssetMetadata with the override function
      const metadata = sdk.getAllAssetMetadata(overrideFunc);
      
      expect(metadata).to.be.an('array');
      expect(metadata).to.deep.equal(mockData);
      expect(metadata[0].projectName).to.equal('Project1');
      expect(metadata[1].projectName).to.equal('Project2');
      expect(metadata[2].projectName).to.equal('Project3');
    });

    it('should get asset metadata for a project', async () => {
      // Create a mock override function that returns predefined data
      // This is necessary because the real API might return unexpected data format
      const mockData = {
        "EVTESTCOMMON": {
          "image": "https://emblem.finance/EVTESTCOMMON.gif",
          "projectName": "Emblem Test"
        },
        "EVTESTEPIC": {
          "image": "https://emblem.finance/EVTESTEPIC.gif",
          "projectName": "Emblem Test"
        },
        "EVTESTLEGEND": {
          "image": "https://emblem.finance/EVTESTLEGEND.jpg",
          "projectName": "Emblem Test"
        }
      };
      
      const overrideFunc = () => mockData
      
      const metadata = await sdk.getAssetMetadata('Emblem Test', false, overrideFunc);
      expect(metadata).to.be.an('array');
      expect(metadata.length).to.equal(3);
      expect(metadata[0].projectName).to.equal('Emblem Test');
    });

    it('should get asset metadata with case-insensitive matching by default', async () => {
      // Create a mock override function that returns predefined data
      const mockData = {
        "EVTESTLEGEND": {
          "image": "https://emblem.finance/EVTESTLEGEND.jpg",
          "projectName": "CaseSensitive"
        }
      };
      
      const overrideFunc = () => mockData;
      
      // Call with different case but strict=false (default)
      const metadata = await sdk.getAssetMetadata('casesensitive', false, overrideFunc);
      
      expect(metadata).to.be.an('array');
      expect(metadata).to.have.lengthOf(1);
      expect(metadata[0].projectName).to.equal('CaseSensitive');
    });

    it('should respect strict matching when specified', async () => {
      // Create a mock override function that returns predefined data
      const mockData = [
        { projectName: 'CaseSensitive', description: 'This tests case sensitivity' }
      ];
      
      const overrideFunc = async () => mockData;
      
      // Call with different case and strict=true
      const metadata = await sdk.getAssetMetadata('casesensitive', true, overrideFunc);
      
      expect(metadata).to.be.an('array');
      expect(metadata).to.have.lengthOf(0); // Should find nothing with strict matching
    });

    it('should get curated contracts', async () => {
      const contracts = await sdk.fetchCuratedContracts();
      expect(contracts).to.be.an('array');
      expect(contracts.length).to.be.greaterThan(0);
      
      // Store contract templates for later tests
      const emblemOpenContract = contracts.find(contract => contract.name === "EmblemOpen");
      const bitcoinOrdinalsContract = contracts.find(contract => contract.name === "BitcoinOrdinals");
      
      if (emblemOpenContract) {
        mocks.emblemopen_create_template = emblemOpenContract.generateCreateTemplate(emblemOpenContract);
      }
      
      if (bitcoinOrdinalsContract) {
        mocks.empty_create_template = bitcoinOrdinalsContract.generateCreateTemplate(bitcoinOrdinalsContract);
      }
    });
  
    it('should make template with functions', async () => {
      const contracts = await sdk.fetchCuratedContracts();
      expect(contracts[0]["generateVaultBody"]).to.be.a('function');
    });
  
    it('should generate create template correctly for emblem open', async () => {
      const contracts = await sdk.fetchCuratedContracts();
      let contract = contracts.find(contract => contract.name === "EmblemOpen");
      const template = contract?.generateCreateTemplate(contract);
      
      // Verify the template has the expected structure
      expect(template).to.be.an('object');
      expect(template).to.have.property('targetAsset');
      expect(template.targetAsset).to.have.property('name');
    });
  
    it('should generate create template correctly for empty', async () => {
      const contracts = await sdk.fetchCuratedContracts();
      let contract = contracts.find(contract => contract.name === "BitcoinOrdinals");
      const template = contract?.generateCreateTemplate(contract);
      
      // Verify the template has the expected structure
      expect(template).to.be.an('object');
      expect(template).to.have.property('targetAsset');
    });

    it('should fetch metadata', async () => {
      const metadata = await sdk.fetchMetadata("1337");
      expect(metadata).to.be.an('object');
      expect(metadata.name).to.equal("Patrick's Birthday Vault");
    });

    it('should fetch vaults of type', async () => {
      const vaults = await sdk.fetchVaultsOfType("created", TEST_ADDRESS);
      expect(vaults).to.be.an('array');
      // todo: test for a non-zero value address
      expect(vaults.length).to.be.at.least(0);
    });
  });
  
  // Note: Vault Creation tests have been moved to integration tests
});
