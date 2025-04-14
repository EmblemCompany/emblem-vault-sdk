"use strict";
// Implementation of Solana Wallet Client for Emblem Vault TEE Signer
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmblemVaultSolanaWalletClient = createEmblemVaultSolanaWalletClient;
const web3_js_1 = require("@solana/web3.js");
/**
 * Creates an Emblem Vault Solana Wallet Client
 * @param config - Configuration for the wallet client
 * @returns An Emblem Vault Solana Wallet Client instance
 */
function createEmblemVaultSolanaWalletClient(config) {
    const { sdk, walletId, connection, publicKey: initialPublicKey } = config;
    // Internal state
    let cachedPublicKey = initialPublicKey;
    // Client implementation
    const client = {
        type: 'emblemVaultSolanaWalletClient',
        sdk,
        walletId,
        connection,
        publicKey: cachedPublicKey,
        // --- Mocked Actions ---
        getPublicKey() {
            return __awaiter(this, void 0, void 0, function* () {
                // If we already have the public key, return it
                if (cachedPublicKey) {
                    return cachedPublicKey;
                }
                // TODO: Replace with actual API call to get public key from TEE wallet
                // For now, generate a deterministic mock key based on walletId
                const mockSeed = new TextEncoder().encode(`mock_seed_for_${walletId}`);
                const mockKeypair = web3_js_1.Keypair.fromSeed(mockSeed.slice(0, 32));
                cachedPublicKey = mockKeypair.publicKey;
                client.publicKey = cachedPublicKey;
                return cachedPublicKey;
            });
        },
        signMessage(message) {
            return __awaiter(this, void 0, void 0, function* () {
                // Convert string message to Uint8Array if needed
                const messageBytes = typeof message === 'string'
                    ? new TextEncoder().encode(message)
                    : message;
                // TODO: Replace with actual API call to TEE signer
                // For now, create a mock signature
                const mockSignature = Buffer.from(`mock_signature_for_${walletId}_${Buffer.from(messageBytes).toString('hex')}`);
                // Return base64 encoded signature
                return mockSignature.toString('base64');
            });
        },
        signTransaction(transaction) {
            return __awaiter(this, void 0, void 0, function* () {
                // Ensure we have a public key
                if (!cachedPublicKey) {
                    yield this.getPublicKey();
                }
                // Instead of actually signing the transaction (which requires valid blockhash),
                // we'll just create a mock signed transaction for testing purposes
                // Create a copy of the transaction to avoid modifying the original
                const signedTx = new web3_js_1.Transaction();
                // Copy over the instructions
                if (transaction.instructions) {
                    transaction.instructions.forEach((instruction) => {
                        signedTx.add(instruction);
                    });
                }
                // Set a valid blockhash format for testing
                signedTx.recentBlockhash = 'EETubP5AKHgjPAhzPAFcb8BAY1hMH639CWCFTqi3hq1k';
                // Set the fee payer if provided
                if (transaction.feePayer) {
                    signedTx.feePayer = transaction.feePayer;
                }
                else if (cachedPublicKey) {
                    signedTx.feePayer = cachedPublicKey;
                }
                // Add a mock signature
                const mockSignature = Buffer.from(`mock_signature_for_${walletId}_${Date.now()}`);
                signedTx.signatures.push({
                    publicKey: cachedPublicKey, // Use non-null assertion as we've already checked above
                    signature: mockSignature
                });
                return signedTx;
            });
        },
        signVersionedTransaction(transaction) {
            return __awaiter(this, void 0, void 0, function* () {
                // Ensure we have a public key
                if (!cachedPublicKey) {
                    yield this.getPublicKey();
                }
                // TODO: Replace with actual API call to TEE signer
                // For now, create a mock signature for the versioned transaction
                // Create a deterministic keypair for mock signing
                const mockSeed = new TextEncoder().encode(`mock_seed_for_${walletId}`);
                const mockKeypair = web3_js_1.Keypair.fromSeed(mockSeed.slice(0, 32));
                // For mocking purposes, we'll need to recreate the transaction with signatures
                // This is a simplified approach - in production, you'd send the transaction to the TEE for signing
                const messageBytes = transaction.message.serialize();
                const signature = mockKeypair.secretKey.slice(0, 64); // Use first 64 bytes as mock signature
                // In a real implementation, you would:
                // 1. Serialize the transaction message
                // 2. Send it to the TEE for signing
                // 3. Add the signature to the transaction
                // For now, we're just returning the original transaction
                // In a real implementation, you would create a new VersionedTransaction with the signature
                return transaction;
            });
        },
        sendTransaction(transaction, options) {
            return __awaiter(this, void 0, void 0, function* () {
                // Ensure we have a connection
                if (!this.connection) {
                    throw new Error("Connection is required to send transactions");
                }
                // TODO: Replace with actual API call to send the transaction
                // For now, create a mock transaction signature
                const mockTxSignature = `mock_tx_signature_${walletId}_${Date.now()}`;
                return mockTxSignature;
            });
        },
        sendVersionedTransaction(transaction, options) {
            return __awaiter(this, void 0, void 0, function* () {
                // Ensure we have a connection
                if (!this.connection) {
                    throw new Error("Connection is required to send transactions");
                }
                // Sign the transaction
                const signedTx = yield this.signVersionedTransaction(transaction);
                // TODO: Replace with actual API call to send the transaction
                // For now, create a mock transaction signature
                const mockTxSignature = `mock_tx_signature_${walletId}_${Date.now()}`;
                return mockTxSignature;
            });
        }
    };
    // Explicitly set the type property for provider detection
    client.type = 'emblemVaultSolanaWalletClient';
    return client;
}
//# sourceMappingURL=emblemVaultSolanaWalletClient.js.map