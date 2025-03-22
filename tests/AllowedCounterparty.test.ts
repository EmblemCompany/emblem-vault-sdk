import EmblemVaultSDK from '../src/';

const fs = require('fs');

describe('Allowed Function for Counterparty', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Counterparty')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Does not allow more than one asset', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Counterparty')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/counterparty/balance-with-multiple.json"))
            balanceValues[0].coin = 'invalid coin'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Does not allow non-native coin', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Counterparty')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/counterparty/balance.json"))
            balanceValues[0].coin = 'invalid coin'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows collection chain asset', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Counterparty')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/counterparty/balance.json"))
            // For protocol collections, only the collectionChain asset is allowed
            balanceValues[0].coin = curatedContract.collectionChain
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            
            // Test case insensitivity
            balanceValues[0].coin = curatedContract.collectionChain.toUpperCase()
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Allows valid balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Counterparty')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/counterparty/balance.json"))
            // Make sure the coin matches the collectionChain for protocol collections
            balanceValues[0].coin = curatedContract.collectionChain
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })


    }
)