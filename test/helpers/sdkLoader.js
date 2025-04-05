/**
 * SDK Loader Helper
 * Provides a singleton pattern for SDK initialization across tests
 */

const { EmblemVaultSDK } = require('../../dist');

// Default values from environment or fallbacks
const DEFAULT_API_KEY = process.env.API_KEY || 'DEMO_KEY';
const DEFAULT_BASE_URL = process.env.BASE_URL;
const DEFAULT_V3_URL = process.env.V3_URL;
const DEFAULT_SIG_URL = process.env.SIG_URL;

// Singleton instance
let sdkInstance = null;
let currentConfig = null;

/**
 * Get the SDK instance - creates a new instance if one doesn't exist
 * or returns the existing instance
 * 
 * @param {Object} options - SDK initialization options
 * @param {string} options.apiKey - API key to use (defaults to env API_KEY or 'DEMO_KEY')
 * @param {string} options.baseUrl - Base URL to use (defaults to env BASE_URL or SDK default)
 * @param {string} options.v3Url - V3 URL to use (defaults to env V3_URL or SDK default)
 * @param {string} options.sigUrl - Signature URL to use (defaults to env SIG_URL or SDK default)
 * @param {boolean} options.forceNew - Force creation of a new instance
 * @returns {EmblemVaultSDK} The SDK instance
 */
function getSDK(options = {}) {
  const { 
    apiKey = DEFAULT_API_KEY, 
    baseUrl = DEFAULT_BASE_URL, 
    v3Url = DEFAULT_V3_URL,
    sigUrl = DEFAULT_SIG_URL,
    forceNew = false 
  } = options;

  // Create new configuration object for comparison
  const newConfig = { apiKey, baseUrl, v3Url, sigUrl };
  
  // Create a new instance if:
  // 1. No instance exists yet
  // 2. forceNew is true
  // 3. Configuration has changed
  const configChanged = currentConfig && (
    currentConfig.apiKey !== newConfig.apiKey ||
    currentConfig.baseUrl !== newConfig.baseUrl ||
    currentConfig.v3Url !== newConfig.v3Url ||
    currentConfig.sigUrl !== newConfig.sigUrl
  );

  if (!sdkInstance || forceNew || configChanged) {
    // Initialize with all possible parameters
    // Only pass parameters that are defined to avoid overriding SDK defaults
    const initParams = [apiKey];
    
    if (baseUrl) initParams.push(baseUrl);
    else if (v3Url || sigUrl) initParams.push(undefined); // Add placeholder if later params exist
    
    if (v3Url) initParams.push(v3Url);
    else if (sigUrl) initParams.push(undefined); // Add placeholder if later params exist
    
    if (sigUrl) initParams.push(sigUrl);
    
    // Create new instance with spread parameters
    sdkInstance = new EmblemVaultSDK(...initParams);
    
    // Store current configuration
    currentConfig = { ...newConfig };
  }

  return sdkInstance;
}

/**
 * Reset the SDK instance
 * Useful for tests that need to start with a fresh instance
 */
function resetSDK() {
  sdkInstance = null;
  currentConfig = null;
}

module.exports = {
  getSDK,
  resetSDK
};
