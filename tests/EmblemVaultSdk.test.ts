import { EmblemVaultSDK } from '../src/';
const TEST_ADDRESS = "0xb0573e14D92755DE30281f7b10d0F3a5DD3e747B"

describe('EmblemVaultSDK', () => {
    const apiKey = 'DEMO_KEY';

    describe('Non Writing', () => {
        test('should create a valid SDK instance with an API key', () => {
            const sdk = new EmblemVaultSDK(apiKey);
            expect(sdk).toBeInstanceOf(EmblemVaultSDK);
        });
        test('should throw an error when no API key is provided', () => {
            expect(() => {
                new EmblemVaultSDK('');
            }).toThrow('API key is required');
        });
    
        test('should get curated contracts', async () => {
            const sdk = new EmblemVaultSDK(apiKey);
            const contracts = await sdk.fetchCuratedContracts();
            expect(Array.isArray(contracts)).toBeTruthy();
            expect(contracts.length).toBeGreaterThan(0);
        });
    
        test('should make template with functions', async () => {
            const sdk = new EmblemVaultSDK(apiKey);
            const contracts = await sdk.fetchCuratedContracts();
            expect(contracts[0]["generateVaultBody"]).toBeInstanceOf(Function);
        });
    
        test('should generate create template correctly for emblem open', async () => {
            const sdk = new EmblemVaultSDK(apiKey);
            const contracts = await sdk.fetchCuratedContracts();
            let contract = contracts.find(contract => contract.name === "EmblemOpen");
            console.log(contract?.generateCreateTemplate(contract));
            expect(contract?.generateCreateTemplate(contract)).toEqual(mocks.emblemopen_create_template);
        });
    
        test('should generate create template correctly for empty', async () => {
            const sdk = new EmblemVaultSDK(apiKey);
            const contracts = await sdk.fetchCuratedContracts();
            let contract = contracts.find(contract => contract.name == "BitcoinOrdinals");
            expect(contract?.generateCreateTemplate(contract)).toEqual(mocks.empty_create_template);
        });

        test('should fetch metadata', async () => {
            const sdk = new EmblemVaultSDK(apiKey);
            const metadata = await sdk.fetchMetadata("1337");
            expect(typeof metadata).toEqual('object');
            expect(metadata.name).toEqual("Patrick's Birthday Vault");
        });

        test('should fetch vaults of type', async () => {
            const sdk = new EmblemVaultSDK(apiKey);
            const vaults = await sdk.fetchVaultsOfType("created", TEST_ADDRESS);
            expect(Array.isArray(vaults)).toBeTruthy();
            // todo: test for a non-zero value address
            expect(vaults.length).toBeGreaterThanOrEqual(0);
        });
    });    
    
    describe('Vault Creation', () => {
        jest.setTimeout(30000); // Extend timeout

        test('should create vault (load type empty)', async () => {        
            const sdk = new EmblemVaultSDK(apiKey);
            const contracts = await sdk.fetchCuratedContracts();
            let populatedTemplate: any = mocks.empty_create_template
            populatedTemplate.fromAddress = TEST_ADDRESS
            populatedTemplate.toAddress = TEST_ADDRESS
            populatedTemplate.chainId = "1" // Add Ethereum mainnet chainId
            let vault = await sdk.createCuratedVault(populatedTemplate);
            expect(typeof vault).toBe('object');
        });

        test('should create vault (load type detailed)', async () => {        
            const sdk = new EmblemVaultSDK(apiKey);
            const contracts = await sdk.fetchCuratedContracts();
            let populatedTemplate: any = mocks.emblemopen_create_template
            populatedTemplate.fromAddress = TEST_ADDRESS
            populatedTemplate.toAddress = TEST_ADDRESS
            populatedTemplate.chainId = "1" // Add Ethereum mainnet chainId
            populatedTemplate.targetAsset.name = "Test Asset"
            populatedTemplate.targetAsset.image = "https://emblem.finance/stamps.png"
            populatedTemplate.targetAsset.description = "Test Asset Description"
            populatedTemplate.targetAsset.ownedImage = "https://emblem.finance/stamps.png" // Add required ownedImage field
            let vault = await sdk.createCuratedVault(populatedTemplate);
            expect(typeof vault).toBe('object');
            expect(vault.targetAsset.name).toEqual("Test Asset");
            expect(vault.targetAsset.image).toEqual("https://emblem.finance/stamps.png");
            expect(vault.targetAsset.description).toEqual("Test Asset Description");
        });
        test('should not require ownedImage', async () => {        
            const sdk = new EmblemVaultSDK(apiKey);
            const contracts = await sdk.fetchCuratedContracts();
            let populatedTemplate: any = mocks.emblemopen_create_template
            populatedTemplate.fromAddress = TEST_ADDRESS
            populatedTemplate.toAddress = TEST_ADDRESS
            populatedTemplate.chainId = "1" // Add Ethereum mainnet chainId
            populatedTemplate.targetAsset.name = "Test Asset"
            populatedTemplate.targetAsset.image = "https://emblem.finance/stamps.png"
            populatedTemplate.targetAsset.description = "Test Asset Description"
            let vault = await sdk.createCuratedVault(populatedTemplate);
            expect(typeof vault).toBe('object');
            expect(vault.targetAsset.name).toEqual("Test Asset");
            expect(vault.targetAsset.image).toEqual("https://emblem.finance/stamps.png");
            expect(vault.targetAsset.description).toEqual("Test Asset Description");
        });
    });

});

const mocks = {
    emblemopen_create_template: {
        "fromAddress": { "type": "user-provided" },
        "toAddress": { "type": "user-provided" },
        "chainId": { "type": "user-provided" },
        "experimental": true,
        "targetContract": {
            "1": "0x184ddb67E2EF517f6754F055b56905f2A9b29b6A",
            "900": "5rxENZEa3rhDk2hcuG6RNFbCGGQwU9APm4CMmaW4s4xy",
            "name": "EmblemOpen",
            "description": "The vaults within this collection feature deposit addresses spanning two or more blockchains. Vault images, titles, and descriptions are generated by users. Prior to making a purchase, it is advisable to authenticate the legitimacy of the assets within the vault. Supported blockchains encompass, but are not restricted to: Bitcoin, Litecoin, Bitcoin Cash, Ethereum, Dogecoin, Solana, Tezos, Namecoin, and any EVM-compatible protocol.",
            "fusion": false
        },
        "targetAsset": {
            "name": { "type": "user-provided" },
            "image": { "type": "user-provided" },
            "description": { "type": "user-provided" }
        }
    },
    empty_create_template: { 
        "fromAddress": { "type": "user-provided" }, 
        "toAddress": { "type": "user-provided" }, 
        "chainId": { "type": "user-provided" }, 
        "experimental": true, 
        "targetContract": { 
            "1": "0xEAD67175CDb9CBDeA5bDDC36015e52f4A954E3fD", 
            "name": "BitcoinOrdinals", 
            "description": "Ordinal Theory is a method for assigning unique identifiers to individual satoshis on the Bitcoin blockchain. This is done by assigning each satoshi a unique identifier based on the order in which it was mined. This identifier can be used to track the satoshi's history and ownership, and to transfer it to another party. Ordinal Theory can also be used to inscribe additional data to satoshis, such as a message, image, serial number, audio file, or document.",
            "fusion": false
        }, 
        "targetAsset": { 
            "name": "Loading...", 
            "image": "https://emblem.finance/ordinals.png"
        }
    }
}
