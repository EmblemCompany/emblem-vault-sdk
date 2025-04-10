"use strict";
// Placeholder for Emblem Vault Wallet Client implementation
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmblemVaultWalletClient = createEmblemVaultWalletClient;
// --- Mock Implementation ---
// Counter for UID generation
let uid = 0;
/**
 * Creates a Wallet Client that interacts with Emblem Vault's TEE remote signer.
 *
 * @param config - Configuration for the Wallet Client.
 * @returns A Wallet Client instance.
 */
function createEmblemVaultWalletClient(config) {
    const { sdk, walletId, chain, account, key = 'emblemVault', name = 'Emblem Vault Wallet Client', } = config;
    if (!sdk)
        throw new Error('EmblemVaultSDK instance is required in config.');
    if (!walletId)
        throw new Error('walletId is required in config.');
    const client = {
        type: 'emblemVaultWalletClient',
        key,
        name,
        uid: `emblemVaultWalletClient-${uid++}`,
        sdk,
        walletId,
        chain,
        account, // Store the initially provided account
        // --- Mocked Actions ---
        getAddresses() {
            return __awaiter(this, void 0, void 0, function* () {
                // console.log(`[${name}] MOCK getAddresses for wallet: ${walletId}`);
                // TODO: Replace with actual API call to get addresses associated with the TEE wallet
                // For now, if an account address was provided in config, return that.
                if (account) {
                    const address = typeof account === 'string' ? account : account.address;
                    return [address];
                }
                // Otherwise, return a mock address based on walletId
                return [`0xMockAddressFor${walletId}`];
            });
        },
        signMessage(_a) {
            return __awaiter(this, arguments, void 0, function* ({ message, account: messageAccount }) {
                const effectiveAccount = messageAccount !== null && messageAccount !== void 0 ? messageAccount : account; // Use account from params or config
                const address = effectiveAccount ? (typeof effectiveAccount === 'string' ? effectiveAccount : effectiveAccount.address) : 'UNKNOWN_ACCOUNT';
                // console.log(`[${name}] MOCK signMessage for wallet: ${walletId}, Account: ${address}`);
                // console.log(`[${name}] Message:`, message);
                // TODO: Replace with actual API call to TEE signer
                const mockSignature = `0x${Buffer.from(`mock_signature_for_${walletId}_${message}`).toString('hex')}`;
                return mockSignature;
            });
        },
        signTypedData(args) {
            return __awaiter(this, void 0, void 0, function* () {
                // Destructure from args according to viem's SignTypedDataParameters
                const { account: messageAccount, domain, message, primaryType, types } = args;
                const effectiveAccount = messageAccount !== null && messageAccount !== void 0 ? messageAccount : account; // Use account from params or config
                const address = effectiveAccount ? (typeof effectiveAccount === 'string' ? effectiveAccount : effectiveAccount.address) : 'UNKNOWN_ACCOUNT';
                // console.log(`[${name}] MOCK signTypedData for wallet: ${walletId}, Account: ${address}`);
                // console.log(`[${name}] Primary Type: ${primaryType}`);
                // Use 'message' which contains the typed data payload, and 'domain' / 'types' if needed for logging/API call
                // console.log(`[${name}] Domain:`, JSON.stringify(domain));
                // console.log(`[${name}] Message Payload:`, JSON.stringify(message));
                // console.log(`[${name}] Types:`, JSON.stringify(types));
                // TODO: Replace with actual API call to TEE signer
                const mockSignature = `0x${Buffer.from(`mock_signature_for_${walletId}_typed_${primaryType}`).toString('hex')}`;
                return mockSignature;
            });
        },
        sendTransaction(args) {
            return __awaiter(this, void 0, void 0, function* () {
                // Destructure from args
                const { account: txAccount } = args, txParams = __rest(args, ["account"]);
                const effectiveAccount = txAccount !== null && txAccount !== void 0 ? txAccount : account; // Use account from params or config
                if (!effectiveAccount)
                    throw new Error("Cannot send transaction without an account specified.");
                const address = typeof effectiveAccount === 'string' ? effectiveAccount : effectiveAccount.address;
                // console.log(`[${name}] MOCK sendTransaction for wallet: ${walletId}, From Account: ${address}`);
                // console.log(`[${name}] Transaction Params:`, txParams);
                // TODO: Replace with actual API call to TEE signer to sign AND submit the transaction
                // The TEE API might handle submission, or we might need a separate step.
                const mockTxHash = `0x${Buffer.from(`mock_tx_hash_for_${walletId}_${Date.now()}`).toString('hex').slice(0, 64)}`;
                return mockTxHash;
            });
        }
    };
    return client;
}
//# sourceMappingURL=emblemVaultWalletClient.js.map