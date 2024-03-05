import EmblemVaultSDK from '../src/';

const fs = require('fs');

describe('Allowed Function for Cursed Ordinals', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Cursed Ordinal')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Does not allow application/json content type', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Cursed Ordinal')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/cursed-ordinals/balance.json"))
            balanceValues[0].content_type = 'application/json'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Does not allow incorrect coin', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Cursed Ordinal')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/cursed-ordinals/balance.json"))
            balanceValues[0].coin = "invalid coin"
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Does not allow incorrect names', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Cursed Ordinal')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/cursed-ordinals/balance.json"))
            balanceValues[0].name = "Invalid Name"
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()

            balanceValues[0].name = "Cursed Ordinal"
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()

            balanceValues[0].name = "Cursed Ordinal InvalidNumber"
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()

            balanceValues[0].name = "Cursed Ordinal 53888"
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires first balance value to be a cursed ordinal', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Cursed Ordinal')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/cursed-ordinals/balance-with-native-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows non-cursed ordinal balances if not first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Cursed Ordinal')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/cursed-ordinals/balance-with-native.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Allows valid coin and name', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Cursed Ordinal')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/cursed-ordinals/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)