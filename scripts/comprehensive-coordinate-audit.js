#!/usr/bin/env node

/**
 * Comprehensive Coordinate Audit Script
 * Validates all region coordinates against known data center locations
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 COMPREHENSIVE COORDINATE AUDIT\n');

// Known accurate data center locations (researched from official sources)
const KNOWN_LOCATIONS = {
  // AWS - Major regions with known data center locations
  'us-east-1': { lat: 39.0458, lng: -77.5081, city: 'Ashburn, VA', source: 'AWS Northern Virginia data center hub' },
  'us-east-2': { lat: 39.9612, lng: -82.9988, city: 'Columbus, OH', source: 'AWS Ohio data center' },
  'us-west-1': { lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA', source: 'AWS Northern California (SF Bay Area)' },
  'us-west-2': { lat: 45.5152, lng: -122.6784, city: 'Portland, OR', source: 'AWS Oregon data center' },
  'eu-west-1': { lat: 53.3498, lng: -6.2603, city: 'Dublin, Ireland', source: 'AWS Ireland data center' },
  'eu-central-1': { lat: 50.1109, lng: 8.6821, city: 'Frankfurt, Germany', source: 'AWS Frankfurt data center' },
  'ap-southeast-1': { lat: 1.3521, lng: 103.8198, city: 'Singapore', source: 'AWS Singapore data center' },
  'ap-northeast-1': { lat: 35.6762, lng: 139.6503, city: 'Tokyo, Japan', source: 'AWS Tokyo data center' },
  'ca-central-1': { lat: 45.5017, lng: -73.5673, city: 'Montreal, QC', source: 'AWS Canada Central' },
  
  // GCP - Major regions
  'us-central1': { lat: 41.2619, lng: -95.8608, city: 'Council Bluffs, IA', source: 'Google Iowa data center' },
  'us-east1': { lat: 33.1960, lng: -79.9760, city: 'Moncks Corner, SC', source: 'Google South Carolina data center' },
  'us-west1': { lat: 45.6945, lng: -121.1786, city: 'The Dalles, OR', source: 'Google Oregon data center' },
  'europe-west1': { lat: 50.4501, lng: 3.8200, city: 'St. Ghislain, Belgium', source: 'Google Belgium data center' },
  'asia-east1': { lat: 24.0518, lng: 120.5161, city: 'Changhua County, Taiwan', source: 'Google Taiwan data center' },
  
  // Azure - Major regions
  'eastus': { lat: 37.5407, lng: -77.4360, city: 'Richmond, VA', source: 'Microsoft East US' },
  'westus2': { lat: 47.2529, lng: -119.8523, city: 'Quincy, WA', source: 'Microsoft West US 2' },
  'westeurope': { lat: 52.3676, lng: 4.9041, city: 'Amsterdam, Netherlands', source: 'Microsoft West Europe' },
  'southeastasia': { lat: 1.3521, lng: 103.8198, city: 'Singapore', source: 'Microsoft Southeast Asia' },
  
  // OCI - Major regions
  'us-ashburn-1': { lat: 39.0458, lng: -77.5081, city: 'Ashburn, VA', source: 'Oracle Ashburn' },
  'us-phoenix-1': { lat: 33.4484, lng: -112.0740, city: 'Phoenix, AZ', source: 'Oracle Phoenix' },
  'eu-frankfurt-1': { lat: 50.1109, lng: 8.6821, city: 'Frankfurt, Germany', source: 'Oracle Frankfurt' }
};

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function auditRegionCoordinates() {
  try {
    // Read regions files
    const regionsPath = path.join(process.cwd(), 'src/data/regions.ts');
    const additionalPath = path.join(process.cwd(), 'src/data/additional-regions.ts');
    
    const regionsContent = fs.readFileSync(regionsPath, 'utf8');
    const additionalContent = fs.readFileSync(additionalPath, 'utf8');
    const allContent = regionsContent + '\n' + additionalContent;
    
    let totalChecked = 0;
    let accurateRegions = 0;
    let inaccurateRegions = 0;
    let criticalIssues = [];
    
    console.log('🔍 AUDITING MAJOR REGION COORDINATES:\n');
    
    for (const [regionId, expected] of Object.entries(KNOWN_LOCATIONS)) {
      totalChecked++;
      
      // Extract coordinates from the file
      const regionRegex = new RegExp(`id: '${regionId}'[\\s\\S]*?coordinates: \\{ latitude: ([\\d.-]+), longitude: ([\\d.-]+) \\}`, 'g');
      const match = regionRegex.exec(allContent);
      
      if (match) {
        const actualLat = parseFloat(match[1]);
        const actualLng = parseFloat(match[2]);
        
        // Calculate distance between expected and actual coordinates
        const distance = calculateDistance(expected.lat, expected.lng, actualLat, actualLng);
        
        // Tolerance: 50km for accurate, 100km for acceptable, >100km for critical
        if (distance <= 50) {
          console.log(`✅ ${regionId}: ACCURATE (${distance.toFixed(1)}km from expected)`);
          console.log(`   Expected: ${expected.city} (${expected.lat}, ${expected.lng})`);
          console.log(`   Actual:   (${actualLat}, ${actualLng})\n`);
          accurateRegions++;
        } else if (distance <= 100) {
          console.log(`⚠️  ${regionId}: ACCEPTABLE (${distance.toFixed(1)}km from expected)`);
          console.log(`   Expected: ${expected.city} (${expected.lat}, ${expected.lng})`);
          console.log(`   Actual:   (${actualLat}, ${actualLng})`);
          console.log(`   Note: Within 100km tolerance but could be more precise\n`);
          accurateRegions++;
        } else {
          console.log(`❌ ${regionId}: CRITICAL ISSUE (${distance.toFixed(1)}km from expected)`);
          console.log(`   Expected: ${expected.city} (${expected.lat}, ${expected.lng})`);
          console.log(`   Actual:   (${actualLat}, ${actualLng})`);
          console.log(`   Source: ${expected.source}\n`);
          inaccurateRegions++;
          criticalIssues.push({
            regionId,
            expected,
            actual: { lat: actualLat, lng: actualLng },
            distance: distance.toFixed(1)
          });
        }
      } else {
        console.log(`⚠️  ${regionId}: NOT FOUND in region files\n`);
        inaccurateRegions++;
      }
    }
    
    // Summary
    console.log('📊 AUDIT SUMMARY:');
    console.log(`   Total Checked: ${totalChecked}`);
    console.log(`   ✅ Accurate/Acceptable: ${accurateRegions}`);
    console.log(`   ❌ Critical Issues: ${inaccurateRegions}`);
    console.log(`   📈 Accuracy Rate: ${Math.round((accurateRegions / totalChecked) * 100)}%\n`);
    
    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
      criticalIssues.forEach(issue => {
        console.log(`   ${issue.regionId}: ${issue.distance}km off from ${issue.expected.city}`);
      });
      console.log('\n🔧 RECOMMENDED FIXES:');
      criticalIssues.forEach(issue => {
        console.log(`   ${issue.regionId}: Update to ${issue.expected.lat}, ${issue.expected.lng} (${issue.expected.city})`);
      });
    } else {
      console.log('🎉 All major regions have accurate coordinates!');
    }
    
  } catch (error) {
    console.error('❌ Error during audit:', error.message);
  }
}

auditRegionCoordinates();