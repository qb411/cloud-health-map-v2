#!/usr/bin/env node

/**
 * Generate complete region mappings from src/data/regions.ts
 * This creates a comprehensive mapping that the RSS processor can use
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the regions.ts file and additional-regions.ts
const regionsPath = join(__dirname, '../src/data/regions.ts');
const additionalRegionsPath = join(__dirname, '../src/data/additional-regions.ts');
const regionsContent = readFileSync(regionsPath, 'utf-8') + '\n' + readFileSync(additionalRegionsPath, 'utf-8');

// Extract region data using regex
const regionMappings = {
  aws: {},
  azure: {},
  gcp: {},
  oci: {}
};

// Parse AWS regions
const awsRegionMatches = regionsContent.matchAll(/id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*provider:\s*'aws'/g);
for (const match of awsRegionMatches) {
  regionMappings.aws[match[1]] = match[2];
}

// Parse Azure regions
const azureRegionMatches = regionsContent.matchAll(/id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*provider:\s*'azure'/g);
for (const match of azureRegionMatches) {
  regionMappings.azure[match[1]] = match[2];
}

// Parse GCP regions
const gcpRegionMatches = regionsContent.matchAll(/id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*provider:\s*'gcp'/g);
for (const match of gcpRegionMatches) {
  regionMappings.gcp[match[1]] = match[2];
}

// Parse OCI regions
const ociRegionMatches = regionsContent.matchAll(/id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*provider:\s*'oci'/g);
for (const match of ociRegionMatches) {
  regionMappings.oci[match[1]] = match[2];
}

// Generate the JavaScript file
const outputContent = `// AUTO-GENERATED - Do not edit manually
// Generated from src/data/regions.ts on ${new Date().toISOString()}
// Run 'node scripts/generate-region-mappings.js' to regenerate

/**
 * Complete region mappings for all cloud providers
 * Maps region IDs to human-readable names
 */
export const REGION_MAPPINGS = ${JSON.stringify(regionMappings, null, 2)};

/**
 * Get region name by provider and region ID
 */
export function getRegionName(provider, regionId) {
  return REGION_MAPPINGS[provider]?.[regionId] || regionId;
}

/**
 * Get all regions for a provider
 */
export function getProviderRegions(provider) {
  return Object.keys(REGION_MAPPINGS[provider] || {});
}

/**
 * Statistics
 */
export const REGION_STATS = {
  aws: ${Object.keys(regionMappings.aws).length},
  azure: ${Object.keys(regionMappings.azure).length},
  gcp: ${Object.keys(regionMappings.gcp).length},
  oci: ${Object.keys(regionMappings.oci).length},
  total: ${Object.keys(regionMappings.aws).length + Object.keys(regionMappings.azure).length + Object.keys(regionMappings.gcp).length + Object.keys(regionMappings.oci).length}
};
`;

// Write to file
const outputPath = join(__dirname, 'region-mappings.js');
writeFileSync(outputPath, outputContent);

console.log('✅ Region mappings generated successfully!');
console.log(`📊 Statistics:`);
console.log(`   AWS regions: ${Object.keys(regionMappings.aws).length}`);
console.log(`   Azure regions: ${Object.keys(regionMappings.azure).length}`);
console.log(`   GCP regions: ${Object.keys(regionMappings.gcp).length}`);
console.log(`   OCI regions: ${Object.keys(regionMappings.oci).length}`);
console.log(`   Total: ${Object.keys(regionMappings.aws).length + Object.keys(regionMappings.azure).length + Object.keys(regionMappings.gcp).length + Object.keys(regionMappings.oci).length}`);
console.log(`\n📝 Output: ${outputPath}`);
