// Placeholder for Emblem Vault Wallet Client implementation

import { EmblemVaultSDK } from '../'; // Adjust path if needed
import type { Account, Address, Chain, Hex, SendTransactionParameters, SignMessageParameters, SignTypedDataParameters, Transport, WalletActions, WalletRpcSchema, TypedData } from 'viem';

// --- Configuration Interface ---

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

// --- Client Interface (Mimicking viem's WalletClient) ---

// Define the specific actions we intend to implement
// We might not need *all* WalletActions from viem initially
export type EmblemVaultWalletActions = Pick<
  WalletActions,
  'getAddresses' | 'sendTransaction' | 'signMessage' | 'signTypedData' // Add more as needed
  // We might omit actions heavily tied to JSON-RPC like `watchAsset`, `requestPermissions`, etc.
>;

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

// --- Mock Implementation ---

// Counter for UID generation
let uid = 0;

/**
 * Creates a Wallet Client that interacts with Emblem Vault's TEE remote signer.
 *
 * @param config - Configuration for the Wallet Client.
 * @returns A Wallet Client instance.
 */
export function createEmblemVaultWalletClient(
  config: EmblemVaultWalletClientConfig,
): EmblemVaultWalletClient {
  const {
    sdk,
    walletId,
    chain,
    account,
    key = 'emblemVault',
    name = 'Emblem Vault Wallet Client',
  } = config;

  if (!sdk) throw new Error('EmblemVaultSDK instance is required in config.');
  if (!walletId) throw new Error('walletId is required in config.');

  const client: EmblemVaultWalletClient = {
    type: 'emblemVaultWalletClient',
    key,
    name,
    uid: `emblemVaultWalletClient-${uid++}`,
    sdk,
    walletId,
    chain,
    account, // Store the initially provided account

    // --- Mocked Actions ---

    async getAddresses(): Promise<Address[]> {
      // console.log(`[${name}] MOCK getAddresses for wallet: ${walletId}`);
      // TODO: Replace with actual API call to get addresses associated with the TEE wallet
      // For now, if an account address was provided in config, return that.
      if (account) {
         const address = typeof account === 'string' ? account : account.address;
         return [address];
      }
      // Otherwise, return a mock address based on walletId
      return [`0xMockAddressFor${walletId}` as Address];
    },

    async signMessage({ message, account: messageAccount }: SignMessageParameters): Promise<Hex> {
      const effectiveAccount = messageAccount ?? account; // Use account from params or config
      const address = effectiveAccount ? (typeof effectiveAccount === 'string' ? effectiveAccount : effectiveAccount.address) : 'UNKNOWN_ACCOUNT';
      // console.log(`[${name}] MOCK signMessage for wallet: ${walletId}, Account: ${address}`);
      // console.log(`[${name}] Message:`, message);
      // TODO: Replace with actual API call to TEE signer
      const mockSignature = `0x${Buffer.from(`mock_signature_for_${walletId}_${message}`).toString('hex')}`;
      return mockSignature as Hex;
    },

    async signTypedData<const TTypedData extends TypedData | { [key: string]: unknown }, TPrimaryType extends string = string>(
        args: SignTypedDataParameters<TTypedData, TPrimaryType>
    ): Promise<Hex> {
      // Destructure from args according to viem's SignTypedDataParameters
      const { account: messageAccount, domain, message, primaryType, types } = args;
      const effectiveAccount = messageAccount ?? account; // Use account from params or config
      const address = effectiveAccount ? (typeof effectiveAccount === 'string' ? effectiveAccount : effectiveAccount.address) : 'UNKNOWN_ACCOUNT';
      // console.log(`[${name}] MOCK signTypedData for wallet: ${walletId}, Account: ${address}`);
      // console.log(`[${name}] Primary Type: ${primaryType}`);
      // Use 'message' which contains the typed data payload, and 'domain' / 'types' if needed for logging/API call
      // console.log(`[${name}] Domain:`, JSON.stringify(domain));
      // console.log(`[${name}] Message Payload:`, JSON.stringify(message));
      // console.log(`[${name}] Types:`, JSON.stringify(types));
      // TODO: Replace with actual API call to TEE signer
      const mockSignature = `0x${Buffer.from(`mock_signature_for_${walletId}_typed_${primaryType}`).toString('hex')}`;
      return mockSignature as Hex;
    },

    async sendTransaction<TChain extends Chain | undefined, TAccount extends Account | undefined, TChainOverride extends Chain | undefined>(
        args: SendTransactionParameters<TChain, TAccount, TChainOverride>
    ): Promise<Hex> {
        // Destructure from args
        const { account: txAccount, ...txParams } = args;
        const effectiveAccount = txAccount ?? account; // Use account from params or config
        if (!effectiveAccount) throw new Error("Cannot send transaction without an account specified.");
        const address = typeof effectiveAccount === 'string' ? effectiveAccount : effectiveAccount.address;
        // console.log(`[${name}] MOCK sendTransaction for wallet: ${walletId}, From Account: ${address}`);
        // console.log(`[${name}] Transaction Params:`, txParams);
        // TODO: Replace with actual API call to TEE signer to sign AND submit the transaction
        // The TEE API might handle submission, or we might need a separate step.
        const mockTxHash = `0x${Buffer.from(`mock_tx_hash_for_${walletId}_${Date.now()}`).toString('hex').slice(0, 64)}`;
        return mockTxHash as Hex;
    }
  };

  return client;
}

export {};
