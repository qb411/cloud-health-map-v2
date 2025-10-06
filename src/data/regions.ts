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
    coordinates: { latitude: 39.0458, longitude: -77.5081 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-78.0, 38.5], [-77.0, 38.5], [-77.0, 39.5], [-78.0, 39.5], [-78.0, 38.5]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFront']
  },
  {
    id: 'us-east-2',
    name: 'US East (Ohio)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 39.9612, longitude: -82.9988 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-83.5, 39.0], [-82.5, 39.0], [-82.5, 40.5], [-83.5, 40.5], [-83.5, 39.0]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda']
  },
  {
    id: 'us-west-1',
    name: 'US West (N. California)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 37.4419, longitude: -122.1430 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-123.0, 36.5], [-121.5, 36.5], [-121.5, 38.0], [-123.0, 38.0], [-123.0, 36.5]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda']
  },
  {
    id: 'us-west-2',
    name: 'US West (Oregon)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 45.5152, longitude: -122.6784 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-123.5, 45.0], [-121.5, 45.0], [-121.5, 46.0], [-123.5, 46.0], [-123.5, 45.0]
      ]]
    },
    services: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFront']
  },
  {
    id: 'eu-west-1',
    name: 'Europe (Ireland)',
    provider: 'aws' as CloudProvider,
    coordinates: { latitude: 53.3498, longitude: -6.2603 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-7.0, 52.8], [-5.8, 52.8], [-5.8, 54.0], [-7.0, 54.0], [-7.0, 52.8]
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
    coordinates: { latitude: 37.5407, longitude: -77.4360 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-78.0, 37.0], [-76.9, 37.0], [-76.9, 38.1], [-78.0, 38.1], [-78.0, 37.0]
      ]]
    },
    services: ['Virtual Machines', 'Storage', 'SQL Database', 'Functions']
  },
  {
    id: 'westus2',
    name: 'West US 2',
    provider: 'azure' as CloudProvider,
    coordinates: { latitude: 47.2529, longitude: -119.8523 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-120.3, 46.8], [-119.4, 46.8], [-119.4, 47.7], [-120.3, 47.7], [-120.3, 46.8]
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
    coordinates: { latitude: 41.2619, longitude: -95.8608 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-96.2, 40.8], [-95.5, 40.8], [-95.5, 41.7], [-96.2, 41.7], [-96.2, 40.8]
      ]]
    },
    services: ['Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions']
  },
  {
    id: 'us-east1',
    name: 'us-east1 (South Carolina)',
    provider: 'gcp' as CloudProvider,
    coordinates: { latitude: 33.1960, longitude: -79.9760 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-80.5, 32.7], [-79.5, 32.7], [-79.5, 33.7], [-80.5, 33.7], [-80.5, 32.7]
      ]]
    },
    services: ['Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions']
  },
  {
    id: 'europe-west1',
    name: 'europe-west1 (Belgium)',
    provider: 'gcp' as CloudProvider,
    coordinates: { latitude: 50.4501, longitude: 3.8200 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [3.3, 50.0], [4.3, 50.0], [4.3, 50.9], [3.3, 50.9], [3.3, 50.0]
      ]]
    },
    services: ['Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions']
  },
  {
    id: 'asia-east1',
    name: 'asia-east1 (Taiwan)',
    provider: 'gcp' as CloudProvider,
    coordinates: { latitude: 24.0518, longitude: 120.5161 },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [120.0, 23.5], [121.0, 23.5], [121.0, 24.5], [120.0, 24.5], [120.0, 23.5]
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
