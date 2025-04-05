import { EmblemVaultSDK } from '../src/';

const fs = require('fs');

describe('Allowed Function for Stamps', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Stamps')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Requires asset name to include `stamps`', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Stamps')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/stamps/balance.json"))
            balanceValues[0].name = 'invalid asset name'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires project name', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Stamps')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/stamps/balance.json"))
            balanceValues[0].project = null
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires project name to be Stamps or Stampunks', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Stamps')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/stamps/balance.json"))
            balanceValues[0].project = 'invalid project'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows case insensitive project name', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Stamps')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/stamps/balance.json"))
            balanceValues[0].project = 'STAMPS'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            balanceValues[0].project = 'STAMPUNKS'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Requires coin to be a native asset', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Stamps')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/stamps/balance.json"))
            balanceValues[0].coin = 'invalid coin'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
            for (var nativeAsset of curatedContract.nativeAssets) {
                balanceValues[0].coin = nativeAsset
                expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            }
        })

        it('Requires first asset to be a stamp', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Stamps')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/stamps/balance-with-non-stamps-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows non-stamps assets if not first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Stamps')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/stamps/balance-with-non-stamps.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Allows valid balances', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Stamps')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/stamps/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)