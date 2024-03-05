import EmblemVaultSDK from '../src/';

const fs = require('fs');

describe('Allowed Function for Embels', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Always returns true', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Embels')
            expect(curatedContract.allowed(null, curatedContract)).toBeTruthy()
            expect(curatedContract.allowed([], curatedContract)).toBeTruthy()
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/embels/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)