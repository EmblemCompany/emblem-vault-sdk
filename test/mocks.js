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
  targetContract: {} // Empty object to prevent null reference errors
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
  targetContract: {}, // Empty object to prevent null reference errors
  targetAsset: {
    name: '',      // Will be populated in tests
    image: '',     // Will be populated in tests
    description: '' // Will be populated in tests
  }
};

// Mock data for API operations tests
const ethscription_contract = {
  name: 'Ethscription',
  mintable: true,
  description: 'Ethscriptions are digital artifacts inscribed to Ethereum',
  image: 'https://emblem.finance/ethscriptions.png',
  contractAddress: '0x1234567890123456789012345678901234567890'
};

const curated_contracts = [
  {
    name: 'Emblem Open',
    mintable: true,
    description: 'Open template for creating vaults',
    image: 'https://emblem.finance/emblemopen.png',
    contractAddress: '0x0987654321098765432109876543210987654321'
  },
  ethscription_contract,
  {
    name: 'Bitcoin Ordinals',
    mintable: true,
    description: 'Bitcoin Ordinals template',
    image: 'https://emblem.finance/ordinals.png',
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
  }
];

const sample_vaults = [
  {
    tokenId: '12345',
    name: 'Test Vault 1',
    description: 'A test vault for integration tests',
    image: 'https://emblem.finance/testvault1.png',
    owner: '0xb0573e14D92755DE30281f7b10d0F3a5DD3e747B',
    contractAddress: '0x0987654321098765432109876543210987654321',
    chainId: '1'
  },
  {
    tokenId: '67890',
    name: 'Test Vault 2',
    description: 'Another test vault for integration tests',
    image: 'https://emblem.finance/testvault2.png',
    owner: '0xb0573e14D92755DE30281f7b10d0F3a5DD3e747B',
    contractAddress: '0x0987654321098765432109876543210987654321',
    chainId: '1'
  }
];

const bitcoin_ordinals_metadata = [
  {
    projectName: 'Bitcoin Ordinals',
    description: 'Bitcoin Ordinals are digital artifacts on the Bitcoin blockchain',
    image: 'https://emblem.finance/ordinals.png',
    assetId: 'btc-ordinals',
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
  }
];

const project_list = [
  {
    name: 'Bitcoin Ordinals',
    description: 'Bitcoin Ordinals are digital artifacts on the Bitcoin blockchain',
    image: 'https://emblem.finance/ordinals.png'
  },
  {
    name: 'Ethscriptions',
    description: 'Ethscriptions are digital artifacts inscribed to Ethereum',
    image: 'https://emblem.finance/ethscriptions.png'
  }
];

const created_vault_response = {
  data: {
    tokenId: '123456789',
    name: 'Test Vault',
    description: 'Test vault created by automated tests',
    image: 'https://emblem.finance/stamps.png',
    owner: '0xb0573e14D92755DE30281f7b10d0F3a5DD3e747B',
    contractAddress: '0x0987654321098765432109876543210987654321',
    chainId: '1',
    status: 'created'
  }
};

module.exports = {
  empty_create_template,
  emblemopen_create_template,
  ethscription_contract,
  curated_contracts,
  sample_vaults,
  bitcoin_ordinals_metadata,
  project_list,
  created_vault_response
};
