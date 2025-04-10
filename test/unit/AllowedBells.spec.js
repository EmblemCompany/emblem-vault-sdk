const { EmblemVaultSDK } = require('../../dist/index.js');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Allowed Function for Bells', () => {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Does not allow empty balance', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bells');
        expect(curatedContract.allowed(null, curatedContract)).to.be.false;
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
    });

    it('Requires balance to be greater than zero', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bells');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bells/balance.json")));
        balanceValues[0].balance = 0;
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Requires balance to be an integer', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bells');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bells/balance.json")));
        balanceValues[0].balance = 1.5;
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Requires name to be `Bel`', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bells');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bells/balance.json")));
        balanceValues[0].name = 'invalid name';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Does not allow non-bel assets as first value', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bells');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bells/balance-with-non-bell-first.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Allows non-bel assets if not first', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bells');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bells/balance-with-non-bell.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Allows valid balances', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bells');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bells/balance.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });
});
