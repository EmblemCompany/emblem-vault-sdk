import EmblemVaultSDK from '../src/';

const fs = require('fs');

describe('Allowed Function for BitcoinOrdinals', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('BitcoinOrdinals')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Allows native balance as first value', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('BitcoinOrdinals')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bitcoin-ordinals/balance-with-native-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Does not allow only native balances', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('BitcoinOrdinals')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bitcoin-ordinals/balance-with-only-native.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires first non-native balance to be a bitcoin ordinal', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('BitcoinOrdinals')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/cursed-ordinals/balance-with-native-first.json"))
            balanceValues[1].coin = 'invalid coin'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Does not allow incorrect coin', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('BitcoinOrdinals')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bitcoin-ordinals/balance.json"))
            balanceValues[0].coin = "invalid coin"
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows valid balances', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('BitcoinOrdinals')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/bitcoin-ordinals/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)