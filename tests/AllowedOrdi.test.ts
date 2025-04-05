import { EmblemVaultSDK } from '../src/';

const fs = require('fs');

describe('Allowed Function for $ORDI', () => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Does not allow empty balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('$ORDI')
            expect(curatedContract.allowed(null, curatedContract)).toBeFalsy()
            expect(curatedContract.allowed([], curatedContract)).toBeFalsy()
        })

        it('Requires specific balance', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('$ORDI')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/ordi/balance.json"))
            balanceValues[0].balance = curatedContract.balanceQty - 1
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
            balanceValues[0].balance = curatedContract.balanceQty + 1
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

        it('Requires specific name', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('$ORDI')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/ordi/balance.json"))
            balanceValues[0].name = `${curatedContract.balanceQty}`
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
            balanceValues[0].name = '$ORDI'
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
            balanceValues[0].name = `${curatedContract.balanceQty} $ORDI`
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Allows non-ordi balance if not first', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('$ORDI')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/ordi/balance-with-native.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeTruthy()
        })

        it('Does not allow non-ordi balance as first vaule', async () => {
            const curatedContract: any = await sdk.fetchCuratedContractByName('$ORDI')
            const balanceValues = JSON.parse(fs.readFileSync("tests/fixtures/ordi/balance-with-native-first.json"))
            expect(curatedContract.allowed(balanceValues, curatedContract)).toBeFalsy()
        })

    }
)