const { EmblemVaultSDK } = require('../../dist/index.js');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Allowed Function for BitcoinOrdinals', () => {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Does not allow empty balance', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('BitcoinOrdinals');
        expect(curatedContract.allowed(null, curatedContract)).to.be.false;
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
    });

    it('Allows native balance as first value', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('BitcoinOrdinals');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bitcoin-ordinals/balance-with-native-first.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Does not allow only native balances', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('BitcoinOrdinals');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bitcoin-ordinals/balance-with-only-native.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Requires first non-native balance to be a bitcoin ordinal', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('BitcoinOrdinals');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/cursed-ordinals/balance-with-native-first.json")));
        balanceValues[1].coin = 'invalid coin';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Does not allow incorrect coin', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('BitcoinOrdinals');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bitcoin-ordinals/balance.json")));
        balanceValues[0].coin = "invalid coin";
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Allows valid balances', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('BitcoinOrdinals');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bitcoin-ordinals/balance.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });
});
