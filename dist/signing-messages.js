"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMintMessage = buildMintMessage;
exports.buildClaimMessage = buildClaimMessage;
exports.buildUnvaultMessage = buildUnvaultMessage;
exports.buildDeleteMessage = buildDeleteMessage;
function buildMintMessage(tokenId) {
    return `Curated Minting: ${tokenId}`;
}
function buildClaimMessage(identifier, isV2Vault) {
    const prefix = isV2Vault ? 'Unvault' : 'Claim';
    return `${prefix}: ${identifier}`;
}
function buildUnvaultMessage(identifier) {
    return `Unvault: ${identifier}`;
}
function buildDeleteMessage(tokenId) {
    return `Delete: ${tokenId}`;
}
