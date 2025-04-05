/**
 * Counterparty Collection Tests
 * Tests for the Counterparty collection's allowed function
 */

const { EmblemVaultSDK } = require('../../dist/index');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

// Test constants
const API_KEY = 'DEMO_KEY';

describe('Allowed Function for Counterparty', function() {
  // Increase timeout for API calls
  this.timeout(10000);
  
  const sdk = new EmblemVaultSDK(API_KEY);
  
  // Helper function to get fixture path
  const getFixturePath = (filename) => {
    return path.join(__dirname, '../fixtures/counterparty', filename);
  };

  it('Does not allow empty balance', async () => {
    const curatedContract = await sdk.fetchCuratedContractByName('Counterparty');
    expect(curatedContract.allowed(null, curatedContract)).to.be.false;
    expect(curatedContract.allowed([], curatedContract)).to.be.false;
  });

  it('Does not allow more than one asset', async () => {
    const curatedContract = await sdk.fetchCuratedContractByName('Counterparty');
    const balanceValues = JSON.parse(fs.readFileSync(getFixturePath("balance-with-multiple.json"), 'utf8'));
    balanceValues[0].coin = 'invalid coin';
    expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
  });

  it('Does not allow non-native coin', async () => {
    const curatedContract = await sdk.fetchCuratedContractByName('Counterparty');
    const balanceValues = JSON.parse(fs.readFileSync(getFixturePath("balance.json"), 'utf8'));
    balanceValues[0].coin = 'invalid coin';
    expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
  });

  it('Allows collection chain asset', async () => {
    const curatedContract = await sdk.fetchCuratedContractByName('Counterparty');
    const balanceValues = JSON.parse(fs.readFileSync(getFixturePath("balance.json"), 'utf8'));
    
    // For protocol collections, only the collectionChain asset is allowed
    balanceValues[0].coin = curatedContract.collectionChain;
    expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    
    // Test case insensitivity
    balanceValues[0].coin = curatedContract.collectionChain.toUpperCase();
    expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
  });

  it('Allows valid balance', async () => {
    const curatedContract = await sdk.fetchCuratedContractByName('Counterparty');
    const balanceValues = JSON.parse(fs.readFileSync(getFixturePath("balance.json"), 'utf8'));
    
    // Make sure the coin matches the collectionChain for protocol collections
    balanceValues[0].coin = curatedContract.collectionChain;
    expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
  });
});
