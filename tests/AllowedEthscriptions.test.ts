import EmblemVaultSDK from '../src/';

const fs = require('fs');

describe('Allowed Function for Ethscriptions', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Ethscription')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it("Requires coin to be 'ethscription'", async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Ethscription')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/ethscriptions/balance.json"))
            balanceValues[0].coin = "invalid coin"
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires first balance value to be an ethscription', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Ethscription')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/ethscriptions/balance-with-native-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows non-ethscription balances if not first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Ethscription')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/ethscriptions/balance-with-native.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Allows valid coin and name', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Ethscription')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/ethscriptions/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)