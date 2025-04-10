import { EmblemVaultSDK } from '../';
import { Transaction, VersionedTransaction, PublicKey, SendOptions, Connection } from '@solana/web3.js';
/**
 * Configuration options for the Emblem Vault Solana Wallet Client
 */
export interface EmblemVaultSolanaWalletClientConfig {
    /** The Emblem Vault SDK instance */
    sdk: EmblemVaultSDK;
    /** The Emblem Vault ID to use for signing */
    walletId: string;
    /** Optional Solana connection to use for transaction sending */
    connection?: Connection;
    /** Optional public key to use (if already known) */
    publicKey?: PublicKey;
}
/**
 * Emblem Vault Solana Wallet Client
 * Provides Solana wallet functionality using Emblem Vault's TEE signer
 */
export interface EmblemVaultSolanaWalletClient {
    /** The type of wallet client */
    type: 'emblemVaultSolanaWalletClient';
    /** The Emblem Vault SDK instance */
    sdk: EmblemVaultSDK;
    /** The Emblem Vault ID used for signing */
    walletId: string;
    /** The Solana connection (if provided) */
    connection?: Connection;
    /** The wallet's public key (if known or retrieved) */
    publicKey?: PublicKey;
    /**
     * Get the public key for this wallet
     * @returns The wallet's public key
     */
    getPublicKey(): Promise<PublicKey>;
    /**
     * Sign a message using the TEE signer
     * @param message - The message to sign as a Uint8Array or string
     * @returns The signature as a base64 string
     */
    signMessage(message: Uint8Array | string): Promise<string>;
    /**
     * Sign a transaction using the TEE signer
     * @param transaction - The transaction to sign
     * @returns The signed transaction
     */
    signTransaction(transaction: Transaction): Promise<Transaction>;
    /**
     * Sign a versioned transaction using the TEE signer
     * @param transaction - The versioned transaction to sign
     * @returns The signed versioned transaction
     */
    signVersionedTransaction(transaction: VersionedTransaction): Promise<VersionedTransaction>;
    /**
     * Sign and send a transaction
     * @param transaction - The transaction to sign and send
     * @param options - Options for sending the transaction
     * @returns The transaction signature
     */
    sendTransaction(transaction: Transaction, options?: SendOptions): Promise<string>;
    /**
     * Sign and send a versioned transaction
     * @param transaction - The versioned transaction to sign and send
     * @param options - Options for sending the transaction
     * @returns The transaction signature
     */
    sendVersionedTransaction(transaction: VersionedTransaction, options?: SendOptions): Promise<string>;
}
/**
 * Creates an Emblem Vault Solana Wallet Client
 * @param config - Configuration for the wallet client
 * @returns An Emblem Vault Solana Wallet Client instance
 */
export declare function createEmblemVaultSolanaWalletClient(config: EmblemVaultSolanaWalletClientConfig): EmblemVaultSolanaWalletClient;
