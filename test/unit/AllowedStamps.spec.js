const { EmblemVaultSDK } = require('../../dist/index.js');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Allowed Function for Stamps', function() {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Does not allow empty balance', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Stamps');
        expect(curatedContract.allowed(null, curatedContract)).to.be.false;
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
    });

    it('Requires asset name to include `stamps`', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Stamps');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/stamps/balance.json")));
        balanceValues[0].name = 'invalid asset name';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Requires project name', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Stamps');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/stamps/balance.json")));
        const originalProject = balanceValues[0].project;
        // balanceValues[0].project = null;
        delete balanceValues[0].project;
        const result = curatedContract.allowed(balanceValues, curatedContract);
        expect(result).to.be.false; // Check for any falsy value (false, null, undefined, 0, "")
        // Restore the original project for future tests
        balanceValues[0].project = originalProject;
    });

    it('Requires project name to be Stamps or Stampunks', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Stamps');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/stamps/balance.json")));
        balanceValues[0].project = 'invalid project';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Allows case insensitive project name', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Stamps');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/stamps/balance.json")));
        balanceValues[0].project = 'STAMPS';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
        balanceValues[0].project = 'STAMPUNKS';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Requires coin to be a native asset', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Stamps');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/stamps/balance.json")));
        balanceValues[0].coin = 'invalid coin';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
        for (var nativeAsset of curatedContract.nativeAssets) {
            balanceValues[0].coin = nativeAsset;
            expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
        }
    });

    it('Requires first asset to be a stamp', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Stamps');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/stamps/balance-with-non-stamps-first.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Allows non-stamps assets if not first', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Stamps');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/stamps/balance-with-non-stamps.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Allows valid balances', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Stamps');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/stamps/balance.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });
});
