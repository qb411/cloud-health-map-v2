#!/usr/bin/env node

/**
 * Incident Detection Analysis Script
 * 
 * This script fetches live data from cloud provider feeds to analyze
 * incident patterns and identify active vs resolved incidents.
 */

import { parseStringPromise } from 'xml2js';
import fetch from 'node-fetch';

// Cloud provider endpoints
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
  },
  oci_incidents: {
    name: 'OCI Incidents',
    url: 'https://ocistatus.oraclecloud.com/api/v2/incident-summary.rss',
    type: 'xml'
  }
};

async function fetchFeedData(provider) {
  try {
    console.log(`\n🔍 Fetching ${provider.name} data from: ${provider.url}`);
    
    const response = await fetch(provider.url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Cloud-Status-Dashboard/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.text();
    
    if (provider.type === 'xml') {
      const parsed = await parseStringPromise(data);
      return { raw: data, parsed };
    } else {
      return { raw: data, parsed: JSON.parse(data) };
    }
    
  } catch (error) {
    console.error(`❌ Failed to fetch ${provider.name}:`, error.message);
    return null;
  }
}

function analyzeAWSIncidents(data) {
  console.log('\n📊 AWS INCIDENT ANALYSIS:');
  
  if (!data?.parsed?.rss?.channel?.[0]?.item) {
    console.log('No incidents found');
    return;
  }

  const items = data.parsed.rss.channel[0].item;
  console.log(`Total items: ${items.length}`);
  
  // Analyze recent items for patterns
  const recentItems = items.slice(0, 10);
  
  recentItems.forEach((item, index) => {
    const title = item.title?.[0] || '';
    const description = item.description?.[0] || '';
    const pubDate = item.pubDate?.[0];
    
    console.log(`\n--- Item ${index + 1} ---`);
    console.log(`Title: ${title}`);
    console.log(`Date: ${pubDate}`);
    console.log(`Description: ${description.substring(0, 200)}...`);
    
    // Look for status indicators
    const statusKeywords = ['resolved', 'investigating', 'identified', 'monitoring', 'outage', 'degraded'];
    const foundKeywords = statusKeywords.filter(keyword => 
      title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword)
    );
    console.log(`Status keywords found: ${foundKeywords.join(', ')}`);
  });
}

function analyzeAzureIncidents(data) {
  console.log('\n📊 AZURE INCIDENT ANALYSIS:');
  
  if (!data?.parsed?.rss?.channel?.[0]?.item) {
    console.log('No incidents found');
    return;
  }

  const items = data.parsed.rss.channel[0].item;
  console.log(`Total items: ${items.length}`);
  
  // Analyze recent items
  const recentItems = items.slice(0, 10);
  
  recentItems.forEach((item, index) => {
    const title = item.title?.[0] || '';
    const description = item.description?.[0] || '';
    const pubDate = item.pubDate?.[0];
    
    console.log(`\n--- Item ${index + 1} ---`);
    console.log(`Title: ${title}`);
    console.log(`Date: ${pubDate}`);
    console.log(`Description: ${description.substring(0, 200)}...`);
    
    // Look for Azure-specific status patterns
    const statusKeywords = ['resolved', 'investigating', 'mitigated', 'ongoing', 'preliminary'];
    const foundKeywords = statusKeywords.filter(keyword => 
      title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword)
    );
    console.log(`Status keywords found: ${foundKeywords.join(', ')}`);
  });
}

function analyzeGCPIncidents(data) {
  console.log('\n📊 GCP INCIDENT ANALYSIS:');
  
  if (!data?.parsed?.length) {
    console.log('No incidents found');
    return;
  }

  console.log(`Total incidents: ${data.parsed.length}`);
  
  // Analyze recent incidents
  const recentIncidents = data.parsed.slice(0, 10);
  
  recentIncidents.forEach((incident, index) => {
    console.log(`\n--- Incident ${index + 1} ---`);
    console.log(`ID: ${incident.id}`);
    console.log(`Status Impact: ${incident.status_impact}`);
    console.log(`Severity: ${incident.severity}`);
    console.log(`Begin: ${incident.begin}`);
    console.log(`End: ${incident.end || 'ONGOING'}`);
    console.log(`Summary: ${incident.external_desc?.substring(0, 200)}...`);
    
    // Check if incident is active
    const isActive = !incident.end;
    console.log(`Active: ${isActive ? 'YES' : 'NO'}`);
    
    if (incident.updates?.length > 0) {
      const latestUpdate = incident.updates[0];
      console.log(`Latest update: ${latestUpdate.status} - ${latestUpdate.text?.substring(0, 100)}...`);
    }
  });
}

function analyzeOCIIncidents(data) {
  console.log('\n📊 OCI INCIDENT ANALYSIS:');
  
  if (data?.parsed?.incidents) {
    console.log(`Total incidents: ${data.parsed.incidents.length}`);
    
    data.parsed.incidents.slice(0, 5).forEach((incident, index) => {
      console.log(`\n--- Incident ${index + 1} ---`);
      console.log(`ID: ${incident.id}`);
      console.log(`Status: ${incident.status}`);
      console.log(`Impact: ${incident.impact}`);
      console.log(`Created: ${incident.created_at}`);
      console.log(`Updated: ${incident.updated_at}`);
      console.log(`Name: ${incident.name}`);
    });
  } else {
    console.log('No incidents found in status endpoint');
  }
}

function analyzeOCIIncidentRSS(data) {
  console.log('\n📊 OCI INCIDENT RSS ANALYSIS:');
  
  if (!data?.parsed?.rss?.channel?.[0]?.item) {
    console.log('No incidents found in RSS feed');
    return;
  }

  const items = data.parsed.rss.channel[0].item;
  console.log(`Total RSS items: ${items.length}`);
  
  items.slice(0, 5).forEach((item, index) => {
    const title = item.title?.[0] || '';
    const description = item.description?.[0] || '';
    const pubDate = item.pubDate?.[0];
    
    console.log(`\n--- RSS Item ${index + 1} ---`);
    console.log(`Title: ${title}`);
    console.log(`Date: ${pubDate}`);
    console.log(`Description: ${description.substring(0, 200)}...`);
  });
}

async function main() {
  console.log('🚀 Starting Cloud Provider Incident Analysis...');
  
  // Fetch data from all providers
  const results = {};
  
  for (const [key, provider] of Object.entries(PROVIDERS)) {
    results[key] = await fetchFeedData(provider);
    
    // Add delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Analyze each provider's data
  if (results.aws) analyzeAWSIncidents(results.aws);
  if (results.azure) analyzeAzureIncidents(results.azure);
  if (results.gcp) analyzeGCPIncidents(results.gcp);
  if (results.oci) analyzeOCIIncidents(results.oci);
  if (results.oci_incidents) analyzeOCIIncidentRSS(results.oci_incidents);
  
  console.log('\n✅ Analysis complete!');
}

// Run the analysis
main().catch(console.error);