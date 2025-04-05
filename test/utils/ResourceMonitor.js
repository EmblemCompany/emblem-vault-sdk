/**
 * ResourceMonitor - A utility class for monitoring memory usage in tests
 * 
 * This class provides methods to track memory usage during test execution,
 * helping to identify potential memory leaks in the SDK.
 */
class ResourceMonitor {
  /**
   * Create a new ResourceMonitor
   * @param {number} thresholdPercentage Percentage increase threshold for warnings (default: 10)
   * @param {boolean} verbose Whether to log all memory measurements (default: false)
   */
  constructor(thresholdPercentage = 10, verbose = false) {
    this.snapshots = [];
    this.thresholdPercentage = thresholdPercentage;
    this.verbose = verbose;
  }

  /**
   * Get current memory usage in MB
   * @returns {number} Current heap memory usage in MB
   */
  getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    return Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100;
  }

  /**
   * Take a memory snapshot with a label
   * @param {string} label Label for this memory snapshot
   * @returns {number} The memory usage in MB
   */
  takeSnapshot(label) {
    const memoryUsage = this.getMemoryUsage();
    this.snapshots.push({
      label,
      memoryUsage,
      timestamp: Date.now()
    });
    
    if (this.verbose) {
      console.log(`Memory snapshot [${label}]: ${memoryUsage} MB`);
    }
    
    return memoryUsage;
  }

  /**
   * Get the difference between the current memory usage and a previous snapshot
   * @param {string} label Label of the snapshot to compare against
   * @returns {number|null} Memory difference in MB, or null if snapshot not found
   */
  getDifference(label) {
    const snapshot = this.snapshots.find(s => s.label === label);
    if (!snapshot) {
      return null;
    }
    
    const currentMemory = this.getMemoryUsage();
    return Math.round((currentMemory - snapshot.memoryUsage) * 100) / 100;
  }

  /**
   * Get the difference between two snapshots
   * @param {string} startLabel Label of the starting snapshot
   * @param {string} endLabel Label of the ending snapshot
   * @returns {number|null} Memory difference in MB, or null if either snapshot not found
   */
  getDifferenceBetweenSnapshots(startLabel, endLabel) {
    const startSnapshot = this.snapshots.find(s => s.label === startLabel);
    const endSnapshot = this.snapshots.find(s => s.label === endLabel);
    
    if (!startSnapshot || !endSnapshot) {
      return null;
    }
    
    return Math.round((endSnapshot.memoryUsage - startSnapshot.memoryUsage) * 100) / 100;
  }

  /**
   * Check if memory usage has increased beyond the threshold compared to a snapshot
   * @param {string} label Label of the snapshot to compare against
   * @returns {Object} Object containing whether threshold was exceeded and the percentage increase
   */
  checkThreshold(label) {
    const snapshot = this.snapshots.find(s => s.label === label);
    if (!snapshot) {
      return { exceeded: false, percentageIncrease: null };
    }
    
    const currentMemory = this.getMemoryUsage();
    const percentageIncrease = ((currentMemory - snapshot.memoryUsage) / snapshot.memoryUsage) * 100;
    const roundedPercentage = Math.round(percentageIncrease * 100) / 100;
    
    return {
      exceeded: percentageIncrease > this.thresholdPercentage,
      percentageIncrease: roundedPercentage
    };
  }

  /**
   * Get all snapshots
   * @returns {Array} Array of all memory snapshots
   */
  getSnapshots() {
    return [...this.snapshots];
  }

  /**
   * Reset all snapshots
   */
  reset() {
    this.snapshots = [];
  }

  /**
   * Force garbage collection if available
   * @returns {boolean} True if garbage collection was triggered, false otherwise
   */
  triggerGC() {
    if (global.gc) {
      global.gc();
      return true;
    }
    
    if (this.verbose) {
      console.log('Garbage collection not exposed. Run with node --expose-gc to enable.');
    }
    
    return false;
  }

  /**
   * Generate a report of memory usage
   * @returns {string} A formatted string containing memory usage information
   */
  generateReport() {
    if (this.snapshots.length === 0) {
      return 'No memory snapshots recorded.';
    }
    
    const firstSnapshot = this.snapshots[0];
    const lastSnapshot = this.snapshots[this.snapshots.length - 1];
    const totalDifference = lastSnapshot.memoryUsage - firstSnapshot.memoryUsage;
    const percentageChange = ((lastSnapshot.memoryUsage - firstSnapshot.memoryUsage) / firstSnapshot.memoryUsage) * 100;
    
    let report = '=== Memory Usage Report ===\n';
    report += `Initial memory [${firstSnapshot.label}]: ${firstSnapshot.memoryUsage} MB\n`;
    report += `Final memory [${lastSnapshot.label}]: ${lastSnapshot.memoryUsage} MB\n`;
    report += `Total change: ${Math.round(totalDifference * 100) / 100} MB (${Math.round(percentageChange * 100) / 100}%)\n`;
    
    if (this.snapshots.length > 2) {
      report += '\nSnapshot history:\n';
      
      for (let i = 1; i < this.snapshots.length; i++) {
        const prev = this.snapshots[i - 1];
        const curr = this.snapshots[i];
        const diff = curr.memoryUsage - prev.memoryUsage;
        const percentChange = (diff / prev.memoryUsage) * 100;
        
        report += `${prev.label} → ${curr.label}: ${Math.round(diff * 100) / 100} MB (${Math.round(percentChange * 100) / 100}%)\n`;
      }
    }
    
    return report;
  }
}

module.exports = { ResourceMonitor };
