#!/usr/bin/env node

/**
 * Test Enhanced Incident Detection
 * 
 * Tests our detection logic against live feed data
 */

import { parseStringPromise } from 'xml2js';
import fetch from 'node-fetch';
import { 
  detectGCPIncidentStatus, 
  classifyGCPSeverity,
  processEnhancedIncidents 
} from './enhanced-incident-detection.js';

async function testGCPDetection() {
  console.log('🧪 Testing GCP Incident Detection...');
  
  try {
    const response = await fetch('https://status.cloud.google.com/incidents.json');
    const incidents = await response.json();
    
    console.log(`\nAnalyzing ${incidents.length} GCP incidents:`);
    
    let activeCount = 0;
    let resolvedCount = 0;
    
    incidents.slice(0, 10).forEach((incident, index) => {
      const statusInfo = detectGCPIncidentStatus(incident);
      const severity = classifyGCPSeverity(incident);
      
      console.log(`\n--- Incident ${index + 1} ---`);
      console.log(`ID: ${incident.id}`);
      console.log(`Status Impact: ${incident.status_impact}`);
      console.log(`Detected Status: ${statusInfo.status} (${statusInfo.confidence} confidence)`);
      console.log(`Severity: ${severity}`);
      console.log(`Begin: ${incident.begin}`);
      console.log(`End: ${incident.end || 'ONGOING'}`);
      console.log(`Active: ${statusInfo.status === 'active' ? 'YES' : 'NO'}`);
      
      if (statusInfo.status === 'active') {
        activeCount++;
      } else {
        resolvedCount++;
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`Active incidents: ${activeCount}`);
    console.log(`Resolved incidents: ${resolvedCount}`);
    
    // Test the enhanced processing function
    console.log('\n🔄 Testing enhanced processing...');
    const processedIncidents = processEnhancedIncidents('gcp', incidents);
    const activeIncidents = processedIncidents.filter(i => i.isActive);
    
    console.log(`Processed ${processedIncidents.length} incidents`);
    console.log(`Found ${activeIncidents.length} active incidents`);
    
    if (activeIncidents.length > 0) {
      console.log('\n🚨 ACTIVE INCIDENTS DETECTED:');
      activeIncidents.forEach(incident => {
        console.log(`- ${incident.id}: ${incident.severity} severity`);
        console.log(`  ${incident.title?.substring(0, 100)}...`);
      });
    } else {
      console.log('\n✅ No active incidents detected');
    }
    
  } catch (error) {
    console.error('❌ Error testing GCP detection:', error.message);
  }
}

async function main() {
  await testGCPDetection();
}

main().catch(console.error);