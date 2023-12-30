const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = require(packageJsonPath);

function bumpVersion(version, type) {
    const [major, minor, patch] = version.split('.').map(Number);
    switch (type) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        default:
            throw new Error('Invalid version bump type');
    }
}

// Example usage to bump minor version
const bumpType = process.argv[2];
packageJson.version = bumpVersion(packageJson.version, bumpType);

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
