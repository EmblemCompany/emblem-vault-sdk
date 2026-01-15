"use strict";
// ============================================================================
// Supported Chains
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.TORUS_SIGNER_API = exports.EMBLEM_API_2 = exports.EMBLEM_API_V2 = exports.ZERO_ADDRESS = exports.UNVAULTING_DIAMOND_ADDRESS = exports.HANDLER_CONTRACT_ADDRESS = exports.SUPPORTED_CHAINS = exports.SOLANA_CHAIN_IDENTIFIER = exports.POLYGON_MAINNET_CHAIN_ID = exports.ETHEREUM_MAINNET_CHAIN_ID = void 0;
exports.ETHEREUM_MAINNET_CHAIN_ID = 1;
exports.POLYGON_MAINNET_CHAIN_ID = 137;
exports.SOLANA_CHAIN_IDENTIFIER = 'solana';
exports.SUPPORTED_CHAINS = {
    [exports.ETHEREUM_MAINNET_CHAIN_ID]: {
        type: 'evm',
        name: 'Ethereum Mainnet',
        handlerContract: '0x23859b51117dbFBcdEf5b757028B18d7759a4460',
        unvaultingContract: '0x214C964bBd3640971E111d3a994CbB89b296a9ad',
    },
    [exports.POLYGON_MAINNET_CHAIN_ID]: {
        type: 'evm',
        name: 'Polygon Mainnet',
        handlerContract: '0x23859b51117dbFBcdEf5b757028B18d7759a4460',
        unvaultingContract: '0x214C964bBd3640971E111d3a994CbB89b296a9ad',
    },
};
// ============================================================================
// Contract Addresses (default to Ethereum mainnet)
// ============================================================================
exports.HANDLER_CONTRACT_ADDRESS = '0x23859b51117dbFBcdEf5b757028B18d7759a4460';
exports.UNVAULTING_DIAMOND_ADDRESS = '0x214C964bBd3640971E111d3a994CbB89b296a9ad';
exports.ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
// ============================================================================
// API Endpoints
// ============================================================================
exports.EMBLEM_API_V2 = 'https://v2.emblemvault.io';
exports.EMBLEM_API_2 = 'https://api2.emblemvault.io';
exports.TORUS_SIGNER_API = 'https://tor-us-signer-coval.vercel.app';
