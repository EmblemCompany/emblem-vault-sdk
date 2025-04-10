const { EmblemVaultSDK } = require('../../dist/index.js');
const { NFT_DATA } = require('../../dist/utils.js');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Allowed Function for Hardcoded NFTs (XCP)', function() {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Does not allow empty balance', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Age of Chains');
        expect(curatedContract.allowed(null, curatedContract)).to.be.false;
        expect(curatedContract.allowed([], curatedContract)).to.be.false;
    });

    it('Requires asset name to be present in hardcoded metadata', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Age of Chains');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/hardcoded-nfts/balance.json")));
        balanceValues[0].name = 'invalid name';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Requires projectName in hardcoded data to match curated collection name (case insensitive)', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Age of Chains');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/hardcoded-nfts/balance.json")));
        const hardcodedData = NFT_DATA[balanceValues[0]['name']];
        const validProjectName = hardcodedData['projectName'];
        
        NFT_DATA[balanceValues[0]['name']]['projectName'] = validProjectName.toUpperCase();
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;

        NFT_DATA[balanceValues[0]['name']]['projectName'] = 'invalid name';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;

        NFT_DATA[balanceValues[0]['name']]['projectName'] = validProjectName;
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Requires asset project to match curated collection name', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Age of Chains');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/hardcoded-nfts/balance.json")));
        balanceValues[0].project = 'Invalid project';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Requires first asset balance to be 1', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Age of Chains');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/hardcoded-nfts/balance.json")));
        balanceValues[0].balance = 2;
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Allows any coin', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Age of Chains');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/hardcoded-nfts/balance.json")));
        balanceValues[0].coin = 'some coin';
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Does not allow non hardcoded asset first', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Age of Chains');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/hardcoded-nfts/balance-witn-non-hardcoded-first.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.false;
    });

    it('Allows non hardcoded assets if not first', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Age of Chains');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/hardcoded-nfts/balance-witn-non-hardcoded.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });

    it('Allows valid balances', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Age of Chains');
        const balanceValues = JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/hardcoded-nfts/balance.json")));
        expect(curatedContract.allowed(balanceValues, curatedContract)).to.be.true;
    });
});
