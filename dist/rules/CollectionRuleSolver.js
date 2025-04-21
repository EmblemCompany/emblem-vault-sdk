"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemplate = generateTemplate;
const utils_1 = require("../utils");
const PROJECTS_DATA = projectsFromMetadataJson();
function projectsFromMetadataJson() {
    let projects = [];
    for (var key in utils_1.NFT_DATA) {
        const projectName = utils_1.NFT_DATA[key]["projectName"];
        if (!projects.includes(projectName)) {
            projects.push(projectName);
        }
    }
    return projects;
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
    let attributes = (0, utils_1.generateAttributeTemplate)(record);
    let imageMethods = (0, utils_1.generateImageTemplate)(record);
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
            if ((!data || data.length == 0)) {
                return false;
            }
            data = _this.filterNativeBalances({ balances: data }, _this);
            let allowed = false;
            let firstAsset = data[0];
            let assetName = (firstAsset === null || firstAsset === void 0 ? void 0 : firstAsset.name) ? firstAsset.name : "";
            let message = null;
            if (recordName == "Filthy Fiat") {
                allowed = firstAsset.project == recordName;
            }
            else if (recordName == "Cursed Ordinal") {
                let allowedCoin = firstAsset.content_type != "application/json" && firstAsset.coin == "cursedordinalsbtc";
                let pieces = assetName.split(' ');
                let allowedName = assetName.includes(recordName) && pieces.length === 3 && Number(pieces.reverse()[0]) < 0;
                allowed = allowedCoin && allowedName;
            }
            else if (recordName == "BitcoinOrdinals") {
                allowed = firstAsset.coin == _this.collectionChain.toLowerCase();
            }
            else if (recordName == "Ethscription") {
                allowed = firstAsset.coin == recordName.toLowerCase();
            }
            else if (balanceQty && balanceQty > 0) { // $ORDI, $OXBT
                allowed = firstAsset.balance == balanceQty && assetName == `${balanceQty} ${recordName}`;
                if (!allowed) {
                    message = `Load vault with exactly ${balanceQty} ${recordName}`;
                }
            }
            else if (recordName == "Stamps") {
                let allowedName = assetName.toLowerCase().includes("stamp");
                const hasProject = !!firstAsset.project;
                const isValidCoin = record.nativeAssets.includes(firstAsset.coin);
                const isValidProject = hasProject && (recordName.toLowerCase() === firstAsset.project.toLowerCase() || firstAsset.project.toLowerCase() === "stampunks");
                allowed = allowedName && hasProject && isValidCoin && isValidProject;
            }
            else if (recordName == "EmblemOpen") {
                allowed = true;
            }
            else if (recordName == "Bells") {
                allowed = assetName == "Bel" && firstAsset.balance > 0 && Number.isInteger(firstAsset.balance);
            }
            else if (recordName == "Namecoin") {
                allowed = record.nativeAssets.includes(firstAsset.coin);
            }
            else if (recordName == "Embels") {
                allowed = _this.name.toLowerCase() == recordName.toLowerCase();
                if (allowed && firstAsset.coin) {
                    allowed = _this.nativeAssets.includes(firstAsset.coin);
                }
            }
            else if (recordName == "Bitcoin DeGods") {
                allowed = firstAsset.coin == "ordinalsbtc" && firstAsset.balance == 1 && firstAsset.project == "DeGods";
            }
            else if (PROJECTS_DATA.includes(recordName)) { // XCP
                allowed = !!utils_1.NFT_DATA[assetName] &&
                    utils_1.NFT_DATA[assetName]["projectName"].toLowerCase() == recordName.toLowerCase() &&
                    firstAsset.project == _this.name && firstAsset.balance == 1;
            }
            else if (_this.vaultCollectionType && _this.vaultCollectionType == "protocol") {
                allowed = firstAsset.coin.toLowerCase() == _this.collectionChain.toLowerCase();
                if (!allowed) {
                    message = `Found ${firstAsset.coin} asset, expected ${_this.collectionChain} asset.`;
                }
            }
            else if (recordName == "COVAL Timelock") {
                let possibleBalances = [5000, 50000, 500000];
                let covalAssets = data.filter((item) => item.name == "Circuits of Value");
                let covalTotalBalance = covalAssets.reduce((acc, item) => acc + item.balance, 0);
                allowed = possibleBalances.includes(covalTotalBalance) || false;
                message = !allowed ? `Load vault with 5000, 50000, or 500000 Circuits of Value` : message;
            }
            else if (_this.vaultCollectionType && _this.vaultCollectionType == "collection") {
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
                allowed = firstAsset.project == recordName;
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
            let assetInformation = utils_1.NFT_DATA[nameAndImage.name] ? utils_1.NFT_DATA[nameAndImage.name] : false;
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
                nameAndImage.explorer = `from the [${utils_1.COIN_TO_NETWORK[_this.collectionChain]} blockchain](${externalUrl})`;
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
                    else {
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
                viewOnEmblemFinanceLink = `\n\n[View on Emblem.finance](https://emblem.vision/vault/${metadata.targetContract.tokenId})`;
            }
            else if (_this.collectionType === "ERC721a") {
                viewOnEmblemFinanceLink = `\n\n[View on Emblem.finance](https://emblem.vision/vault/${metadata.tokenId})`;
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
        },
        validateTemplate(template, callback) {
            // Check if template has chainId and if it's valid for this record
            if (!record[template.chainId]) {
                return callback({ valid: false, errors: [`Collection ${record.name} not minted on chainId ${template.chainId}`] });
            }
            // Check if image is valid
            if (template.targetAsset && template.targetAsset.image && typeof template.targetAsset.image === 'string') {
                return (0, utils_1.checkContentType)(template.targetAsset.image).then((imageResult) => {
                    if (!imageResult.valid) {
                        return callback({ valid: false, errors: [`Invalid image format`] });
                    }
                    return checkGuard();
                });
            }
            else {
                return checkGuard();
            }
            function checkGuard() {
                // Perform template structure validation
                const templateValidation = (0, utils_1.templateGuard)(template, { throwError: false, returnErrors: true });
                // If template structure is invalid, return that result
                if (!templateValidation.valid) {
                    return callback(templateValidation);
                }
                // If no image to validate, we're done
                if (!template.targetAsset || !template.targetAsset.image) {
                    return callback({ valid: true, errors: [] });
                }
                // If we have an image, we need to validate it
                // But since we can't do this synchronously, we'll return an object
                // that indicates the template is structurally valid
                return callback({
                    valid: true,
                    imageValidation: true,
                    imageUrl: template.targetAsset.image
                });
            }
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
//# sourceMappingURL=CollectionRuleSolver.js.map