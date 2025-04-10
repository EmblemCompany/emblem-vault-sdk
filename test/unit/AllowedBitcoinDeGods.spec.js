const { EmblemVaultSDK } = require('../../dist/index.js');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Allowed Function for Bitcoin DeGods', () => {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Does not allow empty balance', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bitcoin DeGods');
        expect(curatedContract.allowed(null, curatedContract)).to.be.false;
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
    });

    it('Requires coin to be ordinalsbtc', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bitcoin DeGods');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bitcoin-degods/balance.json")));
        balanceValues[0].coin = 'invalid value';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Requires balance to be 1', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bitcoin DeGods');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bitcoin-degods/balance.json")));
        balanceValues[0].balance = 2;
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Requires project to be DeGods', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bitcoin DeGods');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bitcoin-degods/balance.json")));
        balanceValues[0].project = 'invalid project';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Does not allow non-ordinalsbtc as first coin', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bitcoin DeGods');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bitcoin-degods/balance-with-non-degods-first.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Allows non-ordinalsbtc if not first coin', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bitcoin DeGods');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bitcoin-degods/balance-with-non-degods.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Allows valid balances', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Bitcoin DeGods');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/bitcoin-degods/balance.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });
});
