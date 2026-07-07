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

        it('Allows the collection-chain native coin', async () => {
            // Counterparty is a "protocol" collection: allowed() qualifies on the
            // asset's coin matching collectionChain (xcp), case-insensitively —
            // not on every entry in nativeAssets. (nativeAssets also lists BTC /
            // Bitcoin, which are used elsewhere, e.g. address filtering.)
            const curatedContract: any = await sdk.fetchCuratedContractByName('Counterparty')
            const nativeCoins = curatedContract.nativeAssets.filter(
                (coin: string) => coin.toLowerCase() === curatedContract.collectionChain.toLowerCase()
            )
            expect(nativeCoins.length).toBeGreaterThan(0)
            for (var nativeAsset of nativeCoins) {
                const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/counterparty/balance.json"))
                balanceValues[0].coin = nativeAsset
                expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            }
        })

        it('Allows valid balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Counterparty')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/counterparty/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })


    }
)