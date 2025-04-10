"use strict";
/**
 * Blockchain Provider Implementations
 *
 * This file contains concrete implementations of blockchain providers.
 * These implementations should be excluded from the main bundle
 * to avoid conflicts with consumer libraries.
 */
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
exports.Web3ProviderAdapter = void 0;
/**
 * Web3 provider adapter
 * This wraps a Web3 instance to make it conform to our EthereumProvider interface
 */
class Web3ProviderAdapter {
    constructor(web3) {
        this.web3 = web3;
        this.type = 'ethereum';
    }
    request(args) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            switch (args.method) {
                case 'eth_accounts':
                    return this.web3.eth.getAccounts();
                case 'eth_chainId':
                    return this.web3.eth.getChainId();
                case 'eth_getBalance':
                    return this.web3.eth.getBalance((_a = args.params) === null || _a === void 0 ? void 0 : _a[0]);
                case 'personal_sign':
                    return this.web3.eth.personal.sign((_b = args.params) === null || _b === void 0 ? void 0 : _b[0], (_c = args.params) === null || _c === void 0 ? void 0 : _c[1], (_d = args.params) === null || _d === void 0 ? void 0 : _d[2]);
                default:
                    throw new Error(`Method ${args.method} not implemented`);
            }
        });
    }
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accounts = yield this.web3.eth.getAccounts();
                return Array.isArray(accounts) && accounts.length > 0;
            }
            catch (error) {
                return false;
            }
        });
    }
    // Expose the original web3 instance
    get eth() {
        return this.web3.eth;
    }
    // Get the raw web3 instance
    getRawWeb3() {
        return this.web3;
    }
}
exports.Web3ProviderAdapter = Web3ProviderAdapter;
//# sourceMappingURL=implementations.js.map