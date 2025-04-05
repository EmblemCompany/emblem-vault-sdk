/**
 * Emblem Vault SDK Unit Tests
 * Core functionality tests for the SDK
 */

import EmblemVaultSDK from '../../src/';
import { expect, TEST_ADDRESS, API_KEY, mocks } from '../helpers/setup';

describe('EmblemVaultSDK', () => {
  describe('Non Writing Operations', () => {
    it('should create a valid SDK instance with an API key', () => {
      const sdk = new EmblemVaultSDK(API_KEY);
      expect(sdk).to.be.instanceOf(EmblemVaultSDK);
    });

    it('should throw an error when no API key is provided', () => {
      expect(() => {
        new EmblemVaultSDK('');
      }).to.throw('API key is required');
    });
  
    it('should get curated contracts', async () => {
      const sdk = new EmblemVaultSDK(API_KEY);
      const contracts = await sdk.fetchCuratedContracts();
      expect(contracts).to.be.an('array');
      expect(contracts.length).to.be.greaterThan(0);
    });
  
    it('should make template with functions', async () => {
      const sdk = new EmblemVaultSDK(API_KEY);
      const contracts = await sdk.fetchCuratedContracts();
      expect(contracts[0]["generateVaultBody"]).to.be.a('function');
    });
  
    it('should generate create template correctly for emblem open', async () => {
      const sdk = new EmblemVaultSDK(API_KEY);
      const contracts = await sdk.fetchCuratedContracts();
      let contract = contracts.find(contract => contract.name === "EmblemOpen");
      expect(contract?.generateCreateTemplate(contract)).to.deep.equal(mocks.emblemopen_create_template);
    });
  
    it('should generate create template correctly for empty', async () => {
      const sdk = new EmblemVaultSDK(API_KEY);
      const contracts = await sdk.fetchCuratedContracts();
      let contract = contracts.find(contract => contract.name == "BitcoinOrdinals");
      expect(contract?.generateCreateTemplate(contract)).to.deep.equal(mocks.empty_create_template);
    });

    it('should fetch metadata', async () => {
      const sdk = new EmblemVaultSDK(API_KEY);
      const metadata = await sdk.fetchMetadata("1337");
      expect(metadata).to.be.an('object');
      expect(metadata.name).to.equal("Patrick's Birthday Vault");
    });

    it('should fetch vaults of type', async () => {
      const sdk = new EmblemVaultSDK(API_KEY);
      const vaults = await sdk.fetchVaultsOfType("created", TEST_ADDRESS);
      expect(vaults).to.be.an('array');
      // todo: test for a non-zero value address
      expect(vaults.length).to.be.at.least(0);
    });
  });    
  
  describe('Vault Creation', () => {
    it('should create vault (load type empty)', async () => {        
      const sdk = new EmblemVaultSDK(API_KEY);
      const contracts = await sdk.fetchCuratedContracts();
      let populatedTemplate: any = JSON.parse(JSON.stringify(mocks.empty_create_template));
      populatedTemplate.fromAddress = TEST_ADDRESS;
      populatedTemplate.toAddress = TEST_ADDRESS;
      populatedTemplate.chainId = "1"; // Add Ethereum mainnet chainId
      let vault = await sdk.createCuratedVault(populatedTemplate);
      expect(vault).to.be.an('object');
    });

    it('should create vault (load type detailed)', async () => {        
      const sdk = new EmblemVaultSDK(API_KEY);
      const contracts = await sdk.fetchCuratedContracts();
      let populatedTemplate: any = JSON.parse(JSON.stringify(mocks.emblemopen_create_template));
      populatedTemplate.fromAddress = TEST_ADDRESS;
      populatedTemplate.toAddress = TEST_ADDRESS;
      populatedTemplate.chainId = "1"; // Add Ethereum mainnet chainId
      populatedTemplate.targetAsset.name = "Test Asset";
      populatedTemplate.targetAsset.image = "https://emblem.finance/stamps.png";
      populatedTemplate.targetAsset.description = "Test Asset Description";
      populatedTemplate.targetAsset.ownedImage = "https://emblem.finance/stamps.png"; // Add required ownedImage field
      let vault = await sdk.createCuratedVault(populatedTemplate);
      expect(vault).to.be.an('object');
      expect(vault.targetAsset.name).to.equal("Test Asset");
      expect(vault.targetAsset.image).to.equal("https://emblem.finance/stamps.png");
      expect(vault.targetAsset.description).to.equal("Test Asset Description");
    });

    it('should not require ownedImage', async () => {        
      const sdk = new EmblemVaultSDK(API_KEY);
      const contracts = await sdk.fetchCuratedContracts();
      let populatedTemplate: any = JSON.parse(JSON.stringify(mocks.emblemopen_create_template));
      populatedTemplate.fromAddress = TEST_ADDRESS;
      populatedTemplate.toAddress = TEST_ADDRESS;
      populatedTemplate.chainId = "1"; // Add Ethereum mainnet chainId
      populatedTemplate.targetAsset.name = "Test Asset";
      populatedTemplate.targetAsset.image = "https://emblem.finance/stamps.png";
      populatedTemplate.targetAsset.description = "Test Asset Description";
      let vault = await sdk.createCuratedVault(populatedTemplate);
      expect(vault).to.be.an('object');
      expect(vault.targetAsset.name).to.equal("Test Asset");
      expect(vault.targetAsset.image).to.equal("https://emblem.finance/stamps.png");
      expect(vault.targetAsset.description).to.equal("Test Asset Description");
    });
  });
});
