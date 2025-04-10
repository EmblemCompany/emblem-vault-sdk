/**
 * Blockchain Provider Detection Utilities
 *
 * This file contains utility functions for detecting provider types.
 * These implementations should be excluded from the main bundle
 * to avoid conflicts with consumer libraries.
 */
import { BlockchainType, BlockchainProvider } from './interfaces';
/**
 * Utility to detect the type of a provider based on its properties
 */
export declare function detectProviderType(provider: any): BlockchainType;
/**
 * Utility to check if a provider is of a specific type
 */
export declare function isProviderType<T extends BlockchainProvider>(provider: any, type: BlockchainType): provider is T;
