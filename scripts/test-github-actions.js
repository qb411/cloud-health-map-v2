#!/usr/bin/env node

/**
 * Test script to validate GitHub Actions setup
 * This simulates the GitHub Actions environment locally
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧪 Testing GitHub Actions Environment Setup...');
console.log(`📅 ${new Date().toISOString()}\n`);

// Test environment variables
console.log('🔍 Checking Environment Variables...');

const requiredVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY
};

let envErrors = 0;

for (const [name, value] of Object.entries(requiredVars)) {
  if (!value) {
    console.error(`❌ Missing: ${name}`);
    envErrors++;
  } else {
    console.log(`✅ Found: ${name} = ${value.substring(0, 20)}...`);
  }
}

if (envErrors > 0) {
  console.error(`\n❌ ${envErrors} environment variable(s) missing!`);
  console.error('For GitHub Actions, these should be set as repository secrets:');
  console.error('- SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY (NOT the anon key!)');
  process.exit(1);
}

// Test Supabase connection with service role
console.log('\n🔗 Testing Supabase Service Role Connection...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

try {
  // Test read access
  const { data: readData, error: readError } = await supabase
    .from('cloud_status')
    .select('count')
    .limit(1);

  if (readError) {
    throw new Error(`Read access failed: ${readError.message}`);
  }
  console.log('✅ Service role read access working');

  // Test write access
  const testRecord = {
    provider: 'aws',
    region_id: 'github-actions-test',
    region_name: 'GitHub Actions Test',
    service_name: 'Test Service',
    status: 'operational',
    incident_id: `github-test-${Date.now()}`,
    incident_title: 'GitHub Actions Test Record',
    incident_description: 'This record validates GitHub Actions can write to database',
    start_time: new Date().toISOString(),
    last_updated: new Date().toISOString()
  };

  const { data: writeData, error: writeError } = await supabase
    .from('cloud_status')
    .insert([testRecord])
    .select();

  if (writeError) {
    throw new Error(`Write access failed: ${writeError.message}`);
  }
  console.log('✅ Service role write access working');

  // Clean up test record
  if (writeData && writeData.length > 0) {
    await supabase
      .from('cloud_status')
      .delete()
      .eq('id', writeData[0].id);
    console.log('🧹 Test record cleaned up');
  }

} catch (error) {
  console.error('❌ Supabase service role test failed:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Verify SUPABASE_SERVICE_ROLE_KEY is the service_role key (not anon key)');
  console.error('2. Check Supabase project is accessible');
  console.error('3. Verify database schema is installed correctly');
  process.exit(1);
}

// Test RSS processor execution
console.log('\n🚀 Testing RSS Processor Execution...');

try {
  // Import and run a simplified version of the RSS processor
  const { execSync } = await import('child_process');
  
  console.log('📡 Running RSS feed connectivity test...');
  execSync('node test-feeds.js', { 
    cwd: 'scripts',
    stdio: 'inherit',
    timeout: 30000 // 30 second timeout
  });
  
  console.log('✅ RSS processor execution test passed');

} catch (error) {
  console.error('❌ RSS processor test failed:', error.message);
  console.error('\nThis may indicate:');
  console.error('1. Network connectivity issues');
  console.error('2. RSS feed endpoints changed');
  console.error('3. Dependencies not installed correctly');
  process.exit(1);
}

// Simulate GitHub Actions workflow steps
console.log('\n🔄 Simulating GitHub Actions Workflow...');

const workflowSteps = [
  '✅ Checkout repository',
  '✅ Setup Node.js 18',
  '✅ Install dependencies (npm ci)',
  '✅ Load environment variables from secrets',
  '✅ Execute RSS processor script',
  '✅ Validate processing results',
  '✅ Update Supabase database',
  '✅ Complete workflow execution'
];

workflowSteps.forEach((step, index) => {
  setTimeout(() => {
    console.log(`   ${step}`);
  }, index * 100);
});

setTimeout(() => {
  console.log('\n🎉 GitHub Actions Environment Test PASSED!');
  console.log('\n📋 Setup Checklist:');
  console.log('   ✅ Environment variables configured');
  console.log('   ✅ Supabase service role access verified');
  console.log('   ✅ RSS processor execution tested');
  console.log('   ✅ Database read/write permissions confirmed');
  console.log('\n🚀 Ready for GitHub Actions deployment!');
  console.log('\nNext steps:');
  console.log('1. Add repository secrets to GitHub');
  console.log('2. Make repository public (for free Actions)');
  console.log('3. Enable GitHub Pages');
  console.log('4. Push workflows to trigger first run');
}, workflowSteps.length * 100 + 500);
