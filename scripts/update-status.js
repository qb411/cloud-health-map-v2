#!/usr/bin/env node

/**
 * Cloud Status Dashboard - RSS Feed Processor
 * 
 * This script fetches status data from all major cloud providers:
 * - AWS: RSS XML feed
 * - Azure: RSS XML feed  
 * - GCP: JSON API
 * - OCI: JSON API
 * 
 * Processes the data and stores it in Supabase for the dashboard.
 */

import { createClient } from '@supabase/supabase-js';
import { parseStringPromise } from 'xml2js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { REGION_MAPPINGS, getRegionName } from './region-mappings.js';

// Load environment variables
dotenv.config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

// Initialize Supabase client with service role key for write access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Cloud provider RSS/API endpoints
const PROVIDERS = {
  aws: {
    name: 'AWS',
    url: 'https://status.aws.amazon.com/rss/all.rss',
    type: 'xml',
    parser: parseAWSFeed
  },
  azure: {
    name: 'Azure', 
    url: 'https://status.azure.com/en-us/status/feed/',
    type: 'xml',
    parser: parseAzureFeed
  },
  gcp: {
    name: 'GCP',
    url: 'https://status.cloud.google.com/incidents.json',
    type: 'json',
    parser: parseGCPFeed
  },
  oci: {
    name: 'OCI',
    url: 'https://ocistatus.oraclecloud.com/api/v2/status.json',
    type: 'json', 
    parser: parseOCIFeed
  }
};

// Region mappings now imported from region-mappings.js (176 regions total)
// AWS: 37 regions, Azure: 59 regions, GCP: 41 regions, OCI: 39 regions

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting cloud status RSS feed processing...');
  console.log(`📅 ${new Date().toISOString()}`);
  
  const results = {
    success: 0,
    errors: 0,
    totalIncidents: 0
  };

  // Process each provider
  for (const [providerId, config] of Object.entries(PROVIDERS)) {
    try {
      console.log(`\n📡 Processing ${config.name} (${providerId})...`);
      
      const incidents = await fetchAndParseProvider(providerId, config);
      
      if (incidents.length > 0) {
        await storeIncidents(providerId, incidents);
        console.log(`✅ ${config.name}: ${incidents.length} incidents processed`);
        results.totalIncidents += incidents.length;
      } else {
        console.log(`✅ ${config.name}: No active incidents`);
      }
      
      results.success++;
      
    } catch (error) {
      console.error(`❌ ${config.name} failed:`, error.message);
      results.errors++;
    }
  }

  // Update region status summaries
  await updateRegionSummaries();

  // Print summary
  console.log('\n📊 Processing Summary:');
  console.log(`   ✅ Successful providers: ${results.success}`);
  console.log(`   ❌ Failed providers: ${results.errors}`);
  console.log(`   📈 Total incidents processed: ${results.totalIncidents}`);
  console.log(`   🏁 Completed at: ${new Date().toISOString()}`);

  if (results.errors > 0) {
    process.exit(1); // Exit with error code for GitHub Actions
  }
}

/**
 * Fetch and parse data from a cloud provider
 */
async function fetchAndParseProvider(providerId, config) {
  const response = await fetch(config.url, {
    headers: {
      'User-Agent': 'CloudStatusDashboard/1.0 (+https://github.com/your-repo)'
    },
    timeout: 30000 // 30 second timeout
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.text();
  
  if (config.type === 'json') {
    const jsonData = JSON.parse(data);
    return await config.parser(jsonData, providerId);
  } else {
    const xmlData = await parseStringPromise(data);
    return await config.parser(xmlData, providerId);
  }
}

/**
 * Parse AWS RSS feed
 */
async function parseAWSFeed(xmlData, providerId) {
  const incidents = [];
  
  if (!xmlData.rss?.channel?.[0]?.item) {
    return incidents;
  }

  for (const item of xmlData.rss.channel[0].item) {
    try {
      const title = item.title?.[0] || '';
      const description = item.description?.[0] || '';
      const pubDate = item.pubDate?.[0];
      const guid = item.guid?.[0]?._ || item.guid?.[0];

      // Extract region and service from title/description
      const regionMatch = title.match(/\[([\w-]+)\]/);
      const regionId = regionMatch ? regionMatch[1] : 'global';
      
      // Enhanced incident detection for AWS
      const text = `${title} ${description}`.toLowerCase();
      
      // Check if incident is resolved
      const resolvedKeywords = ['resolved', 'restored', 'completed', 'fixed'];
      const isResolved = resolvedKeywords.some(keyword => text.includes(keyword));
      
      // Check if incident is active
      const activeKeywords = ['investigating', 'identified', 'monitoring', 'ongoing', 'experiencing'];
      const isActive = activeKeywords.some(keyword => text.includes(keyword));
      
      // Skip resolved incidents for real-time status
      if (isResolved) {
        continue;
      }
      
      // Determine status and severity
      let status = 'operational';
      let severity = 'medium';
      
      if (text.includes('outage') || text.includes('unavailable') || text.includes('down') || text.includes('failed')) {
        status = 'outage';
        severity = 'high';
      } else if (text.includes('degraded') || text.includes('elevated error') || text.includes('intermittent')) {
        status = 'degraded';
        severity = 'medium';
      } else if (text.includes('maintenance') || text.includes('scheduled')) {
        status = 'maintenance';
        severity = 'low';
      }
      
      // Only process if there's a clear issue or it's explicitly active
      if (status === 'operational' && !isActive) {
        continue;
      }

      // Extract service name
      const serviceMatch = title.match(/^([^:]+):/);
      const serviceName = serviceMatch ? serviceMatch[1].trim() : 'AWS Service';

      incidents.push({
        provider: providerId,
        region_id: regionId,
        region_name: REGION_MAPPINGS[providerId]?.[regionId] || regionId,
        service_name: serviceName,
        status: status,
        severity: severity,
        incident_severity: severity, // For database compatibility
        is_active: isActive || (status !== 'operational'),
        detection_confidence: isActive ? 'high' : 'medium',
        incident_id: guid,
        incident_title: title,
        incident_description: description,
        start_time: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        end_time: null, // AWS RSS doesn't provide end times
        last_updated: new Date().toISOString()
      });

    } catch (error) {
      console.warn(`⚠️  Skipping malformed AWS item:`, error.message);
    }
  }

  return incidents;
}

/**
 * Parse Azure RSS feed
 */
async function parseAzureFeed(xmlData, providerId) {
  const incidents = [];
  
  if (!xmlData.rss?.channel?.[0]?.item) {
    return incidents;
  }

  for (const item of xmlData.rss.channel[0].item) {
    try {
      const title = item.title?.[0] || '';
      const description = item.description?.[0] || '';
      const pubDate = item.pubDate?.[0];
      const guid = item.guid?.[0]?._ || item.guid?.[0];

      // Azure typically includes region in description
      const regionMatch = description.match(/(\w+\s*\w*)\s*-/);
      const regionId = regionMatch ? regionMatch[1].toLowerCase().replace(/\s+/g, '') : 'global';
      
      // Enhanced Azure incident detection
      const text = `${title} ${description}`.toLowerCase();
      
      // Check if incident is resolved
      const resolvedKeywords = ['resolved', 'mitigated', 'restored', 'completed'];
      const isResolved = resolvedKeywords.some(keyword => text.includes(keyword));
      
      // Check if incident is active
      const activeKeywords = ['investigating', 'preliminary', 'ongoing', 'mitigating'];
      const isActive = activeKeywords.some(keyword => text.includes(keyword));
      
      // Skip resolved incidents
      if (isResolved) {
        continue;
      }
      
      // Determine status and severity
      let status = 'operational';
      let severity = 'medium';
      
      if (text.includes('outage') || text.includes('unavailable') || text.includes('major impact') || text.includes('complete')) {
        status = 'outage';
        severity = 'high';
      } else if (text.includes('degraded') || text.includes('performance issues') || text.includes('intermittent')) {
        status = 'degraded';
        severity = 'medium';
      } else if (text.includes('advisory') || text.includes('maintenance') || text.includes('informational')) {
        status = 'maintenance';
        severity = 'low';
      }
      
      // Only process if there's a clear issue or it's explicitly active
      if (status === 'operational' && !isActive) {
        continue;
      }

      incidents.push({
        provider: providerId,
        region_id: regionId,
        region_name: REGION_MAPPINGS[providerId]?.[regionId] || regionId,
        service_name: 'Azure Service',
        status: status,
        severity: severity,
        incident_severity: severity, // For database compatibility
        is_active: isActive || (status !== 'operational'),
        detection_confidence: isActive ? 'high' : 'medium',
        incident_id: guid,
        incident_title: title,
        incident_description: description,
        start_time: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        end_time: null, // Azure RSS doesn't provide end times
        last_updated: new Date().toISOString()
      });

    } catch (error) {
      console.warn(`⚠️  Skipping malformed Azure item:`, error.message);
    }
  }

  return incidents;
}

/**
 * Parse GCP JSON feed with enhanced incident detection
 */
async function parseGCPFeed(jsonData, providerId) {
  const incidents = [];
  
  if (!Array.isArray(jsonData)) {
    return incidents;
  }

  for (const incident of jsonData) {
    try {
      // Enhanced incident detection - check if incident is currently active
      const isActive = !incident.end; // No end timestamp means ongoing
      
      // Only process active incidents for real-time status
      // (Historical incidents don't affect current region status)
      if (!isActive) {
        continue; // Skip resolved incidents
      }
      
      // Enhanced severity classification
      let status = 'operational';
      let severity = 'low';
      
      if (incident.status_impact?.toLowerCase() === 'service_outage') {
        status = 'outage';
        severity = 'high';
      } else if (incident.status_impact?.toLowerCase() === 'service_disruption') {
        status = 'degraded';
        severity = 'medium';
      } else if (incident.status_impact?.toLowerCase() === 'service_information') {
        // Skip informational incidents - they don't affect service status
        continue;
      }
      
      // Skip if status is still operational (no real impact)
      if (status === 'operational') {
        continue;
      }
      
      // Use incident severity if available
      if (incident.severity) {
        severity = incident.severity;
      }

      // Extract regions from affected products
      const regions = incident.affected_products?.map(product => {
        // Try to extract region from product name
        const regionMatch = product.title?.match(/\(([^)]+)\)/);
        return regionMatch ? regionMatch[1].toLowerCase() : 'global';
      }) || ['global'];

      for (const regionId of regions) {
        incidents.push({
          provider: providerId,
          region_id: regionId,
          region_name: REGION_MAPPINGS[providerId]?.[regionId] || regionId,
          service_name: incident.affected_products?.[0]?.title || 'GCP Service',
          status: status,
          severity: severity,
          incident_severity: severity, // For database compatibility
          is_active: isActive,
          detection_confidence: 'high', // GCP has explicit end timestamp
          incident_id: incident.id,
          incident_title: incident.summary || incident.external_desc,
          incident_description: incident.most_recent_update?.text || incident.external_desc || incident.summary,
          start_time: incident.begin ? new Date(incident.begin).toISOString() : new Date().toISOString(),
          end_time: incident.end ? new Date(incident.end).toISOString() : null,
          status_impact: incident.status_impact,
          affected_products: incident.affected_products?.map(p => p.title).join(', '),
          last_updated: new Date().toISOString()
        });
      }

    } catch (error) {
      console.warn(`⚠️  Skipping malformed GCP incident:`, error.message);
    }
  }

  return incidents;
}

/**
 * Parse OCI JSON feed with enhanced active incident detection
 */
async function parseOCIFeed(jsonData, providerId) {
  const incidents = [];

  if (!jsonData.incidents || !Array.isArray(jsonData.incidents)) {
    return incidents;
  }

  for (const incident of jsonData.incidents) {
    try {
      // Enhanced OCI incident detection
      const incidentStatus = incident.status?.toLowerCase() || '';
      const incidentName = incident.name || '';
      const incidentBody = incident.incident_updates?.[0]?.body || '';
      const text = `${incidentName} ${incidentBody}`.toLowerCase();

      // Check if incident is resolved
      const resolvedKeywords = ['resolved', 'completed', 'restored'];
      const isResolved = resolvedKeywords.some(keyword =>
        incidentStatus.includes(keyword) || text.includes(keyword)
      );

      // Skip resolved incidents
      if (isResolved || incidentStatus === 'resolved') {
        continue;
      }

      // Check if incident is active
      const activeKeywords = ['investigating', 'identified', 'monitoring', 'ongoing'];
      const isActive = activeKeywords.some(keyword =>
        incidentStatus.includes(keyword) || text.includes(keyword)
      ) || (incident.resolved_at === null);

      // Determine status and severity
      let status = 'operational';
      let severity = 'medium';

      const impact = incident.impact?.toLowerCase() || '';
      if (impact === 'major' || impact === 'critical' || incidentStatus === 'major_outage') {
        status = 'outage';
        severity = 'high';
      } else if (impact === 'minor' || impact === 'moderate' || incidentStatus === 'investigating') {
        status = 'degraded';
        severity = 'medium';
      } else if (impact === 'maintenance' || text.includes('maintenance')) {
        status = 'maintenance';
        severity = 'low';
      }

      // Only process if there's a clear issue or it's explicitly active
      if (status === 'operational' && !isActive) {
        continue;
      }

      // OCI incidents may have components with regions
      const regions = incident.components?.map(comp => {
        const regionMatch = comp.name?.match(/\(([^)]+)\)/);
        return regionMatch ? regionMatch[1].toLowerCase().replace(/\s+/g, '-') : 'global';
      }) || ['global'];

      for (const regionId of regions) {
        incidents.push({
          provider: providerId,
          region_id: regionId,
          region_name: REGION_MAPPINGS[providerId]?.[regionId] || regionId,
          service_name: incident.components?.[0]?.name || 'OCI Service',
          status: status,
          severity: severity,
          incident_severity: severity, // For database compatibility
          is_active: isActive,
          detection_confidence: incidentStatus ? 'high' : 'medium',
          incident_id: incident.id,
          incident_title: incident.name,
          incident_description: incident.incident_updates?.[0]?.body || incident.name,
          start_time: incident.created_at ? new Date(incident.created_at).toISOString() : new Date().toISOString(),
          end_time: incident.resolved_at ? new Date(incident.resolved_at).toISOString() : null,
          last_updated: new Date().toISOString()
        });
      }

    } catch (error) {
      console.warn(`⚠️  Skipping malformed OCI incident:`, error.message);
    }
  }

  return incidents;
}

/**
 * Store incidents in Supabase
 */
async function storeIncidents(providerId, incidents) {
  if (incidents.length === 0) return;

  // Insert incidents one by one to handle conflicts properly
  let successCount = 0;
  let errorCount = 0;

  for (const incident of incidents) {
    try {
      const { error } = await supabase
        .from('cloud_status')
        .insert([incident]);

      if (error) {
        // If it's a duplicate, that's okay - just skip it
        if (error.code === '23505') { // PostgreSQL unique violation
          console.log(`⚠️  Skipping duplicate incident: ${incident.incident_id}`);
        } else {
          throw error;
        }
      } else {
        successCount++;
      }
    } catch (error) {
      console.warn(`⚠️  Failed to store incident ${incident.incident_id}:`, error.message);
      errorCount++;
    }
  }

  console.log(`💾 Stored ${successCount} new incidents for ${providerId} (${errorCount} duplicates/errors skipped)`);
}

/**
 * Update region status summaries
 */
async function updateRegionSummaries() {
  console.log('\n🔄 Updating region status summaries...');
  
  try {
    // Get all unique provider/region combinations
    const { data: regions, error } = await supabase
      .from('cloud_status')
      .select('provider, region_id, region_name');

    if (error) {
      throw error;
    }

    // Deduplicate regions manually since Supabase JS doesn't have group()
    const uniqueRegions = [];
    const seen = new Set();
    
    for (const region of regions || []) {
      const key = `${region.provider}-${region.region_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRegions.push(region);
      }
    }

    // Update each region summary
    for (const region of uniqueRegions) {
      const { error: updateError } = await supabase
        .rpc('update_region_status_summary', {
          p_provider: region.provider,
          p_region_id: region.region_id,
          p_region_name: region.region_name
        });

      if (updateError) {
        console.warn(`⚠️  Failed to update summary for ${region.provider}/${region.region_id}:`, updateError.message);
      }
    }

    console.log('✅ Region summaries updated');

  } catch (error) {
    console.error('❌ Failed to update region summaries:', error.message);
  }
}

// Run the main function
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});