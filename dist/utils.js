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
exports.COIN_TO_NETWORK = exports.fetchData = exports.metadataAllProjects = exports.metadataObj2Arr = exports.evaluateFacts = exports.pad = exports.NFT_DATA = void 0;
exports.generateAttributeTemplate = generateAttributeTemplate;
exports.generateImageTemplate = generateImageTemplate;
exports.generateTemplate = generateTemplate;
exports.templateGuard = templateGuard;
exports.genericGuard = genericGuard;
exports.getQuoteContractObject = getQuoteContractObject;
exports.getHandlerContract = getHandlerContract;
exports.getLegacyContract = getLegacyContract;
exports.checkContentType = checkContentType;
exports.getTorusKeys = getTorusKeys;
exports.decryptKeys = decryptKeys;
exports.getSatsConnectAddress = getSatsConnectAddress;
exports.signPSBT = signPSBT;
const crypto_js_1 = __importDefault(require("crypto-js"));
const metadata_json_1 = __importDefault(require("./curated/metadata.json"));
const darkfarms_metadata_json_1 = __importDefault(require("./curated/darkfarms-metadata.json"));
const dot_id_json_1 = __importDefault(require("./curated/dot_id.json"));
const abi_json_1 = __importDefault(require("./abi/abi.json"));
const sats_connect_1 = require("sats-connect");
// import { phrasePathToKey } from './derive'
exports.NFT_DATA = Object.assign(metadata_json_1.default, darkfarms_metadata_json_1.default, dot_id_json_1.default);
// PROJECTS_DATA is list of projects i.e. curated collection names
// that are present in metadataJson file
const PROJECTS_DATA = projectsFromMetadataJson();
const TORUS_CLIENT_ID = 'BOqGGv-Yx7Dp5RdvD9R3DgSC8jv66gQGwT3w22L7fj3Fg5WQ8AEUjJzyyEwD-qvq5eUQiVipyzOmRZTWBAxaoj0';
const TORUS_VERIFIER = 'tor-us-signer-vercel';
function projectsFromMetadataJson() {
    let projects = [];
    for (var key in exports.NFT_DATA) {
        const projectName = exports.NFT_DATA[key]["projectName"];
        if (!projects.includes(projectName)) {
            projects.push(projectName);
        }
    }
    return projects;
}
const pad = (num, size) => {
    if (!num)
        return null;
    num = num.toString();
    while (num.length < size)
        num = "0" + num;
    return num;
};
exports.pad = pad;
const evaluateFacts = (allowed, facts, msgCallback) => {
    let reasons = [];
    allowed = facts.every(fact => {
        if (!fact.eval) {
            reasons.push(fact.msg);
        }
        return fact.eval;
    });
    if (reasons.length > 0 && msgCallback) {
        msgCallback(reasons.join(' '));
    }
    return allowed;
};
exports.evaluateFacts = evaluateFacts;
const metadataObj2Arr = (data) => Object.keys(data).map(key => (Object.assign(Object.assign({}, data[key]), { assetName: key })));
exports.metadataObj2Arr = metadataObj2Arr;
const metadataAllProjects = (projects) => projects.reduce((unique, item) => {
    if (!unique.includes(item.projectName)) {
        unique.push(item.projectName);
    }
    return unique;
}, []);
exports.metadataAllProjects = metadataAllProjects;
const fetchData = (url_1, apiKey_1, ...args_1) => __awaiter(void 0, [url_1, apiKey_1, ...args_1], void 0, function* (url, apiKey, method = 'GET', body = null, headers = null) {
    const options = {
        method: method,
        headers: headers ? Object.assign(Object.assign({}, headers), { 'x-api-key': apiKey }) : { 'x-api-key': apiKey },
    };
    if (method === 'POST' && body) {
        options.body = JSON.stringify(body);
        options.headers['Content-Type'] = 'application/json';
    }
    const response = yield fetch(url, options);
    return yield response.json();
});
exports.fetchData = fetchData;
function generateAttributeTemplate(record) {
    let template = [];
    if (record.name == "Rare Pepe" ||
        record.name == "Fake Rares" ||
        record.name == "Dank Rares" ||
        record.name == "Fake Commons" ||
        record.name == "Age of Rust" ||
        record.name == "Age of Chains" ||
        record.name == "Bitcorn Crops" ||
        record.name == "Bitgirls" ||
        record.name == "Force of Will" ||
        record.name == "Memorychain" ||
        record.name == "Oasis Mining" ||
        record.name == "Sarutobi Island") {
        template = [
            {
                "trait_type": "Series",
                "value": (metadata) => {
                    var _a, _b;
                    return (_b = (0, exports.pad)((_a = exports.NFT_DATA[metadata.targetAsset.name]) === null || _a === void 0 ? void 0 : _a.series, 2)) === null || _b === void 0 ? void 0 : _b.toString();
                }
            },
            {
                "trait_type": "Card",
                "value": (metadata) => {
                    var _a, _b;
                    return (_b = (0, exports.pad)((_a = exports.NFT_DATA[metadata.targetAsset.name]) === null || _a === void 0 ? void 0 : _a.order, 2)) === null || _b === void 0 ? void 0 : _b.toString();
                }
            },
            {
                "trait_type": "Total Supply",
                "value": (metadata) => {
                    var _a, _b, _c, _d;
                    return (_d = (0, exports.pad)(((_a = exports.NFT_DATA[metadata.targetAsset.name]) === null || _a === void 0 ? void 0 : _a.remaining) || ((_c = (_b = exports.NFT_DATA[metadata.targetAsset.name]) === null || _b === void 0 ? void 0 : _b.raw) === null || _c === void 0 ? void 0 : _c.supply), 2)) === null || _d === void 0 ? void 0 : _d.toString();
                }
            },
            {
                "trait_type": "Artist",
                "value": (metadata) => {
                    var _a, _b, _c;
                    return (_c = (0, exports.pad)((_b = (_a = exports.NFT_DATA[metadata.targetAsset.name]) === null || _a === void 0 ? void 0 : _a.raw) === null || _b === void 0 ? void 0 : _b.artist.name, 2)) === null || _c === void 0 ? void 0 : _c.toString();
                }
            }
        ];
        if (record.name == "Rare Pepe") {
            template.push({
                "trait_type": "Year",
                "value": (metadata) => {
                    return (exports.NFT_DATA[metadata.targetAsset.name].series < 10 ? '2016' :
                        exports.NFT_DATA[metadata.targetAsset.name].series > 9 &&
                            exports.NFT_DATA[metadata.targetAsset.name].series < 31 ? '2017' :
                            '2018');
                }
            });
        }
    }
    else if (record.name == "Cursed Ordinal") {
        template = [
            {
                "trait_type": "Content Type",
                "value": (metadata) => {
                    return metadata.values[0].content_type;
                }
            },
            {
                "trait_type": "Ordinal Number",
                "value": (metadata) => {
                    return metadata.values[0].name.includes("Cursed Ordinal") ? metadata.values[0].name.replace('Cursed Ordinal', '').trim() : false;
                }
            },
            {
                "trait_type": "Collection",
                "value": (metadata) => {
                    return metadata.values[0].name.includes("Cursed Ordinal") ? false : `All:${metadata.values[0].project}`;
                }
            },
            {
                "trait_type": "Artist",
                "value": (metadata) => {
                    let foundArtistTrait = metadata.values.length > 0 && metadata.values[0].traits ? metadata.values[0].traits.filter((item) => { return item.trait_type === "artist"; }) : [];
                    return foundArtistTrait.length > 0 ? foundArtistTrait[0].value : false;
                }
            }
        ];
    }
    else if (record.name == "Ethscription") {
        template = [
            {
                "trait_type": "Collection",
                "value": (metadata) => {
                    return metadata.values[0].project ? `${metadata.values[0].project}` : false;
                }
            },
            {
                "trait_type": "Ethscriptions",
                "value": (metadata) => {
                    let foundTrait = metadata.values && metadata.values.length > 0 && metadata.values[0].traits && metadata.values[0].traits.length > 0 && metadata.values[0].traits.filter((item) => { return item.trait_type == "Ethscriptions"; }).length > 0 ? metadata.values[0].traits.filter((item) => { return item.trait_type == "Ethscriptions"; })[0].value : false;
                    return foundTrait;
                }
            }
        ];
    }
    else if (record.name == "EmblemOpen") {
        template = [
            {
                "trait_type": "Contains",
                "value": (balanceItem) => {
                    return balanceItem.coin;
                },
                "type": "loop",
                "key": "values"
            }
        ];
    }
    return template;
}
function generateImageTemplate(record) {
    let template = {};
    if (record.imageHandler) {
        template.image = (data) => {
            return `${record.image}`;
        };
    }
    if (record.loadingImages) {
        template.loading = () => {
            let images = record.loadingImages;
            return images[Math.floor(Math.random() * images.length)]; // Random image
        };
    }
    if (record.placeholderImages) {
        template.placeholder = () => {
            let images = record.placeholderImages;
            return images[Math.floor(Math.random() * images.length)]; // Random image
        };
    }
    return template;
}
/**
 * generateTemplate defines rules and utilitites for a given curated
 * collection. This is used by callers, like emblem.finance website
 * to display vaults belonging to a curated collection with appropriate
 * data and actions.
 *
 * @param record is a curated collection record as defined in
 * the Emblem database.
 */
function generateTemplate(record) {
    let addressChain = record.addressChain;
    let attributes = generateAttributeTemplate(record);
    let imageMethods = generateImageTemplate(record);
    let recordName = record.name;
    let balanceQty = record.balanceQty;
    let template = {
        attributes,
        /**
         * allowed function is used by callers, like the Emblem website
         * to determine if a vault belonging to a curated collection
         * has assets matching that curated collection. A vault can't be
         * minted until it has at least one qualifying asset.
         * Currently, we run qualifying checks only on the first asset in the vault.
         *
         * @param {Array} data - data is a list of balance Value objects
         * (see Value's interface definition  in emblemvault.io-v3)
         * @param {_this} _this is  one of the curatedContract returned by `fetchCuratedContracts`.
         *  It should be further embellished with tokenId and serialNumber properties.
         * @param {function} - msgCallback should be a function that takes a string message
         */
        allowed: (data, _this, msgCallback = null) => {
            if (recordName == "Embels") {
                return true;
            }
            if ((!data || data.length == 0)) {
                return false;
            }
            let allowed = false;
            let firstAsset = data[0];
            let assetName = (firstAsset === null || firstAsset === void 0 ? void 0 : firstAsset.name) ? firstAsset.name : "";
            let message = null;
            if (recordName == "Filthy Fiat") {
                data = _this.filterNativeBalances({ balances: data }, _this);
                allowed = data[0].project == recordName;
            }
            else if (recordName == "Cursed Ordinal") {
                if (data && data.length > 0) {
                    let allowedCoin = firstAsset.content_type != "application/json" && firstAsset.coin == "cursedordinalsbtc";
                    let pieces = assetName.split(' ');
                    let allowedName = assetName.includes(recordName) && pieces.length === 3 && Number(pieces.reverse()[0]) < 0;
                    allowed = allowedCoin && allowedName;
                }
            }
            else if (recordName == "BitcoinOrdinals") {
                data = _this.filterNativeBalances({ balances: data }, _this);
                allowed = data && data.length > 0 && data[0].coin == _this.collectionChain.toLowerCase();
            }
            else if (recordName == "Ethscription") {
                allowed = firstAsset.coin == recordName.toLowerCase();
            }
            else if (balanceQty && balanceQty > 0) { // $ORDI, $OXBT
                allowed = firstAsset.balance == balanceQty && assetName == `${balanceQty} ${recordName}`;
                if (!allowed) {
                    message = `Load vault with exactly ${balanceQty} ${recordName}`;
                }
                // } else if (recordName == "Counterparty") {
                //     let facts = [
                //         {
                //             eval: record.nativeAssets.includes(data[0]?.coin),
                //             msg: `Vaults should only contain assets native to ${recordName}`
                //         },
                //         {eval: data.length == 1, msg: `Vaults should only contain a single item`},
                //         // { eval: data[0].projectName && data[0].projectName == recordName, msg: `Vaults should only contain a single item` }
                //     ]
                //     allowed = evaluateFacts(allowed, facts, msgCallback)
            }
            else if (recordName == "Stamps") {
                let allowedName = assetName.toLowerCase().includes("stamp");
                allowed = allowedName &&
                    firstAsset.project &&
                    record.nativeAssets.includes(firstAsset.coin) &&
                    (recordName.toLowerCase() == firstAsset.project.toLowerCase() || firstAsset.project.toLowerCase() == "stampunks");
            }
            else if (recordName == "EmblemOpen") {
                allowed = true;
            }
            else if (recordName == "Bells") {
                allowed = assetName == "Bel" && firstAsset.balance > 0 && Number.isInteger(data[0].balance);
            }
            else if (recordName == "Namecoin") {
                allowed = record.nativeAssets.includes(data[0].coin);
            }
            else if (recordName == "Embels") {
                allowed = _this.name.toLowerCase() == recordName.toLowerCase();
                if (allowed && firstAsset.coin) {
                    allowed = _this.nativeAssets.includes(data[0].coin);
                }
            }
            else if (recordName == "Bitcoin DeGods") {
                allowed = firstAsset.coin == "ordinalsbtc" && firstAsset.balance == 1 && firstAsset.project == "DeGods";
            }
            else if (recordName == "dot_id" || recordName == "dot_bit" || recordName == "Twitter Eggs" || recordName == "Blockhead" || recordName == "punycodes") {
                data = _this.filterNativeBalances({ balances: data }, _this);
                allowed = data[0].project == recordName;
            }
            else if (PROJECTS_DATA.includes(recordName)) { // XCP
                allowed = !!exports.NFT_DATA[assetName] &&
                    exports.NFT_DATA[assetName]["projectName"].toLowerCase() == recordName.toLowerCase() &&
                    firstAsset.project == _this.name && firstAsset.balance == 1;
            }
            else if (_this.vaultCollectionType && _this.vaultCollectionType == "protocol") {
                allowed = firstAsset.coin.toLowerCase() == _this.collectionChain.toLowerCase();
                if (!allowed) {
                    message = `Found ${firstAsset.coin} asset, expected ${_this.collectionChain} asset.`;
                }
            }
            else if (recordName == "COVAL Timelock") {
                let covalAssets = data.filter((item) => item.name == "Circuits of Value");
                let covalTotalBalance = covalAssets.reduce((acc, item) => acc + item.balance, 0);
                allowed = covalTotalBalance == 5000 || covalTotalBalance == 50000 || covalTotalBalance == 500000;
            }
            else if (_this.vaultCollectionType && _this.vaultCollectionType == "collection") {
                if (recordName == "Bitcoin Punks") {
                    firstAsset = _this.filterNativeBalances({ balances: data }, _this)[0];
                }
                const allowedChain = firstAsset.coin.toLowerCase() == _this.collectionChain.toLowerCase();
                if (!allowedChain) {
                    message = `Found ${firstAsset.coin} asset, expected ${_this.collectionChain} asset.`;
                }
                const allowedProject = firstAsset.project == recordName;
                if (!allowedProject) {
                    message = (message ? `${message} ` : '') +
                        `Found asset from ${firstAsset.project} collection, expected asset from  ${recordName} collection.`;
                }
                allowed = allowedChain && allowedProject;
            }
            else if (_this) {
                data = _this.filterNativeBalances({ balances: data }, _this);
                allowed = data[0].project == recordName;
            }
            if (message && msgCallback) {
                msgCallback(message);
            }
            return allowed;
        },
        /**
         * allowedName function is deprecated. It used to be called by callers like Emblem website
         * to determine if an asset with a given name was allowed in a vault.
         * This functionality is now part of the "allowed" function instead.
         *
         *  @deprecated
         */
        allowedName: (asset, msgCallback = null) => {
            return true;
        },
        allowedJump: (ownership_balances, _this) => {
            let hasAnyBalance = ownership_balances && ownership_balances.status != "claimed";
            let allowedJump = false;
            if (hasAnyBalance && recordName != "Rinkeby") {
                let filteredBalances = _this.filterNativeBalances(ownership_balances, _this);
                if ((_this.vaultCollectionType == "protocol" && filteredBalances.length >= 1 && filteredBalances.every((balance) => balance.coin.toLowerCase() == _this.collectionChain.toLowerCase())) || filteredBalances.length == 1) {
                    allowedJump = _this.allowed(filteredBalances, _this);
                }
                else {
                    allowedJump = false;
                }
            }
            return allowedJump;
        },
        allowedNetwork: (fromNetwork, toNetwork, msgCallback = null) => {
            return fromNetwork == toNetwork; // don't allow cross chain
        },
        filterNativeBalances: (balance, _this) => {
            let filtered = balance.balances.filter((item) => !_this.nativeAssets.includes(item.name));
            return filtered;
        },
        address: (addresses) => {
            return addresses.filter(item => { return item.coin === addressChain; })[0].address;
        },
        addresses: (addresses, _this) => {
            return _this.nativeAssets.includes("*") ? addresses : addresses.filter(item => { return item.coin === addressChain; });
        },
        balanceExplorer(address) {
            return `https://xchain.io/address/${address}`;
        },
        generateVaultBody: (metadata, balance, _this, msgCallback) => {
            let nameAndImage = { name: metadata.targetAsset.name, image: metadata.targetAsset.image || _this.loading() };
            let filtered = balance && balance.length > 0 && _this.filterNativeBalances ? _this.filterNativeBalances({ balances: balance }, _this) : balance;
            let externalUrl = false;
            if (_this.autoLoad && balance && balance.length > 0) { // Is auto load and has a balance
                if (filtered && filtered.length > 0) {
                    nameAndImage.name = filtered[0].name;
                    nameAndImage.assetName = filtered[0].name;
                    nameAndImage.image = filtered[0].image ? filtered[0].image : nameAndImage.image;
                    externalUrl = filtered[0].external_url ? filtered[0].external_url : externalUrl;
                    // can I over write balance here?
                }
                else {
                    nameAndImage.name = balance[0].name;
                    nameAndImage.assetName = balance[0].name;
                    nameAndImage.image = balance[0].image ? balance[0].image : nameAndImage.image;
                    externalUrl = balance[0].external_url ? balance[0].external_url : externalUrl;
                }
                if (filtered && filtered[0].balance && (filtered[0].type != "nft" || filtered[0].balance > 1)) {
                    nameAndImage.name = filtered[0].balance.toString().split('.')[0] + ' ' + nameAndImage.name;
                }
                else if (balance && balance[0].balance && (balance[0].type != "nft" || balance[0].balance > 1) && filtered[0].balance < 1) {
                    nameAndImage.name = balance[0].balance.toString().split('.')[0] + ' ' + nameAndImage.name;
                }
            }
            else if (!_this.autoLoad) {
                // not sure yet
                if (balance && balance.length > 0) {
                    nameAndImage.name = balance[0].name;
                    nameAndImage.assetName = balance[0].name;
                    nameAndImage.image = balance[0].image ? balance[0].image : nameAndImage.image;
                    externalUrl = balance[0].external_url ? balance[0].external_url : externalUrl;
                }
            }
            // handle xcp image urls
            let assetInformation = exports.NFT_DATA[nameAndImage.name] ? exports.NFT_DATA[nameAndImage.name] : false;
            if (assetInformation) {
                if (assetInformation.image) {
                    nameAndImage.image = assetInformation.image;
                }
                if (assetInformation.series) {
                    nameAndImage.name += ' | Series ' + assetInformation.series;
                }
                if (assetInformation.order) {
                    nameAndImage.name += ' Card ' + assetInformation.order;
                }
                if (assetInformation.video) {
                    nameAndImage.animation_url = assetInformation.video;
                }
            }
            if (nameAndImage.image.includes("STAMP:")) {
                nameAndImage.image = nameAndImage.image.replace("STAMP:", 'data:image/png:base64,');
            }
            if (_this.imageHandler) {
                nameAndImage.image = _this.imageHandler + nameAndImage.image;
            }
            if (metadata.targetAsset.contentType && metadata.targetAsset.contentType.embed && metadata.targetAsset.contentType.valid) {
                nameAndImage.animation_url = metadata.targetAsset.image;
                nameAndImage.image = _this.loading();
            }
            if (externalUrl) {
                nameAndImage.explorer = `from the [${exports.COIN_TO_NETWORK[_this.collectionChain]} blockchain](${externalUrl})`;
            }
            nameAndImage.description = `Curated ${_this.name} Collection: `;
            // Emblem Open Description
            if (_this.loadTypes.includes('detailed')) {
                if (balance && balance.length > 0) {
                    nameAndImage.description = `${nameAndImage.description}\n\n`;
                    balance.forEach((item) => {
                        item.balance && item.coin && item.name ? (nameAndImage.description = `${nameAndImage.description} * ${item.balance} ${item.name} on ${item.coin}\n\n`) : null;
                    });
                }
                nameAndImage.description = nameAndImage.description + metadata.targetAsset.description + `.\n\n${_this.description}`;
            }
            else {
                let balanceDescription = '';
                if (filtered && filtered.length > 0) {
                    if (filtered[0].balance) {
                        balanceDescription = filtered[0].balance;
                    }
                    else if (filtered) {
                        balanceDescription = '1';
                    }
                }
                else {
                    if (balance && balance.length > 0 && balance[0].balance) {
                        balanceDescription = balance[0].balance;
                    }
                    else if (balance) {
                        balanceDescription = '1';
                    }
                }
                let descriptionContents = balanceDescription ? `This vault contains ${balanceDescription} ${nameAndImage.assetName} ${nameAndImage.explorer}.` : '';
                nameAndImage.description = nameAndImage.description + `${descriptionContents}\n\n${_this.description}`;
            }
            let viewOnEmblemFinanceLink = '';
            if (_this.collectionType === "ERC1155") {
                viewOnEmblemFinanceLink = `\n\n[View on Emblem.finance](https://emblem.finance/nft2?id=${metadata.targetContract.tokenId})`;
            }
            else if (_this.collectionType === "ERC721a") {
                viewOnEmblemFinanceLink = `\n\n[View on Emblem.finance](https://emblem.finance/nft2?id=${metadata.tokenId})`;
            }
            nameAndImage.description = nameAndImage.description + viewOnEmblemFinanceLink;
            return nameAndImage;
        },
        generateCreateTemplate: (_this) => {
            let template = {
                fromAddress: { type: "user-provided" },
                toAddress: { type: "user-provided" },
                chainId: { type: "user-provided" },
                experimental: true,
                targetContract: {
                    "name": _this.name,
                    "description": _this.description,
                    "fusion": _this.fusion
                },
                targetAsset: {
                    name: _this.loadTypes.includes('detailed') ? { type: "user-provided" } : _this.loadTypes.includes('select') ? { type: "selection-provided" } : "Loading...",
                    image: _this.loadTypes.includes('detailed') ? { type: "user-provided" } : _this.loadTypes.includes('select') ? { type: "selection-provided" } : _this.loading(),
                    description: _this.loadTypes.includes('detailed') ? { type: "user-provided" } : null,
                    ownedImage: _this.loadTypes.includes('detailed') ? { type: "user-provided" } : null,
                    projectName: _this.loadTypes.includes('select') ? _this.name : null
                }
            };
            Object.keys(_this.contracts).forEach(address => {
                template.targetContract[address] = _this.contracts[address];
            });
            const removeNulls = (obj) => {
                Object.keys(obj).forEach(key => {
                    if (obj[key] && typeof obj[key] === 'object')
                        removeNulls(obj[key]);
                    else if (obj[key] === null)
                        delete obj[key];
                });
            };
            removeNulls(template);
            return template;
        }
    };
    Object.keys(record.contracts).forEach(key => {
        template[key] = record.contracts[key];
    });
    Object.keys(imageMethods).forEach(key => {
        template[key] = imageMethods[key];
    });
    return template;
}
function templateGuard(input) {
    if (!input)
        throw new Error(`No template provided`);
    for (const key in input) {
        if (input.hasOwnProperty(key)) {
            const value = input[key];
            // Check if the value is an object and has a "type" property
            let errors = [];
            if (value && typeof value === 'object' && 'type' in value) {
                if (value.type === 'user-provided' || value.type === 'selection-provided') {
                    errors.push(`'${key}' is a required field`);
                }
            }
            else if (typeof value === 'object') {
                // Recursively check nested objects
                try {
                    templateGuard(value);
                }
                catch (e) {
                    errors.push(e.message);
                }
            }
            else if (value === "") {
                errors.push(`'${key}' is a required field`);
            }
            else if (value === false) {
                // false is allowed, do nothing
            }
            if (errors.length > 0) {
                throw new Error(errors.join(", "));
            }
        }
    }
}
function genericGuard(input, type, key) {
    if (!input)
        throw new Error(`No ${key} provided`);
    if (typeof input !== type)
        throw new Error(`Invalid ${key} provided`);
}
function getQuoteContractObject(web3) {
    return __awaiter(this, void 0, void 0, function* () {
        let contractAddress = '0xE5dec92911c78069d727a67C85936EDDbc9B02Cf';
        const quoteContract = new web3.eth.Contract(abi_json_1.default.quote, contractAddress);
        return quoteContract;
    });
}
function getHandlerContract(web3) {
    return __awaiter(this, void 0, void 0, function* () {
        let contractAddress = '0x23859b51117dbFBcdEf5b757028B18d7759a4460';
        const handlerContract = new web3.eth.Contract(abi_json_1.default.handler, contractAddress);
        return handlerContract;
    });
}
function getLegacyContract(web3) {
    return __awaiter(this, void 0, void 0, function* () {
        let contractAddress = '0x82c7a8f707110f5fbb16184a5933e9f78a34c6ab';
        const handlerContract = new web3.eth.Contract(abi_json_1.default.legacy, contractAddress);
        return handlerContract;
    });
}
function checkContentType(url) {
    return new Promise((resolve, reject) => {
        let returnVal = { valid: false };
        // Function to make fetch requests
        function fetchUrl(method) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout (probably need to make this timeout only for HEAD)
            return fetch(url, { method: method, signal: controller.signal })
                .then(response => {
                clearTimeout(timeoutId);
                if (!response.ok) {
                    returnVal.valid = false;
                    return resolve(returnVal);
                }
                else if (response.status === 200) {
                    const contentType = response.headers.get('content-type');
                    if (!contentType && method === 'HEAD') {
                        // If content-type is not found in HEAD, make a GET request
                        return fetchUrl('GET');
                    }
                    else {
                        // Process the content type and resolve the promise
                        let extension = getFileExtensionFromMimeType(contentType);
                        returnVal.valid = true;
                        returnVal.contentType = contentType;
                        returnVal.extension = extension;
                        returnVal.method = method;
                        returnVal.embed = !isValidDirect(extension);
                        console.log('Content-Type:', contentType);
                        return resolve(returnVal);
                    }
                }
                else {
                    return resolve(returnVal);
                }
            })
                .catch(error => {
                clearTimeout(timeoutId);
                console.error('Error while fetching URL:', error);
                return resolve(returnVal);
            });
        }
        // Start with a HEAD request
        fetchUrl('HEAD').catch((error) => {
            console.error('Initial fetch error:', error);
            resolve(returnVal);
        });
    });
}
// export function checkContentType(url: string) {
//     return new Promise((resolve, reject) => {
//         // Making a HTTP HEAD request to get only the headers
//         type ReturnVal = { valid?: boolean, contentType?: string | null, extension?: string, embed?: boolean, method?: string};
//         let returnVal: ReturnVal = {valid: false};
//         function fetchUrl(method: string) {
//             fetch(url, { method: method })
//                 .then(response => {
//                     if (!response.ok) {
//                         returnVal.valid = false                    
//                     } 
//                     else if (response.status === 200) {
//                         const contentType = response.headers.get('content-type');
//                         if (!contentType) {
//                             return fetchUrl('GET')
//                         } else {
//                             let extension = getFileExtensionFromMimeType(contentType)
//                             returnVal.valid = true
//                             returnVal.contentType = contentType
//                             returnVal.extension = extension 
//                             returnVal.method = method
//                             returnVal.embed = !isValidDirect(extension)
//                             console.log('Content-Type:', contentType);
//                         }
//                     } 
//                     return resolve(returnVal);
//                 })
//                 .catch(error => {
//                     console.error('Error while fetching URL:', error);
//                     resolve(returnVal);
//                 });                
//         }
//         try {
//             fetchUrl('HEAD');
//         } catch (error) {
//         }
//     });
// }
function isValidDirect(extension) {
    switch (extension) {
        case '.png':
        case '.jpg':
        case '.jpeg':
        case '.gif':
        case '.webp':
        case '.tif':
        case '.tiff':
            return true;
        default:
            return false;
    }
}
function getFileExtensionFromMimeType(mimeType) {
    return mimeType ? mimeToExtensionMap[mimeType] : ''; // return an empty string if no match
}
exports.COIN_TO_NETWORK = {
    'xcp': 'BTC',
    'ordinalsbtc': 'BTC',
    'cursedordinalsbtc': 'BTC',
    'ethscription': 'ETH',
    'ordi': 'TAP',
    'oxbt': 'TAP',
    'bel': 'Bel',
    'nmc': 'Namecoin'
};
const mimeToExtensionMap = {
    // Image formats
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpe": ".jpe",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/heif": ".heif",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
    "image/tif": ".tif",
    "image/x-icon": ".ico",
    "image/svg+xml": ".svg",
    "image/heic": ".heic",
    "image/avif": ".avif",
    "image/apng": ".apng",
    "image/jp2": ".jp2",
    "image/jxr": ".jxr",
    "image/astc": ".astc",
    "image/jxl": ".jxl",
    "image/x-jng": ".jng",
    "image/x-ms-bmp": ".bmp",
    "image/x-png": ".png",
    "image/x-xbitmap": ".xbm",
    "image/x-xpixmap": ".xpm",
    "image/x-rgb": ".rgb",
    "image/x-portable-anymap": ".pnm",
    "image/x-portable-bitmap": ".pbm",
    "image/x-portable-graymap": ".pgm",
    "image/x-portable-pixmap": ".ppm",
    // Video formats
    "video/mp4": ".mp4",
    "video/x-m4v": ".m4v",
    "video/3gpp": ".3gp",
    "video/3gpp2": ".3g2",
    "video/webm": ".webm",
    "video/ogg": ".ogv",
    "video/x-msvideo": ".avi",
    "video/ms-asf": ".asf",
    "video/x-ms-wmv": ".wmv",
    "video/mpeg": ".mpeg",
    "video/quicktime": ".mov",
    "video/x-flv": ".flv",
    "video/x-matroska": ".mkv",
    "video/h264": ".h264",
    "video/h265": ".h265",
    "video/vnd.dlna.mpeg-tts": ".ts"
    // Add more mappings if needed
};
function getTorusKeys(verifierId_1, idToken_1) {
    return __awaiter(this, arguments, void 0, function* (verifierId, idToken, cb = null) {
        const FetchNodeDetails = require("@toruslabs/fetch-node-details").default;
        const TorusUtils = require("@toruslabs/torus.js").default;
        const fetchNodeDetails = new FetchNodeDetails();
        const torus = new TorusUtils({ network: "mainnet", enableOneKey: true, clientId: TORUS_CLIENT_ID });
        const { torusNodeEndpoints, torusIndexes } = yield fetchNodeDetails.getNodeDetails({ verifier: TORUS_VERIFIER, verifierId });
        let privKey = yield torus.retrieveShares(torusNodeEndpoints, torusIndexes, TORUS_VERIFIER, { verifier_id: verifierId }, idToken);
        return { privateKey: privKey };
    });
}
function decryptKeys(vaultCiphertextV2, keys, addresses) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var bytes = crypto_js_1.default.AES.decrypt(vaultCiphertextV2, keys.privateKey.privKey);
            let payload = JSON.parse(bytes.toString(crypto_js_1.default.enc.Utf8));
            // let key = phrasePathToKey(payload.phrase, 0)
            return payload; //key
            // addresses.forEach(async address=>{
            //     let key = phraseToKey(payload.phrase, 0)
            //     console.log(key)
            // })
        }
        catch (err) {
            console.log(err);
        }
    });
}
function getSatsConnectAddress() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            (0, sats_connect_1.getAddress)({
                payload: {
                    purposes: [
                        sats_connect_1.AddressPurpose.Ordinals,
                        sats_connect_1.AddressPurpose.Payment,
                    ],
                    message: "My App's Name",
                    network: {
                        type: sats_connect_1.BitcoinNetworkType.Mainnet,
                    },
                },
                onFinish: (response) => {
                    const paymentAddressItem = response.addresses.find((address) => address.purpose === sats_connect_1.AddressPurpose.Payment);
                    const ordinalsAddressItem = response.addresses.find((address) => address.purpose === sats_connect_1.AddressPurpose.Ordinals);
                    resolve({
                        paymentAddress: (paymentAddressItem === null || paymentAddressItem === void 0 ? void 0 : paymentAddressItem.address) || "",
                        paymentPublicKey: (paymentAddressItem === null || paymentAddressItem === void 0 ? void 0 : paymentAddressItem.publicKey) || "",
                        ordinalsAddress: (ordinalsAddressItem === null || ordinalsAddressItem === void 0 ? void 0 : ordinalsAddressItem.address) || ""
                    });
                },
                onCancel: () => {
                    reject("Request canceled");
                },
            });
        });
    });
}
function signPSBT(psbtBase64_1, paymentAddress_1, indexes_1) {
    return __awaiter(this, arguments, void 0, function* (psbtBase64, paymentAddress, indexes, broadcast = false) {
        return new Promise((resolve, reject) => {
            (0, sats_connect_1.signTransaction)({
                payload: {
                    network: {
                        type: sats_connect_1.BitcoinNetworkType.Mainnet,
                    },
                    message: "Sign Transaction",
                    psbtBase64,
                    broadcast: broadcast, // or false if you want to broadcast yourself
                    inputsToSign: [
                        {
                            address: paymentAddress,
                            signingIndexes: indexes, // this needs to match the number of inputs coming from the payment address
                            sigHash: 1,
                        },
                    ],
                },
                onFinish: (response) => {
                    console.log('PSBT', response.psbtBase64);
                    console.log('txid', response.txid); // only populated if broadcast is true
                    resolve(response);
                },
                onCancel: () => {
                    alert("Canceled");
                    reject(new Error("Transaction cancelled"));
                },
            });
        });
    });
}
