#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// RSS/API endpoints
const endpoints = {
  aws: 'https://status.aws.amazon.com/rss/all.rss',
  azure: 'https://status.azure.com/en-us/status/feed/',
  gcp: 'https://status.cloud.google.com/incidents.json',
  oci: 'https://ocistatus.oraclecloud.com/api/v2/incidents.json'
};

// Process AWS RSS feed
async function processAWSStatus() {
  try {
    console.log('Processing AWS status...');
    const response = await fetch(endpoints.aws);
    const xmlData = await response.text();
    const result = await parseXML(xmlData);
    
    const items = result.rss?.channel?.[0]?.item || [];
    const incidents = items.slice(0, 10).map(item => ({
      title: item.title?.[0] || '',
      description: item.description?.[0] || '',
      pubDate: item.pubDate?.[0] || '',
      link: item.link?.[0] || ''
    }));
    
    const status = determineOverallStatus(incidents);
    
    return {
      provider: 'aws',
      status,
      incidents,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('AWS processing failed:', error);
    return { provider: 'aws', status: 'operational', incidents: [], lastUpdated: new Date().toISOString() };
  }
}

// Process Azure RSS feed
async function processAzureStatus() {
  try {
    console.log('Processing Azure status...');
    const response = await fetch(endpoints.azure);
    const xmlData = await response.text();
    const result = await parseXML(xmlData);
    
    const items = result.rss?.channel?.[0]?.item || [];
    const incidents = items.slice(0, 10).map(item => ({
      title: item.title?.[0] || '',
      description: item.description?.[0] || '',
      pubDate: item.pubDate?.[0] || '',
      link: item.link?.[0] || ''
    }));
    
    const status = determineOverallStatus(incidents);
    
    return {
      provider: 'azure',
      status,
      incidents,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Azure processing failed:', error);
    return { provider: 'azure', status: 'operational', incidents: [], lastUpdated: new Date().toISOString() };
  }
}

// Process GCP JSON API
async function processGCPStatus() {
  try {
    console.log('Processing GCP status...');
    const response = await fetch(endpoints.gcp);
    const data = await response.json();
    
    const incidents = (data || []).slice(0, 10).map(incident => ({
      title: incident.external_desc || incident.most_recent_update?.text || '',
      description: incident.most_recent_update?.text || '',
      pubDate: incident.begin || incident.most_recent_update?.created || '',
      link: `https://status.cloud.google.com/incident/${incident.id}`
    }));
    
    const status = determineOverallStatus(incidents);
    
    return {
      provider: 'gcp',
      status,
      incidents,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('GCP processing failed:', error);
    return { provider: 'gcp', status: 'operational', incidents: [], lastUpdated: new Date().toISOString() };
  }
}

// Process OCI JSON API
async function processOCIStatus() {
  try {
    console.log('Processing OCI status...');
    const response = await fetch(endpoints.oci);
    const data = await response.json();
    
    const incidents = (data.incidents || []).slice(0, 10).map(incident => ({
      title: incident.name || '',
      description: incident.incident_updates?.[0]?.body || '',
      pubDate: incident.created_at || '',
      link: incident.shortlink || ''
    }));
    
    const status = determineOverallStatus(incidents);
    
    return {
      provider: 'oci',
      status,
      incidents,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('OCI processing failed:', error);
    return { provider: 'oci', status: 'operational', incidents: [], lastUpdated: new Date().toISOString() };
  }
}

// Determine overall status from incidents
function determineOverallStatus(incidents) {
  if (incidents.length === 0) return 'operational';
  
  const hasOutage = incidents.some(incident => 
    incident.title.toLowerCase().includes('outage') ||
    incident.title.toLowerCase().includes('unavailable') ||
    incident.title.toLowerCase().includes('down')
  );
  
  if (hasOutage) return 'outage';
  
  const hasDegradation = incidents.some(incident =>
    incident.title.toLowerCase().includes('degraded') ||
    incident.title.toLowerCase().includes('slow') ||
    incident.title.toLowerCase().includes('issue')
  );
  
  return hasDegradation ? 'degraded' : 'operational';
}

// Update Supabase database
async function updateDatabase(statusData) {
  try {
    const { data, error } = await supabase
      .from('cloud_status')
      .upsert(statusData, { 
        onConflict: 'provider',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Database update error:', error);
    } else {
      console.log(`Updated ${statusData.provider} status in database`);
    }
  } catch (error) {
    console.error('Database update failed:', error);
  }
}

// Main execution
async function main() {
  console.log('Starting cloud status update...');
  
  try {
    // Process all providers in parallel
    const [awsStatus, azureStatus, gcpStatus, ociStatus] = await Promise.all([
      processAWSStatus(),
      processAzureStatus(),
      processGCPStatus(),
      processOCIStatus()
    ]);
    
    // Update database for each provider
    await Promise.all([
      updateDatabase(awsStatus),
      updateDatabase(azureStatus),
      updateDatabase(gcpStatus),
      updateDatabase(ociStatus)
    ]);
    
    console.log('Cloud status update completed successfully');
  } catch (error) {
    console.error('Main execution failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
