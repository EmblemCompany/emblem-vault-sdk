// ============================================================================
// Supported Chains
// ============================================================================

export const ETHEREUM_MAINNET_CHAIN_ID = 1;
export const POLYGON_MAINNET_CHAIN_ID = 137;
export const SOLANA_CHAIN_IDENTIFIER = 'solana';

export type ChainType = 'evm' | 'solana';

export interface ChainConfig {
    type: ChainType;
    name: string;
    handlerContract?: string;
    unvaultingContract?: string;
}

export const SUPPORTED_CHAINS: Record<number | string, ChainConfig> = {
    [ETHEREUM_MAINNET_CHAIN_ID]: {
        type: 'evm',
        name: 'Ethereum Mainnet',
        handlerContract: '0x23859b51117dbFBcdEf5b757028B18d7759a4460',
        unvaultingContract: '0x214C964bBd3640971E111d3a994CbB89b296a9ad',
    },
    [POLYGON_MAINNET_CHAIN_ID]: {
        type: 'evm',
        name: 'Polygon Mainnet',
        handlerContract: '0x23859b51117dbFBcdEf5b757028B18d7759a4460',
        unvaultingContract: '0x214C964bBd3640971E111d3a994CbB89b296a9ad',
    },
};

// ============================================================================
// Contract Addresses (default to Ethereum mainnet)
// ============================================================================

export const HANDLER_CONTRACT_ADDRESS = '0x23859b51117dbFBcdEf5b757028B18d7759a4460';
export const UNVAULTING_DIAMOND_ADDRESS = '0x214C964bBd3640971E111d3a994CbB89b296a9ad';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// ============================================================================
// API Endpoints
// ============================================================================

export const EMBLEM_API_V2 = 'https://v2.emblemvault.io';
export const EMBLEM_API_2 = 'https://api2.emblemvault.io';
export const TORUS_SIGNER_API = 'https://tor-us-signer-coval.vercel.app';
