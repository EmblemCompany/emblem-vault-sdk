const { EmblemVaultSDK } = require('../../dist/index.js');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Allowed Function for $ORDI', function() {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Does not allow empty balance', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('$ORDI');
        expect(curatedContract.allowed(null, curatedContract)).to.be.false;
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
    });

    it('Requires specific balance', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('$ORDI');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/ordi/balance.json")));
        balanceValues[0].balance = curatedContract.balanceQty - 1;
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
        balanceValues[0].balance = curatedContract.balanceQty + 1;
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Requires specific name', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('$ORDI');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/ordi/balance.json")));
        balanceValues[0].name = `${curatedContract.balanceQty}`;
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
        balanceValues[0].name = '$ORDI';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
        balanceValues[0].name = `${curatedContract.balanceQty} $ORDI`;
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Allows non-ordi balance if not first', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('$ORDI');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/ordi/balance-with-native.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Does not allow non-ordi balance as first value', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('$ORDI');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/ordi/balance-with-native-first.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });
});
