const { EmblemVaultSDK } = require('../../dist/index.js');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Allowed Function for Cursed Ordinals', () => {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Does not allow empty balance', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Cursed Ordinal');
        expect(curatedContract.allowed(null, curatedContract)).to.be.false;
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
    });

    it('Does not allow application/json content type', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Cursed Ordinal');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/cursed-ordinals/balance.json")));
        balanceValues[0].content_type = 'application/json';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Does not allow incorrect coin', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Cursed Ordinal');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/cursed-ordinals/balance.json")));
        balanceValues[0].coin = "invalid coin";
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Does not allow incorrect names', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Cursed Ordinal');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/cursed-ordinals/balance.json")));
        balanceValues[0].name = "Invalid Name";
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;

        balanceValues[0].name = "Cursed Ordinal";
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;

        balanceValues[0].name = "Cursed Ordinal InvalidNumber";
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;

        balanceValues[0].name = "Cursed Ordinal 53888";
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;

        balanceValues[0].name = "Invalid Project -53888";
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;

        balanceValues[0].name = "Cursed Ordinal -53888";
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Requires first balance value to be a cursed ordinal', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Cursed Ordinal');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/cursed-ordinals/balance-with-native-first.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Allows non-cursed ordinal balances if not first', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Cursed Ordinal');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/cursed-ordinals/balance-with-native.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Allows valid coin and name', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Cursed Ordinal');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/cursed-ordinals/balance.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });
});
