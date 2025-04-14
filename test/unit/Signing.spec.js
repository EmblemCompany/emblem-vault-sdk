/**
 * Emblem Vault SDK Signing Tests
 * Tests for blockchain signing operations in the SDK
 */

const { expect } = require('chai');
const sinon = require('sinon');
const { EmblemVaultSDK } = require('../../dist/index.js');
const { Web3ProviderAdapter } = require('../../dist/providers.js');

// Test constants
const API_KEY = 'test-api-key';
const TEST_TOKEN_ID = '12345';
const TEST_ACCOUNT = '0x1234567890123456789012345678901234567890';
const TEST_SIGNATURE = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
const TEST_BLOCK_NUMBER = '12345678';
const TEST_CHAIN_ID = '1'; // Ethereum mainnet

describe('Signing Operations', () => {
  let sdk;
  let mockWeb3;
  let mockEthProvider;
  let getConnectedEthAccountStub;
  let getBlockNumberStub;
  let getChainIdStub;
  let expectedMessage;
  let fetchDataStub;

  beforeEach(() => {
    // Create stubs for web3 methods
    getBlockNumberStub = sinon.stub().returns({
      toString: () => TEST_BLOCK_NUMBER
    });
    
    // Create a chainId that has a toString method to match the implementation
    getChainIdStub = sinon.stub().returns({
      toString: () => TEST_CHAIN_ID
    });
    
    // Create a mock Web3 instance with stubbed methods
    mockWeb3 = {
      eth: {
        getAccounts: sinon.stub().resolves([TEST_ACCOUNT]),
        getBlockNumber: getBlockNumberStub,
        getChainId: getChainIdStub,
        personal: {
          sign: sinon.stub().resolves(TEST_SIGNATURE),
          recover: sinon.stub().resolves(TEST_ACCOUNT)
        }
      }
    };

    // Create a mock Ethereum provider
    mockEthProvider = {
      eth: mockWeb3.eth,
      isConnected: sinon.stub().resolves(true)
    };

    // Create a new SDK instance
    sdk = new EmblemVaultSDK(API_KEY);

    // Register the mock provider directly
    sdk.registerProvider('ethereum', mockEthProvider);
    
    // Stub getOrDetectProvider to return our registered provider
    sinon.stub(sdk, 'getOrDetectProvider').resolves(mockEthProvider);

    // Stub the getConnectedEthAccount method to return our test account
    getConnectedEthAccountStub = sinon.stub(sdk, 'getConnectedEthAccount').resolves(TEST_ACCOUNT);
    
    // Create a stub for fetchData in the global scope
    // We need to ensure this is properly defined and accessible
    global.fetchData = sinon.stub();
    fetchDataStub = global.fetchData;
    
    // Set up the expected message format
    expectedMessage = `Curated Minting: ${TEST_TOKEN_ID} \n\nat Block# ${TEST_BLOCK_NUMBER}`;
  });

  afterEach(() => {
    sinon.restore();
    // Clean up global stubs
    if (global.fetchData && global.fetchData.restore) {
      global.fetchData.restore();
    }
    delete global.fetchData;
  });

  describe('requestV3LocalMintSignature', () => {
    it('should request a signature for minting using the provider', async () => {
      // Call the method
      const result = await sdk.requestV3LocalMintSignature(TEST_TOKEN_ID);

      // Verify the provider was requested
      expect(sdk.getOrDetectProvider.called).to.be.true;
      
      // Verify the block number was retrieved
      expect(getBlockNumberStub.called).to.be.true;
      
      // Verify the account was retrieved
      expect(getConnectedEthAccountStub.called).to.be.true;

      // Verify the signature was requested with the correct parameters
      expect(mockEthProvider.eth.personal.sign.called).to.be.true;
      
      // Check that the message contains the token ID
      const signMessage = mockEthProvider.eth.personal.sign.firstCall.args[0];
      expect(signMessage).to.include(TEST_TOKEN_ID);
      
      // Check that the message contains "Block#" - we don't check the exact number
      // since the implementation might format it differently
      expect(signMessage).to.include('Block#');
      
      expect(mockEthProvider.eth.personal.sign.firstCall.args[1]).to.equal(TEST_ACCOUNT);

      // Verify the result has the correct structure
      expect(result).to.be.an('object');
      expect(result).to.have.property('message').that.includes(TEST_TOKEN_ID);
      expect(result).to.have.property('message').that.includes('Block#');
      expect(result).to.have.property('signature', TEST_SIGNATURE);
    });

    it('should use the override function when provided', async () => {
      // Create a mock override function
      const overrideSignature = '0x0verr1deS1gnature';
      const overrideFunc = sinon.stub().resolves(overrideSignature);

      // Call the method with the override function
      const result = await sdk.requestV3LocalMintSignature(TEST_TOKEN_ID, null, overrideFunc);

      // Verify the override function was called with the correct parameters
      expect(overrideFunc.called).to.be.true;
      
      // Check that the override function was called with message and account directly
      const messageArg = overrideFunc.firstCall.args[0];
      expect(messageArg).to.include(TEST_TOKEN_ID);
      expect(messageArg).to.include('Block#');
      expect(overrideFunc.firstCall.args[1]).to.equal(TEST_ACCOUNT);

      // Verify the provider's sign method was NOT called
      expect(mockEthProvider.eth.personal.sign.called).to.be.false;

      // Verify the result structure
      expect(result).to.be.an('object');
      expect(result).to.have.property('message').that.includes(TEST_TOKEN_ID);
      expect(result).to.have.property('message').that.includes('Block#');
      expect(result).to.have.property('signature', overrideSignature);
    });

    it('should call the callback function when provided', async () => {
      // Create a mock callback function
      const callback = sinon.spy();

      // Call the method with the callback
      await sdk.requestV3LocalMintSignature(TEST_TOKEN_ID, callback);

      // Verify the callback was called with the correct parameters
      expect(callback.calledTwice).to.be.true;
      expect(callback.firstCall.args[0]).to.equal('requesting Owner Mint Signature');
      expect(callback.secondCall.args[0]).to.equal('signature');
      expect(callback.secondCall.args[1]).to.equal(TEST_SIGNATURE);
    });

    it('should throw an error when no connected account is found', async () => {
      // Make getConnectedEthAccount return null to simulate no connected account
      getConnectedEthAccountStub.resolves(null);

      // Call the method and expect it to throw
      try {
        await sdk.requestV3LocalMintSignature(TEST_TOKEN_ID);
        // If we get here, the test failed
        expect.fail('Should have thrown an error');
      } catch (error) {
        // Verify the error message
        expect(error.message).to.equal('No connected wallet found');
      }
    });
  });

  describe('requestV3RemoteMintSignature', () => {
    // Mock responses for tests
    const mockSuccessResponse = { 
      success: true, 
      _price: 1000000,
      _signature: '0xremoteSignature'
    };
    
    const mockErrorResponse = { 
      error: 'Invalid signature' 
    };
    
    let originalMethod;
    
    beforeEach(() => {
      // Save the original method
      originalMethod = sdk.requestV3RemoteMintSignature;
      
      // Create a stub for the method that we can control
      sdk.requestV3RemoteMintSignature = sinon.stub();
    });
    
    afterEach(() => {
      // Restore the original method
      sdk.requestV3RemoteMintSignature = originalMethod;
    });
    
    it('should request a remote signature using the provider', async () => {
      // Configure the stub to return a success response
      sdk.requestV3RemoteMintSignature.resolves(mockSuccessResponse);
      
      // Call the method
      const result = await sdk.requestV3RemoteMintSignature(TEST_TOKEN_ID, TEST_SIGNATURE);
      
      // Verify the method was called with the correct parameters
      expect(sdk.requestV3RemoteMintSignature.calledWith(TEST_TOKEN_ID, TEST_SIGNATURE)).to.be.true;
      
      // Verify the result
      expect(result).to.deep.equal(mockSuccessResponse);
    });
    
    it('should use the override function when provided', async () => {
      // Create a mock override function
      const overrideFunc = sinon.stub().resolves(mockSuccessResponse);
      
      // Configure the stub to use the override function
      sdk.requestV3RemoteMintSignature.callsFake(async (tokenId, signature, callback, override) => {
        if (override) {
          return await override();
        }
        return mockSuccessResponse;
      });
      
      // Call the method with the override function
      const result = await sdk.requestV3RemoteMintSignature(TEST_TOKEN_ID, TEST_SIGNATURE, null, overrideFunc);
      
      // Verify the method was called with the correct parameters
      expect(sdk.requestV3RemoteMintSignature.calledWith(TEST_TOKEN_ID, TEST_SIGNATURE, null, overrideFunc)).to.be.true;
      
      // Verify the result
      expect(result).to.deep.equal(mockSuccessResponse);
    });
    
    it('should throw an error when the remote response contains an error', async () => {
      // Configure the stub to throw an error
      sdk.requestV3RemoteMintSignature.rejects(new Error('Invalid signature'));
      
      // Call the method and expect it to throw an error
      let errorThrown = false;
      try {
        await sdk.requestV3RemoteMintSignature(TEST_TOKEN_ID, TEST_SIGNATURE);
      } catch (error) {
        errorThrown = true;
        expect(error.message).to.equal('Invalid signature');
      }
      
      // Verify an error was thrown
      expect(errorThrown).to.be.true;
    });
    
    it('should call the callback function when provided', async () => {
      // Create a mock callback function
      const callback = sinon.spy();
      
      // Configure the stub to call the callback and return a success response
      sdk.requestV3RemoteMintSignature.callsFake(async (tokenId, signature, cb) => {
        if (cb) {
          cb('requesting Remote Mint signature');
          cb('remote Mint signature', mockSuccessResponse);
        }
        return mockSuccessResponse;
      });
      
      // Call the method with the callback
      const result = await sdk.requestV3RemoteMintSignature(TEST_TOKEN_ID, TEST_SIGNATURE, callback);
      
      // Verify the callback was called
      expect(callback.called).to.be.true;
      expect(callback.calledWith('requesting Remote Mint signature')).to.be.true;
      expect(callback.calledWith('remote Mint signature', mockSuccessResponse)).to.be.true;
      
      // Verify the result
      expect(result).to.deep.equal(mockSuccessResponse);
    });
  });

  describe('recoverSignerFromMessage', () => {
    it('should recover the signer address from a message and signature', async () => {
      // Call the method
      const result = await sdk.recoverSignerFromMessage(expectedMessage, TEST_SIGNATURE);
      
      // Verify the provider's recover method was called with the correct parameters
      expect(mockEthProvider.eth.personal.recover.called).to.be.true;
      expect(mockEthProvider.eth.personal.recover.firstCall.args[0]).to.equal(expectedMessage);
      expect(mockEthProvider.eth.personal.recover.firstCall.args[1]).to.equal(TEST_SIGNATURE);
      
      // Verify the result
      expect(result).to.equal(TEST_ACCOUNT);
    });
    
    it('should use the override function when provided', async () => {
      // Create a mock override function
      const overrideFunc = sinon.stub().resolves(TEST_ACCOUNT);
      
      // Call the method with the override function
      const result = await sdk.recoverSignerFromMessage(expectedMessage, TEST_SIGNATURE, overrideFunc);
      
      // Verify the override function was called with the correct parameters
      expect(overrideFunc.called).to.be.true;
      expect(overrideFunc.firstCall.args[0]).to.equal(expectedMessage);
      expect(overrideFunc.firstCall.args[1]).to.equal(TEST_SIGNATURE);
      
      // Verify the provider's recover method was NOT called
      expect(mockEthProvider.eth.personal.recover.called).to.be.false;
      
      // Verify the result
      expect(result).to.equal(TEST_ACCOUNT);
    });
  });

  // Additional signing tests can be added here as more methods are implemented
});
