"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performMintEvm = performMintEvm;
exports.performClaimEvm = performClaimEvm;
exports.deleteVaultEvm = deleteVaultEvm;
const constants_1 = require("./constants");
const signing_messages_1 = require("./signing-messages");
const vault_utils_1 = require("./vault-utils");
const utils_1 = require("./utils");
const EVM_RPC_URLS = {
    1: 'https://eth.llamarpc.com',
    137: 'https://polygon-rpc.com',
};
function getEvmRpcUrl(chainId) {
    return EVM_RPC_URLS[chainId] || EVM_RPC_URLS[1];
}
function performMintEvm(ctx, client, tokenId, chainId, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        callback === null || callback === void 0 ? void 0 : callback('Initializing EVM signer...');
        const { ethers } = yield Promise.resolve().then(() => __importStar(require('ethers')));
        const provider = new ethers.providers.JsonRpcProvider(getEvmRpcUrl(chainId));
        const wallet = yield client.toEthersWallet(provider);
        (_a = wallet.setChainId) === null || _a === void 0 ? void 0 : _a.call(wallet, chainId);
        callback === null || callback === void 0 ? void 0 : callback('Signing mint request...');
        const mintMessage = (0, signing_messages_1.buildMintMessage)(tokenId);
        const mintRequestSig = yield wallet.signMessage(mintMessage);
        callback === null || callback === void 0 ? void 0 : callback('Getting remote mint signature...');
        const remoteMintSig = yield requestRemoteMintSignature(ctx, tokenId, mintRequestSig, chainId);
        callback === null || callback === void 0 ? void 0 : callback('Submitting mint transaction...');
        const txHash = yield submitMintTransaction(wallet, remoteMintSig, chainId, callback);
        callback === null || callback === void 0 ? void 0 : callback('Mint complete!', { txHash });
        return { txHash, tokenId, chainId };
    });
}
function performClaimEvm(ctx, client, tokenId, chainId, metadata, claimIdentifier, vaultIsV2, needsOnChainUnvault, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        callback === null || callback === void 0 ? void 0 : callback('Initializing EVM signer...');
        const { ethers } = yield Promise.resolve().then(() => __importStar(require('ethers')));
        const provider = new ethers.providers.JsonRpcProvider(getEvmRpcUrl(chainId));
        const wallet = yield client.toEthersWallet(provider);
        (_a = wallet.setChainId) === null || _a === void 0 ? void 0 : _a.call(wallet, chainId);
        // Determine if vault needs on-chain claim/unvault before getting keys
        // For minted vaults (live=true, status=unclaimed), we must claim on-chain first
        const isMinted = metadata.live === true || metadata.status === 'unclaimed';
        const isAlreadyClaimed = metadata.status === 'claimed' || Boolean(metadata.claimedBy);
        if (isMinted && !isAlreadyClaimed) {
            if (needsOnChainUnvault) {
                // V2 vault: use unvaultWithSignedPrice
                yield performOnChainUnvault(ctx, wallet, tokenId, claimIdentifier, metadata.collectionAddress, chainId, callback);
            }
            else {
                // Non-V2 vault: use handler's claim function
                const targetContractAddress = ((_b = metadata.targetContract) === null || _b === void 0 ? void 0 : _b[chainId]) || metadata.collectionAddress;
                if (targetContractAddress) {
                    callback === null || callback === void 0 ? void 0 : callback('Performing on-chain claim...');
                    yield performLegacyClaim(wallet, targetContractAddress, claimIdentifier, chainId, callback);
                }
            }
        }
        callback === null || callback === void 0 ? void 0 : callback('Signing claim message...');
        const claimMessage = (0, signing_messages_1.buildClaimMessage)(claimIdentifier, vaultIsV2);
        const signature = yield wallet.signMessage(claimMessage);
        callback === null || callback === void 0 ? void 0 : callback('Requesting claim token...');
        const jwt = yield requestClaimToken(tokenId, signature, chainId);
        callback === null || callback === void 0 ? void 0 : callback('Requesting remote key...');
        const decryptionKeys = yield ctx.requestRemoteKey(tokenId, jwt, callback);
        if (!decryptionKeys) {
            throw new Error('Failed to get decryption key');
        }
        callback === null || callback === void 0 ? void 0 : callback('Decrypting vault keys...');
        return yield ctx.decryptVaultKeys(tokenId, decryptionKeys, callback);
    });
}
function deleteVaultEvm(client, tokenId, chainId, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        callback === null || callback === void 0 ? void 0 : callback('Initializing EVM signer...');
        const wallet = yield client.toEthersWallet(null);
        (_a = wallet.setChainId) === null || _a === void 0 ? void 0 : _a.call(wallet, chainId);
        callback === null || callback === void 0 ? void 0 : callback('Signing delete message...');
        const deleteMessage = (0, signing_messages_1.buildDeleteMessage)(tokenId);
        const signature = yield wallet.signMessage(deleteMessage);
        callback === null || callback === void 0 ? void 0 : callback('Deleting vault...');
        const response = yield fetch(`${constants_1.EMBLEM_API_2}/v2/delete`, {
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
            const errorData = yield response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete vault');
        }
        callback === null || callback === void 0 ? void 0 : callback('Vault deleted successfully');
        return true;
    });
}
function requestRemoteMintSignature(ctx, tokenId, signature, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${ctx.baseUrl}/mint-curated`;
        const remoteMintResponse = yield (0, utils_1.fetchData)(url, ctx.apiKey, 'POST', {
            method: 'buyWithSignedPrice',
            tokenId,
            signature,
            chainId: chainId.toString(),
        });
        // Handle both 'error' and 'err' fields (API inconsistency)
        const errorMsg = remoteMintResponse.error || remoteMintResponse.err;
        if (errorMsg) {
            const message = typeof errorMsg === 'string'
                ? errorMsg
                : errorMsg.msg || errorMsg.message || JSON.stringify(errorMsg);
            throw new Error(message);
        }
        return remoteMintResponse;
    });
}
function submitMintTransaction(wallet, remoteMintSig, chainId, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ethers } = yield Promise.resolve().then(() => __importStar(require('ethers')));
        const handlerAddress = (0, vault_utils_1.getHandlerContractAddress)(chainId);
        const priceBigInt = (0, utils_1.parseBigIntValue)(remoteMintSig._price);
        const iface = new ethers.utils.Interface([
            'function buyWithSignedPrice(address _nftAddress, address _payment, uint256 _price, address _to, uint256 _tokenId, uint256 _nonce, bytes _signature, bytes serialNumber, uint256 _amount) payable'
        ]);
        const data = iface.encodeFunctionData('buyWithSignedPrice', [
            remoteMintSig._nftAddress,
            constants_1.ZERO_ADDRESS,
            priceBigInt,
            remoteMintSig._to,
            (0, utils_1.parseBigIntValue)(remoteMintSig._tokenId),
            (0, utils_1.parseBigIntValue)(remoteMintSig._nonce),
            remoteMintSig._signature,
            remoteMintSig.serialNumber,
            BigInt(1),
        ]);
        const tx = yield wallet.sendTransaction({
            to: handlerAddress,
            data,
            value: priceBigInt,
        });
        callback === null || callback === void 0 ? void 0 : callback('Waiting for confirmation...', { txHash: tx.hash });
        yield tx.wait();
        return tx.hash;
    });
}
function performOnChainUnvault(ctx, wallet, tokenId, claimIdentifier, nftAddress, chainId, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        callback === null || callback === void 0 ? void 0 : callback('Signing unvault request...');
        // Sign with tokenId to match server expectation (server verifies "Unvault: " + req.body.tokenId)
        const unvaultMessage = (0, signing_messages_1.buildUnvaultMessage)(tokenId);
        const unvaultSignature = yield wallet.signMessage(unvaultMessage);
        callback === null || callback === void 0 ? void 0 : callback('Requesting remote unvault signature...');
        const remoteUnvaultSig = yield requestRemoteUnvaultSignature(ctx, tokenId, unvaultSignature, chainId);
        callback === null || callback === void 0 ? void 0 : callback('Submitting on-chain unvault transaction...');
        yield submitUnvaultTransaction(wallet, remoteUnvaultSig, nftAddress, chainId, callback);
        callback === null || callback === void 0 ? void 0 : callback('On-chain unvault complete, retrieving keys...');
    });
}
/**
 * Perform legacy claim by calling the handler contract's claim function
 * This is for non-V2 vaults that don't use signed price unvaulting
 */
function performLegacyClaim(wallet, targetContractAddress, tokenId, chainId, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ethers } = yield Promise.resolve().then(() => __importStar(require('ethers')));
        // Handler contract ABI for claim function
        const HANDLER_CLAIM_ABI = [
            'function claim(address _nftAddress, uint256 _tokenId) external'
        ];
        const handlerAddress = (0, vault_utils_1.getHandlerContractAddress)(chainId);
        const iface = new ethers.utils.Interface(HANDLER_CLAIM_ABI);
        const data = iface.encodeFunctionData('claim', [
            targetContractAddress,
            BigInt(tokenId),
        ]);
        callback === null || callback === void 0 ? void 0 : callback('Submitting claim transaction...');
        const tx = yield wallet.sendTransaction({
            to: handlerAddress,
            data,
        });
        callback === null || callback === void 0 ? void 0 : callback('Waiting for claim confirmation...', { txHash: tx.hash });
        yield tx.wait();
        callback === null || callback === void 0 ? void 0 : callback('On-chain claim complete!');
    });
}
function requestRemoteUnvaultSignature(ctx, tokenId, signature, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${ctx.baseUrl}/unvault-curated`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: 'unvaultWithSignedPrice',
                tokenId,
                signature,
                chainId: chainId.toString(),
            }),
        });
        const remoteUnvaultSig = yield response.json();
        if (!(remoteUnvaultSig === null || remoteUnvaultSig === void 0 ? void 0 : remoteUnvaultSig.success)) {
            throw new Error((remoteUnvaultSig === null || remoteUnvaultSig === void 0 ? void 0 : remoteUnvaultSig.msg) || (remoteUnvaultSig === null || remoteUnvaultSig === void 0 ? void 0 : remoteUnvaultSig.err) || 'Failed to get remote unvault signature');
        }
        return remoteUnvaultSig;
    });
}
function submitUnvaultTransaction(wallet, remoteUnvaultSig, nftAddress, chainId, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ethers } = yield Promise.resolve().then(() => __importStar(require('ethers')));
        const unvaultingAddress = (0, vault_utils_1.getUnvaultingContractAddress)(chainId);
        const nftAddressToUse = nftAddress || remoteUnvaultSig._nftAddress;
        const tokenId = (0, utils_1.parseBigIntValue)(remoteUnvaultSig._tokenId);
        const nonce = (0, utils_1.parseBigIntValue)(remoteUnvaultSig._nonce);
        const price = (0, utils_1.parseBigIntValue)(remoteUnvaultSig._price);
        const timestamp = (0, utils_1.parseBigIntValue)(remoteUnvaultSig._timestamp);
        const iface = new ethers.utils.Interface([
            'function unvaultWithSignedPrice(address _nftAddress, uint256 _tokenId, uint256 _nonce, address _payment, uint256 _price, bytes _signature, uint256 _timestamp) payable'
        ]);
        const data = iface.encodeFunctionData('unvaultWithSignedPrice', [
            nftAddressToUse,
            tokenId,
            nonce,
            constants_1.ZERO_ADDRESS,
            price,
            remoteUnvaultSig._signature,
            timestamp,
        ]);
        const tx = yield wallet.sendTransaction({
            to: unvaultingAddress,
            data,
            value: price,
        });
        callback === null || callback === void 0 ? void 0 : callback('Waiting for unvault confirmation...', { txHash: tx.hash });
        yield tx.wait();
        return tx.hash;
    });
}
function requestClaimToken(tokenId, signature, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${constants_1.TORUS_SIGNER_API}/sign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                chainid: chainId.toString(),
            },
            body: JSON.stringify({ signature, tokenId }),
        });
        const jwt = yield response.json();
        if (!jwt || jwt.success === false) {
            throw new Error((jwt === null || jwt === void 0 ? void 0 : jwt.debug) ? `Claim failed: ${JSON.stringify(jwt.debug)}` : 'Failed to get claim token');
        }
        return jwt;
    });
}
