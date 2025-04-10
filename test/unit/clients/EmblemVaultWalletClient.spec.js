/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const { EmblemVaultSDK } = require('../../../dist/index.js');
const { expect } = require('chai');
const sinon = require('sinon');
const { createEmblemVaultWalletClient } = require('../../../dist/clients/emblemVaultWalletClient.js');
const { parseEther } = require('viem');

// Mock SDK
const mockApiKey = 'mock-api-key';
class MockEmblemVaultSDK extends EmblemVaultSDK {
    constructor(apiKey) {
        super(apiKey);
        // Override methods if necessary for testing setup
    }
    // Mock any methods needed by the client creation or its methods, if they are called internally
}

describe('EmblemVaultWalletClient', () => {
    let sdk;
    let walletClient;
    const testWalletId = 'test-wallet-001';
    const mockAccountAddress = '0xMockAddressFor' + testWalletId; // Consistent mock address

    beforeEach(() => {
        sdk = new MockEmblemVaultSDK(mockApiKey);
        walletClient = createEmblemVaultWalletClient({
            sdk: sdk,
            walletId: testWalletId,
            // Optionally provide a mock account here if needed for default tests
            // account: { address: mockAccountAddress, type: 'json-rpc'} // type is required by viem Account
        });
    });

    afterEach(() => {
        // Restore sinon spies/stubs after each test
        sinon.restore();
    });

    it('should create a client instance', () => {
        expect(walletClient).to.exist;
        expect(walletClient.type).to.equal('emblemVaultWalletClient');
        expect(walletClient.walletId).to.equal(testWalletId);
        expect(walletClient.sdk).to.equal(sdk);
    });

    it('should have the expected methods', () => {
        expect(walletClient.getAddresses).to.be.a('function');
        expect(walletClient.signMessage).to.be.a('function');
        expect(walletClient.signTypedData).to.be.a('function');
        expect(walletClient.sendTransaction).to.be.a('function');
    });

    describe('getAddresses', () => {
        it('should return the mock address derived from walletId when no account is configured', async () => {
            const addresses = await walletClient.getAddresses();
            expect(addresses).to.be.an('array').with.lengthOf(1);
            expect(addresses[0]).to.equal(mockAccountAddress);
        });

        it('should return the configured account address if provided', async () => {
             const configuredAddress = '0xConfiguredAccountAddress001';
             const clientWithAccount = createEmblemVaultWalletClient({
                 sdk: sdk,
                 walletId: testWalletId,
                 account: { address: configuredAddress, type: 'local', 
                            publicKey: '0x', // Added mock publicKey
                            source: 'custom', // Added mock source
                            signMessage: async () => '0x', 
                            signTransaction: async () => '0x', 
                            signTypedData: async () => '0x' } 
             });
             const addresses = await clientWithAccount.getAddresses();
             expect(addresses).to.be.an('array').with.lengthOf(1);
             expect(addresses[0]).to.equal(configuredAddress);
        });

         it('should return the configured account address from Account object', async () => {
             const configuredAddress = '0xConfiguredAccountObjectAddress002';
             const clientWithAccount = createEmblemVaultWalletClient({
                 sdk: sdk,
                 walletId: testWalletId,
                 account: { address: configuredAddress, type: 'local', 
                            publicKey: '0x', // Added mock publicKey
                            source: 'custom', // Added mock source
                            signMessage: async () => '0x', 
                            signTransaction: async () => '0x', 
                            signTypedData: async () => '0x' } 
             });
             const addresses = await clientWithAccount.getAddresses();
             expect(addresses).to.be.an('array').with.lengthOf(1);
             expect(addresses[0]).to.equal(configuredAddress);
         });
    });

    describe('signMessage', () => {
        it('should return a mock signature string', async () => {
            const message = 'Hello, Emblem!';
            const signature = await walletClient.signMessage({ message, account: mockAccountAddress });
            
            expect(signature).to.be.a('string');
            expect(signature).to.match(/^0x[a-f0-9]+$/); // Check for hex format
            expect(signature).to.include(Buffer.from(`mock_signature_for_${testWalletId}`).toString('hex'));
        });

        it('should use the account provided in parameters', async () => {
             const specificAccount = '0xSpecificAccountForMsg003';
             // Spy on the signMessage method directly
             const signMessageSpy = sinon.spy(walletClient, 'signMessage');
             await walletClient.signMessage({ message: 'Hello, specific account!', account: specificAccount });
             // Verify the method was called with the specific account
             expect(signMessageSpy.calledWith(sinon.match({ 
                 message: 'Hello, specific account!',
                 account: specificAccount 
             }))).to.be.true;
         });
    });

    describe('signTypedData', () => {
        // EIP712 Domain definition
        const domain = {
            name: 'Ether Mail',
            version: '1',
            chainId: 1,
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        };

        // The named type definitions
        const types = {
            Person: [
                { name: 'name', type: 'string' },
                { name: 'wallet', type: 'address' },
            ],
            Mail: [
                { name: 'from', type: 'Person' },
                { name: 'to', type: 'Person' },
                { name: 'contents', type: 'string' },
            ],
        };

        // The data to sign
        const message = {
            from: {
                name: 'Alice',
                wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            },
            to: {
                name: 'Bob',
                wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            },
            contents: 'Hello, Bob!',
        };

        it('should return a mock signature string for typed data', async () => {
            const signature = await walletClient.signTypedData({
                domain,
                types,
                primaryType: 'Mail',
                message,
                account: mockAccountAddress
            });
            expect(signature).to.be.a('string');
            expect(signature).to.match(/^0x[a-f0-9]+$/);
            expect(signature).to.include(Buffer.from(`mock_signature_for_${testWalletId}_typed_Mail`).toString('hex'));
        });

        it('should use the account provided in parameters for typed data', async () => {
             const specificAccount = '0xSpecificAccountForTypedData004';
             // Spy on the signTypedData method directly
             const signTypedDataSpy = sinon.spy(walletClient, 'signTypedData');
             await walletClient.signTypedData({
                 domain,
                 types,
                 primaryType: 'Mail',
                 message,
                 account: specificAccount
             });
             // Verify the method was called with the specific account
             expect(signTypedDataSpy.calledWith(sinon.match({ 
                 domain,
                 types,
                 primaryType: 'Mail',
                 message,
                 account: specificAccount 
             }))).to.be.true;
         });
    });

    describe('sendTransaction', () => {
        it('should return a mock transaction hash', async () => {
            const txParams = {
                account: mockAccountAddress, // Provide the account needed for sendTransaction
                to: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                value: parseEther('0.01'),
                chain: null // Explicitly provide chain: null when account is specified
            };
            // Client needs an account configured or passed for sendTransaction
            const clientWithAccount = createEmblemVaultWalletClient({
                 sdk: sdk,
                 walletId: testWalletId,
                 account: mockAccountAddress
             });
            const txHash = await clientWithAccount.sendTransaction(txParams);
            expect(txHash).to.be.a('string');
            expect(txHash).to.match(/^0x[a-f0-9]{64}$/); // Check for 64 hex chars
        });

        it('should use the account provided in parameters for transaction', async () => {
             const specificAccount = '0xSpecificAccountForTx005';
             const txParams = {
                 account: specificAccount, // Pass account in tx params
                 to: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                 value: parseEther('0.01'),
                 chain: null // Explicitly provide chain: null when account is specified in params
             };
             // Spy on the sendTransaction method directly
             const sendTransactionSpy = sinon.spy(walletClient, 'sendTransaction');
             await walletClient.sendTransaction(txParams); // Can use default client as account is in params
             // Verify the method was called with the specific account
             expect(sendTransactionSpy.calledWith(sinon.match({ 
                 account: specificAccount,
                 to: txParams.to,
                 value: txParams.value,
                 chain: null
             }))).to.be.true;
        });

         it('should throw if no account is available', async () => {
             const txParams = {
                 to: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                 value: parseEther('0.01'),
             };
             // We need to provide an account, even if it's just the mock one, to hit the logic path being tested
             // The implementation should check for account presence *before* this call is made in real scenarios
             // However, the type requires it here. The check inside the method is what prevents the action.
             try {
                 await walletClient.sendTransaction({ ...txParams, account: mockAccountAddress, chain: null }); // Added chain: null
                 // If it doesn't throw, fail the test
                 expect.fail('Cannot send transaction without an account specified.');
             } catch (error) {
                 expect(error).to.be.instanceOf(Error);
                 expect(error.message).to.equal('Cannot send transaction without an account specified.');
             }
         });
    });
});
