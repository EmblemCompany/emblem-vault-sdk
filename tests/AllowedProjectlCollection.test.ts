import { EmblemVaultSDK } from '../src/';

const fs = require('fs');

describe('Allowed Function for project collections', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('MegaPunks')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Requires first asset to have coin matching collectionChain (case insensitive)', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('MegaPunks')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/megapunks/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            balanceValues[0].coin = balanceValues[0].coin.toUpperCase()
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            balanceValues[0].coin = balanceValues[0].coin.toLowerCase()
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            balanceValues[0].coin = 'invalid coin'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires project to match collection name', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('MegaPunks')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/megapunks/balance.json"))
            balanceValues[0].project = 'invalid project'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Does not allow non collection assets if first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('MegaPunks')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/megapunks/balance-with-non-megapunk-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows non collection assets if not first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('MegaPunks')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/megapunks/balance-with-non-megapunk.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Allows valid balances', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('MegaPunks')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/megapunks/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)