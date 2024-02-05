"use strict";
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
exports.getSignedJWT = void 0;
const appConstants_1 = require("../constants/appConstants");
const getSignedJWT = (signature, tokenId, chainId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(`${appConstants_1.SIG_API}/sign`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            chainid: String(chainId),
        },
        body: JSON.stringify({ signature: signature, tokenId: tokenId }),
    });
    const jtw = yield response.json();
    if ((jtw === null || jtw === void 0 ? void 0 : jtw.success) === false)
        throw new Error('JWT signing failed');
    return jtw;
});
exports.getSignedJWT = getSignedJWT;
