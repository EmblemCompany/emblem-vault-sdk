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
class EmblemVaultSDK {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this.baseUrl = baseUrl || 'https://v2.emblemvault.io';
    }
    // Example method structure
    generateUploadUrl() {
        // Implementation goes here
    }
    fetchCuratedContracts(sortByName) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `${this.baseUrl}/curated`;
            if (sortByName) {
                url += '?sort=name';
            }
            if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
                // Client-side (Browser)
                const response = yield fetch(url, {
                    headers: { 'x-api-key': this.apiKey }
                });
                const data = yield response.json();
                return sortByName ? data.sort((a, b) => a.name.localeCompare(b.name)) : data;
            }
            else {
                // Server-side (Node.js)
                const fetch = require('node-fetch');
                const response = yield fetch(url, {
                    headers: { 'x-api-key': this.apiKey }
                });
                const data = yield response.json();
                return sortByName ? data.sort((a, b) => a.name.localeCompare(b.name)) : data;
            }
        });
    }
}
if (typeof window !== 'undefined') {
    window.EmblemVaultSDK = EmblemVaultSDK;
}
exports.default = EmblemVaultSDK;
