import { 
  CloudRegion, 
  ServiceHealth, 
  ServiceIncident, 
  ProviderStatus,
  CloudProvider,
  IncidentSeverity
} from './index';

// Mock data interfaces for development and testing
export interface MockDataConfig {
  enableMockData: boolean;
  simulateErrors: boolean;
  simulateLatency: boolean;
  latencyRange: [number, number]; // min, max in milliseconds
  errorRate: number; // 0-1, percentage of requests that should fail
}

export interface MockRegionData {
  provider: CloudProvider;
  regions: MockCloudRegion[];
}

export interface MockCloudRegion extends Omit<CloudRegion, 'boundaries'> {
  // Simplified boundaries for mock data (just a bounding box)
  boundingBox: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface MockIncidentScenario {
  name: string;
  description: string;
  affectedProviders: CloudProvider[];
  affectedRegions: string[];
  severity: IncidentSeverity;
  duration: number; // in minutes
}

// Predefined mock scenarios
export interface MockScenarios {
  normal: 'All services operational';
  minorIssues: 'Some minor service degradations';
  majorOutage: 'Major outage affecting multiple regions';
  multiProviderIssue: 'Issues across multiple cloud providers';
  recoveryMode: 'Services recovering from outage';
}

// Mock data generation utilities
export interface MockDataGenerator {
  generateRegions(provider: CloudProvider): MockCloudRegion[];
  generateServiceHealth(region: string, provider: CloudProvider): ServiceHealth[];
  generateIncident(severity: IncidentSeverity): ServiceIncident;
  generateProviderStatus(provider: CloudProvider): ProviderStatus;
  applyScenario(scenario: keyof MockScenarios): void;
}

// Default mock configuration
export const DEFAULT_MOCK_CONFIG: MockDataConfig = {
  enableMockData: false,
  simulateErrors: false,
  simulateLatency: true,
  latencyRange: [500, 2000],
  errorRate: 0.1, // 10% error rate
};