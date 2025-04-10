const { EmblemVaultSDK } = require('../../dist/index.js');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Allowed Function for Namecoin', function() {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Does not allow empty balance', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Namecoin');
        expect(curatedContract.allowed(null, curatedContract)).to.be.false;
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
    });

    it('Requires coin to be a native asset', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Namecoin');
        let balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/namecoin/balance.json")));
        balanceValues[0].coin = "invalid coin";
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
        balanceValues[0].coin = null;
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
    });

    it('Allows native assets and NFTs in any order', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Namecoin');
        let balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/namecoin/balance.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
        balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/namecoin/balance-with-native.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
        balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/namecoin/balance-with-native-first.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });
});
