#!/usr/bin/env node

/**
 * Test Enhanced RSS Processing
 * 
 * Tests the enhanced incident detection in the main RSS processor
 */

import { parseStringPromise } from 'xml2js';
import fetch from 'node-fetch';

// Import the parsing functions (we'll need to make them exportable)
// For now, let's test the logic directly

async function testEnhancedProcessing() {
  console.log('🧪 Testing Enhanced RSS Processing...');
  
  try {
    // Test GCP processing
    console.log('\n📊 Testing GCP Enhanced Processing:');
    const gcpResponse = await fetch('https://status.cloud.google.com/incidents.json');
    const gcpData = await gcpResponse.json();
    
    console.log(`Total GCP incidents in feed: ${gcpData.length}`);
    
    // Apply our enhanced filtering
    const activeGCPIncidents = gcpData.filter(incident => !incident.end);
    console.log(`Active GCP incidents: ${activeGCPIncidents.length}`);
    
    if (activeGCPIncidents.length > 0) {
      console.log('🚨 ACTIVE GCP INCIDENTS:');
      activeGCPIncidents.forEach(incident => {
        const severity = incident.status_impact?.toLowerCase() === 'service_outage' ? 'HIGH' :
                        incident.status_impact?.toLowerCase() === 'service_disruption' ? 'MEDIUM' : 'LOW';
        console.log(`  - ${incident.id}: ${severity} - ${incident.external_desc?.substring(0, 80)}...`);
      });
    } else {
      console.log('✅ No active GCP incidents');
    }
    
    // Test AWS processing (simulate with keywords)
    console.log('\n📊 Testing AWS Keyword Detection:');
    const awsTestCases = [
      { title: 'EC2: Investigating connectivity issues in us-east-1', expected: 'ACTIVE' },
      { title: 'S3: Service restored in eu-west-1', expected: 'RESOLVED' },
      { title: 'Lambda: Elevated error rates resolved', expected: 'RESOLVED' },
      { title: 'RDS: Ongoing maintenance in ap-south-1', expected: 'ACTIVE' },
      { title: 'CloudFront: Service degradation identified', expected: 'ACTIVE' }
    ];
    
    awsTestCases.forEach(testCase => {
      const text = testCase.title.toLowerCase();
      
      const resolvedKeywords = ['resolved', 'restored', 'completed', 'fixed'];
      const activeKeywords = ['investigating', 'identified', 'monitoring', 'ongoing', 'experiencing'];
      
      const isResolved = resolvedKeywords.some(keyword => text.includes(keyword));
      const isActive = activeKeywords.some(keyword => text.includes(keyword));
      
      let detected = 'UNKNOWN';
      if (isResolved) detected = 'RESOLVED';
      else if (isActive) detected = 'ACTIVE';
      
      const correct = detected === testCase.expected ? '✅' : '❌';
      console.log(`  ${correct} "${testCase.title}" → ${detected} (expected: ${testCase.expected})`);
    });
    
    // Test severity classification
    console.log('\n📊 Testing Severity Classification:');
    const severityTestCases = [
      { text: 'Service outage affecting all users', expected: 'HIGH' },
      { text: 'Degraded performance in some regions', expected: 'MEDIUM' },
      { text: 'Scheduled maintenance notification', expected: 'LOW' },
      { text: 'Elevated error rates detected', expected: 'MEDIUM' },
      { text: 'Complete service unavailability', expected: 'HIGH' }
    ];
    
    severityTestCases.forEach(testCase => {
      const text = testCase.text.toLowerCase();
      
      let severity = 'MEDIUM';
      if (text.includes('outage') || text.includes('unavailable') || text.includes('down')) {
        severity = 'HIGH';
      } else if (text.includes('maintenance') || text.includes('scheduled') || text.includes('informational')) {
        severity = 'LOW';
      }
      
      const correct = severity === testCase.expected ? '✅' : '❌';
      console.log(`  ${correct} "${testCase.text}" → ${severity} (expected: ${testCase.expected})`);
    });
    
    console.log('\n✅ Enhanced processing tests complete!');
    
  } catch (error) {
    console.error('❌ Error testing enhanced processing:', error.message);
  }
}

testEnhancedProcessing();