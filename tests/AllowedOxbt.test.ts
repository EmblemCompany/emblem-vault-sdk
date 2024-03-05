import EmblemVaultSDK from '../src/';

const fs = require('fs');

describe('Allowed Function for $OXBT', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('$OXBT')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Requires specific balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('$OXBT')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/oxbt/balance.json"))
            balanceValues[0].balance = curatedContract.balanceQty - 1
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
            balanceValues[0].balance = curatedContract.balanceQty + 1
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires specific name', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('$OXBT')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/oxbt/balance.json"))
            balanceValues[0].name = `${curatedContract.balanceQty}`
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
            balanceValues[0].name = '$ORDI'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
            balanceValues[0].name = `${curatedContract.balanceQty} $OXBT`
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Allows non-oxbt balance if not first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('$OXBT')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/oxbt/balance-with-native.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Does not allow non-oxbt balance as first vaule', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('$OXBT')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/oxbt/balance-with-native-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

    }
)