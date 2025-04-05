import { EmblemVaultSDK } from '../src/';
import { NFT_DATA } from '../src/utils';

const fs = require('fs');

describe('Allowed Function for Hardcoded NFTs (XCP)', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Age of Chains')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Requires asset name to be present in hardcoded metadata', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Age of Chains')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/hardcoded-nfts/balance.json"))
            balanceValues[0].name = 'invalid name'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires projectName in hardcoded data to match curated collection name (case insensitive)', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Age of Chains')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/hardcoded-nfts/balance.json"))
            const hardcodedData = NFT_DATA[balanceValues[0]['name']]
            const validProjectName = hardcodedData['projectName']
            let hardcodedDataCopy = hardcodedData
            NFT_DATA[balanceValues[0]['name']]['projectName'] = validProjectName.toUpperCase()
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()

            NFT_DATA[balanceValues[0]['name']]['projectName'] = 'invalid name'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()

            NFT_DATA[balanceValues[0]['name']]['projectName'] = validProjectName
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Requires asset project to match curated collection name', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Age of Chains')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/hardcoded-nfts/balance.json"))
            balanceValues[0].project = 'Invalid project'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires first asset balance to be 1', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Age of Chains')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/hardcoded-nfts/balance.json"))
            balanceValues[0].balance = 2
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows any coin', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Age of Chains')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/hardcoded-nfts/balance.json"))
            balanceValues[0].coin = 'some coin'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Does not allow non hardcoded asset first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Age of Chains')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/hardcoded-nfts/balance-witn-non-hardcoded-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Allows non hardcoded assets if not first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Age of Chains')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/hardcoded-nfts/balance-witn-non-hardcoded.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })


        it('Allows valid balances', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('Age of Chains')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/hardcoded-nfts/balance.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })
    }
)