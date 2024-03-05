import EmblemVaultSDK from '../src/';


describe('Allowed Function for Embels',() => {
        const sdk = new EmblemVaultSDK('DEMO_KEY');

        it('Always allowed', async () => {
            const curatedContract:any = await sdk.fetchCuratedContractByName('Embels')
            expect(curatedContract.allowed()).toBeTruthy()
        })
    }
)