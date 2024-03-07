import EmblemVaultSDK from '../src/';

const fs = require('fs');

describe('Allowed Function for protocol collections', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Dogeparty')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Requires first asset to have coin matching collectionChain (case insensitive)', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Dogeparty')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/dogeparty/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            balanceValues[0].coin = balanceValues[0].coin.toUpperCase()
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            balanceValues[0].coin = balanceValues[0].coin.toLowerCase()
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            balanceValues[0].coin = 'invalid coin'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Does not allow non collection asset if first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Dogeparty')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/dogeparty/balance-with-non-dogeparty-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows non collection assets if not first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Dogeparty')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/dogeparty/balance-with-non-dogeparty.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Allows valid balances', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Dogeparty')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/dogeparty/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)