#!/usr/bin/env node

/**
 * Test Supabase connection for RSS processor
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase connection for RSS processor...');
console.log('📍 URL:', SUPABASE_URL);
console.log('🔑 Service Key:', SUPABASE_SERVICE_KEY ? `${SUPABASE_SERVICE_KEY.substring(0, 20)}...` : 'NOT SET');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testConnection() {
  try {
    // Test read access
    console.log('\n🧪 Testing read access...');
    const { data: readData, error: readError } = await supabase
      .from('cloud_status')
      .select('count')
      .limit(1);

    if (readError) {
      throw new Error(`Read test failed: ${readError.message}`);
    }
    console.log('✅ Read access working');

    // Test write access with a dummy record
    console.log('🧪 Testing write access...');
    const testRecord = {
      provider: 'aws',
      region_id: 'test-region',
      region_name: 'Test Region',
      service_name: 'Test Service',
      status: 'operational',
      incident_id: `test-${Date.now()}`,
      incident_title: 'Test Incident',
      incident_description: 'This is a test incident',
      start_time: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    const { data: writeData, error: writeError } = await supabase
      .from('cloud_status')
      .insert([testRecord])
      .select();

    if (writeError) {
      throw new Error(`Write test failed: ${writeError.message}`);
    }
    console.log('✅ Write access working');

    // Clean up test record
    if (writeData && writeData.length > 0) {
      await supabase
        .from('cloud_status')
        .delete()
        .eq('id', writeData[0].id);
      console.log('🧹 Test record cleaned up');
    }

    console.log('\n🎉 Supabase connection test passed!');
    console.log('✅ RSS processor can read and write to database');

  } catch (error) {
    console.error('\n❌ Supabase connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();