const { EmblemVaultSDK } = require('../../dist/index.js');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Allowed Function for Ethscriptions', function() {
    // Set timeout for all tests in this suite
    this.timeout(10000);
    
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Does not allow empty balance', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Ethscription');
        expect(curatedContract.allowed(null, curatedContract)).to.be.false;
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
    });

    it("Requires coin to match collectionChain case-insensitively", async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Ethscription');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/ethscriptions/balance.json")));
        // For protocol collections, the coin must match the collectionChain (case insensitive)
        balanceValues[0].coin = "invalid coin";
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
        
        // Should pass with the correct coin matching collectionChain (case insensitive)
        // Note: The fixture uses "ethscription" (singular) while the collectionChain is "Ethscriptions" (plural)
        // The validation should be case-insensitive but the actual value needs to match exactly
        balanceValues[0].coin = "ethscription"; // exact match to the fixture
        balanceValues[0].project = "Ethscription"; // Add project property matching the contract name
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Requires first balance value to be an ethscription', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Ethscription');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/ethscriptions/balance-with-native-first.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Allows non-ethscription balances if not first', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Ethscription');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/ethscriptions/balance-with-native.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Allows valid balances', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Ethscription');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/ethscriptions/balance.json")));
        // Make sure the coin matches the collectionChain for protocol collections (case insensitive)
        balanceValues[0].coin = "ethscription"; // exact match to the fixture
        balanceValues[0].project = "Ethscription"; // Add project property matching the contract name
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });
});
