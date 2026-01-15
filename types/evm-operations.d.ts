import type { EmblemVaultClient, ProgressCallback, MintResult, ClaimResult, MetaData, SdkContext } from './types';
export declare function performMintEvm(ctx: SdkContext, client: EmblemVaultClient, tokenId: string, chainId: number, callback?: ProgressCallback): Promise<MintResult>;
export declare function performClaimEvm(ctx: SdkContext, client: EmblemVaultClient, tokenId: string, chainId: number, metadata: MetaData, claimIdentifier: string, vaultIsV2: boolean, needsOnChainUnvault: boolean, callback?: ProgressCallback): Promise<ClaimResult>;
export declare function deleteVaultEvm(client: EmblemVaultClient, tokenId: string, chainId: number, callback?: ProgressCallback): Promise<boolean>;
