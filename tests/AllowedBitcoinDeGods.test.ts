import { EmblemVaultSDK } from '../src/';

const fs = require('fs');

describe('Allowed Function for Bitcoin DeGods', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bitcoin DeGods')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Requires coin to be ordinalsbtc', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bitcoin DeGods')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bitcoin-degods/balance.json"))
            balanceValues[0].coin = 'invalid value'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires balance to be 1', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bitcoin DeGods')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bitcoin-degods/balance.json"))
            balanceValues[0].balance = 2
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires project to be DeGods', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bitcoin DeGods')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bitcoin-degods/balance.json"))
            balanceValues[0].project = 'invalid project'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Does not allow non-ordinalsbtc as first coin', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bitcoin DeGods')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bitcoin-degods/balance-with-non-degods-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows non-ordinalsbtc if not first coin', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bitcoin DeGods')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bitcoin-degods/balance-with-non-degods.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Allows valid balances', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Bitcoin DeGods')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bitcoin-degods/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)