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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTorusKey = void 0;
const fetch_node_details_1 = __importDefault(require("@toruslabs/fetch-node-details"));
const torus_js_1 = __importDefault(require("@toruslabs/torus.js"));
const appConstants_1 = require("../constants/appConstants");
const getTorusKey = (tokenId, signedJwt) => __awaiter(void 0, void 0, void 0, function* () {
    const fetchNodeDetails = new fetch_node_details_1.default({ network: "mainnet" });
    const torusUtils = new torus_js_1.default({
        clientId: appConstants_1.WEB3_AUTH_DASHBOARD_CLIENT_ID,
        enableOneKey: true,
        network: "sapphire_mainnet",
    });
    const { torusNodeEndpoints, //
    torusIndexes, } = yield fetchNodeDetails.getNodeDetails({
        verifier: "tor-us-signer-vercel",
        verifierId: tokenId,
    });
    // @TEST
    const { finalKeyData: { privKey }, } = yield torusUtils.retrieveShares(torusNodeEndpoints, torusIndexes, "tor-us-signer-vercel", { verifier_id: tokenId }, signedJwt);
    if (!privKey)
        throw new Error("No private key found");
    return privKey;
});
exports.getTorusKey = getTorusKey;
