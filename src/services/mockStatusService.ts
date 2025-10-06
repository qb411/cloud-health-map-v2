import { ServiceStatus, CloudRegion } from '../types';

// Mock service to generate random status for regions
export class MockStatusService {
  private statusCache: Map<string, ServiceStatus> = new Map();
  
  constructor() {
    this.generateInitialStatuses();
  }

  private generateInitialStatuses() {
    // Generate some realistic status distribution
    // 85% operational, 10% degraded, 5% outage
    
    // For demo purposes, we'll have some regions with issues
    const problematicRegions = [
      'us-east-1',    // AWS
      'westeurope',   // Azure
      'asia-east1'    // GCP
    ];
    
    problematicRegions.forEach(regionId => {
      this.statusCache.set(regionId, 'degraded');
    });
    
    // Set one region to outage for demo
    this.statusCache.set('eu-central-1', 'outage');
  }

  getRegionStatus(region: CloudRegion): ServiceStatus {
    // Check cache first
    if (this.statusCache.has(region.id)) {
      return this.statusCache.get(region.id)!;
    }
    
    // Default to operational for regions not in cache
    return 'operational';
  }

  // Simulate status changes (for future auto-refresh functionality)
  updateRegionStatus(regionId: string, status: ServiceStatus) {
    this.statusCache.set(regionId, status);
  }

  // Get all statuses for regions
  getAllStatuses(regions: CloudRegion[]): Map<string, ServiceStatus> {
    const statuses = new Map<string, ServiceStatus>();
    
    regions.forEach(region => {
      statuses.set(region.id, this.getRegionStatus(region));
    });
    
    return statuses;
  }

  // Simulate random status changes for demo
  simulateStatusChanges(regions: CloudRegion[]) {
    if (regions.length === 0) return;
    
    const randomRegion = regions[Math.floor(Math.random() * regions.length)];
    if (!randomRegion) return;
    
    const statuses: ServiceStatus[] = ['operational', 'degraded', 'outage'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    if (!randomStatus) return;
    
    this.updateRegionStatus(randomRegion.id, randomStatus);
    
    console.log(`Status updated: ${randomRegion.name} is now ${randomStatus}`);
  }
}

// Export singleton instance
export const mockStatusService = new MockStatusService();