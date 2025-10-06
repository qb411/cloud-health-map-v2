// Quick test to verify regions are properly exported
import { ALL_REGIONS, AWS_REGIONS } from './src/data/regions.ts';

console.log('Total regions:', ALL_REGIONS.length);
console.log('AWS regions:', AWS_REGIONS.length);

const awsRegions = ALL_REGIONS.filter(r => r.provider === 'aws');
console.log('AWS regions in ALL_REGIONS:', awsRegions.length);

// Check for specific regions
const usEast1 = ALL_REGIONS.find(r => r.id === 'us-east-1');
const usWest1 = ALL_REGIONS.find(r => r.id === 'us-west-1');
const usWest2 = ALL_REGIONS.find(r => r.id === 'us-west-2');

console.log('us-east-1 found:', !!usEast1);
console.log('us-west-1 found:', !!usWest1);
console.log('us-west-2 found:', !!usWest2);

if (usEast1) console.log('us-east-1:', usEast1.name, usEast1.coordinates);
if (usWest1) console.log('us-west-1:', usWest1.name, usWest1.coordinates);
if (usWest2) console.log('us-west-2:', usWest2.name, usWest2.coordinates);