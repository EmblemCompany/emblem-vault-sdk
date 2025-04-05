/**
 * Mock data for Emblem Vault SDK tests
 */

// Empty vault creation template
const empty_create_template = {
  contractName: 'Emblem Open',
  name: 'Test Vault',
  description: 'Test vault created by automated tests',
  image: 'https://emblem.finance/stamps.png',
  fromAddress: '', // Will be populated in tests
  toAddress: '',   // Will be populated in tests
  chainId: '1',    // Ethereum mainnet
};

// Emblem Open vault creation template with more details
const emblemopen_create_template = {
  contractName: 'Emblem Open',
  name: 'Test Vault with Asset',
  description: 'Test vault with asset created by automated tests',
  image: 'https://emblem.finance/stamps.png',
  fromAddress: '', // Will be populated in tests
  toAddress: '',   // Will be populated in tests
  chainId: '1',    // Ethereum mainnet
  targetAsset: {
    name: '',      // Will be populated in tests
    image: '',     // Will be populated in tests
    description: '' // Will be populated in tests
  }
};

module.exports = {
  empty_create_template,
  emblemopen_create_template
};
