const { EmblemVaultSDK } = require('../../dist/index.js');
const { expect } = require('chai');

describe('Allowed Function for Embels', function() {
    const sdk = new EmblemVaultSDK('DEMO_KEY');

    it('Always allowed', async () => {
        const curatedContract = await sdk.fetchCuratedContractByName('Embels');
        expect(curatedContract.allowed()).to.be.true;
    });
});
