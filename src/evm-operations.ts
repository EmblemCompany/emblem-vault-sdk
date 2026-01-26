import type {
    EvmSigner,
    EmblemVaultClient,
    ProgressCallback,
    MintResult,
    ClaimResult,
    RemoteMintSignature,
    RemoteUnvaultSignature,
    MetaData,
    SdkContext,
} from './types';

import {
    ZERO_ADDRESS,
    EMBLEM_API_2,
    TORUS_SIGNER_API,
} from './constants';

import {
    buildMintMessage,
    buildClaimMessage,
    buildUnvaultMessage,
    buildDeleteMessage,
} from './signing-messages';

import {
    getHandlerContractAddress,
    getUnvaultingContractAddress,
} from './vault-utils';

import { fetchData, parseBigIntValue } from './utils';

const EVM_RPC_URLS: Record<number, string> = {
    1: 'https://eth.llamarpc.com',
    137: 'https://polygon-rpc.com',
};

function getEvmRpcUrl(chainId: number): string {
    return EVM_RPC_URLS[chainId] || EVM_RPC_URLS[1];
}

export async function performMintEvm(
    ctx: SdkContext,
    client: EmblemVaultClient,
    tokenId: string,
    chainId: number,
    callback?: ProgressCallback
): Promise<MintResult> {
    callback?.('Initializing EVM signer...');
    const { ethers } = await import('ethers');
    const provider = new ethers.providers.JsonRpcProvider(getEvmRpcUrl(chainId));
    const wallet = await client.toEthersWallet(provider);
    wallet.setChainId?.(chainId);

    callback?.('Signing mint request...');
    const mintMessage = buildMintMessage(tokenId);
    const mintRequestSig = await wallet.signMessage(mintMessage);

    callback?.('Getting remote mint signature...');
    const remoteMintSig = await requestRemoteMintSignature(ctx, tokenId, mintRequestSig, chainId);

    callback?.('Submitting mint transaction...');
    const txHash = await submitMintTransaction(wallet, remoteMintSig, chainId, callback);

    callback?.('Mint complete!', { txHash });
    return { txHash, tokenId, chainId };
}

export async function performClaimEvm(
    ctx: SdkContext,
    client: EmblemVaultClient,
    tokenId: string,
    chainId: number,
    metadata: MetaData,
    claimIdentifier: string,
    vaultIsV2: boolean,
    needsOnChainUnvault: boolean,
    callback?: ProgressCallback
): Promise<ClaimResult> {
    callback?.('Initializing EVM signer...');
    const { ethers } = await import('ethers');
    const provider = new ethers.providers.JsonRpcProvider(getEvmRpcUrl(chainId));
    const wallet = await client.toEthersWallet(provider);
    wallet.setChainId?.(chainId);

    // Determine if vault needs on-chain claim/unvault before getting keys
    // For minted vaults (live=true, status=unclaimed), we must claim on-chain first
    const isMinted = metadata.live === true || metadata.status === 'unclaimed';
    const isAlreadyClaimed = metadata.status === 'claimed' || Boolean(metadata.claimedBy);
    
    if (isMinted && !isAlreadyClaimed) {
        if (needsOnChainUnvault) {
            // V2 vault: use unvaultWithSignedPrice
            await performOnChainUnvault(
                ctx,
                wallet,
                tokenId,
                claimIdentifier,
                metadata.collectionAddress,
                chainId,
                callback
            );
        } else {
            // Non-V2 vault: use handler's claim function
            const targetContractAddress = metadata.targetContract?.[chainId] || metadata.collectionAddress;
            if (targetContractAddress) {
                callback?.('Performing on-chain claim...');
                await performLegacyClaim(wallet, targetContractAddress, claimIdentifier, chainId, callback);
            }
        }
    }

    callback?.('Signing claim message...');
    const claimMessage = buildClaimMessage(claimIdentifier, vaultIsV2);
    const signature = await wallet.signMessage(claimMessage);

    callback?.('Requesting claim token...');
    const jwt = await requestClaimToken(tokenId, signature, chainId);

    callback?.('Requesting remote key...');
    const decryptionKeys = await ctx.requestRemoteKey(tokenId, jwt, callback);
    if (!decryptionKeys) {
        throw new Error('Failed to get decryption key');
    }

    callback?.('Decrypting vault keys...');
    return await ctx.decryptVaultKeys(tokenId, decryptionKeys, callback);
}

export async function deleteVaultEvm(
    client: EmblemVaultClient,
    tokenId: string,
    chainId: number,
    callback?: ProgressCallback
): Promise<boolean> {
    callback?.('Initializing EVM signer...');
    const wallet = await client.toEthersWallet(null);
    wallet.setChainId?.(chainId);

    callback?.('Signing delete message...');
    const deleteMessage = buildDeleteMessage(tokenId);
    const signature = await wallet.signMessage(deleteMessage);

    callback?.('Deleting vault...');
    const response = await fetch(`${EMBLEM_API_2}/v2/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            service: 'evmetadata',
        },
        body: JSON.stringify({
            tokenId,
            signature,
            chainId: chainId.toString(),
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete vault');
    }

    callback?.('Vault deleted successfully');
    return true;
}

async function requestRemoteMintSignature(
    ctx: SdkContext,
    tokenId: string,
    signature: string,
    chainId: number
): Promise<RemoteMintSignature> {
    const url = `${ctx.baseUrl}/mint-curated`;
    const remoteMintResponse = await fetchData(
        url,
        ctx.apiKey,
        'POST',
        {
            method: 'buyWithSignedPrice',
            tokenId,
            signature,
            chainId: chainId.toString(),
        }
    );

    // Handle both 'error' and 'err' fields (API inconsistency)
    const errorMsg = remoteMintResponse.error || remoteMintResponse.err;
    if (errorMsg) {
        const message = typeof errorMsg === 'string'
            ? errorMsg
            : errorMsg.msg || errorMsg.message || JSON.stringify(errorMsg);
        throw new Error(message);
    }

    return remoteMintResponse as RemoteMintSignature;
}

async function submitMintTransaction(
    wallet: EvmSigner,
    remoteMintSig: RemoteMintSignature,
    chainId: number,
    callback?: ProgressCallback
): Promise<string> {
    const { ethers } = await import('ethers');

    const handlerAddress = getHandlerContractAddress(chainId);
    const priceBigInt = parseBigIntValue(remoteMintSig._price);

    const iface = new ethers.utils.Interface([
        'function buyWithSignedPrice(address _nftAddress, address _payment, uint256 _price, address _to, uint256 _tokenId, uint256 _nonce, bytes _signature, bytes serialNumber, uint256 _amount) payable'
    ]);

    const data = iface.encodeFunctionData('buyWithSignedPrice', [
        remoteMintSig._nftAddress,
        ZERO_ADDRESS,
        priceBigInt,
        remoteMintSig._to,
        parseBigIntValue(remoteMintSig._tokenId),
        parseBigIntValue(remoteMintSig._nonce),
        remoteMintSig._signature,
        remoteMintSig.serialNumber,
        BigInt(1),
    ]);

    const tx = await wallet.sendTransaction({
        to: handlerAddress,
        data,
        value: priceBigInt,
    });

    callback?.('Waiting for confirmation...', { txHash: tx.hash });
    await tx.wait();

    return tx.hash;
}

async function performOnChainUnvault(
    ctx: SdkContext,
    wallet: EvmSigner,
    tokenId: string,
    claimIdentifier: string,
    nftAddress: string | undefined,
    chainId: number,
    callback?: ProgressCallback
): Promise<void> {
    callback?.('Signing unvault request...');
    // Sign with tokenId to match server expectation (server verifies "Unvault: " + req.body.tokenId)
    const unvaultMessage = buildUnvaultMessage(tokenId);
    const unvaultSignature = await wallet.signMessage(unvaultMessage);

    callback?.('Requesting remote unvault signature...');
    const remoteUnvaultSig = await requestRemoteUnvaultSignature(ctx, tokenId, unvaultSignature, chainId);

    callback?.('Submitting on-chain unvault transaction...');
    await submitUnvaultTransaction(wallet, remoteUnvaultSig, nftAddress, chainId, callback);

    callback?.('On-chain unvault complete, retrieving keys...');
}

/**
 * Perform legacy claim by calling the handler contract's claim function
 * This is for non-V2 vaults that don't use signed price unvaulting
 */
async function performLegacyClaim(
    wallet: EvmSigner,
    targetContractAddress: string,
    tokenId: string,
    chainId: number,
    callback?: ProgressCallback
): Promise<void> {
    const { ethers } = await import('ethers');
    
    // Handler contract ABI for claim function
    const HANDLER_CLAIM_ABI = [
        'function claim(address _nftAddress, uint256 _tokenId) external'
    ];
    
    const handlerAddress = getHandlerContractAddress(chainId);
    const iface = new ethers.utils.Interface(HANDLER_CLAIM_ABI);
    
    const data = iface.encodeFunctionData('claim', [
        targetContractAddress,
        BigInt(tokenId),
    ]);

    callback?.('Submitting claim transaction...');
    const tx = await wallet.sendTransaction({
        to: handlerAddress,
        data,
    });

    callback?.('Waiting for claim confirmation...', { txHash: tx.hash });
    await tx.wait();
    
    callback?.('On-chain claim complete!');
}

async function requestRemoteUnvaultSignature(
    ctx: SdkContext,
    tokenId: string,
    signature: string,
    chainId: number
): Promise<RemoteUnvaultSignature> {
    const response = await fetch(`${ctx.baseUrl}/unvault-curated`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'unvaultWithSignedPrice',
            tokenId,
            signature,
            chainId: chainId.toString(),
        }),
    });

    const remoteUnvaultSig = await response.json() as RemoteUnvaultSignature;

    if (!remoteUnvaultSig?.success) {
        throw new Error(
            remoteUnvaultSig?.msg || remoteUnvaultSig?.err || 'Failed to get remote unvault signature'
        );
    }

    return remoteUnvaultSig;
}

async function submitUnvaultTransaction(
    wallet: EvmSigner,
    remoteUnvaultSig: RemoteUnvaultSignature,
    nftAddress: string | undefined,
    chainId: number,
    callback?: ProgressCallback
): Promise<string> {
    const { ethers } = await import('ethers');

    const unvaultingAddress = getUnvaultingContractAddress(chainId);
    const nftAddressToUse = nftAddress || remoteUnvaultSig._nftAddress;
    const tokenId = parseBigIntValue(remoteUnvaultSig._tokenId);
    const nonce = parseBigIntValue(remoteUnvaultSig._nonce);
    const price = parseBigIntValue(remoteUnvaultSig._price);
    const timestamp = parseBigIntValue(remoteUnvaultSig._timestamp);

    const iface = new ethers.utils.Interface([
        'function unvaultWithSignedPrice(address _nftAddress, uint256 _tokenId, uint256 _nonce, address _payment, uint256 _price, bytes _signature, uint256 _timestamp) payable'
    ]);

    const data = iface.encodeFunctionData('unvaultWithSignedPrice', [
        nftAddressToUse,
        tokenId,
        nonce,
        ZERO_ADDRESS,
        price,
        remoteUnvaultSig._signature,
        timestamp,
    ]);

    const tx = await wallet.sendTransaction({
        to: unvaultingAddress,
        data,
        value: price,
    });

    callback?.('Waiting for unvault confirmation...', { txHash: tx.hash });
    await tx.wait();

    return tx.hash;
}

async function requestClaimToken(
    tokenId: string,
    signature: string,
    chainId: number
): Promise<{ token: string }> {
    const response = await fetch(`${TORUS_SIGNER_API}/sign`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            chainid: chainId.toString(),
        },
        body: JSON.stringify({ signature, tokenId }),
    });

    const jwt = await response.json();

    if (!jwt || jwt.success === false) {
        throw new Error(
            jwt?.debug ? `Claim failed: ${JSON.stringify(jwt.debug)}` : 'Failed to get claim token'
        );
    }

    return jwt;
}
