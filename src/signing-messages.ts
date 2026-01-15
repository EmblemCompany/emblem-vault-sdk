export function buildMintMessage(tokenId: string): string {
    return `Curated Minting: ${tokenId}`;
}

export function buildClaimMessage(identifier: string, isV2Vault: boolean): string {
    const prefix = isV2Vault ? 'Unvault' : 'Claim';
    return `${prefix}: ${identifier}`;
}

export function buildUnvaultMessage(identifier: string): string {
    return `Unvault: ${identifier}`;
}

export function buildDeleteMessage(tokenId: string): string {
    return `Delete: ${tokenId}`;
}