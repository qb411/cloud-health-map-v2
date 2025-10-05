#!/usr/bin/env node

/**
 * Validate GitHub Actions workflow configuration
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Validating GitHub Actions Workflow Configuration...\n');

const workflowFiles = [
  '.github/workflows/update-status.yml',
  '.github/workflows/deploy.yml'
];

let validationErrors = 0;

// Check if workflow files exist
console.log('📁 Checking Workflow Files...');
for (const file of workflowFiles) {
  if (existsSync(file)) {
    console.log(`✅ Found: ${file}`);
  } else {
    console.error(`❌ Missing: ${file}`);
    validationErrors++;
  }
}

// Validate update-status.yml
if (existsSync('.github/workflows/update-status.yml')) {
  console.log('\n🔍 Validating update-status.yml...');
  
  try {
    const content = readFileSync('.github/workflows/update-status.yml', 'utf8');
    
    const checks = [
      { pattern: /schedule:/, description: 'Cron schedule configured' },
      { pattern: /\*\/15 \* \* \* \*/, description: '15-minute interval set' },
      { pattern: /SUPABASE_URL/, description: 'Supabase URL secret referenced' },
      { pattern: /SUPABASE_SERVICE_ROLE_KEY/, description: 'Service role key secret referenced' },
      { pattern: /node-version: ['"]18['"]/, description: 'Node.js 18 specified' },
      { pattern: /npm ci/, description: 'npm ci for dependency installation' },
      { pattern: /node update-status\.js/, description: 'RSS processor script execution' }
    ];
    
    for (const check of checks) {
      if (check.pattern.test(content)) {
        console.log(`   ✅ ${check.description}`);
      } else {
        console.error(`   ❌ ${check.description}`);
        validationErrors++;
      }
    }
    
  } catch (error) {
    console.error(`❌ Error reading update-status.yml: ${error.message}`);
    validationErrors++;
  }
}

// Validate deploy.yml
if (existsSync('.github/workflows/deploy.yml')) {
  console.log('\n🔍 Validating deploy.yml...');
  
  try {
    const content = readFileSync('.github/workflows/deploy.yml', 'utf8');
    
    const checks = [
      { pattern: /pages: write/, description: 'Pages write permission set' },
      { pattern: /VITE_SUPABASE_URL/, description: 'Frontend Supabase URL configured' },
      { pattern: /VITE_SUPABASE_ANON_KEY/, description: 'Frontend anon key configured' },
      { pattern: /npm run build/, description: 'Build command specified' },
      { pattern: /upload-pages-artifact/, description: 'Pages artifact upload configured' },
      { pattern: /deploy-pages/, description: 'Pages deployment configured' }
    ];
    
    for (const check of checks) {
      if (check.pattern.test(content)) {
        console.log(`   ✅ ${check.description}`);
      } else {
        console.error(`   ❌ ${check.description}`);
        validationErrors++;
      }
    }
    
  } catch (error) {
    console.error(`❌ Error reading deploy.yml: ${error.message}`);
    validationErrors++;
  }
}

// Check package.json dependencies
console.log('\n📦 Checking Dependencies...');
if (existsSync('scripts/package.json')) {
  try {
    const pkg = JSON.parse(readFileSync('scripts/package.json', 'utf8'));
    const requiredDeps = [
      '@supabase/supabase-js',
      'xml2js',
      'node-fetch',
      'dotenv'
    ];
    
    for (const dep of requiredDeps) {
      if (pkg.dependencies && pkg.dependencies[dep]) {
        console.log(`   ✅ ${dep}: ${pkg.dependencies[dep]}`);
      } else {
        console.error(`   ❌ Missing dependency: ${dep}`);
        validationErrors++;
      }
    }
    
  } catch (error) {
    console.error(`❌ Error reading scripts/package.json: ${error.message}`);
    validationErrors++;
  }
} else {
  console.error('❌ Missing: scripts/package.json');
  validationErrors++;
}

// Check main script files
console.log('\n📄 Checking Script Files...');
const scriptFiles = [
  'scripts/update-status.js',
  'scripts/test-feeds.js',
  'scripts/test-supabase.js'
];

for (const file of scriptFiles) {
  if (existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.error(`   ❌ Missing: ${file}`);
    validationErrors++;
  }
}

// Summary
console.log('\n📊 Validation Summary:');
if (validationErrors === 0) {
  console.log('🎉 All validations passed!');
  console.log('\n✅ GitHub Actions workflows are properly configured');
  console.log('✅ All required files and dependencies are present');
  console.log('✅ Ready for GitHub repository setup');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Add repository secrets to GitHub:');
  console.log('   - SUPABASE_URL');
  console.log('   - SUPABASE_ANON_KEY');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  console.log('2. Make repository public (for free Actions)');
  console.log('3. Enable GitHub Pages');
  console.log('4. Push to main branch to trigger workflows');
  
} else {
  console.error(`❌ ${validationErrors} validation error(s) found!`);
  console.error('\nPlease fix the issues above before proceeding with GitHub Actions setup.');
  process.exit(1);
}