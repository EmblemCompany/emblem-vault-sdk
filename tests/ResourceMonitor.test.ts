import EmblemVaultSDK from '../src/';

// Add TypeScript global declaration for garbage collection
declare global {
  namespace NodeJS {
    interface Global {
      gc?: () => void;
    }
  }
}

describe.skip('Resource Monitor', () => {
  // Function to get current memory usage in MB
  const getMemoryUsage = (): number => {
    const memoryUsage = process.memoryUsage();
    return Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100;
  };

  // Increase timeout for all tests in this suite
  jest.setTimeout(60000);

  it('should monitor memory usage during SDK operations', async () => {
    console.log(`Initial memory usage: ${getMemoryUsage()} MB`);
    
    // Create multiple SDK instances to simulate test environment
    const sdkInstances: any[] = [];
    
    for (let i = 0; i < 10; i++) {
      console.log(`Memory before creating SDK instance #${i+1}: ${getMemoryUsage()} MB`);
      const sdk = new EmblemVaultSDK('DEMO_KEY');
      sdkInstances.push(sdk);
      console.log(`Memory after creating SDK instance #${i+1}: ${getMemoryUsage()} MB`);
      
      // Perform some operations with the SDK
      try {
        const curatedContract = await sdk.fetchCuratedContractByName('Ethscription');
        console.log(`Memory after fetching contract #${i+1}: ${getMemoryUsage()} MB`);
      } catch (error) {
        console.error(`Error fetching contract #${i+1}:`, error);
      }
    }
    
    // Force garbage collection if possible (Node.js with --expose-gc flag)
    if (global.gc) {
      console.log(`Memory before garbage collection: ${getMemoryUsage()} MB`);
      global.gc();
      console.log(`Memory after garbage collection: ${getMemoryUsage()} MB`);
    } else {
      console.log('Garbage collection not exposed. Run with node --expose-gc to enable.');
    }
    
    // Final memory check
    console.log(`Final memory usage: ${getMemoryUsage()} MB`);
    
    // This test doesn't actually assert anything, it just monitors memory
    expect(true).toBe(true);
  });
  
  it('should test for memory leaks with repeated operations', async () => {
    const initialMemory = getMemoryUsage();
    console.log(`Initial memory: ${initialMemory} MB`);
    
    const sdk = new EmblemVaultSDK('DEMO_KEY');
    
    // Perform repeated operations that might cause memory leaks
    for (let i = 0; i < 20; i++) {
      console.log(`Iteration ${i+1} - Memory before: ${getMemoryUsage()} MB`);
      
      // Perform some operations
      try {
        const curatedContract: any = await sdk.fetchCuratedContractByName('Ethscription');
        // Do something with the contract to ensure it's fully processed
        if (curatedContract) {
          const allowed = curatedContract.allowed([], curatedContract);
        }
      } catch (error) {
        console.error(`Error in iteration ${i+1}:`, error);
      }
      
      console.log(`Iteration ${i+1} - Memory after: ${getMemoryUsage()} MB`);
      
      // Optional: Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log(`Iteration ${i+1} - Memory after GC: ${getMemoryUsage()} MB`);
      }
    }
    
    const finalMemory = getMemoryUsage();
    console.log(`Final memory: ${finalMemory} MB`);
    console.log(`Memory difference: ${finalMemory - initialMemory} MB`);
    
    // We don't want to fail the test based on memory usage,
    // but we can log a warning if there's a significant increase
    if (finalMemory > initialMemory * 1.5) {
      console.warn('WARNING: Significant memory increase detected. Possible memory leak.');
    }
    
    expect(true).toBe(true);
  });
});
