import { CloudRegion, CloudProvider } from '../types';
import { 
  ADDITIONAL_AWS_REGIONS, 
  ADDITIONAL_AZURE_REGIONS, 
  ADDITIONAL_GCP_REGIONS, 
  ADDITIONAL_OCI_REGIONS 
} from './additional-regions';

// AWS Regions with approximate geographic boundaries
export const AWS_REGIONS: CloudRegion[] = [
  {
    id: 'us-east-1',
    name: 'US East (N. Virginia)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 38.13, longitude: -78.45 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-80.0, 36.5], [-76.0, 36.5], [-76.0, 40.0], [-80.0, 40.0], [-80.0, 36.5]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFront']
  },
  {
    id: 'us-east-2',
    name: 'US East (Ohio)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 40.42, longitude: -82.91 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-84.5, 38.5], [-81.0, 38.5], [-81.0, 42.0], [-84.5, 42.0], [-84.5, 38.5]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda']
  },
  {
    id: 'us-west-1',
    name: 'US West (N. California)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 37.35, longitude: -121.96 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-124.0, 35.0], [-119.0, 35.0], [-119.0, 39.5], [-124.0, 39.5], [-124.0, 35.0]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda']
  },
  {
    id: 'us-west-2',
    name: 'US West (Oregon)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 45.87, longitude: -119.69 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-125.0, 42.0], [-116.0, 42.0], [-116.0, 49.0], [-125.0, 49.0], [-125.0, 42.0]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFront']
  },
  {
    id: 'eu-west-1',
    name: 'Europe (Ireland)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 53.41, longitude: -8.24 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-10.5, 51.5], [-5.5, 51.5], [-5.5, 55.5], [-10.5, 55.5], [-10.5, 51.5]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFront']
  },
  {
    id: 'eu-central-1',
    name: 'Europe (Frankfurt)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 50.11, longitude: 8.68 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [6.0, 47.5], [11.0, 47.5], [11.0, 52.5], [6.0, 52.5], [6.0, 47.5]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda']
  },
  {
    id: 'ap-southeast-1',
    name: 'Asia Pacific (Singapore)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 1.37, longitude: 103.8 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [103.0, 1.0], [104.5, 1.0], [104.5, 1.8], [103.0, 1.8], [103.0, 1.0]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda']
  },
  {
    id: 'ap-northeast-1',
    name: 'Asia Pacific (Tokyo)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 35.41, longitude: 139.42 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [138.0, 34.0], [141.0, 34.0], [141.0, 37.0], [138.0, 37.0], [138.0, 34.0]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFront']
  }
];

// Azure Regions
export const AZURE_REGIONS: CloudRegion[] = [
  {
    id: 'eastus',
    name: 'East US',
    provider: 'azure' as CloudProvider,
    coordinates: { latitude: 37.36, longitude: -79.43 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-81.0, 35.5], [-77.5, 35.5], [-77.5, 39.0], [-81.0, 39.0], [-81.0, 35.5]
      ]]
    },
    services: ['Virtual Machines', 'Storage', 'SQL Database', 'Functions']
  },
  {
    id: 'westus2',
    name: 'West US 2',
    provider: 'azure' as CloudProvider,
    coordinates: { latitude: 47.23, longitude: -119.85 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-122.0, 45.5], [-117.0, 45.5], [-117.0, 49.0], [-122.0, 49.0], [-122.0, 45.5]
      ]]
    },
    services: ['Virtual Machines', 'Storage', 'SQL Database', 'Functions']
  },
  {
    id: 'westeurope',
    name: 'West Europe',
    provider: 'azure' as CloudProvider,
    coordinates: { latitude: 52.37, longitude: 4.89 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [3.0, 50.5], [7.0, 50.5], [7.0, 54.0], [3.0, 54.0], [3.0, 50.5]
      ]]
    },
    services: ['Virtual Machines', 'Storage', 'SQL Database', 'Functions']
  },
  {
    id: 'southeastasia',
    name: 'Southeast Asia',
    provider: 'azure' as CloudProvider,
    coordinates: { latitude: 1.28, longitude: 103.85 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [103.2, 1.0], [104.2, 1.0], [104.2, 1.6], [103.2, 1.6], [103.2, 1.0]
      ]]
    },
    services: ['Virtual Machines', 'Storage', 'SQL Database']
  }
];

// GCP Regions
export const GCP_REGIONS: CloudRegion[] = [
  {
    id: 'us-central1',
    name: 'us-central1 (Iowa)',
    provider: 'gcp' as CloudProvider,
    coordinates: { latitude: 41.26, longitude: -95.86 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-97.0, 40.0], [-94.0, 40.0], [-94.0, 43.0], [-97.0, 43.0], [-97.0, 40.0]
      ]]
    },
    services: ['Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions']
  },
  {
    id: 'us-east1',
    name: 'us-east1 (South Carolina)',
    provider: 'gcp' as CloudProvider,
    coordinates: { latitude: 33.84, longitude: -81.16 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-83.0, 32.0], [-79.0, 32.0], [-79.0, 35.5], [-83.0, 35.5], [-83.0, 32.0]
      ]]
    },
    services: ['Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions']
  },
  {
    id: 'europe-west1',
    name: 'europe-west1 (Belgium)',
    provider: 'gcp' as CloudProvider,
    coordinates: { latitude: 50.44, longitude: 3.81 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [2.5, 49.5], [6.0, 49.5], [6.0, 51.5], [2.5, 51.5], [2.5, 49.5]
      ]]
    },
    services: ['Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions']
  },
  {
    id: 'asia-east1',
    name: 'asia-east1 (Taiwan)',
    provider: 'gcp' as CloudProvider,
    coordinates: { latitude: 24.05, longitude: 120.67 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [120.0, 22.0], [122.0, 22.0], [122.0, 25.5], [120.0, 25.5], [120.0, 22.0]
      ]]
    },
    services: ['Compute Engine', 'Cloud Storage', 'Cloud SQL']
  }
];

// OCI Regions
export const OCI_REGIONS: CloudRegion[] = [
  {
    id: 'us-ashburn-1',
    name: 'US East (Ashburn)',
    provider: 'oci' as CloudProvider,
    coordinates: { latitude: 39.04, longitude: -77.49 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-78.5, 38.0], [-76.5, 38.0], [-76.5, 40.0], [-78.5, 40.0], [-78.5, 38.0]
      ]]
    },
    services: ['Compute', 'Object Storage', 'Database', 'Functions']
  },
  {
    id: 'us-phoenix-1',
    name: 'US West (Phoenix)',
    provider: 'oci' as CloudProvider,
    coordinates: { latitude: 33.45, longitude: -112.07 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-113.0, 32.5], [-111.0, 32.5], [-111.0, 34.5], [-113.0, 34.5], [-113.0, 32.5]
      ]]
    },
    services: ['Compute', 'Object Storage', 'Database', 'Functions']
  },
  {
    id: 'eu-frankfurt-1',
    name: 'Germany Central (Frankfurt)',
    provider: 'oci' as CloudProvider,
    coordinates: { latitude: 50.11, longitude: 8.68 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [7.5, 49.0], [9.5, 49.0], [9.5, 51.0], [7.5, 51.0], [7.5, 49.0]
      ]]
    },
    services: ['Compute', 'Object Storage', 'Database']
  }
];

// Combined regions array with additional major regions
export const ALL_REGIONS: CloudRegion[] = [
  ...AWS_REGIONS,
  ...ADDITIONAL_AWS_REGIONS,
  ...AZURE_REGIONS,
  ...ADDITIONAL_AZURE_REGIONS,
  ...GCP_REGIONS,
  ...ADDITIONAL_GCP_REGIONS,
  ...OCI_REGIONS,
  ...ADDITIONAL_OCI_REGIONS
];
