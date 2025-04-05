import { EmblemVaultSDK } from '../src/';

const fs = require('fs');

describe('Allowed Function for EmblemOpen', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('EmblemOpen')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Allows any asset', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('EmblemOpen')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/emblem-open/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)