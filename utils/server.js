const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const INCOMING_DIR = path.join(__dirname, 'incoming');
const TRAITS_DIR = path.join(__dirname, 'traits');
const VAULT_IMAGES_BASE = '/Users/shannoncode/repo/Emblem.Current/vaultImages/collection';
const SITE_METADATA_PATH = path.join(__dirname, 'emblem-site-metadata.json');
const SDK_METADATA_PATH = path.join(__dirname, 'sdk-metadata.json');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css'
};

// Helper function to convert filename to proper collection name
function getCollectionName(filename) {
    // Remove .json extension and convert hyphens to spaces, then title case
    const name = filename.replace('.json', '').split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return name;
}

// Helper function to get collection folder name (e.g., "fake-rares" from "fake-rares.json")
function getCollectionFolder(filename) {
    return filename.replace('.json', '');
}

// Handler to list available collections
async function handleListCollections(req, res) {
    try {
        const files = fs.readdirSync(INCOMING_DIR);
        const collections = files
            .filter(file => file.endsWith('.json'))
            .map(file => ({
                filename: file,
                name: getCollectionName(file),
                folder: getCollectionFolder(file)
            }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(collections, null, 2));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

// Handler to list available trait files
async function handleListTraits(req, res) {
    try {
        const files = fs.readdirSync(TRAITS_DIR);
        const traits = files
            .filter(file => file.endsWith('.json'))
            .map(file => ({
                filename: file,
                name: getCollectionName(file),
                folder: getCollectionFolder(file)
            }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(traits, null, 2));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });

            fileStream.on('error', (err) => {
                fs.unlink(filepath, () => {});
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function handleCopyImages(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items, collection } = JSON.parse(body);
            const collectionFolder = getCollectionFolder(collection);
            const targetDir = path.join(VAULT_IMAGES_BASE, collectionFolder);

            // Ensure target directory exists
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const results = {
                success: [],
                failed: [],
                skipped: []
            };

            for (const item of items) {
                const { name, image, serie } = item;
                const targetPath = path.join(targetDir, image);

                // Check if file already exists
                if (fs.existsSync(targetPath)) {
                    results.skipped.push({ name, image, reason: 'already exists' });
                    continue;
                }

                const imageUrl = `https://pepewtf.s3.amazonaws.com/collections/${collectionFolder}/small/${serie}/${image}`;

                try {
                    await downloadImage(imageUrl, targetPath);
                    results.success.push({ name, image, url: imageUrl });
                    console.log(`Downloaded: ${image}`);
                } catch (error) {
                    results.failed.push({ name, image, url: imageUrl, error: error.message });
                    console.error(`Failed to download ${image}: ${error.message}`);
                }
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

async function handleInsertToSite(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items } = JSON.parse(body);

            // Read current site metadata
            const siteDataRaw = fs.readFileSync(SITE_METADATA_PATH, 'utf8');
            const siteData = JSON.parse(siteDataRaw);

            const results = {
                added: [],
                skipped: [],
                failed: []
            };

            // Add each item
            for (const [key, value] of Object.entries(items)) {
                try {
                    if (siteData[key]) {
                        results.skipped.push({ key, reason: 'already exists in site metadata' });
                    } else {
                        siteData[key] = value;
                        results.added.push({ key, data: value });
                        console.log(`Added ${key} to site metadata`);
                    }
                } catch (error) {
                    results.failed.push({ key, error: error.message });
                    console.error(`Failed to add ${key}: ${error.message}`);
                }
            }

            // Write back to file
            if (results.added.length > 0) {
                // Create backup first
                const backupPath = SITE_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SITE_METADATA_PATH, backupPath);
                console.log(`Created backup at: ${backupPath}`);

                // Write updated data
                fs.writeFileSync(SITE_METADATA_PATH, JSON.stringify(siteData, null, 2), 'utf8');
                console.log(`Updated site metadata with ${results.added.length} new items`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

async function handleInsertToSDK(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items } = JSON.parse(body);

            // Read current SDK metadata
            const sdkDataRaw = fs.readFileSync(SDK_METADATA_PATH, 'utf8');
            const sdkData = JSON.parse(sdkDataRaw);

            const results = {
                added: [],
                skipped: [],
                failed: []
            };

            // Add each item
            for (const [key, value] of Object.entries(items)) {
                try {
                    if (sdkData[key]) {
                        results.skipped.push({ key, reason: 'already exists in SDK metadata' });
                    } else {
                        sdkData[key] = value;
                        results.added.push({ key, data: value });
                        console.log(`Added ${key} to SDK metadata`);
                    }
                } catch (error) {
                    results.failed.push({ key, error: error.message });
                    console.error(`Failed to add ${key}: ${error.message}`);
                }
            }

            // Write back to file
            if (results.added.length > 0) {
                // Create backup first
                const backupPath = SDK_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SDK_METADATA_PATH, backupPath);
                console.log(`Created backup at: ${backupPath}`);

                // Write updated data
                fs.writeFileSync(SDK_METADATA_PATH, JSON.stringify(sdkData, null, 2), 'utf8');
                console.log(`Updated SDK metadata with ${results.added.length} new items`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

async function handleRemoveOldImages(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items, target } = JSON.parse(body);

            const filePath = target === 'sdk' ? SDK_METADATA_PATH : SITE_METADATA_PATH;
            const fileName = target === 'sdk' ? 'SDK' : 'Site';

            // Read current metadata
            const dataRaw = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(dataRaw);

            const results = {
                removed: [],
                notFound: [],
                failed: []
            };

            // Remove oldImage property from each item
            for (const key of items) {
                try {
                    if (data[key]) {
                        if (data[key].oldImage) {
                            const oldImageValue = data[key].oldImage;
                            delete data[key].oldImage;
                            results.removed.push({ key, oldImageValue });
                            console.log(`Removed oldImage from ${key} in ${fileName} metadata`);
                        } else {
                            results.notFound.push({ key, reason: 'oldImage property not found' });
                        }
                    } else {
                        results.notFound.push({ key, reason: 'item not found in metadata' });
                    }
                } catch (error) {
                    results.failed.push({ key, error: error.message });
                    console.error(`Failed to process ${key}: ${error.message}`);
                }
            }

            // Write back to file
            if (results.removed.length > 0) {
                // Create backup first
                const backupPath = filePath + '.backup.' + Date.now();
                fs.copyFileSync(filePath, backupPath);
                console.log(`Created backup at: ${backupPath}`);

                // Write updated data
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                console.log(`Updated ${fileName} metadata - removed oldImage from ${results.removed.length} items`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

async function handleAddMissingProps(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items } = JSON.parse(body);

            // Read both metadata files
            const sdkDataRaw = fs.readFileSync(SDK_METADATA_PATH, 'utf8');
            const sdkData = JSON.parse(sdkDataRaw);

            const siteDataRaw = fs.readFileSync(SITE_METADATA_PATH, 'utf8');
            const siteData = JSON.parse(siteDataRaw);

            const results = {
                added: [],
                notFound: [],
                failed: []
            };

            // Add missing properties to SDK metadata
            for (const item of items) {
                const { key, missingProps, siteValues } = item;

                try {
                    if (!sdkData[key]) {
                        results.notFound.push({ key, reason: 'item not found in SDK metadata' });
                        continue;
                    }

                    if (!siteData[key]) {
                        results.notFound.push({ key, reason: 'item not found in Site metadata' });
                        continue;
                    }

                    const addedProps = [];

                    for (const prop of missingProps) {
                        if (siteData[key][prop] !== undefined) {
                            sdkData[key][prop] = siteData[key][prop];
                            addedProps.push(prop);
                        }
                    }

                    if (addedProps.length > 0) {
                        results.added.push({ key, props: addedProps });
                        console.log(`Added properties ${addedProps.join(', ')} to ${key} in SDK metadata`);
                    }
                } catch (error) {
                    results.failed.push({ key, error: error.message });
                    console.error(`Failed to add properties to ${key}: ${error.message}`);
                }
            }

            // Write back to file
            if (results.added.length > 0) {
                // Create backup first
                const backupPath = SDK_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SDK_METADATA_PATH, backupPath);
                console.log(`Created backup at: ${backupPath}`);

                // Write updated data
                fs.writeFileSync(SDK_METADATA_PATH, JSON.stringify(sdkData, null, 2), 'utf8');
                console.log(`Updated SDK metadata - added missing properties to ${results.added.length} items`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

async function handleUpdateConflicts(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items } = JSON.parse(body);

            // Read both metadata files
            const sdkDataRaw = fs.readFileSync(SDK_METADATA_PATH, 'utf8');
            const sdkData = JSON.parse(sdkDataRaw);

            const siteDataRaw = fs.readFileSync(SITE_METADATA_PATH, 'utf8');
            const siteData = JSON.parse(siteDataRaw);

            const results = {
                updated: [],
                notFound: [],
                failed: []
            };

            // Update conflicting properties in Site metadata with values from SDK
            for (const item of items) {
                const { key, conflicts } = item;

                try {
                    if (!sdkData[key]) {
                        results.notFound.push({ key, reason: 'item not found in SDK metadata' });
                        continue;
                    }

                    if (!siteData[key]) {
                        results.notFound.push({ key, reason: 'item not found in Site metadata' });
                        continue;
                    }

                    const updatedProps = [];

                    for (const conflict of conflicts) {
                        if (conflict.prop === 'image') {
                            const oldValue = siteData[key][conflict.prop];
                            siteData[key][conflict.prop] = sdkData[key][conflict.prop];
                            updatedProps.push({
                                prop: conflict.prop,
                                oldValue: oldValue,
                                newValue: sdkData[key][conflict.prop]
                            });
                        }
                    }

                    if (updatedProps.length > 0) {
                        results.updated.push({ key, props: updatedProps });
                        console.log(`Updated ${updatedProps.length} properties in ${key} in Site metadata`);
                    }
                } catch (error) {
                    results.failed.push({ key, error: error.message });
                    console.error(`Failed to update properties in ${key}: ${error.message}`);
                }
            }

            // Write back to file
            if (results.updated.length > 0) {
                // Create backup first
                const backupPath = SITE_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SITE_METADATA_PATH, backupPath);
                console.log(`Created backup at: ${backupPath}`);

                // Write updated data
                fs.writeFileSync(SITE_METADATA_PATH, JSON.stringify(siteData, null, 2), 'utf8');
                console.log(`Updated Site metadata - updated conflicting properties in ${results.updated.length} items`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

async function handleCopyVideoProps(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items } = JSON.parse(body);

            // Read both metadata files
            const sdkDataRaw = fs.readFileSync(SDK_METADATA_PATH, 'utf8');
            const sdkData = JSON.parse(sdkDataRaw);

            const siteDataRaw = fs.readFileSync(SITE_METADATA_PATH, 'utf8');
            const siteData = JSON.parse(siteDataRaw);

            const results = {
                copied: [],
                notFound: [],
                failed: []
            };

            // Copy video property from SDK to Site metadata
            for (const item of items) {
                const { key, missingProps, sdkValues } = item;

                try {
                    if (!sdkData[key]) {
                        results.notFound.push({ key, reason: 'item not found in SDK metadata' });
                        continue;
                    }

                    if (!siteData[key]) {
                        results.notFound.push({ key, reason: 'item not found in Site metadata' });
                        continue;
                    }

                    const copiedProps = [];

                    for (const prop of missingProps) {
                        if (prop === 'video' && sdkData[key][prop] !== undefined) {
                            siteData[key][prop] = sdkData[key][prop];
                            copiedProps.push({
                                prop: prop,
                                value: sdkData[key][prop]
                            });
                        }
                    }

                    if (copiedProps.length > 0) {
                        results.copied.push({ key, props: copiedProps });
                        console.log(`Copied video property to ${key} in Site metadata`);
                    }
                } catch (error) {
                    results.failed.push({ key, error: error.message });
                    console.error(`Failed to copy video property to ${key}: ${error.message}`);
                }
            }

            // Write back to file
            if (results.copied.length > 0) {
                // Create backup first
                const backupPath = SITE_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SITE_METADATA_PATH, backupPath);
                console.log(`Created backup at: ${backupPath}`);

                // Write updated data
                fs.writeFileSync(SITE_METADATA_PATH, JSON.stringify(siteData, null, 2), 'utf8');
                console.log(`Updated Site metadata - copied video properties to ${results.copied.length} items`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

async function handleUpdateSiteRawFromSDK(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items } = JSON.parse(body);

            // Read both metadata files
            const sdkDataRaw = fs.readFileSync(SDK_METADATA_PATH, 'utf8');
            const sdkData = JSON.parse(sdkDataRaw);

            const siteDataRaw = fs.readFileSync(SITE_METADATA_PATH, 'utf8');
            const siteData = JSON.parse(siteDataRaw);

            const results = {
                updated: [],
                notFound: [],
                failed: []
            };

            // Update Site 'raw' property from SDK
            for (const item of items) {
                const { key } = item;

                try {
                    if (!sdkData[key]) {
                        results.notFound.push({ key, reason: 'item not found in SDK metadata' });
                        continue;
                    }

                    if (!siteData[key]) {
                        results.notFound.push({ key, reason: 'item not found in Site metadata' });
                        continue;
                    }

                    if (!sdkData[key].raw) {
                        results.notFound.push({ key, reason: 'raw property not found in SDK metadata' });
                        continue;
                    }

                    // Copy raw property from SDK to Site
                    siteData[key].raw = sdkData[key].raw;
                    results.updated.push(key);
                    console.log(`Updated 'raw' property for ${key} in Site metadata from SDK`);
                } catch (error) {
                    results.failed.push({ key, error: error.message });
                    console.error(`Failed to update ${key}: ${error.message}`);
                }
            }

            // Write back to file
            if (results.updated.length > 0) {
                // Create Site backup
                const siteBackupPath = SITE_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SITE_METADATA_PATH, siteBackupPath);
                console.log(`Created Site backup at: ${siteBackupPath}`);

                // Write updated Site data
                fs.writeFileSync(SITE_METADATA_PATH, JSON.stringify(siteData, null, 2), 'utf8');
                console.log(`Updated Site metadata 'raw' properties from SDK - ${results.updated.length} items`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

async function handleUpdateRawProperties(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items, collection } = JSON.parse(body);

            // Read all three metadata files
            const sdkDataRaw = fs.readFileSync(SDK_METADATA_PATH, 'utf8');
            const sdkData = JSON.parse(sdkDataRaw);

            const siteDataRaw = fs.readFileSync(SITE_METADATA_PATH, 'utf8');
            const siteData = JSON.parse(siteDataRaw);

            const incomingPath = path.join(INCOMING_DIR, collection);
            const incomingRaw = fs.readFileSync(incomingPath, 'utf8');
            const incomingArray = JSON.parse(incomingRaw);

            // Convert incoming array to object keyed by name
            const incomingData = {};
            incomingArray.forEach(item => {
                if (item.name) {
                    incomingData[item.name] = item;
                }
            });

            const results = {
                sdkUpdated: [],
                siteUpdated: [],
                notFound: [],
                failed: []
            };

            // Update 'raw' property with incoming data
            for (const item of items) {
                const { key, sdkMatches, siteMatches, sdkExists, siteExists } = item;

                try {
                    const incomingItem = incomingData[key];

                    if (!incomingItem) {
                        results.notFound.push({ key, reason: `item not found in ${collection}` });
                        continue;
                    }

                    // Update SDK if it exists and doesn't match
                    if (sdkExists && !sdkMatches && sdkData[key]) {
                        sdkData[key].raw = incomingItem;
                        results.sdkUpdated.push(key);
                        console.log(`Updated 'raw' property for ${key} in SDK metadata`);
                    }

                    // Update Site if it exists and doesn't match
                    if (siteExists && !siteMatches && siteData[key]) {
                        siteData[key].raw = incomingItem;
                        results.siteUpdated.push(key);
                        console.log(`Updated 'raw' property for ${key} in Site metadata`);
                    }
                } catch (error) {
                    results.failed.push({ key, error: error.message });
                    console.error(`Failed to update ${key}: ${error.message}`);
                }
            }

            // Write back to files
            if (results.sdkUpdated.length > 0) {
                // Create SDK backup
                const sdkBackupPath = SDK_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SDK_METADATA_PATH, sdkBackupPath);
                console.log(`Created SDK backup at: ${sdkBackupPath}`);

                // Write updated SDK data
                fs.writeFileSync(SDK_METADATA_PATH, JSON.stringify(sdkData, null, 2), 'utf8');
                console.log(`Updated SDK metadata 'raw' properties - ${results.sdkUpdated.length} items`);
            }

            if (results.siteUpdated.length > 0) {
                // Create Site backup
                const siteBackupPath = SITE_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SITE_METADATA_PATH, siteBackupPath);
                console.log(`Created Site backup at: ${siteBackupPath}`);

                // Write updated Site data
                fs.writeFileSync(SITE_METADATA_PATH, JSON.stringify(siteData, null, 2), 'utf8');
                console.log(`Updated Site metadata 'raw' properties - ${results.siteUpdated.length} items`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

async function handleUpdateFromRaw(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items, collection } = JSON.parse(body);

            // Read all three metadata files
            const sdkDataRaw = fs.readFileSync(SDK_METADATA_PATH, 'utf8');
            const sdkData = JSON.parse(sdkDataRaw);

            const siteDataRaw = fs.readFileSync(SITE_METADATA_PATH, 'utf8');
            const siteData = JSON.parse(siteDataRaw);

            const incomingPath = path.join(INCOMING_DIR, collection);
            const incomingRaw = fs.readFileSync(incomingPath, 'utf8');
            const incomingArray = JSON.parse(incomingRaw);

            // Convert incoming array to object keyed by name
            const incomingData = {};
            incomingArray.forEach(item => {
                if (item.name) {
                    incomingData[item.name] = item;
                }
            });

            const results = {
                sdkUpdated: [],
                siteUpdated: [],
                notFound: [],
                failed: []
            };

            // Update conflicting properties with raw values
            for (const item of items) {
                const { key, conflicts } = item;

                try {
                    const rawItem = incomingData[key];

                    if (!rawItem) {
                        results.notFound.push({ key, reason: `item not found in ${collection}` });
                        continue;
                    }

                    const sdkUpdatedProps = [];
                    const siteUpdatedProps = [];

                    for (const conflict of conflicts) {
                        const { prop, rawValue, sdkConflict, siteConflict } = conflict;

                        // Update SDK if there's a conflict
                        if (sdkConflict && sdkData[key]) {
                            const oldValue = sdkData[key][prop];
                            sdkData[key][prop] = rawValue;
                            sdkUpdatedProps.push({
                                prop: prop,
                                oldValue: oldValue,
                                newValue: rawValue
                            });
                        }

                        // Update Site if there's a conflict
                        if (siteConflict && siteData[key]) {
                            const oldValue = siteData[key][prop];
                            siteData[key][prop] = rawValue;
                            siteUpdatedProps.push({
                                prop: prop,
                                oldValue: oldValue,
                                newValue: rawValue
                            });
                        }
                    }

                    if (sdkUpdatedProps.length > 0) {
                        results.sdkUpdated.push({ key, props: sdkUpdatedProps });
                        console.log(`Updated ${sdkUpdatedProps.length} properties in ${key} in SDK metadata from raw source`);
                    }

                    if (siteUpdatedProps.length > 0) {
                        results.siteUpdated.push({ key, props: siteUpdatedProps });
                        console.log(`Updated ${siteUpdatedProps.length} properties in ${key} in Site metadata from raw source`);
                    }
                } catch (error) {
                    results.failed.push({ key, error: error.message });
                    console.error(`Failed to update ${key}: ${error.message}`);
                }
            }

            // Write back to files
            let sdkBackupPath, siteBackupPath;

            if (results.sdkUpdated.length > 0) {
                // Create SDK backup
                sdkBackupPath = SDK_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SDK_METADATA_PATH, sdkBackupPath);
                console.log(`Created SDK backup at: ${sdkBackupPath}`);

                // Write updated SDK data
                fs.writeFileSync(SDK_METADATA_PATH, JSON.stringify(sdkData, null, 2), 'utf8');
                console.log(`Updated SDK metadata from raw source - ${results.sdkUpdated.length} items`);
            }

            if (results.siteUpdated.length > 0) {
                // Create Site backup
                siteBackupPath = SITE_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SITE_METADATA_PATH, siteBackupPath);
                console.log(`Created Site backup at: ${siteBackupPath}`);

                // Write updated Site data
                fs.writeFileSync(SITE_METADATA_PATH, JSON.stringify(siteData, null, 2), 'utf8');
                console.log(`Updated Site metadata from raw source - ${results.siteUpdated.length} items`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

async function handleApplyTraitMappings(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items } = JSON.parse(body);

            // Read current metadata files
            const sdkDataRaw = fs.readFileSync(SDK_METADATA_PATH, 'utf8');
            const sdkData = JSON.parse(sdkDataRaw);

            const siteDataRaw = fs.readFileSync(SITE_METADATA_PATH, 'utf8');
            const siteData = JSON.parse(siteDataRaw);

            const results = {
                sdkUpdated: 0,
                siteUpdated: 0,
                failed: []
            };

            // Update each item with the mapped properties - ONLY if they already exist
            Object.keys(items).forEach(key => {
                try {
                    const mappedItem = items[key];

                    // Update SDK metadata ONLY if item already exists
                    if (sdkData[key]) {
                        // Merge existing with new mapped data
                        sdkData[key] = {
                            ...sdkData[key],
                            ...mappedItem,
                            // Preserve and merge raw data
                            raw: {
                                ...sdkData[key].raw,
                                ...mappedItem.raw
                            }
                        };
                        results.sdkUpdated++;
                        console.log(`Updated existing item ${key} in SDK metadata`);
                    }

                    // Update Site metadata ONLY if item already exists
                    if (siteData[key]) {
                        // Merge existing with new mapped data
                        siteData[key] = {
                            ...siteData[key],
                            ...mappedItem,
                            // Preserve and merge raw data
                            raw: {
                                ...siteData[key].raw,
                                ...mappedItem.raw
                            }
                        };
                        results.siteUpdated++;
                        console.log(`Updated existing item ${key} in Site metadata`);
                    }

                } catch (error) {
                    results.failed.push({ key, error: error.message });
                    console.error(`Failed to update ${key}: ${error.message}`);
                }
            });

            // Write back to files if there are updates
            if (results.sdkUpdated > 0) {
                // Create SDK backup
                const sdkBackupPath = SDK_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SDK_METADATA_PATH, sdkBackupPath);
                console.log(`Created SDK backup at: ${sdkBackupPath}`);

                // Write updated SDK data
                fs.writeFileSync(SDK_METADATA_PATH, JSON.stringify(sdkData, null, 2), 'utf8');
                console.log(`Updated SDK metadata with trait mappings - ${results.sdkUpdated} items`);
            }

            if (results.siteUpdated > 0) {
                // Create Site backup
                const siteBackupPath = SITE_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SITE_METADATA_PATH, siteBackupPath);
                console.log(`Created Site backup at: ${siteBackupPath}`);

                // Write updated Site data
                fs.writeFileSync(SITE_METADATA_PATH, JSON.stringify(siteData, null, 2), 'utf8');
                console.log(`Updated Site metadata with trait mappings - ${results.siteUpdated} items`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

async function handleAddMissingItemsToBoth(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { items, collection } = JSON.parse(body);
            const collectionFolder = getCollectionFolder(collection);
            const collectionName = getCollectionName(collection);

            // Read all three metadata files
            const sdkDataRaw = fs.readFileSync(SDK_METADATA_PATH, 'utf8');
            const sdkData = JSON.parse(sdkDataRaw);

            const siteDataRaw = fs.readFileSync(SITE_METADATA_PATH, 'utf8');
            const siteData = JSON.parse(siteDataRaw);

            const incomingPath = path.join(INCOMING_DIR, collection);
            const incomingRaw = fs.readFileSync(incomingPath, 'utf8');
            const incomingArray = JSON.parse(incomingRaw);

            // Convert incoming array to object keyed by name
            const incomingData = {};
            incomingArray.forEach(item => {
                if (item.name) {
                    incomingData[item.name] = item;
                }
            });

            const results = {
                sdkAdded: [],
                siteAdded: [],
                skipped: [],
                failed: []
            };

            // Add missing items to both SDK and Site
            for (const missingItem of items) {
                const { name } = missingItem;

                try {
                    const incomingItem = incomingData[name];

                    if (!incomingItem) {
                        results.failed.push({ name, reason: `item not found in ${collection}` });
                        continue;
                    }

                    // Determine image file extension from the 'image' field in incoming
                    const imageFileName = incomingItem.image || '';
                    const extension = imageFileName.split('.').pop() || 'jpeg';

                    // Create the template structure
                    const templateItem = {
                        image: `https://raw.githubusercontent.com/EmblemCompany/vaultImages/master/collection/${collectionFolder}/${name}.${extension}`,
                        projectName: collectionName,
                        series: incomingItem.serie || 0,  // Fix spelling: serie -> series
                        order: incomingItem.card || 0,
                        projectProtocol: "Counterparty",
                        raw: incomingItem  // Complete incoming object
                    };

                    let addedToSdk = false;
                    let addedToSite = false;

                    // Add to SDK if it doesn't exist
                    if (!sdkData[name]) {
                        sdkData[name] = templateItem;
                        addedToSdk = true;
                        results.sdkAdded.push(name);
                        console.log(`Added ${name} to SDK metadata`);
                    }

                    // Add to Site if it doesn't exist
                    if (!siteData[name]) {
                        siteData[name] = templateItem;
                        addedToSite = true;
                        results.siteAdded.push(name);
                        console.log(`Added ${name} to Site metadata`);
                    }

                    // If both already exist, mark as skipped
                    if (!addedToSdk && !addedToSite) {
                        results.skipped.push({ name, reason: 'already exists in both SDK and Site' });
                    }
                } catch (error) {
                    results.failed.push({ name, error: error.message });
                    console.error(`Failed to add ${name}: ${error.message}`);
                }
            }

            // Write back to files
            if (results.sdkAdded.length > 0) {
                // Create SDK backup
                const sdkBackupPath = SDK_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SDK_METADATA_PATH, sdkBackupPath);
                console.log(`Created SDK backup at: ${sdkBackupPath}`);

                // Write updated SDK data
                fs.writeFileSync(SDK_METADATA_PATH, JSON.stringify(sdkData, null, 2), 'utf8');
                console.log(`Added ${results.sdkAdded.length} items to SDK metadata`);
            }

            if (results.siteAdded.length > 0) {
                // Create Site backup
                const siteBackupPath = SITE_METADATA_PATH + '.backup.' + Date.now();
                fs.copyFileSync(SITE_METADATA_PATH, siteBackupPath);
                console.log(`Created Site backup at: ${siteBackupPath}`);

                // Write updated Site data
                fs.writeFileSync(SITE_METADATA_PATH, JSON.stringify(siteData, null, 2), 'utf8');
                console.log(`Added ${results.siteAdded.length} items to Site metadata`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results, null, 2));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);

    // Handle GET request to list available collections
    if (req.method === 'GET' && req.url === '/list-collections') {
        handleListCollections(req, res);
        return;
    }

    // Handle GET request to list available trait files
    if (req.method === 'GET' && req.url === '/list-traits') {
        handleListTraits(req, res);
        return;
    }

    // Handle POST request to copy images
    if (req.method === 'POST' && req.url === '/copy-images') {
        handleCopyImages(req, res);
        return;
    }

    // Handle POST request to insert items to site metadata
    if (req.method === 'POST' && req.url === '/insert-to-site') {
        handleInsertToSite(req, res);
        return;
    }

    // Handle POST request to insert items to SDK metadata
    if (req.method === 'POST' && req.url === '/insert-to-sdk') {
        handleInsertToSDK(req, res);
        return;
    }

    // Handle POST request to remove redundant oldImage properties
    if (req.method === 'POST' && req.url === '/remove-old-images') {
        handleRemoveOldImages(req, res);
        return;
    }

    // Handle POST request to add missing properties
    if (req.method === 'POST' && req.url === '/add-missing-props') {
        handleAddMissingProps(req, res);
        return;
    }

    // Handle POST request to update conflicting properties
    if (req.method === 'POST' && req.url === '/update-conflicts') {
        handleUpdateConflicts(req, res);
        return;
    }

    // Handle POST request to copy video properties
    if (req.method === 'POST' && req.url === '/copy-video-props') {
        handleCopyVideoProps(req, res);
        return;
    }

    // Handle POST request to update Site raw from SDK
    if (req.method === 'POST' && req.url === '/update-site-raw-from-sdk') {
        handleUpdateSiteRawFromSDK(req, res);
        return;
    }

    // Handle POST request to update raw properties
    if (req.method === 'POST' && req.url === '/update-raw-properties') {
        handleUpdateRawProperties(req, res);
        return;
    }

    // Handle POST request to update from raw source
    if (req.method === 'POST' && req.url === '/update-from-raw') {
        handleUpdateFromRaw(req, res);
        return;
    }

    // Handle POST request to add missing items to both SDK and Site
    if (req.method === 'POST' && req.url === '/add-missing-items-to-both') {
        handleAddMissingItemsToBoth(req, res);
        return;
    }

    // Handle POST request to apply trait mappings
    if (req.method === 'POST' && req.url === '/apply-trait-mappings') {
        handleApplyTraitMappings(req, res);
        return;
    }

    // Handle GET requests for files
    let filePath = '.' + req.url;

    if (filePath === './') {
        filePath = './compare-metadata.html';
    }

    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open your browser to http://localhost:${PORT}/`);
});
