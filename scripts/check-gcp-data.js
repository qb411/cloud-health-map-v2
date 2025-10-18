import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Checking GCP data in database...\n');

// Check cloud_status table
const { data: incidents } = await supabase
  .from('cloud_status')
  .select('region_id, region_name, status, incident_title')
  .eq('provider', 'gcp')
  .limit(10);

console.log('Sample GCP incidents from cloud_status:');
if (incidents) {
  incidents.forEach(inc => {
    const title = inc.incident_title || 'No title';
    console.log(`  Region: ${inc.region_id} (${inc.region_name}) - ${inc.status} - ${title.substring(0, 50)}`);
  });
}

// Check region_status_current table
const { data: regions } = await supabase
  .from('region_status_current')
  .select('region_id, region_name, overall_status, active_incidents')
  .eq('provider', 'gcp');

console.log('\n\nGCP regions in region_status_current:');
if (regions) {
  regions.forEach(r => {
    console.log(`  ${r.region_id} (${r.region_name}): ${r.overall_status} - ${r.active_incidents} incidents`);
  });
}

process.exit(0);
