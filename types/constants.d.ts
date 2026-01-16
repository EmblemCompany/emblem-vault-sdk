export declare const ETHEREUM_MAINNET_CHAIN_ID = 1;
export declare const POLYGON_MAINNET_CHAIN_ID = 137;
export declare const SOLANA_CHAIN_IDENTIFIER = "solana";
export type ChainType = 'evm' | 'solana';
export interface ChainConfig {
    type: ChainType;
    name: string;
    handlerContract?: string;
    unvaultingContract?: string;
}
export declare const SUPPORTED_CHAINS: Record<number | string, ChainConfig>;
export declare const HANDLER_CONTRACT_ADDRESS = "0x23859b51117dbFBcdEf5b757028B18d7759a4460";
export declare const UNVAULTING_DIAMOND_ADDRESS = "0x214C964bBd3640971E111d3a994CbB89b296a9ad";
export declare const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export declare const EMBLEM_API_V2 = "https://v2.emblemvault.io";
export declare const EMBLEM_API_2 = "https://api2.emblemvault.io";
export declare const TORUS_SIGNER_API = "https://tor-us-signer-coval.vercel.app";
