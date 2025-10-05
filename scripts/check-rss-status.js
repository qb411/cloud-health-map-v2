#!/usr/bin/env node

/**
 * Check RSS processing status and provide control instructions
 */

import { readFileSync, existsSync } from 'fs';

console.log('🔍 RSS Processing Status Check\n');

// Check workflow file for schedule
console.log('📄 Checking workflow configuration...');
if (existsSync('.github/workflows/update-status.yml')) {
  const workflow = readFileSync('.github/workflows/update-status.yml', 'utf8');
  
  if (workflow.includes('schedule:') && !workflow.includes('# schedule:')) {
    console.log('✅ Schedule is ENABLED in workflow file');
  } else {
    console.log('⏸️  Schedule is DISABLED in workflow file');
  }
  
  if (workflow.includes('RSS_PROCESSING_ENABLED')) {
    console.log('✅ Repository variable control is configured');
  } else {
    console.log('❌ Repository variable control is NOT configured');
  }
} else {
  console.log('❌ Workflow file not found');
}

// Check for environment variable (simulating repository variable)
console.log('\n🔧 Repository Variable Status:');
const enabled = process.env.RSS_PROCESSING_ENABLED;
if (enabled === 'true') {
  console.log('✅ RSS_PROCESSING_ENABLED = true (ACTIVE)');
} else if (enabled === 'false') {
  console.log('⏸️  RSS_PROCESSING_ENABLED = false (DISABLED)');
} else {
  console.log('❓ RSS_PROCESSING_ENABLED = not set (check GitHub repository variables)');
}

// Provide control instructions
console.log('\n🎛️  Control Instructions:');
console.log('');
console.log('📍 To ENABLE RSS processing:');
console.log('   1. Go to GitHub repository Settings');
console.log('   2. Secrets and variables → Actions → Variables');
console.log('   3. Add: RSS_PROCESSING_ENABLED = true');
console.log('');
console.log('📍 To DISABLE RSS processing (stop emails):');
console.log('   1. Go to GitHub repository Settings');
console.log('   2. Secrets and variables → Actions → Variables');
console.log('   3. Set: RSS_PROCESSING_ENABLED = false');
console.log('');
console.log('📍 For EMERGENCY stop:');
console.log('   1. Actions tab → Update Cloud Status Data');
console.log('   2. Click "..." → Disable workflow');
console.log('');

// Check recent test results
console.log('🧪 Quick Test Options:');
console.log('');
console.log('   Test RSS feeds:     npm run test');
console.log('   Test Supabase:      npm run test:supabase');
console.log('   Test full process:  npm start');
console.log('   Manual GitHub run:  Actions tab → Run workflow');
console.log('');

// Status summary
console.log('📊 Current Status Summary:');
if (enabled === 'true') {
  console.log('   🟢 RSS processing is ENABLED');
  console.log('   📧 Will generate emails if failures occur');
  console.log('   ⏰ Runs every 15 minutes (if schedule enabled)');
} else {
  console.log('   🔴 RSS processing is DISABLED');
  console.log('   📧 No automated emails');
  console.log('   🛠️  Manual testing only');
}

console.log('\n💡 Tip: Start with DISABLED, test manually, then enable when stable');