import EmblemVaultSDK from "../src";
import fs from "fs";

describe('Hardcoded Metadata for Darkfarms', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Darkfarms')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

    it('Does not assets with name not present in hardcoded data', async () => {
        const curatedContract: any = await sdk.fetchCuratedContractByName('Darkfarms')
        const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/darkfarms/balance.json").toString())
        balanceValues[0].name = 'invalid name'
        expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
    })

        it('Allows valid balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Darkfarms')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/darkfarms/balance.json").toString())
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)