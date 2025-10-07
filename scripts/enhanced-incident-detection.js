#!/usr/bin/env node

/**
 * Enhanced Incident Detection System
 * 
 * Implements advanced logic to detect active vs resolved incidents
 * and classify incident severity across all cloud providers.
 */

import { parseStringPromise } from 'xml2js';
import fetch from 'node-fetch';

/**
 * Enhanced incident detection patterns for each provider
 */
const INCIDENT_PATTERNS = {
  aws: {
    // AWS RSS patterns for incident status detection
    activeKeywords: ['investigating', 'identified', 'monitoring', 'ongoing', 'experiencing'],
    resolvedKeywords: ['resolved', 'restored', 'completed', 'fixed'],
    severityPatterns: {
      high: ['outage', 'unavailable', 'down', 'failed'],
      medium: ['degraded', 'elevated error', 'intermittent', 'slow'],
      low: ['maintenance', 'scheduled', 'informational']
    }
  },
  
  azure: {
    // Azure RSS patterns
    activeKeywords: ['investigating', 'preliminary', 'ongoing', 'mitigating'],
    resolvedKeywords: ['resolved', 'mitigated', 'restored', 'completed'],
    severityPatterns: {
      high: ['outage', 'unavailable', 'major impact'],
      medium: ['degraded', 'performance issues', 'intermittent'],
      low: ['advisory', 'maintenance', 'informational']
    }
  },
  
  gcp: {
    // GCP JSON API has structured data
    statusMapping: {
      'SERVICE_OUTAGE': 'high',
      'SERVICE_DISRUPTION': 'medium', 
      'SERVICE_INFORMATION': 'low'
    },
    severityMapping: {
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    }
  },
  
  oci: {
    // OCI patterns from RSS and JSON
    activeKeywords: ['investigating', 'identified', 'monitoring', 'ongoing'],
    resolvedKeywords: ['resolved', 'restored', 'completed'],
    severityPatterns: {
      high: ['major', 'outage', 'unavailable'],
      medium: ['minor', 'degraded', 'performance'],
      low: ['maintenance', 'informational']
    }
  }
};

/**
 * Detect if an AWS incident is currently active
 */
function detectAWSIncidentStatus(title, description, pubDate) {
  const text = `${title} ${description}`.toLowerCase();
  const patterns = INCIDENT_PATTERNS.aws;
  
  // Check for resolved keywords first (more definitive)
  const isResolved = patterns.resolvedKeywords.some(keyword => text.includes(keyword));
  if (isResolved) {
    return { status: 'resolved', confidence: 'high' };
  }
  
  // Check for active keywords
  const isActive = patterns.activeKeywords.some(keyword => text.includes(keyword));
  if (isActive) {
    return { status: 'active', confidence: 'high' };
  }
  
  // Check incident age (older than 7 days likely resolved)
  const incidentDate = new Date(pubDate);
  const daysSinceIncident = (Date.now() - incidentDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceIncident > 7) {
    return { status: 'resolved', confidence: 'medium' };
  }
  
  // Default to unknown for recent incidents without clear status
  return { status: 'unknown', confidence: 'low' };
}

/**
 * Classify AWS incident severity
 */
function classifyAWSSeverity(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const patterns = INCIDENT_PATTERNS.aws.severityPatterns;
  
  // Check high severity first
  if (patterns.high.some(keyword => text.includes(keyword))) {
    return 'high';
  }
  
  // Check medium severity
  if (patterns.medium.some(keyword => text.includes(keyword))) {
    return 'medium';
  }
  
  // Check low severity
  if (patterns.low.some(keyword => text.includes(keyword))) {
    return 'low';
  }
  
  // Default to medium if unclear
  return 'medium';
}

/**
 * Detect Azure incident status
 */
function detectAzureIncidentStatus(title, description, pubDate) {
  const text = `${title} ${description}`.toLowerCase();
  const patterns = INCIDENT_PATTERNS.azure;
  
  // Check for resolved keywords
  const isResolved = patterns.resolvedKeywords.some(keyword => text.includes(keyword));
  if (isResolved) {
    return { status: 'resolved', confidence: 'high' };
  }
  
  // Check for active keywords
  const isActive = patterns.activeKeywords.some(keyword => text.includes(keyword));
  if (isActive) {
    return { status: 'active', confidence: 'high' };
  }
  
  // Age-based detection
  const incidentDate = new Date(pubDate);
  const daysSinceIncident = (Date.now() - incidentDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceIncident > 7) {
    return { status: 'resolved', confidence: 'medium' };
  }
  
  return { status: 'unknown', confidence: 'low' };
}

/**
 * Classify Azure incident severity
 */
function classifyAzureSeverity(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const patterns = INCIDENT_PATTERNS.azure.severityPatterns;
  
  if (patterns.high.some(keyword => text.includes(keyword))) {
    return 'high';
  }
  
  if (patterns.medium.some(keyword => text.includes(keyword))) {
    return 'medium';
  }
  
  if (patterns.low.some(keyword => text.includes(keyword))) {
    return 'low';
  }
  
  return 'medium';
}

/**
 * Detect GCP incident status (most reliable due to structured data)
 */
function detectGCPIncidentStatus(incident) {
  // GCP provides explicit end timestamp
  const isActive = !incident.end;
  const confidence = 'high'; // GCP data is very reliable
  
  return {
    status: isActive ? 'active' : 'resolved',
    confidence,
    endTime: incident.end,
    statusImpact: incident.status_impact
  };
}

/**
 * Classify GCP incident severity
 */
function classifyGCPSeverity(incident) {
  const patterns = INCIDENT_PATTERNS.gcp;
  
  // Use status_impact first
  if (incident.status_impact && patterns.statusMapping[incident.status_impact]) {
    return patterns.statusMapping[incident.status_impact];
  }
  
  // Use severity field if available
  if (incident.severity && patterns.severityMapping[incident.severity]) {
    return patterns.severityMapping[incident.severity];
  }
  
  return 'medium';
}

/**
 * Detect OCI incident status
 */
function detectOCIIncidentStatus(incident, isRSSFeed = false) {
  if (isRSSFeed) {
    // RSS feed analysis
    const description = incident.description?.[0] || '';
    const isResolved = description.toLowerCase().includes('resolved');
    
    return {
      status: isResolved ? 'resolved' : 'active',
      confidence: isResolved ? 'high' : 'medium'
    };
  } else {
    // JSON API analysis
    const status = incident.status?.toLowerCase();
    
    if (status === 'resolved' || status === 'completed') {
      return { status: 'resolved', confidence: 'high' };
    }
    
    if (status === 'investigating' || status === 'identified' || status === 'monitoring') {
      return { status: 'active', confidence: 'high' };
    }
    
    return { status: 'unknown', confidence: 'low' };
  }
}

/**
 * Classify OCI incident severity
 */
function classifyOCISeverity(incident, isRSSFeed = false) {
  if (isRSSFeed) {
    const text = `${incident.title?.[0] || ''} ${incident.description?.[0] || ''}`.toLowerCase();
    const patterns = INCIDENT_PATTERNS.oci.severityPatterns;
    
    if (patterns.high.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    
    if (patterns.medium.some(keyword => text.includes(keyword))) {
      return 'medium';
    }
    
    if (patterns.low.some(keyword => text.includes(keyword))) {
      return 'low';
    }
    
    return 'medium';
  } else {
    // JSON API
    const impact = incident.impact?.toLowerCase();
    
    if (impact === 'major' || impact === 'critical') {
      return 'high';
    }
    
    if (impact === 'minor' || impact === 'moderate') {
      return 'medium';
    }
    
    return 'low';
  }
}

/**
 * Enhanced incident processing with active detection
 */
function processEnhancedIncidents(provider, data) {
  const incidents = [];
  
  switch (provider) {
    case 'aws':
      if (data?.rss?.channel?.[0]?.item) {
        data.rss.channel[0].item.forEach(item => {
          const title = item.title?.[0] || '';
          const description = item.description?.[0] || '';
          const pubDate = item.pubDate?.[0];
          
          const statusInfo = detectAWSIncidentStatus(title, description, pubDate);
          const severity = classifyAWSSeverity(title, description);
          
          incidents.push({
            provider: 'aws',
            title,
            description,
            pubDate,
            status: statusInfo.status,
            statusConfidence: statusInfo.confidence,
            severity,
            isActive: statusInfo.status === 'active'
          });
        });
      }
      break;
      
    case 'gcp':
      if (Array.isArray(data)) {
        data.forEach(incident => {
          const statusInfo = detectGCPIncidentStatus(incident);
          const severity = classifyGCPSeverity(incident);
          
          incidents.push({
            provider: 'gcp',
            id: incident.id,
            title: incident.external_desc,
            begin: incident.begin,
            end: incident.end,
            status: statusInfo.status,
            statusConfidence: statusInfo.confidence,
            severity,
            isActive: statusInfo.status === 'active',
            statusImpact: incident.status_impact,
            affectedProducts: incident.affected_products
          });
        });
      }
      break;
      
    // Add Azure and OCI processing...
  }
  
  return incidents;
}

export {
  detectAWSIncidentStatus,
  detectAzureIncidentStatus,
  detectGCPIncidentStatus,
  detectOCIIncidentStatus,
  classifyAWSSeverity,
  classifyAzureSeverity,
  classifyGCPSeverity,
  classifyOCISeverity,
  processEnhancedIncidents,
  INCIDENT_PATTERNS
};