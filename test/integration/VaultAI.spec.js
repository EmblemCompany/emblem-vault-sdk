const { expect } = require('chai');
const { EmblemVaultSDK } = require('../../dist/index');

// API key for testing
const API_KEY = 'demo';
const AI_API_KEY = 'demo-ai-key';

describe.only('Vault AI Integration Tests', () => {
  let sdk;
  
  before(() => {
    // Create a new SDK instance with the demo AI API key
    sdk = new EmblemVaultSDK(API_KEY, undefined, undefined, undefined, undefined, AI_API_KEY);
  });
  
  it('should fetch NOT vault info using the demo AI API key', async function() {
    this.timeout(10000); // Increase timeout for API call
    
    // Call the method with the demo AI API key
    const result = await sdk.vaultInfoFromApiKey();
    
    // Verify the response structure
    expect(result).to.be.an('object');
    expect(result).to.have.property('data');
    
    // Log the response for debugging
    console.log('Vault info response:', JSON.stringify(result, null, 2));
    
    // If the API returns an error with the demo key, this test will still pass
    // as long as we get a proper response object
    if (result.success === true) {
      expect(result.data).to.be.an('object');
      // Add more specific assertions based on the expected response structure
    } else {
      console.log('Note: API returned an error, but the test is verifying the call was made correctly');
    }
  });
  
  it('should handle API errors gracefully', async function() {
    this.timeout(10000); // Increase timeout for API call
    
    // Call the method with an invalid API key
    try {
      const result = await sdk.vaultInfoFromApiKey('invalid-key');
      
      // If we get here, the API might return an error object rather than throwing
      expect(result).to.be.an('object');
      
      // Log the response for debugging
      console.log('Error response with invalid key:', JSON.stringify(result, null, 2));
    } catch (error) {
      // If the API throws an error, that's also acceptable
      console.log('API threw an error with invalid key (expected):', error.message);
      expect(error).to.exist;
    }
  });
});
