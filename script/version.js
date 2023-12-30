const fs = require('fs');
const packageJson = require('../package.json');

const sdkFile = './build/index.js'; // Adjust the path as necessary
let sdkCode = fs.readFileSync(sdkFile, 'utf8');
sdkCode = sdkCode.replace('__SDK_VERSION__', packageJson.version);

fs.writeFileSync(sdkFile, sdkCode);
