#!/usr/bin/env node

/**
 * Debug Region Display Issues
 * Identifies potential problems with region display on the map
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 DEBUGGING REGION DISPLAY ISSUES\n');

function checkRegionDisplayIssues() {
  try {
    const regionsPath = path.join(process.cwd(), 'src/data/regions.ts');
    const additionalPath = path.join(process.cwd(), 'src/data/additional-regions.ts');
    
    const regionsContent = fs.readFileSync(regionsPath, 'utf8');
    const additionalContent = fs.readFileSync(additionalPath, 'utf8');
    
    console.log('🔍 POTENTIAL DISPLAY ISSUES:\n');
    
    // 1. Check for duplicate coordinates
    const coordinateMap = new Map();
    const duplicates = [];
    
    const coordinateRegex = /id: '([^']+)'[\s\S]*?coordinates: \{ latitude: ([^,]+), longitude: ([^}]+) \}/g;
    let match;
    
    while ((match = coordinateRegex.exec(regionsContent + additionalContent)) !== null) {
      const [, regionId, lat, lng] = match;
      const coordKey = `${lat.trim()},${lng.trim()}`;
      
      if (coordinateMap.has(coordKey)) {
        duplicates.push({
          coord: coordKey,
          regions: [coordinateMap.get(coordKey), regionId]
        });
      } else {
        coordinateMap.set(coordKey, regionId);
      }
    }
    
    if (duplicates.length > 0) {
      console.log('⚠️  DUPLICATE COORDINATES FOUND:');
      duplicates.forEach(dup => {
        console.log(`   ${dup.coord}: ${dup.regions.join(', ')}`);
      });
      console.log('   → This causes regions to overlap on the map!\n');
    }
    
    // 2. Check for regions too close together (within 50km)
    const regions = [];
    const regionRegex = /id: '([^']+)'[\s\S]*?coordinates: \{ latitude: ([^,]+), longitude: ([^}]+) \}/g;
    let regionMatch;
    
    while ((regionMatch = regionRegex.exec(regionsContent + additionalContent)) !== null) {
      const [, id, lat, lng] = regionMatch;
      regions.push({
        id,
        lat: parseFloat(lat.trim()),
        lng: parseFloat(lng.trim())
      });
    }
    
    console.log('🗺️  CHECKING FOR OVERLAPPING REGIONS (within 50km):\n');
    
    const closeRegions = [];
    for (let i = 0; i < regions.length; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        const distance = calculateDistance(
          regions[i].lat, regions[i].lng,
          regions[j].lat, regions[j].lng
        );
        
        if (distance < 50) {
          closeRegions.push({
            region1: regions[i].id,
            region2: regions[j].id,
            distance: distance.toFixed(1)
          });
        }
      }
    }
    
    if (closeRegions.length > 0) {
      console.log('⚠️  REGIONS TOO CLOSE TOGETHER:');
      closeRegions.forEach(close => {
        console.log(`   ${close.region1} ↔ ${close.region2}: ${close.distance}km apart`);
      });
      console.log('   → These may visually overlap on the map\n');
    }
    
    // 3. Check for invalid coordinates
    console.log('🌍 CHECKING FOR INVALID COORDINATES:\n');
    
    const invalidCoords = [];
    regions.forEach(region => {
      if (region.lat < -90 || region.lat > 90) {
        invalidCoords.push(`${region.id}: Invalid latitude ${region.lat}`);
      }
      if (region.lng < -180 || region.lng > 180) {
        invalidCoords.push(`${region.id}: Invalid longitude ${region.lng}`);
      }
    });
    
    if (invalidCoords.length > 0) {
      console.log('❌ INVALID COORDINATES:');
      invalidCoords.forEach(invalid => console.log(`   ${invalid}`));
    } else {
      console.log('✅ All coordinates are within valid ranges');
    }
    
    // 4. Summary
    console.log('\n📊 DISPLAY ISSUE SUMMARY:');
    console.log(`   Total Regions: ${regions.length}`);
    console.log(`   Duplicate Coordinates: ${duplicates.length}`);
    console.log(`   Close Regions (<50km): ${closeRegions.length}`);
    console.log(`   Invalid Coordinates: ${invalidCoords.length}`);
    
    if (duplicates.length === 0 && closeRegions.length === 0 && invalidCoords.length === 0) {
      console.log('\n🎉 No display issues found in coordinate data!');
      console.log('\n🔍 OTHER POTENTIAL ISSUES:');
      console.log('   1. Map zoom level - regions might be outside current view');
      console.log('   2. Region boundaries too small - increase boundary size');
      console.log('   3. CSS styling - regions might be transparent/hidden');
      console.log('   4. JavaScript errors - check browser console');
      console.log('   5. Data loading issues - check network tab');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  }
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

checkRegionDisplayIssues();