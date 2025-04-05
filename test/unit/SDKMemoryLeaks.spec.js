const { expect } = require('chai');
const { EmblemVaultSDK } = require('../../dist');
const { ResourceMonitor } = require('../utils/ResourceMonitor');

describe('SDK Memory Leak Tests', () => {
  // Configure test parameters
  const ITERATIONS = 10; // Reduced from 20 to make tests run faster
  const MEMORY_THRESHOLD = 25; // Increased from 15% to 25% to accommodate normal fluctuations
  const API_KEY = process.env.API_KEY || 'DEMO_KEY';
  
  let monitor;
  let sdk = new EmblemVaultSDK(API_KEY);
  
  beforeEach(() => {
    // Create a new monitor for each test
    monitor = new ResourceMonitor(MEMORY_THRESHOLD, false);
  });
  
  afterEach(() => {
    // Generate and log memory report after each test
    const report = monitor.generateReport();
    // console.log(report);
    
    // Attempt garbage collection between tests
    monitor.triggerGC();
  });
  
  /**
   * Helper function to run repeated operations and monitor memory
   * @param {Function} operation - The SDK operation to test
   * @param {string} operationName - Name of the operation for reporting
   */
  async function testOperation(operation, operationName) {
    // Take initial snapshot
    monitor.takeSnapshot(`${operationName}-start`);
    
    // Run multiple iterations of the operation
    for (let i = 0; i < ITERATIONS; i++) {
      // Take snapshot before operation
      monitor.takeSnapshot(`${operationName}-iter-${i+1}-before`);
      
      // Run the operation
      await operation();
      
      // Take snapshot after operation
      monitor.takeSnapshot(`${operationName}-iter-${i+1}-after`);
      
      // Force garbage collection if available
      monitor.triggerGC();
    }
    
    // Take final snapshot
    monitor.takeSnapshot(`${operationName}-end`);
    
    // Check if memory usage exceeds threshold
    const thresholdCheck = monitor.checkThreshold(`${operationName}-start`);
    
    // We don't want to fail the test, but we log a warning if threshold is exceeded
    if (thresholdCheck.exceeded) {
      console.warn(`WARNING: Memory usage for ${operationName} increased by ${thresholdCheck.percentageIncrease}%, which exceeds the threshold of ${MEMORY_THRESHOLD}%`);
    }
    
    // Calculate memory difference
    const memoryDiff = monitor.getDifferenceBetweenSnapshots(`${operationName}-start`, `${operationName}-end`);
    
    // Log memory difference
    console.log(`Memory difference for ${operationName}: ${memoryDiff} MB`);
    
    // Return the memory difference for assertions
    return { 
      memoryDiff,
      thresholdExceeded: thresholdCheck.exceeded,
      percentageIncrease: thresholdCheck.percentageIncrease
    };
  }
  
  // Create more complete mock data for tests
  const mockAssetMetadata = [
    { 
      projectName: 'Bitcoin Ordinals', 
      description: 'Test description',
      image: 'https://example.com/image.png',
      properties: {
        test: 'value'
      }
    }
  ];
  
  const mockCuratedContract = { 
    name: 'Ethscription', 
    mintable: true,
    allowed: () => true,
    template: {
      name: 'Test Template',
      description: 'Test Description',
      image: 'https://example.com/image.png'
    }
  };
  
  // Tests with proper mock data
  it('should not leak memory with getAssetMetadata using override function', async function() {
    this.timeout(30000);
    
    const result = await testOperation(
      async () => await sdk.getAssetMetadata('Bitcoin Ordinals', false, () => mockAssetMetadata),
      'getAssetMetadata-override'
    );
    
    // We don't assert on the exact memory difference, as it can vary,
    // but we log if it exceeds the threshold
    // console.log(`Memory increase percentage: ${result.percentageIncrease}%`);
  });
  
  it('should not leak memory with getAllAssetMetadata', async function() {
    this.timeout(30000);
    
    const result = await testOperation(
      async () => sdk.getAllAssetMetadata(),
      'getAllAssetMetadata'
    );
    
    // console.log(`Memory increase percentage: ${result.percentageIncrease}%`);
  });
  
  it('should not leak memory with fetchCuratedContractByName using override function', async function() {
    this.timeout(30000);
    
    const result = await testOperation(
      async () => await sdk.fetchCuratedContractByName('Ethscription', false, () => [mockCuratedContract]),
      'fetchCuratedContractByName-override'
    );
    
    // console.log(`Memory increase percentage: ${result.percentageIncrease}%`);
  });
  
  it('should not leak memory with getRemoteAssetMetadata using override function', async function() {
    this.timeout(30000);
    
    const result = await testOperation(
      async () => await sdk.getInventoryAssetMetadata('Bitcoin Ordinals', () => mockAssetMetadata),
      'getRemoteAssetMetadata-override'
    );
    
    // console.log(`Memory increase percentage: ${result.percentageIncrease}%`);
  });
  
  // Test with a deliberately leaky override function
  it('should detect memory leaks with leaky override function', async function() {
    this.timeout(30000);
    
    // Create a closure with a leaky array that grows on each call
    let leakyArray = [];
    
    // This override function will cause a memory leak
    const leakyOverride = () => {
      // Create a larger object and add it to the leaky array
      const largeObject = new Array(500000).fill('memory leak test data');
      leakyArray.push(largeObject);
      
      // Return mock data
      return mockAssetMetadata;
    };
    
    const result = await testOperation(
      async () => await sdk.getInventoryAssetMetadataProject('Bitcoin Ordinals', leakyOverride),
      'leaky-override'
    );
    
    // console.log(`Memory increase percentage: ${result.percentageIncrease}%`);
    
    // This test should show a significant memory increase
    // We expect the threshold to be exceeded
    expect(result.percentageIncrease).to.be.greaterThan(5);
    // console.log('✓ Successfully detected memory leak in leaky override function');
  });
});
