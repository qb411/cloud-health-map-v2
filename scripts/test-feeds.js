#!/usr/bin/env node

/**
 * Test script to verify RSS feeds are accessible and parseable
 * Run this to test the feeds without writing to database
 */

import { parseStringPromise } from 'xml2js';
import fetch from 'node-fetch';

const PROVIDERS = {
  aws: {
    name: 'AWS',
    url: 'https://status.aws.amazon.com/rss/all.rss',
    type: 'xml'
  },
  azure: {
    name: 'Azure', 
    url: 'https://status.azure.com/en-us/status/feed/',
    type: 'xml'
  },
  gcp: {
    name: 'GCP',
    url: 'https://status.cloud.google.com/incidents.json',
    type: 'json'
  },
  oci: {
    name: 'OCI',
    url: 'https://ocistatus.oraclecloud.com/api/v2/status.json',
    type: 'json'
  }
};

async function testProvider(providerId, config) {
  console.log(`\n📡 Testing ${config.name} (${config.type.toUpperCase()})...`);
  console.log(`🔗 URL: ${config.url}`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(config.url, {
      headers: {
        'User-Agent': 'CloudStatusDashboard-Test/1.0'
      },
      timeout: 10000
    });

    const fetchTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.text();
    const dataSize = (data.length / 1024).toFixed(2);
    
    console.log(`✅ Response: ${response.status} ${response.statusText}`);
    console.log(`⏱️  Fetch time: ${fetchTime}ms`);
    console.log(`📦 Data size: ${dataSize} KB`);

    // Try to parse the data
    if (config.type === 'json') {
      const jsonData = JSON.parse(data);
      const itemCount = Array.isArray(jsonData) ? jsonData.length : 
                       jsonData.incidents ? jsonData.incidents.length : 'unknown';
      console.log(`📊 Items found: ${itemCount}`);
      
      // Show sample item
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        console.log(`📄 Sample item:`, JSON.stringify(jsonData[0], null, 2).substring(0, 200) + '...');
      } else if (jsonData.incidents && jsonData.incidents.length > 0) {
        console.log(`📄 Sample incident:`, JSON.stringify(jsonData.incidents[0], null, 2).substring(0, 200) + '...');
      }
      
    } else {
      const xmlData = await parseStringPromise(data);
      const itemCount = xmlData.rss?.channel?.[0]?.item?.length || 0;
      console.log(`📊 RSS items found: ${itemCount}`);
      
      // Show sample item
      if (xmlData.rss?.channel?.[0]?.item?.[0]) {
        const sampleItem = xmlData.rss.channel[0].item[0];
        console.log(`📄 Sample item title: ${sampleItem.title?.[0] || 'No title'}`);
        console.log(`📄 Sample item date: ${sampleItem.pubDate?.[0] || 'No date'}`);
      }
    }

    console.log(`✅ ${config.name} test passed!`);
    return true;

  } catch (error) {
    console.error(`❌ ${config.name} test failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing RSS feeds for all cloud providers...');
  console.log(`📅 ${new Date().toISOString()}\n`);

  let passed = 0;
  let failed = 0;

  for (const [providerId, config] of Object.entries(PROVIDERS)) {
    const success = await testProvider(providerId, config);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n⚠️  Some feeds failed. Check network connectivity and URLs.');
    process.exit(1);
  } else {
    console.log('\n🎉 All feeds are working correctly!');
  }
}

main().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});