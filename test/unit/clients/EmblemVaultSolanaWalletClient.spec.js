/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const { EmblemVaultSDK } = require('../../../dist/index.js');
const { expect } = require('chai');
const sinon = require('sinon');
const { createEmblemVaultSolanaWalletClient } = require('../../../dist/clients/emblemVaultSolanaWalletClient.js');
const { 
  Transaction, 
  VersionedTransaction, 
  PublicKey, 
  Connection, 
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  MessageV0
} = require('@solana/web3.js');

// Mock SDK
const mockApiKey = 'mock-api-key';
class MockEmblemVaultSDK extends EmblemVaultSDK {
    constructor(apiKey) {
        super(apiKey);
        // Override methods if necessary for testing setup
    }
    // Mock any methods needed by the client creation or its methods, if they are called internally
}

describe('EmblemVaultSolanaWalletClient', () => {
    let sdk;
    let walletClient;
    let mockConnection;
    const testWalletId = 'test-solana-wallet-001';
    
    beforeEach(() => {
        sdk = new MockEmblemVaultSDK(mockApiKey);
        mockConnection = new Connection('http://localhost:8899', 'confirmed');
        walletClient = createEmblemVaultSolanaWalletClient({
            sdk: sdk,
            walletId: testWalletId,
            connection: mockConnection
        });
    });

    afterEach(() => {
        // Restore sinon spies/stubs after each test
        sinon.restore();
    });

    it('should create a client instance', () => {
        expect(walletClient).to.exist;
        expect(walletClient.type).to.equal('emblemVaultSolanaWalletClient');
        expect(walletClient.walletId).to.equal(testWalletId);
        expect(walletClient.sdk).to.equal(sdk);
        expect(walletClient.connection).to.equal(mockConnection);
    });

    it('should have the expected methods', () => {
        expect(walletClient.getPublicKey).to.be.a('function');
        expect(walletClient.signMessage).to.be.a('function');
        expect(walletClient.signTransaction).to.be.a('function');
        expect(walletClient.signVersionedTransaction).to.be.a('function');
        expect(walletClient.sendTransaction).to.be.a('function');
        expect(walletClient.sendVersionedTransaction).to.be.a('function');
    });

    describe('getPublicKey', () => {
        it('should return a PublicKey instance', async () => {
            const publicKey = await walletClient.getPublicKey();
            expect(publicKey).to.be.instanceOf(PublicKey);
        });

        it('should cache the public key after first retrieval', async () => {
            // First call should set the cached public key
            const publicKey1 = await walletClient.getPublicKey();
            expect(walletClient.publicKey).to.equal(publicKey1);
            
            // Spy on the getPublicKey method
            const getPublicKeySpy = sinon.spy(walletClient, 'getPublicKey');
            
            // Second call should return the same public key
            const publicKey2 = await walletClient.getPublicKey();
            expect(publicKey2).to.deep.equal(publicKey1);
            
            // Verify the method was called
            expect(getPublicKeySpy.calledOnce).to.be.true;
        });

        it('should use provided public key if available', async () => {
            const providedPublicKey = new PublicKey('11111111111111111111111111111111');
            const clientWithPublicKey = createEmblemVaultSolanaWalletClient({
                sdk: sdk,
                walletId: testWalletId,
                publicKey: providedPublicKey
            });
            
            const publicKey = await clientWithPublicKey.getPublicKey();
            expect(publicKey).to.deep.equal(providedPublicKey);
        });
    });

    describe('signMessage', () => {
        it('should sign a string message', async () => {
            const message = 'Hello, Solana!';
            const signature = await walletClient.signMessage(message);
            
            expect(signature).to.be.a('string');
            // Base64 encoded signature
            expect(signature).to.match(/^[A-Za-z0-9+/=]+$/);
        });

        it('should sign a Uint8Array message', async () => {
            const message = new TextEncoder().encode('Hello, Solana!');
            const signature = await walletClient.signMessage(message);
            
            expect(signature).to.be.a('string');
            // Base64 encoded signature
            expect(signature).to.match(/^[A-Za-z0-9+/=]+$/);
        });

        it('should produce different signatures for different messages', async () => {
            const message1 = 'Hello, Solana!';
            const message2 = 'Different message';
            
            const signature1 = await walletClient.signMessage(message1);
            const signature2 = await walletClient.signMessage(message2);
            
            // They should be different
            expect(signature1).to.not.equal(signature2);
        });
    });

    describe('signTransaction', () => {
        it('should sign a transaction', async () => {
            // Get the public key first
            const publicKey = await walletClient.getPublicKey();
            
            // Create a simple transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey('11111111111111111111111111111111'),
                    lamports: LAMPORTS_PER_SOL * 0.01
                })
            );
            
            // Set recent blockhash
            transaction.recentBlockhash = 'EETubP5AKHgjPAhzPAFcb8BAY1hMH639CWCFTqi3hq1k';
            transaction.feePayer = publicKey;
            
            // Sign the transaction
            const signedTx = await walletClient.signTransaction(transaction);
            
            // Verify the transaction has signatures
            expect(signedTx.signatures.length).to.be.greaterThan(0);
            expect(signedTx.signatures[0].publicKey.toBase58()).to.equal(publicKey.toBase58());
        });

        it('should get the public key if not already cached', async () => {
            // Create a client without a public key
            const newClient = createEmblemVaultSolanaWalletClient({
                sdk: sdk,
                walletId: testWalletId,
                connection: mockConnection
            });
            
            // Spy on the getPublicKey method
            const getPublicKeySpy = sinon.spy(newClient, 'getPublicKey');
            
            // Create a simple transaction
            const transaction = new Transaction();
            
            // Sign the transaction - this should call getPublicKey internally
            await newClient.signTransaction(transaction);
            
            // Verify getPublicKey was called
            expect(getPublicKeySpy.calledOnce).to.be.true;
        });
    });

    describe('signVersionedTransaction', () => {
        it('should sign a versioned transaction', async () => {
            // Get the public key first
            const publicKey = await walletClient.getPublicKey();
            
            // Create a mock versioned transaction
            const mockVersionedTransaction = {
                message: {
                    serialize: () => Buffer.from('mock-serialized-message')
                }
            };
            
            // Sign the transaction
            const signedTx = await walletClient.signVersionedTransaction(mockVersionedTransaction);
            
            // In our mock implementation, we're just returning the original transaction
            expect(signedTx).to.equal(mockVersionedTransaction);
        });
    });

    describe('sendTransaction', () => {
        it('should throw if no connection is provided', async () => {
            // Create a client without a connection
            const clientWithoutConnection = createEmblemVaultSolanaWalletClient({
                sdk: sdk,
                walletId: testWalletId
            });
            
            // Create a simple transaction
            const transaction = new Transaction();
            
            // Attempt to send the transaction
            try {
                await clientWithoutConnection.sendTransaction(transaction);
                // If it doesn't throw, fail the test
                expect.fail('sendTransaction should have thrown without a connection');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Connection is required to send transactions');
            }
        });

        it('should sign and send a transaction', async () => {
            // Get the public key first
            const publicKey = await walletClient.getPublicKey();
            
            // Create a simple transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey('11111111111111111111111111111111'),
                    lamports: LAMPORTS_PER_SOL * 0.01
                })
            );
            
            // Set recent blockhash
            transaction.recentBlockhash = 'EETubP5AKHgjPAhzPAFcb8BAY1hMH639CWCFTqi3hq1k';
            transaction.feePayer = publicKey;
            
            // Send the transaction
            const signature = await walletClient.sendTransaction(transaction);
            
            // Verify a signature was returned
            expect(signature).to.be.a('string');
            expect(signature).to.include('mock_tx_signature');
        });
    });

    describe('sendVersionedTransaction', () => {
        it('should throw if no connection is provided', async () => {
            // Create a client without a connection
            const clientWithoutConnection = createEmblemVaultSolanaWalletClient({
                sdk: sdk,
                walletId: testWalletId
            });
            
            // Get the public key first
            const publicKey = await clientWithoutConnection.getPublicKey();
            
            // Create a mock versioned transaction
            const mockVersionedTransaction = {
                message: {
                    serialize: () => Buffer.from('mock-serialized-message')
                }
            };
            
            // Attempt to send the transaction
            try {
                await clientWithoutConnection.sendVersionedTransaction(mockVersionedTransaction);
                // If it doesn't throw, fail the test
                expect.fail('sendVersionedTransaction should have thrown without a connection');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Connection is required to send transactions');
            }
        });

        it('should sign and send a versioned transaction', async () => {
            // Get the public key first
            const publicKey = await walletClient.getPublicKey();
            
            // Create a mock versioned transaction
            const mockVersionedTransaction = {
                message: {
                    serialize: () => Buffer.from('mock-serialized-message')
                }
            };
            
            // Send the transaction
            const signature = await walletClient.sendVersionedTransaction(mockVersionedTransaction);
            
            // Verify a signature was returned
            expect(signature).to.be.a('string');
            expect(signature).to.include('mock_tx_signature');
        });
    });
});
