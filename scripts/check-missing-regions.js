#!/usr/bin/env node

/**
 * Check Missing Regions Script
 * Specifically checks for us-east-1, us-west-1, us-west-2
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 CHECKING FOR MISSING REGIONS ON MAP\n');

const CRITICAL_REGIONS = [
  'us-east-1',
  'us-west-1', 
  'us-west-2'
];

try {
  const regionsPath = path.join(process.cwd(), 'src/data/regions.ts');
  const regionsContent = fs.readFileSync(regionsPath, 'utf8');
  
  console.log('Checking critical AWS regions:\n');
  
  CRITICAL_REGIONS.forEach(regionId => {
    const regionRegex = new RegExp(`id: '${regionId}'[\\s\\S]*?coordinates: \\{ latitude: ([^,]+), longitude: ([^}]+) \\}[\\s\\S]*?name: '([^']+)'`, 'g');
    const match = regionRegex.exec(regionsContent);
    
    if (match) {
      const [, lat, lng, name] = match;
      console.log(`✅ ${regionId}: FOUND`);
      console.log(`   Name: ${name}`);
      console.log(`   Coordinates: ${lat.trim()}, ${lng.trim()}`);
      console.log(`   Location: ${getLocationName(regionId, parseFloat(lat), parseFloat(lng))}\n`);
    } else {
      console.log(`❌ ${regionId}: NOT FOUND\n`);
    }
  });
  
  // Check if regions are in ALL_REGIONS export
  console.log('Checking ALL_REGIONS export structure:');
  const hasAllRegions = regionsContent.includes('export const ALL_REGIONS');
  const hasAwsSpread = regionsContent.includes('...AWS_REGIONS');
  
  console.log(`   ALL_REGIONS export: ${hasAllRegions ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`   AWS_REGIONS spread: ${hasAwsSpread ? '✅ FOUND' : '❌ MISSING'}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

function getLocationName(regionId, lat, lng) {
  const locations = {
    'us-east-1': `Ashburn, VA area (${lat > 38.5 && lat < 39.5 && lng > -78 && lng < -77 ? 'CORRECT' : 'WRONG AREA'})`,
    'us-west-1': `San Francisco Bay Area (${lat > 37 && lat < 38 && lng > -123 && lng < -121 ? 'CORRECT' : 'WRONG AREA'})`,
    'us-west-2': `Portland, OR area (${lat > 45 && lat < 46 && lng > -123 && lng < -122 ? 'CORRECT' : 'WRONG AREA'})`
  };
  return locations[regionId] || 'Unknown location';
}