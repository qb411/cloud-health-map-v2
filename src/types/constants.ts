// Cloud provider region mappings

// Cloud provider region mappings
export const CLOUD_REGIONS = {
  aws: [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-south-1',
    'ca-central-1', 'sa-east-1', 'af-south-1', 'me-south-1'
  ],
  azure: [
    'eastus', 'eastus2', 'westus', 'westus2', 'centralus',
    'westeurope', 'northeurope', 'uksouth', 'ukwest', 'francecentral',
    'southeastasia', 'eastasia', 'japaneast', 'japanwest', 'australiaeast',
    'canadacentral', 'brazilsouth', 'southafricanorth', 'uaenorth'
  ],
  gcp: [
    'us-central1', 'us-east1', 'us-east4', 'us-west1', 'us-west2', 'us-west3', 'us-west4',
    'europe-west1', 'europe-west2', 'europe-west3', 'europe-west4', 'europe-west6', 'europe-north1',
    'asia-east1', 'asia-east2', 'asia-northeast1', 'asia-northeast2', 'asia-northeast3',
    'asia-south1', 'asia-southeast1', 'asia-southeast2', 'australia-southeast1'
  ],
  oci: [
    'us-ashburn-1', 'us-phoenix-1', 'us-sanjose-1',
    'eu-frankfurt-1', 'eu-zurich-1', 'uk-london-1',
    'ap-tokyo-1', 'ap-osaka-1', 'ap-sydney-1', 'ap-melbourne-1',
    'ca-toronto-1', 'sa-saopaulo-1', 'me-jeddah-1', 'af-johannesburg-1'
  ]
} as const;

// Common cloud services by provider
export const CLOUD_SERVICES = {
  aws: [
    'EC2', 'S3', 'RDS', 'Lambda', 'CloudFront', 'Route 53', 'ELB', 'VPC',
    'IAM', 'CloudWatch', 'SNS', 'SQS', 'DynamoDB', 'ECS', 'EKS', 'API Gateway'
  ],
  azure: [
    'Virtual Machines', 'Storage', 'SQL Database', 'Functions', 'CDN', 'DNS', 'Load Balancer',
    'Virtual Network', 'Active Directory', 'Monitor', 'Service Bus', 'Cosmos DB', 'Container Instances',
    'Kubernetes Service', 'API Management'
  ],
  gcp: [
    'Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions', 'Cloud CDN', 'Cloud DNS',
    'Load Balancing', 'VPC', 'IAM', 'Cloud Monitoring', 'Pub/Sub', 'Firestore', 'Cloud Run',
    'GKE', 'API Gateway'
  ],
  oci: [
    'Compute', 'Object Storage', 'Database', 'Functions', 'CDN', 'DNS', 'Load Balancer',
    'Virtual Cloud Network', 'Identity', 'Monitoring', 'Notifications', 'Autonomous Database',
    'Container Engine', 'API Gateway'
  ]
} as const;

// Status color mappings
export const STATUS_COLORS = {
  operational: '#10B981', // green-500
  degraded: '#F59E0B',    // amber-500
  outage: '#EF4444'       // red-500
} as const;

// Severity color mappings
export const SEVERITY_COLORS = {
  low: '#6B7280',      // gray-500
  medium: '#F59E0B',   // amber-500
  high: '#F97316',     // orange-500
  critical: '#EF4444'  // red-500
} as const;

// Provider brand colors (avoiding conflicts with status colors: green/yellow/red)
export const PROVIDER_COLORS = {
  aws: '#FF8C00',      // AWS Orange (distinct from status colors)
  azure: '#0078D4',    // Microsoft Azure Blue (official Azure brand color)
  gcp: '#06B6D4',      // Cyan/Teal (distinct from Azure blue and all status colors)
  oci: '#8B5CF6'       // Purple (distinct from Oracle red to avoid status conflict)
} as const;

// Google Cloud additional brand colors (for future use)
export const GOOGLE_BRAND_COLORS = {
  blue: '#4285F4',     // Primary Google Blue
  red: '#DB4437',      // Google Red
  yellow: '#F4B400',   // Google Yellow
  green: '#0F9D58'     // Google Green
} as const;

// Map zoom levels for different views
export const MAP_ZOOM_LEVELS = {
  world: 2,
  continent: 4,
  country: 6,
  region: 8,
  city: 10
} as const;

// Responsive breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  tv: 1920
} as const;