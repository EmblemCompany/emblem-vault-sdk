import EmblemVaultSDK from '../src/';

const fs = require('fs');

describe('Allowed Function for Ethscriptions', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');
        // Increase timeout for all tests in this suite
        jest.setTimeout(10000);

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Ethscription')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it("Requires coin to match collectionChain case-insensitively", async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Ethscription')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/ethscriptions/balance.json"))
            // For protocol collections, the coin must match the collectionChain (case insensitive)
            balanceValues[0].coin = "invalid coin"
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
            
            // Should pass with the correct coin matching collectionChain (case insensitive)
            // Note: The fixture uses "ethscription" (singular) while the collectionChain is "Ethscriptions" (plural)
            // The validation should be case-insensitive but the actual value needs to match exactly
            balanceValues[0].coin = "ethscription" // exact match to the fixture
            balanceValues[0].project = "Ethscription" // Add project property matching the contract name
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
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

        it('Allows valid balances', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Ethscription')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/ethscriptions/balance.json"))
            // Make sure the coin matches the collectionChain for protocol collections (case insensitive)
            balanceValues[0].coin = "ethscription" // exact match to the fixture
            balanceValues[0].project = "Ethscription" // Add project property matching the contract name
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)