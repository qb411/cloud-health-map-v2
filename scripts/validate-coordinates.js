#!/usr/bin/env node

/**
 * Coordinate Validation Script
 * Validates that region coordinates have been updated correctly
 */

import fs from 'fs';
import path from 'path';

// Expected accurate coordinates from our research
const EXPECTED_COORDINATES = {
  // NEW CRITICAL MISSING REGIONS
  'ca-central-1': { latitude: 45.5017, longitude: -73.5673, location: 'Montreal, QC' },
  'sa-east-1': { latitude: -23.5505, longitude: -46.6333, location: 'São Paulo, Brazil' },
  'northamerica-northeast1': { latitude: 45.5017, longitude: -73.5673, location: 'Montreal, QC' },
  'northamerica-northeast2': { latitude: 43.6532, longitude: -79.3832, location: 'Toronto, ON' },
  'us-east4': { latitude: 39.0458, longitude: -77.5081, location: 'Ashburn, VA' },
  'us-south1': { latitude: 32.7767, longitude: -96.7970, location: 'Dallas, TX' },
  'us-west3': { latitude: 40.7608, longitude: -111.8910, location: 'Salt Lake City, UT' },
  'us-west4': { latitude: 36.1699, longitude: -115.1398, location: 'Las Vegas, NV' },
  'ca-montreal-1': { latitude: 45.5017, longitude: -73.5673, location: 'Montreal, QC' },
  'us-sanjose-1': { latitude: 37.3382, longitude: -121.8863, location: 'San Jose, CA' },
  'us-chicago-1': { latitude: 41.8781, longitude: -87.6298, location: 'Chicago, IL' },
  // AWS High Priority Fixes
  'us-east-1': { latitude: 39.0458, longitude: -77.5081, location: 'Ashburn, VA' },
  'us-east-2': { latitude: 39.9612, longitude: -82.9988, location: 'Columbus, OH' },
  'us-west-1': { latitude: 37.4419, longitude: -122.1430, location: 'Palo Alto, CA' },
  'us-west-2': { latitude: 45.8696, longitude: -119.6880, location: 'Umatilla, OR' },
  'eu-west-1': { latitude: 53.3498, longitude: -6.2603, location: 'Dublin, Ireland' },
  
  // GCP High Priority Fixes
  'us-central1': { latitude: 41.2619, longitude: -95.8608, location: 'Council Bluffs, IA' },
  'us-east1': { latitude: 33.1960, longitude: -79.9760, location: 'Moncks Corner, SC' },
  'europe-west1': { latitude: 50.4501, longitude: 3.8200, location: 'St. Ghislain, Belgium' },
  'asia-east1': { latitude: 24.0518, longitude: 120.5161, location: 'Changhua County, Taiwan' },
  
  // Azure High Priority Fixes
  'eastus': { latitude: 37.5407, longitude: -77.4360, location: 'Richmond, VA' },
  'westus2': { latitude: 47.2529, longitude: -119.8523, location: 'Quincy, WA' },
  
  // Medium Priority Fixes
  'us-gov-east-1': { latitude: 39.0458, longitude: -77.5081, location: 'Ashburn, VA' },
  'us-gov-west-1': { latitude: 45.8696, longitude: -119.6880, location: 'Umatilla, OR' },
  'us-west1': { latitude: 45.6945, longitude: -121.1786, location: 'The Dalles, OR' }
};

function validateCoordinates() {
  console.log('🔍 Validating Region Coordinate Updates...\n');
  
  let totalChecked = 0;
  let correctUpdates = 0;
  let incorrectUpdates = 0;
  
  // Read the main regions file
  try {
    const regionsPath = path.join(process.cwd(), 'src/data/regions.ts');
    const regionsContent = fs.readFileSync(regionsPath, 'utf8');
    
    // Read additional regions file
    const additionalPath = path.join(process.cwd(), 'src/data/additional-regions.ts');
    const additionalContent = fs.readFileSync(additionalPath, 'utf8');
    
    const allContent = regionsContent + '\n' + additionalContent;
    
    // Check each expected coordinate
    for (const [regionId, expected] of Object.entries(EXPECTED_COORDINATES)) {
      totalChecked++;
      
      // Look for the region definition
      const regionRegex = new RegExp(`id: '${regionId}'[\\s\\S]*?coordinates: \\{ latitude: ([\\d.-]+), longitude: ([\\d.-]+) \\}`, 'g');
      const match = regionRegex.exec(allContent);
      
      if (match) {
        const actualLat = parseFloat(match[1]);
        const actualLng = parseFloat(match[2]);
        
        // Check if coordinates match (within 0.0001 tolerance for floating point comparison)
        const latMatch = Math.abs(actualLat - expected.latitude) < 0.0001;
        const lngMatch = Math.abs(actualLng - expected.longitude) < 0.0001;
        
        if (latMatch && lngMatch) {
          console.log(`✅ ${regionId}: Correctly updated to ${expected.location}`);
          console.log(`   Expected: ${expected.latitude}, ${expected.longitude}`);
          console.log(`   Actual:   ${actualLat}, ${actualLng}\n`);
          correctUpdates++;
        } else {
          console.log(`❌ ${regionId}: Incorrect coordinates for ${expected.location}`);
          console.log(`   Expected: ${expected.latitude}, ${expected.longitude}`);
          console.log(`   Actual:   ${actualLat}, ${actualLng}\n`);
          incorrectUpdates++;
        }
      } else {
        console.log(`⚠️  ${regionId}: Region not found in files\n`);
        incorrectUpdates++;
      }
    }
    
    // Summary
    console.log('📊 Validation Summary:');
    console.log(`   Total Checked: ${totalChecked}`);
    console.log(`   ✅ Correct Updates: ${correctUpdates}`);
    console.log(`   ❌ Incorrect/Missing: ${incorrectUpdates}`);
    console.log(`   📈 Success Rate: ${Math.round((correctUpdates / totalChecked) * 100)}%\n`);
    
    if (correctUpdates === totalChecked) {
      console.log('🎉 All coordinate updates are correct!');
      console.log('   The map should now display regions at accurate data center locations.');
    } else {
      console.log('⚠️  Some coordinates need attention. Please review the incorrect updates above.');
    }
    
  } catch (error) {
    console.error('❌ Error reading region files:', error.message);
    process.exit(1);
  }
}

// Run validation
validateCoordinates();