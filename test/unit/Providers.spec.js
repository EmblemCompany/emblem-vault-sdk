const { expect } = require('chai');
const sinon = require('sinon'); // Using sinon for mocking/stubbing
const { EmblemVaultSDK } = require('../../dist/index.js'); // Assuming built files are in dist
const { 
    detectProviderType, 
    isProviderType, 
    Web3ProviderAdapter, 
    EthereumProvider, 
    SolanaProvider, 
    BitcoinProvider 
} = require('../../dist/providers.js');

describe('Blockchain Provider Abstraction', () => {
    let sdk;

    beforeEach(() => {
        sdk = new EmblemVaultSDK('mock-api-key');
        // Reset window mocks if needed for detection tests in the future
    });

    afterEach(() => {
        sinon.restore(); // Restore any sinon mocks/stubs
    });

    describe('Utility Functions (providers.ts)', () => {
        it('detectProviderType should correctly identify providers', () => {
            const mockEthProvider = { request: () => {}, eth: {} };
            const mockSolProvider = { publicKey: {}, signTransaction: () => {} };
            const mockBtcProvider = { network: {}, signPsbt: () => {} };
            const mockWeb3Provider = { eth: { getAccounts: () => {} } }; // Web3 specific
            const otherProvider = { someOtherProp: true };

            expect(detectProviderType(mockEthProvider)).to.equal('ethereum');
            expect(detectProviderType(mockSolProvider)).to.equal('solana');
            expect(detectProviderType(mockBtcProvider)).to.equal('bitcoin');
            expect(detectProviderType(mockWeb3Provider)).to.equal('ethereum'); // Web3 detected as ethereum
            expect(detectProviderType(otherProvider)).to.equal('other');
            expect(detectProviderType(null)).to.equal('other');
            expect(detectProviderType(undefined)).to.equal('other');
        });

        it('isProviderType should correctly check provider types', () => {
            const mockEthProvider = { request: () => {}, eth: {} };
            // Use a more explicit mock, ensuring properties are clearly defined
            const mockSolProvider = {
                publicKey: { toString: () => 'somePublicKey' }, // Ensure publicKey is truthy and somewhat realistic
                signTransaction: () => Promise.resolve({}), 
                isConnected: () => Promise.resolve(true), // Add potentially missing base properties if needed
                type: 'solana' // Explicitly add type to mock if needed, though detect shouldn't rely on it
            };
            const mockOtherProvider = { someProp: true };

            const detectedSolType = detectProviderType(mockSolProvider);

            expect(isProviderType(mockEthProvider, 'ethereum')).to.be.true; // Keep generic type for JS
            expect(isProviderType(mockEthProvider, 'solana')).to.be.false;
            expect(isProviderType(mockSolProvider, 'solana')).to.be.true; // This is the line that likely failed
            expect(isProviderType(mockSolProvider, 'ethereum')).to.be.false;
            expect(isProviderType(mockOtherProvider, 'ethereum')).to.be.false;
            expect(isProviderType(mockOtherProvider, 'solana')).to.be.false;
        });
    });

    describe('Web3ProviderAdapter', () => {
        let mockWeb3;
        let adapter;

        beforeEach(() => {
            // Create a more detailed mock Web3 instance
            mockWeb3 = {
                eth: {
                    getAccounts: sinon.stub(),
                    getChainId: sinon.stub(),
                    getBalance: sinon.stub(),
                    personal: {
                        sign: sinon.stub(),
                    },
                },
                // Add other web3 properties if needed by the adapter
            };
            adapter = new Web3ProviderAdapter(mockWeb3);
        });

        it('should initialize correctly', () => {
            expect(adapter.type).to.equal('ethereum');
            expect(adapter.getRawWeb3()).to.equal(mockWeb3);
            expect(adapter.eth).to.equal(mockWeb3.eth);
        });

        it('request should call correct web3.eth methods', async () => {
            mockWeb3.eth.getAccounts.resolves(['0x123']);
            await adapter.request({ method: 'eth_accounts' });
            expect(mockWeb3.eth.getAccounts.calledOnce).to.be.true;

            mockWeb3.eth.getChainId.resolves('1');
            await adapter.request({ method: 'eth_chainId' });
            expect(mockWeb3.eth.getChainId.calledOnce).to.be.true;
            
            mockWeb3.eth.getBalance.resolves('1000');
            await adapter.request({ method: 'eth_getBalance', params: ['0x123'] });
            expect(mockWeb3.eth.getBalance.calledOnceWith('0x123')).to.be.true;
            
            mockWeb3.eth.personal.sign.resolves('0xSignature');
            await adapter.request({ method: 'personal_sign', params: ['message', '0x123', 'password'] });
            expect(mockWeb3.eth.personal.sign.calledOnceWith('message', '0x123', 'password')).to.be.true;
        });

        it('request should throw for unimplemented methods', async () => {
            try {
                await adapter.request({ method: 'unimplemented_method' });
                throw new Error('Should have thrown');
            } catch (error) {
                expect(error.message).to.contain('not implemented');
            }
        });

        it('isConnected should return true if accounts exist', async () => {
            mockWeb3.eth.getAccounts.resolves(['0x123']);
            expect(await adapter.isConnected()).to.be.true;
        });

        it('isConnected should return false if no accounts exist', async () => {
            mockWeb3.eth.getAccounts.resolves([]);
            expect(await adapter.isConnected()).to.be.false;
        });

        it('isConnected should return false on error', async () => {
            mockWeb3.eth.getAccounts.rejects(new Error('Connection failed'));
            expect(await adapter.isConnected()).to.be.false;
        });
    });

    describe('SDK Provider Management (index.ts)', () => {
        const mockEthProvider = { type: 'ethereum', request: async () => {}, isConnected: async () => true };
        const mockSolProvider = { type: 'solana', connect: async () => ({publicKey: 'solKey'}), disconnect: async () => {}, isConnected: async () => true };
        const mockBtcProvider = { type: 'bitcoin', isConnected: async () => true };

        it('registerProvider should store providers', () => {
            sdk.registerProvider('ethereum', mockEthProvider);
            sdk.registerProvider('solana', mockSolProvider);
            expect(sdk.hasProvider('ethereum')).to.be.true;
            expect(sdk.hasProvider('solana')).to.be.true;
            expect(sdk.hasProvider('bitcoin')).to.be.false;
        });

        it('getProvider should retrieve registered providers', () => {
            sdk.registerProvider('ethereum', mockEthProvider);
            expect(sdk.getProvider('ethereum')).to.equal(mockEthProvider);
            expect(sdk.getProvider('solana')).to.be.undefined;
        });

        it('getOrDetectProvider should return registered provider first', async () => {
            sdk.registerProvider('ethereum', mockEthProvider);
            const provider = await sdk.getOrDetectProvider('ethereum');
            expect(provider).to.equal(mockEthProvider);
        });

        // Detection tests would require mocking 'window' and are more complex for unit tests
        // it('getOrDetectProvider should detect window.ethereum if not registered', async () => { ... });

        it('getOrDetectProvider should throw if no provider is registered or detected', async () => {
            // Ensure no provider is registered and window is clean (or mocked as empty)
            try {
                await sdk.getOrDetectProvider('ethereum');
                throw new Error('Should have thrown');
            } catch (error) {
                expect(error.message).to.contain('No provider available');
            }
        });

        it('loadWeb3 should return raw web3 from Web3ProviderAdapter', async () => {
            const mockWeb3Instance = { eth: { /* ... */ } }; // Simple mock
            const adapter = new Web3ProviderAdapter(mockWeb3Instance);
            sdk.registerProvider('ethereum', adapter);

            const web3 = await sdk.loadWeb3();
            expect(web3).to.equal(mockWeb3Instance);
        });
        
        it('loadWeb3 should return the provider object if not an adapter', async () => {
            const consoleWarnStub = sinon.stub(console, 'warn');
            sdk.registerProvider('ethereum', mockEthProvider); // Register a non-adapter provider
            
            const provider = await sdk.loadWeb3();
            expect(provider).to.equal(mockEthProvider);
            expect(consoleWarnStub.calledOnce).to.be.true;
            expect(consoleWarnStub.firstCall.args[0]).to.contain('not a Web3 instance');
        });

        it('loadWeb3 should return undefined and log error if no provider found', async () => {
            const consoleErrorStub = sinon.stub(console, 'error');
            // Ensure no provider is registered
            const web3 = await sdk.loadWeb3();
            expect(web3).to.be.undefined;
            expect(consoleErrorStub.called).to.be.true; // Could be called by getOrDetectProvider throwing too
        });
    });
});
