import { EmblemVaultSDK } from '../src/';

const fs = require('fs');

describe('Allowed Function for Bells', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bells')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Requires balance to be greater than zero', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bells')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bells/balance.json"))
            balanceValues[0].balance = 0
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires balance to be an integer', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bells')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bells/balance.json"))
            balanceValues[0].balance = 1.5
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires name to be `Bel`', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bells')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bells/balance.json"))
            balanceValues[0].name = 'invalid name'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Does not allow non-bel assets as first value', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bells')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bells/balance-with-non-bell-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows non-bel assets if not first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bells')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bells/balance-with-non-bell.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Allows valid balances', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bells')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bells/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)