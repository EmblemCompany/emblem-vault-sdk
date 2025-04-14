import { BlockchainProvider, BlockchainType } from '../providers';
import { WalletConfig } from '../types';
export declare class ProviderManager {
    private providers;
    private walletConfig?;
    private selectedProvider;
    constructor(walletConfig?: WalletConfig);
    /**
     * Applies auto-connect settings based on the wallet configuration.
     * Defaults to auto-connect off unless specified in config.
     */
    private applyAutoConnectSettings;
    /**
     * Disconnects the currently selected wallet provider, if applicable.
     */
    disconnect(): Promise<void>;
    /**
     * Register a blockchain provider for a specific blockchain type
     * @param type The blockchain type
     * @param provider The provider instance
     */
    registerProvider(type: BlockchainType, provider: BlockchainProvider): void;
    /**
     * Get a registered provider for a specific blockchain type
     * @param type The blockchain type
     * @returns The provider instance or undefined if not registered
     */
    getProvider(type: BlockchainType): BlockchainProvider | undefined;
    /**
     * Check if a provider is registered for a specific blockchain type
     * @param type The blockchain type
     * @returns True if a provider is registered for the specified type
     */
    hasProvider(type: BlockchainType): boolean;
    /**
     * Try to connect to a specific wallet by its identifier.
     * @param walletId The identifier of the wallet (e.g., 'phantom', 'metamask').
     * @param type The blockchain type ('solana' or 'ethereum').
     * @returns The provider instance if connection is successful, otherwise null.
     */
    private tryConnectWalletById;
    /**
     * Get or detect a provider for a specific blockchain type
     * If a provider is registered, it will be returned
     * Otherwise, it will try to detect a provider in the environment, respecting priority config.
     * @param type The blockchain type
     * @returns A promise that resolves to the provider instance
     * @throws Error if no provider is available
     */
    getOrDetectProvider(type: BlockchainType): Promise<BlockchainProvider>;
    /**
     * Helper function for general provider detection.
     * @param type The blockchain type
     * @returns A promise that resolves to the detected provider instance or null.
     */
    private _detectGenericProvider;
}
