const { expect } = require('chai');
const { ResourceMonitor } = require('../utils/ResourceMonitor');

describe('ResourceMonitor', () => {
  let monitor;
  
  beforeEach(() => {
    // Create a new monitor for each test
    monitor = new ResourceMonitor(10, false);
  });
  
  it('should correctly measure memory usage', () => {
    const memoryUsage = monitor.getMemoryUsage();
    expect(memoryUsage).to.be.a('number');
    expect(memoryUsage).to.be.greaterThan(0);
  });
  
  it('should take snapshots and store them', () => {
    const label = 'initial';
    const memoryUsage = monitor.takeSnapshot(label);
    
    expect(memoryUsage).to.be.a('number');
    expect(monitor.getSnapshots()).to.have.lengthOf(1);
    expect(monitor.getSnapshots()[0].label).to.equal(label);
    expect(monitor.getSnapshots()[0].memoryUsage).to.equal(memoryUsage);
  });
  
  it('should calculate differences between snapshots', () => {
    // Create a large array to cause memory allocation
    monitor.takeSnapshot('before-allocation');
    
    // Allocate memory
    const largeArray = new Array(1000000).fill('test');
    
    monitor.takeSnapshot('after-allocation');
    
    // Get difference
    const diff = monitor.getDifferenceBetweenSnapshots('before-allocation', 'after-allocation');
    
    expect(diff).to.be.a('number');
    // Memory should have increased due to the large array allocation
    expect(diff).to.be.greaterThan(0);
    
    // Clean up to avoid affecting other tests
    largeArray.length = 0;
  });
  
  it('should detect when memory usage exceeds threshold', () => {
    // Set a very low threshold for testing
    monitor = new ResourceMonitor(0.1, false);
    
    monitor.takeSnapshot('baseline');
    
    // Allocate significant memory
    const largeArray = new Array(5000000).fill('test');
    
    const thresholdCheck = monitor.checkThreshold('baseline');
    
    expect(thresholdCheck.exceeded).to.be.true;
    expect(thresholdCheck.percentageIncrease).to.be.a('number');
    expect(thresholdCheck.percentageIncrease).to.be.greaterThan(0.1);
    
    // Clean up
    largeArray.length = 0;
  });
  
  it('should reset snapshots correctly', () => {
    monitor.takeSnapshot('snapshot1');
    monitor.takeSnapshot('snapshot2');
    
    expect(monitor.getSnapshots()).to.have.lengthOf(2);
    
    monitor.reset();
    
    expect(monitor.getSnapshots()).to.have.lengthOf(0);
  });
  
  it('should generate a readable report', () => {
    monitor.takeSnapshot('start');
    
    // Allocate some memory
    const array = new Array(100000).fill('test');
    
    monitor.takeSnapshot('middle');
    
    // Allocate more memory
    const array2 = new Array(100000).fill('test');
    
    monitor.takeSnapshot('end');
    
    const report = monitor.generateReport();
    
    expect(report).to.be.a('string');
    expect(report).to.include('Memory Usage Report');
    expect(report).to.include('start');
    expect(report).to.include('middle');
    expect(report).to.include('end');
    
    // Clean up
    array.length = 0;
    array2.length = 0;
  });
  
  it('should attempt to trigger garbage collection', () => {
    const result = monitor.triggerGC();
    
    // This will be true only if the test is run with --expose-gc
    // We don't assert on the result since it depends on how the test is run
    expect(result).to.be.a('boolean');
  });
});
