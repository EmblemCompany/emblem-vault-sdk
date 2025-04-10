const { EmblemVaultSDK } = require('../../dist/index.js');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Allowed Function for protocol collections', function() {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Does not allow empty balance', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Dogeparty');
        expect(curatedContract.allowed(null, curatedContract)).to.be.false;
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
    });

    it('Requires first asset to have coin matching collectionChain (case insensitive)', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Dogeparty');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/dogeparty/balance.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
        balanceValues[0].coin = balanceValues[0].coin.toUpperCase();
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
        balanceValues[0].coin = balanceValues[0].coin.toLowerCase();
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
        balanceValues[0].coin = 'invalid coin';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Does not allow non collection asset if first', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Dogeparty');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/dogeparty/balance-with-non-dogeparty-first.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Allows non collection assets if not first', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Dogeparty');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/dogeparty/balance-with-non-dogeparty.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Allows valid balances', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Dogeparty');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/dogeparty/balance.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });
});
