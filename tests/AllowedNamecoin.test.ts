import { EmblemVaultSDK } from '../src/';

const fs = require('fs');

describe('Allowed Function for Namecoin', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Namecoin')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Requires coin to be a native asset', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Namecoin')
            let balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/namecoin/balance.json"))
            balanceValues[0].coin = "invalid coin"
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
            balanceValues[0].coin = null
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Allows native assets and NFTs in any order', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Namecoin')
            let balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/namecoin/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/namecoin/balance-with-native.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
            balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/namecoin/balance-with-native-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)