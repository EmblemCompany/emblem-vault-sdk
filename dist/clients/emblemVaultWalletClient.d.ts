import { EmblemVaultSDK } from '../';
import type { Account, Address, Chain, Transport, WalletActions } from 'viem';
/**
 * Configuration for creating an EmblemVaultWalletClient.
 */
export interface EmblemVaultWalletClientConfig {
    /** The initialized EmblemVaultSDK instance */
    sdk: EmblemVaultSDK;
    /** Identifier for the specific remote TEE wallet to use (e.g., a wallet ID or label) */
    walletId: string;
    /** Optional viem Chain object if needed for compatibility */
    chain?: Chain;
    /** Optional viem Account object if address is known upfront */
    account?: Account | Address;
    /** Optional Transport (likely unused as we use API, but here for viem compatibility) */
    transport?: Transport;
    /** Optional Key for the client */
    key?: string;
    /** Optional Name for the client */
    name?: string;
}
export type EmblemVaultWalletActions = Pick<WalletActions, 'getAddresses' | 'sendTransaction' | 'signMessage' | 'signTypedData'>;
/**
 * Represents a Wallet Client powered by Emblem Vault's TEE remote signer API.
 * Mimics the viem WalletClient interface for compatibility.
 */
export type EmblemVaultWalletClient = EmblemVaultWalletActions & {
    /** The type of the client */
    type: 'emblemVaultWalletClient';
    /** The configured wallet identifier */
    walletId: string;
    /** The configured viem Chain object, if provided */
    chain?: Chain;
    /** The configured viem Account object, if provided */
    account?: Account | Address;
    /** The underlying Emblem Vault SDK instance */
    sdk: EmblemVaultSDK;
    /** Client Key */
    key: string;
    /** Client Name */
    name: string;
    /** Client UID */
    uid: string;
};
/**
 * Creates a Wallet Client that interacts with Emblem Vault's TEE remote signer.
 *
 * @param config - Configuration for the Wallet Client.
 * @returns A Wallet Client instance.
 */
export declare function createEmblemVaultWalletClient(config: EmblemVaultWalletClientConfig): EmblemVaultWalletClient;
export {};
