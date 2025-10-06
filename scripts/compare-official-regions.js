#!/usr/bin/env node

/**
 * Official Region Comparison Script
 * Compares our current region implementation against the official cloud provider reference
 */

console.log('🔍 COMPARING OUR REGIONS AGAINST OFFICIAL REFERENCE\n');

// Our current regions (extracted from the files)
const OUR_AWS_REGIONS = [
  // Core regions
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1',
  // Additional regions
  'ca-central-1', 'ca-west-1', 'sa-east-1', 'mx-central-1', 'us-gov-east-1', 'us-gov-west-1',
  'eu-west-2', 'eu-west-3', 'eu-south-1', 'eu-south-2', 'eu-north-1', 'eu-central-2',
  'me-south-1', 'me-central-1', 'il-central-1', 'af-south-1',
  'ap-east-1', 'ap-south-2', 'ap-southeast-3', 'ap-southeast-5', 'ap-south-1', 'ap-northeast-3',
  'ap-northeast-2', 'ap-east-2', 'ap-southeast-7', 'ap-southeast-4', 'ap-southeast-2',
  'cn-north-1', 'cn-northwest-1'
];

const OUR_GCP_REGIONS = [
  // Core regions
  'us-central1', 'us-east1', 'europe-west1', 'asia-east1',
  // Additional regions
  'northamerica-northeast1', 'northamerica-northeast2', 'us-east4', 'us-south1',
  'us-west1', 'us-west3', 'us-west4', 'us-west2', 'europe-west2', 'europe-west3',
  'asia-southeast1', 'asia-northeast1',
  // NEWLY ADDED REGIONS
  'us-east5', 'northamerica-south1', 'southamerica-east1', 'southamerica-west1',
  'europe-central2', 'europe-north1', 'europe-southwest1', 'europe-west4', 'europe-west6',
  'europe-west8', 'europe-west9', 'europe-west10', 'europe-west12', 'asia-east2',
  'asia-northeast2', 'asia-northeast3', 'asia-south1', 'asia-south2', 'asia-southeast2',
  'australia-southeast1', 'australia-southeast2', 'me-central1', 'me-central2',
  'me-west1', 'africa-south1'
];

const OUR_AZURE_REGIONS = [
  // Core regions
  'eastus', 'westus2', 'westeurope', 'southeastasia',
  // Additional regions (50+ from the files)
  'australiacentral', 'australiacentral2', 'australiaeast', 'australiasoutheast', 'austriaeast',
  'belgiumcentral', 'brazilsouth', 'brazilsoutheast', 'canadacentral', 'canadaeast',
  'centralindia', 'centralus', 'chilecentral', 'eastasia', 'eastus2', 'francecentral',
  'francesouth', 'germanynorth', 'germanywestcentral', 'indonesiacentral', 'israelcentral',
  'italynorth', 'japaneast', 'japanwest', 'koreacentral', 'koreasouth', 'malaysiawest',
  'mexicocentral', 'newzealandnorth', 'northcentralus', 'northeurope', 'norwayeast',
  'norwaywest', 'polandcentral', 'qatarcentral', 'southafricanorth', 'southafricawest',
  'southcentralus', 'southindia', 'spaincentral', 'swedencentral', 'switzerlandnorth',
  'switzerlandwest', 'uaecentral', 'uaenorth', 'uksouth', 'ukwest', 'westcentralus',
  'westindia', 'westus', 'westus3',
  // NEWLY ADDED REGIONS
  'eastus3', 'finlandcentral', 'denmarkeast', 'taiwannorth'
];

const OUR_OCI_REGIONS = [
  // Core regions
  'us-ashburn-1', 'us-phoenix-1', 'eu-frankfurt-1',
  // Additional regions
  'ca-montreal-1', 'us-sanjose-1', 'us-chicago-1', 'uk-london-1', 'ap-tokyo-1',
  'ap-sydney-1', 'ca-toronto-1',
  // NEWLY ADDED REGIONS
  'mx-queretaro-1', 'mx-monterrey-1', 'sa-saopaulo-1', 'sa-vinhedo-1', 'sa-santiago-1',
  'sa-valparaiso-1', 'sa-bogota-1', 'uk-cardiff-1', 'eu-amsterdam-1', 'eu-paris-1',
  'eu-marseille-1', 'eu-milan-1', 'eu-madrid-1', 'eu-madrid-2', 'eu-zurich-1',
  'eu-stockholm-1', 'eu-jovanovac-1', 'ap-osaka-1', 'ap-seoul-1', 'ap-chuncheon-1',
  'ap-mumbai-1', 'ap-hyderabad-1', 'ap-singapore-1', 'ap-melbourne-1', 'me-dubai-1',
  'me-abudhabi-1', 'me-jeddah-1', 'il-jerusalem-1', 'af-johannesburg-1'
];

// Official regions from the reference file
const OFFICIAL_AWS_REGIONS = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1', 'ca-west-1',
  'sa-east-1', 'mx-central-1', 'eu-central-1', 'eu-central-2', 'eu-west-1', 'eu-west-2',
  'eu-west-3', 'eu-north-1', 'eu-south-1', 'eu-south-2', 'me-south-1', 'me-central-1',
  'il-central-1', 'af-south-1', 'ap-east-1', 'ap-east-2', 'ap-south-1', 'ap-south-2',
  'ap-southeast-1', 'ap-southeast-2', 'ap-southeast-3', 'ap-southeast-4', 'ap-southeast-5',
  'ap-southeast-7', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3', 'cn-north-1',
  'cn-northwest-1', 'us-gov-east-1', 'us-gov-west-1'
];

const OFFICIAL_GCP_REGIONS = [
  'us-central1', 'us-east1', 'us-east4', 'us-east5', 'us-south1', 'us-west1', 'us-west2',
  'us-west3', 'us-west4', 'northamerica-northeast1', 'northamerica-northeast2', 'northamerica-south1',
  'southamerica-east1', 'southamerica-west1', 'europe-central2', 'europe-north1', 'europe-southwest1',
  'europe-west1', 'europe-west2', 'europe-west3', 'europe-west4', 'europe-west6', 'europe-west8',
  'europe-west9', 'europe-west10', 'europe-west12', 'asia-east1', 'asia-east2', 'asia-northeast1',
  'asia-northeast2', 'asia-northeast3', 'asia-south1', 'asia-south2', 'asia-southeast1',
  'asia-southeast2', 'australia-southeast1', 'australia-southeast2', 'me-central1', 'me-central2',
  'me-west1', 'africa-south1'
];

const OFFICIAL_OCI_REGIONS = [
  'us-ashburn-1', 'us-phoenix-1', 'us-sanjose-1', 'us-chicago-1', 'ca-montreal-1', 'ca-toronto-1',
  'mx-queretaro-1', 'mx-monterrey-1', 'sa-saopaulo-1', 'sa-vinhedo-1', 'sa-santiago-1',
  'sa-valparaiso-1', 'sa-bogota-1', 'uk-london-1', 'uk-cardiff-1', 'eu-frankfurt-1',
  'eu-amsterdam-1', 'eu-paris-1', 'eu-marseille-1', 'eu-milan-1', 'eu-madrid-1', 'eu-madrid-2',
  'eu-zurich-1', 'eu-stockholm-1', 'eu-jovanovac-1', 'ap-tokyo-1', 'ap-osaka-1', 'ap-seoul-1',
  'ap-chuncheon-1', 'ap-mumbai-1', 'ap-hyderabad-1', 'ap-singapore-1', 'ap-sydney-1',
  'ap-melbourne-1', 'me-dubai-1', 'me-abudhabi-1', 'me-jeddah-1', 'il-jerusalem-1',
  'af-johannesburg-1'
];

function findMissingRegions(ourRegions, officialRegions, providerName) {
  const missing = officialRegions.filter(region => !ourRegions.includes(region));
  const extra = ourRegions.filter(region => !officialRegions.includes(region));
  
  console.log(`\n🔴 ${providerName} ANALYSIS:`);
  console.log(`   Our Regions: ${ourRegions.length}`);
  console.log(`   Official Regions: ${officialRegions.length}`);
  console.log(`   Coverage: ${Math.round((ourRegions.length / officialRegions.length) * 100)}%`);
  
  if (missing.length > 0) {
    console.log(`\n   ❌ MISSING REGIONS (${missing.length}):`);
    missing.forEach(region => console.log(`      - ${region}`));
  }
  
  if (extra.length > 0) {
    console.log(`\n   ⚠️  EXTRA REGIONS (${extra.length}) - May be outdated or incorrect:`);
    extra.forEach(region => console.log(`      - ${region}`));
  }
  
  if (missing.length === 0 && extra.length === 0) {
    console.log(`   ✅ PERFECT MATCH - All regions covered!`);
  }
  
  return { missing, extra };
}

// Analyze each provider
const awsAnalysis = findMissingRegions(OUR_AWS_REGIONS, OFFICIAL_AWS_REGIONS, 'AWS');
const gcpAnalysis = findMissingRegions(OUR_GCP_REGIONS, OFFICIAL_GCP_REGIONS, 'GCP');
const azureAnalysis = findMissingRegions(OUR_AZURE_REGIONS, [], 'AZURE'); // No official list provided
const ociAnalysis = findMissingRegions(OUR_OCI_REGIONS, OFFICIAL_OCI_REGIONS, 'OCI');

// Summary
console.log('\n📊 OVERALL SUMMARY:');
console.log(`   AWS: ${OUR_AWS_REGIONS.length}/${OFFICIAL_AWS_REGIONS.length} regions (${awsAnalysis.missing.length} missing)`);
console.log(`   GCP: ${OUR_GCP_REGIONS.length}/${OFFICIAL_GCP_REGIONS.length} regions (${gcpAnalysis.missing.length} missing)`);
console.log(`   Azure: ${OUR_AZURE_REGIONS.length} regions (reference needed for comparison)`);
console.log(`   OCI: ${OUR_OCI_REGIONS.length}/${OFFICIAL_OCI_REGIONS.length} regions (${ociAnalysis.missing.length} missing)`);

const totalMissing = awsAnalysis.missing.length + gcpAnalysis.missing.length + ociAnalysis.missing.length;
console.log(`\n🎯 TOTAL MISSING REGIONS: ${totalMissing}`);

if (totalMissing > 0) {
  console.log('\n🔧 RECOMMENDED ACTIONS:');
  console.log('1. Add the missing regions identified above');
  console.log('2. Research accurate coordinates for each new region');
  console.log('3. Update region data files with new regions');
  console.log('4. Validate all new coordinates');
  console.log('5. Update documentation and reference files');
} else {
  console.log('\n🎉 EXCELLENT! All major regions are covered.');
}

console.log('\n⚠️  NOTE: Some regions may be newer or specialized (GovCloud, China, etc.)');
console.log('Focus on adding the most critical missing regions first.');