#!/usr/bin/env node

/**
 * Validate Region Export Script
 * Checks if core AWS regions are properly exported
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 VALIDATING REGION EXPORTS\n');

try {
  // Read the regions file content
  const regionsPath = path.join(process.cwd(), 'src/data/regions.ts');
  const regionsContent = fs.readFileSync(regionsPath, 'utf8');
  
  // Check for core AWS regions
  const coreRegions = ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2'];
  
  console.log('Checking for core AWS regions in regions.ts:');
  coreRegions.forEach(regionId => {
    const found = regionsContent.includes(`id: '${regionId}'`);
    console.log(`  ${found ? '✅' : '❌'} ${regionId}: ${found ? 'FOUND' : 'MISSING'}`);
  });
  
  // Check ALL_REGIONS export
  const hasAllRegionsExport = regionsContent.includes('export const ALL_REGIONS');
  const hasAwsRegionsSpread = regionsContent.includes('...AWS_REGIONS');
  
  console.log('\nChecking exports:');
  console.log(`  ${hasAllRegionsExport ? '✅' : '❌'} ALL_REGIONS export: ${hasAllRegionsExport ? 'FOUND' : 'MISSING'}`);
  console.log(`  ${hasAwsRegionsSpread ? '✅' : '❌'} AWS_REGIONS spread: ${hasAwsRegionsSpread ? 'FOUND' : 'MISSING'}`);
  
  // Count total regions mentioned
  const regionMatches = regionsContent.match(/id: '[^']+'/g) || [];
  console.log(`\nTotal regions found in file: ${regionMatches.length}`);
  
  // Check if there are any syntax issues
  const hasSyntaxErrors = regionsContent.includes('undefined') || regionsContent.includes('null');
  console.log(`Potential syntax issues: ${hasSyntaxErrors ? '⚠️ YES' : '✅ NO'}`);
  
  console.log('\n📋 RECOMMENDATIONS:');
  if (coreRegions.every(regionId => regionsContent.includes(`id: '${regionId}'`))) {
    console.log('✅ All core AWS regions are present in the file');
    console.log('🔄 Issue might be:');
    console.log('   1. Browser cache - try hard refresh (Ctrl+F5)');
    console.log('   2. GitHub Pages deployment delay - wait 2-3 minutes');
    console.log('   3. CDN cache - may take up to 10 minutes to update');
    console.log('   4. Check browser console for JavaScript errors');
  } else {
    console.log('❌ Some core AWS regions are missing from the file');
    console.log('🔧 Need to fix the regions.ts file');
  }
  
} catch (error) {
  console.error('❌ Error reading regions file:', error.message);
}