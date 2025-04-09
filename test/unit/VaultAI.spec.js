const { expect } = require('chai');
const { EmblemVaultSDK } = require('../../dist/index');

// API key for testing
const API_KEY = 'test-api-key';
const AI_API_KEY = 'test-ai-api-key';
const AI_URL = 'https://api.emblemvault.ai';

describe('Emblem Vault AI', () => {
  describe('Vault AI Operations', () => {
    let sdk;
    
    beforeEach(() => {
      // Create a new SDK instance with custom AI URL and API key for testing
      sdk = new EmblemVaultSDK(API_KEY, undefined, undefined, undefined, AI_URL, AI_API_KEY);
    });
    
    it('should use the correct URL and API key when getting vault info', async () => {
      // Track the URL, API key, and headers that were passed to the override function
      let capturedUrl;
      let capturedApiKey;
      let capturedMethod;
      let capturedBody;
      let capturedHeaders;
      
      // Create an override function that captures all parameters
      const overrideFunc = (url, apiKey, method, body, headers) => {
        capturedUrl = url;
        capturedApiKey = apiKey;
        capturedMethod = method;
        capturedBody = body;
        capturedHeaders = headers;
        
        // Return mock data
        return Promise.resolve({
          success: true,
          vaultId: 'mock-vault-id',
          owner: 'mock-owner-address',
          createdAt: new Date().toISOString()
        });
      };
      
      // Call the method with the override function
      const result = await sdk.vaultInfoFromApiKey(undefined, true, overrideFunc);
      
      // Verify all parameters were correct
      expect(capturedUrl).to.equal(`${AI_URL}/vault/info-complete`);
      expect(capturedApiKey).to.equal(AI_API_KEY);
      expect(capturedMethod).to.equal('POST');
      expect(capturedBody).to.equal(null);
      
      // Verify the mock data was returned
      expect(result).to.be.an('object');
      expect(result.success).to.be.true;
      expect(result.vaultId).to.equal('mock-vault-id');
    });
    
    it('should prioritize the provided API key over the SDK instance API key', async () => {
      const providedApiKey = 'provided-api-key';
      let capturedUrl;
      let capturedApiKey;
      let capturedHeaders;
      
      // Create an override function that captures the URL, API key and headers
      const overrideFunc = (url, apiKey, method, body, headers) => {
        capturedUrl = url;
        capturedApiKey = apiKey;
        capturedHeaders = headers;
        return Promise.resolve({ success: true });
      };
      
      // Call the method with a provided API key and the override function
      await sdk.vaultInfoFromApiKey(providedApiKey, true, overrideFunc);
      
      // Verify the provided API key was used instead of the SDK instance API key
      expect(capturedUrl).to.equal(`${AI_URL}/vault/info-complete`);
      expect(capturedApiKey).to.equal(providedApiKey);
    });
    
    it('should handle the case when no API key is provided', async () => {
      // Create an SDK instance without an AI API key
      const sdkWithoutAiKey = new EmblemVaultSDK(API_KEY, undefined, undefined, undefined, AI_URL);
      
      let capturedUrl;
      let capturedApiKey;
      let capturedMethod;
      let capturedBody;
      let capturedHeaders;
      
      // Create an override function that captures all parameters
      const overrideFunc = (url, apiKey, method, body, headers) => {
        capturedUrl = url;
        capturedApiKey = apiKey;
        capturedMethod = method;
        capturedBody = body;
        capturedHeaders = headers;
        return Promise.resolve({ success: true });
      };
      
      // Call the method without providing an API key
      await sdkWithoutAiKey.vaultInfoFromApiKey(undefined, true, overrideFunc);
      
      // Verify all parameters were correct
      expect(capturedUrl).to.equal(`${AI_URL}/vault/info-complete`);
      expect(capturedApiKey).to.equal('');
      expect(capturedMethod).to.equal('POST');
      expect(capturedBody).to.equal(null);
    });

    it('should use sdk ai api key when no api key is provided', async () => {
      // Create an SDK instance without an AI API key
      const sdkWithoutAiKey = new EmblemVaultSDK(API_KEY, undefined, undefined, undefined, AI_URL, AI_API_KEY);
      
      let capturedUrl;
      let capturedApiKey;
      let capturedMethod;
      let capturedBody;
      let capturedHeaders;
      
      // Create an override function that captures all parameters
      const overrideFunc = (url, apiKey, method, body, headers) => {
        capturedUrl = url;
        capturedApiKey = apiKey;
        capturedMethod = method;
        capturedBody = body;
        capturedHeaders = headers;
        return Promise.resolve({ success: true });
      };
      
      // Call the method without providing an API key
      await sdkWithoutAiKey.vaultInfoFromApiKey(undefined, true, overrideFunc);
      
      // Verify all parameters were correct
      expect(capturedUrl).to.equal(`${AI_URL}/vault/info-complete`);
      expect(capturedApiKey).to.equal(AI_API_KEY);
      expect(capturedMethod).to.equal('POST');
      expect(capturedBody).to.equal(null);
    });
  });
});
