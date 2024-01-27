import { MetaData } from "./types";
import metadataJson from './curated/metadata.json';
import abi from './abi/abi.json';
export const NFT_DATA: any = metadataJson

export const pad = (num: string | any[], size: number) => {
    if (!num) return null;
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

export const evaluateFacts = (allowed: boolean, facts: { eval: any; msg: string }[], msgCallback: any) => {
    let reasons: string[] = []
    allowed = facts.every(fact => {
        if (!fact.eval) {
            reasons.push(fact.msg)
        }
        return fact.eval
    })
    if (reasons.length > 0 && msgCallback) {
        msgCallback(reasons.join(' '))
    }
    return allowed
}

export const metadataObj2Arr = (data: any) => Object.keys(data).map(key => ({
    ...data[key],
    assetName: key
}));

export const metadataAllProjects = (projects: any[]) => projects.reduce((unique: any[], item: any) => {
    if (!unique.includes(item.projectName)) {
      unique.push(item.projectName);
    }
    return unique;
  }, []);

export const fetchData = async (url: string, apiKey: string, method: string = 'GET', body: any = null) => {
    const options: any = {
        method: method,
        headers: { 'x-api-key': apiKey },
    };
    if (method === 'POST' && body) {
        options.body = JSON.stringify(body);
        options.headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, options);
    return await response.json();
};

export function generateAttributeTemplate(record: any) {
    let template: any = []
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
        record.name == "Sarutobi Island"
    ) {
        template = [
            {
                "trait_type": "Series",
                "value": (metadata: MetaData) => {
                    return pad(NFT_DATA[metadata.targetAsset.name]?.series, 2)?.toString()
                }
            },
            {
                "trait_type": "Card",
                "value": (metadata: MetaData) => {
                    return pad(NFT_DATA[metadata.targetAsset.name]?.order, 2)?.toString()
                }
            },
            {
                "trait_type": "Total Supply",
                "value": (metadata: MetaData) => {
                    return pad(NFT_DATA[metadata.targetAsset.name]?.remaining || NFT_DATA[metadata.targetAsset.name]?.raw?.supply, 2)?.toString()
                }
            },
            {
                "trait_type": "Artist",
                "value": (metadata: MetaData) => {
                    return pad(NFT_DATA[metadata.targetAsset.name]?.raw?.artist.name, 2)?.toString();
                }
            }
        ]
        if (record.name == "Rare Pepe") {
            template.push({
                "trait_type": "Year",
                "value": (metadata: MetaData) => {
                    return (
                        NFT_DATA[metadata.targetAsset.name].series < 10 ? '2016' :
                            NFT_DATA[metadata.targetAsset.name].series > 9 &&
                                NFT_DATA[metadata.targetAsset.name].series < 31 ? '2017' :
                                '2018'
                    )
                }
            })
        }
    } else if (record.name == "Cursed Ordinal") {
        template = [
            {
                "trait_type": "Content Type",
                "value": (metadata: MetaData) => {
                    return metadata.values[0].content_type
                }
            },
            {
                "trait_type": "Ordinal Number",
                "value": (metadata: MetaData) => {
                    return metadata.values[0].name.includes("Cursed Ordinal") ? metadata.values[0].name.replace('Cursed Ordinal', '').trim() : false;
                }
            },
            {
                "trait_type": "Collection",
                "value": (metadata: MetaData) => {
                    return metadata.values[0].name.includes("Cursed Ordinal") ? false : `All:${metadata.values[0].project}`;
                }
            },
            {
                "trait_type": "Artist",
                "value": (metadata: MetaData) => {
                    let foundArtistTrait = metadata.values.length > 0 && metadata.values[0].traits ? metadata.values[0].traits.filter((item: { trait_type: string; }) => { return item.trait_type === "artist"; }) : [];
                    return foundArtistTrait.length > 0 ? foundArtistTrait[0].value : false;
                }
            }
        ]
    } else if (record.name == "Ethscription") {
        template = [
            {
                "trait_type": "Collection",
                "value": (metadata: MetaData) => {
                    return metadata.values[0].project ? `${metadata.values[0].project}` : false;
                }
            },
            {
                "trait_type": "Ethscriptions",
                "value": (metadata: MetaData) => {
                    let foundTrait = metadata.values && metadata.values.length > 0 && metadata.values[0].traits && metadata.values[0].traits.length > 0 && metadata.values[0].traits.filter((item: { trait_type: string; }) => { return item.trait_type == "Ethscriptions" }).length > 0 ? metadata.values[0].traits.filter((item: { trait_type: string; }) => { return item.trait_type == "Ethscriptions" })[0].value : false
                    return foundTrait
                }
            }
        ]
    } else if (record.name == "EmblemOpen") {
        template = [
            {
                "trait_type": "Contains",
                "value": (balanceItem: any) => {
                    return balanceItem.coin;
                },
                "type": "loop",
                "key": "values"
            }
        ]
    }
    return template
}

export function generateImageTemplate(record: any) {
    let template: any = {}
    if (record.imageHandler) {
        template.image = (data: any) => {
            return `${record.image}`
        }
    }
    if (record.loadingImages) {
        template.loading = () => {
            let images = record.loadingImages
            return images[Math.floor(Math.random() * images.length)] // Random image
        }
    } if (record.placeholderImages) {
        template.placeholder = () => {
            let images = record.placeholderImages
            return images[Math.floor(Math.random() * images.length)] // Random image
        }
    }
    return template
}

export function generateTemplate(record: any) {
    let addressChain = record.addressChain
    let attributes = generateAttributeTemplate(record)
    let imageMethods = generateImageTemplate(record)
    let recordName = record.name
    let balanceQty = record.balanceQty
    let template: any = {
        attributes,
        allowed: (data: any[], _this: any, msgCallback: any = null) => {
            let allowed = false
            if (recordName == "Cursed Ordinal") {
                allowed = data && data.length > 0 ? data[0].content_type != "application/json" && data[0].coin == "cursedordinalsbtc" : false
            } else if (recordName == "BitcoinOrdinals") {
                data = _this.filterNativeBalances({balances: data}, _this)
                allowed = data && data.length > 0 && data[0].coin == _this.collectionChain.toLowerCase()
            } else if (recordName == "Ethscription") {
                allowed = data && data.length > 0 && data[0].coin == recordName.toLowerCase()? true : false
            } else if (recordName == "$OXBT" || recordName == "$ORDI") {
                if (data && data.length > 0 && data[0].balance == balanceQty) {
                    msgCallback ? msgCallback("") : null
                    allowed = true
                } else if (data && data.length > 0 && data[0].balance != balanceQty && msgCallback) {
                    msgCallback ? msgCallback(`Load vault with exactly ${balanceQty} ${recordName}`) : null
                    allowed = false
                }
            } else if (recordName == "Counterparty") {
                let facts = [
                    { eval: record.nativeAssets.includes(data[0]?.coin), msg: `Vaults should only contain assets native to ${recordName}` },
                    { eval: data.length == 1, msg: `Vaults should only contain a single item` },
                    // { eval: data[0].projectName && data[0].projectName == recordName, msg: `Vaults should only contain a single item` }
                ]
                allowed = evaluateFacts(allowed, facts, msgCallback)
            } else if (recordName == "Stamps") {
                allowed = data && data.length > 0 && data[0].project && record.nativeAssets.includes(data[0].coin) && (recordName.toLowerCase() == data[0].project.toLowerCase() || data[0].project.toLowerCase() == "stampunks")
            } else if (recordName == "EmblemOpen") {
                allowed = data && data.length > 0 ? true : false
            } else if (recordName == "Bells") {
                allowed = data && data.length > 0 && data[0].name == "Bel" && data[0].balance > 0 && Number.isInteger(data[0].balance)
            } else if (recordName == "Namecoin") {
                allowed = data && data.length > 0 && record.nativeAssets.includes(data[0].coin) ? true: false
            } else if (recordName == "Embels") {
                allowed = _this.name.toLowerCase() == recordName.toLowerCase()
                if (allowed && data && data.length > 0 && data[0].coin) {
                    allowed = _this.nativeAssets.includes(data[0].coin)
                }
            } else if (_this.vaultCollectionType && _this.vaultCollectionType == "protocol") {                
                allowed =  data && data.length > 0 && data[0].coin.toLowerCase() == _this.collectionChain.toLowerCase()  && data[0].project  && data[0].project ==  recordName
            } else if (_this.vaultCollectionType && _this.vaultCollectionType == "collection" ) {
                allowed =  data && data.length > 0 &&  data[0].coin.toLowerCase() == _this.collectionChain.toLowerCase() && data[0].project ==  recordName
            } else { // XCP
                allowed = data && data.length > 0 && data[0].project == _this.name && data[0].balance == 1;
            }
            return allowed
        },
        allowedName: (asset: any, msgCallback: any = null) => {
            let allowedName = false
            if (recordName == "Cursed Ordinal") {
                let pieces = asset.split(' ')
                allowedName = asset.includes(recordName) && pieces.length === 3 && Number(pieces.reverse()[0]) < 0
            } else if (recordName == "Ethscription") {
                if (asset) {
                    allowedName = true
                }
            } else if (recordName == "$OXBT" || recordName == "$ORDI") {
                if (asset == `${balanceQty} ${recordName}`) {
                    allowedName = true
                } else {
                    msgCallback ? msgCallback("Incorrect Asset Or Qty In Vault") : null
                    allowedName = false
                }
            } else if (recordName == "Counterparty") {
                allowedName = asset ? true : false
            } else if (recordName == "Stamps") {
                allowedName = asset && asset.toLowerCase().includes("stamp") ? true : false
            } else if (recordName == "EmblemOpen") {
                allowedName = asset ? true : false
            } else if (recordName == "Bells") {
                allowedName = asset == "Bel" ? true : false
            } else if (recordName == "Namecoin") {
                allowedName = asset? true: false
            } else if (recordName == "Embels"){
                allowedName = true
            } else if (recordName == "BitcoinOrdinals" || recordName == "BitcoinPunks" || recordName == "filthyFiat" || recordName == "Megapunks" || recordName == "TwelveFold" || recordName == "Bitcoin DeGods" || recordName == "Bitcoin Frogs" || recordName == "Ordinal Maxi Biz" || recordName == "NodeMonkes" || recordName == "Bitmap" || recordName == "Ordinal Punks" || recordName == "Bitcoin Rocks" || recordName == "OnChainMonkey (OCM) Dimentions") {
                allowedName = true
            } else { // XCP
                let curatedItemFound = NFT_DATA[asset];
                allowedName = asset && curatedItemFound ? true : false;
            }

            return allowedName
        },
        allowedJump: (ownership_balances: any, _this: any): boolean => {
            let hasAnyBalance = ownership_balances && ownership_balances.status != "claimed"
            let allowedJump = false
            if (hasAnyBalance && recordName != "Rinkeby") {
                let filteredBalances = _this.filterNativeBalances(ownership_balances, _this)
                // single
                if (filteredBalances.length == 1) {
                    allowedJump = _this.allowed(filteredBalances, _this)
                } else {
                    allowedJump = false
                }
            }
            return allowedJump
        },
        allowedNetwork: (fromNetwork: any, toNetwork: any, msgCallback: any = null) => {
            return fromNetwork == toNetwork // don't allow cross chain
        },
        filterNativeBalances: (balance: any, _this: any): any => {
            let filtered =  balance.balances.filter((item: { name: any; }) => !_this.nativeAssets.includes(item.name));
            return filtered
        },
        address: (addresses: any[]) => {
            return addresses.filter(item => { return item.coin === addressChain })[0].address
        },
        addresses: (addresses: any[], _this: any) => {
            return _this.nativeAssets.includes("*") ? addresses : addresses.filter(item => { return item.coin === addressChain })
        },
        balanceExplorer(address: string) {
            return `https://xchain.io/address/${address}`
        },
        generateVaultBody: (metadata: any, balance: any, _this: any, msgCallback: any) => {
            let nameAndImage: any = {name: metadata.targetAsset.name, image: metadata.targetAsset.image || _this.loading()}

            let filtered = balance && balance.length > 0 && _this.filterNativeBalances? _this.filterNativeBalances({balances: balance}, _this) : balance
            let externalUrl = false
            if (_this.autoLoad && balance && balance.length > 0) { // Is auto load and has a balance
                if (filtered && filtered.length > 0) {
                    nameAndImage.name = filtered[0].name
                    nameAndImage.assetName = filtered[0].name
                    nameAndImage.image = filtered[0].image? filtered[0].image : nameAndImage.image;
                    externalUrl = filtered[0].external_url? filtered[0].external_url : externalUrl
                    // can I over write balance here?
                } else {
                    nameAndImage.name = balance[0].name
                    nameAndImage.assetName = balance[0].name
                    nameAndImage.image = balance[0].image? balance[0].image : nameAndImage.image;
                    externalUrl = balance[0].external_url? balance[0].external_url : externalUrl
                }
                if (filtered && filtered[0].balance && (filtered[0].type != "nft" || filtered[0].balance > 1)) {
                    nameAndImage.name = filtered[0].balance.toString().split('.')[0] + ' ' + nameAndImage.name;
                } else if (balance && balance[0].balance && (balance[0].type != "nft" || balance[0].balance > 1) && filtered[0].balance < 1) {
                    nameAndImage.name = balance[0].balance.toString().split('.')[0] + ' ' + nameAndImage.name;
                }
            } else if (!_this.autoLoad) {
                // not sure yet
                if (balance && balance.length > 0) {
                    nameAndImage.name = balance[0].name;
                    nameAndImage.assetName = balance[0].name;
                    nameAndImage.image = balance[0].image ? balance[0].image : nameAndImage.image;
                    externalUrl = balance[0].external_url ? balance[0].external_url : externalUrl;
                }
            }
            // handle xcp image urls
            
            let assetInformation = NFT_DATA[nameAndImage.name]? NFT_DATA[nameAndImage.name] : false
            if (assetInformation) {
                if (assetInformation.image) {
                    nameAndImage.image = assetInformation.image
                }
                if (assetInformation.series) {
                    nameAndImage.name += ' | Series ' + assetInformation.series;
                                      
                }
                if (assetInformation.order) {
                    nameAndImage.name += ' Card ' + assetInformation.order;
                }
                if (assetInformation.video) {
                    nameAndImage.animation_url = assetInformation.video
                }
            }

            if (nameAndImage.image.includes("STAMP:")) {
                nameAndImage.image = nameAndImage.image.replace("STAMP:", 'data:image/png:base64,')
            } 

            if (_this.imageHandler) {
                nameAndImage.image = _this.imageHandler + nameAndImage.image
            }

            if (metadata.targetAsset.contentType && metadata.targetAsset.contentType.embed && metadata.targetAsset.contentType.valid) {
                nameAndImage.animation_url = metadata.targetAsset.image
                nameAndImage.image = _this.loading()
            }

            if (externalUrl) {     
                nameAndImage.explorer = `from the [${COIN_TO_NETWORK[_this.collectionChain]} blockchain](${externalUrl})`;
            }

            nameAndImage.description = `Curated ${_this.name} Collection: `;
            // Emblem Open Description
            if (_this.loadTypes.includes('detailed')) {
                if (balance && balance.length > 0) {
                    nameAndImage.description = `${nameAndImage.description}\n\n`
                    balance.forEach((item: { coin: string; name: any; project: any; balance: any; }) => {
                        item.balance && item.coin && item.name ? (
                            nameAndImage.description = `${nameAndImage.description} * ${item.balance} ${item.name} on ${item.coin}\n\n`
                        ) : null
                    })
                }
                nameAndImage.description = nameAndImage.description + metadata.targetAsset.description + `.\n\n${_this.description}`
            } else {
                let balanceDescription = '';
                if (filtered && filtered.length > 0) {
                    if (filtered[0].balance) {
                        balanceDescription = filtered[0].balance;
                    } else if (filtered) {
                        balanceDescription = '1';
                    }
                } else {
                    if (balance && balance.length > 0 && balance[0].balance) {
                        balanceDescription = balance[0].balance;
                    } else if (balance) {
                        balanceDescription = '1';
                    }
                }
                let descriptionContents = balanceDescription ? `This vault contains ${balanceDescription} ${nameAndImage.assetName} ${nameAndImage.explorer}.`: ''
                nameAndImage.description = nameAndImage.description + `${descriptionContents}\n\n${_this.description}`;
            }

            let viewOnEmblemFinanceLink = '';
            if (_this.collectionType === "ERC1155") {
                viewOnEmblemFinanceLink = `\n\n[View on Emblem.finance](https://emblem.finance/nft2?id=${metadata.targetContract.tokenId})`;
            } else if (_this.collectionType === "ERC721a") {
                viewOnEmblemFinanceLink = `\n\n[View on Emblem.finance](https://emblem.finance/nft2?id=${metadata.tokenId})`;
            }
            nameAndImage.description = nameAndImage.description + viewOnEmblemFinanceLink;
            
            return nameAndImage
        },
        generateCreateTemplate: (_this: any) =>{
            let template: any =  {
                fromAddress: { type: "user-provided" },
                toAddress: { type: "user-provided" },
                chainId: 1,
                experimental: true,
                targetContract: {
                    ..._this.contracts,
                    name: _this.name,
                    description: _this.loadTypes.includes('detailed') ? null: _this.description

                },
                targetAsset: {
                    name: _this.loadTypes.includes('detailed') ? { type: "user-provided"}: _this.loadTypes.includes('select')? { type: "selection-provided"}: "Loading...",
                    image: _this.loadTypes.includes('detailed') ? { type: "user-provided"}: _this.loadTypes.includes('select')? { type: "selection-provided"}: _this.loading(),
                    description: _this.loadTypes.includes('detailed') ? { type: "user-provided"}: null,
                    ownedImage: _this.loadTypes.includes('detailed') ? { type: "user-provided"}: null,
                    projectName: _this.loadTypes.includes('select')? _this.name: null
                }
            }
            const removeNulls = (obj: { [x: string]: any; }) => {
                Object.keys(obj).forEach(key => {
                    if (obj[key] && typeof obj[key] === 'object') removeNulls(obj[key]);
                    else if (obj[key] === null) delete obj[key];
                });
            };
            removeNulls(template);
            return template
        }
    }
    Object.keys(record.contracts).forEach(key => {
        template[key] = record.contracts[key]
    })
    Object.keys(imageMethods).forEach(key => {
        template[key] = imageMethods[key]
    })
    return template
}

export function templateGuard(input: { [x: string]: any; hasOwnProperty: (arg0: string) => any; }) {
    if (!input) throw new Error(`No template provided`);
    for (const key in input) {
        if (input.hasOwnProperty(key)) {
            const value = input[key];

            // Check if the value is an object and has a "type" property
            let errors = [];
            if (value && typeof value === 'object' && 'type' in value) {
                if (value.type === 'user-provided' || value.type === 'selection-provided') {
                    errors.push(`'${key}' is a required field`);
                }
            } else if (typeof value === 'object') {
                // Recursively check nested objects
                try {
                    templateGuard(value);
                } catch (e: any) {
                    errors.push(e.message);
                }
            } else if (value == "") {
                errors.push(`'${key}' is a required field`);
            }
            if (errors.length > 0) {
                throw new Error(errors.join(", "));
            }
        }
    }
}

export function genericGuard(input: any, type: string, key: string) {
    if (!input) throw new Error(`No ${key} provided`);
    if (typeof input !== type) throw new Error(`Invalid ${key} provided`);
}

export async function getQuoteContractObject(web3: any) {
    let contractAddress = '0xE5dec92911c78069d727a67C85936EDDbc9B02Cf'
    const quoteContract = new web3.eth.Contract(abi.quote, contractAddress);
    return quoteContract
}

export async function getHandlerContract(web3: any) {
    let contractAddress = '0x23859b51117dbFBcdEf5b757028B18d7759a4460'
    const handlerContract = new web3.eth.Contract(abi.handler, contractAddress);
    return handlerContract
}

export function checkContentType(url: string) {
    return new Promise((resolve, reject) => {
        // Making a HTTP HEAD request to get only the headers
        type ReturnVal = { valid?: boolean, contentType?: string | null, extension?: string, embed?: boolean };
        let returnVal: ReturnVal = {valid: false};
        try {
            fetch(url, { method: 'HEAD' })
                .then(response => {
                    if (!response.ok) {
                        returnVal.valid = false                    
                    } 
                    else if (response.status === 200) {
                        const contentType = response.headers.get('content-type');
                        let extension = getFileExtensionFromMimeType(contentType)
                        returnVal.valid = true
                        returnVal.contentType = contentType
                        returnVal.extension = extension 
                        returnVal.embed = !isValidDirect(extension)
                        console.log('Content-Type:', contentType);
                    } 
                    resolve(returnVal);
                })
                .catch(error => {
                    console.error('Error while fetching URL:', error);
                    resolve(returnVal);
                });
            } catch (error) {

            }
    });
}

function isValidDirect(extension: string) {
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

function getFileExtensionFromMimeType(mimeType: string | null) {
    return mimeType? mimeToExtensionMap[mimeType] : '';  // return an empty string if no match
}

export const COIN_TO_NETWORK: any = {
    'xcp': 'BTC',
    'ordinalsbtc': 'BTC',
    'cursedordinalsbtc': 'BTC',
    'ethscription': 'ETH',
    'ordi': 'TAP',
    'oxbt': 'TAP',
    'bel': 'Bel',
    'nmc':'Namecoin'
}

const mimeToExtensionMap: any = {
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
