#!/usr/bin/env node

/**
 * Automated Database Cleanup - Debug Version
 * 
 * Keeps database under size limits with smart retention:
 * - Delete operational status records
 * - Remove duplicate active incidents (keep latest per incident)
 * - Keep resolved incidents for 90 days (for reporting)
 * - Mark old incidents as resolved
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.VITE_SUPABASE_ANON_KEY
);

async function performMaintenance() {
  console.log('🧹 Starting Automated Database Maintenance (Debug Mode)...\n');

  try {
    // 1. Delete operational records (shouldn't be stored)
    console.log('1️⃣ Removing operational status records...');
    const { error: opError, count: opCount } = await supabase
      .from('cloud_status')
      .delete({ count: 'exact' })
      .eq('status', 'operational');

    if (opError) {
      console.error('❌ Error deleting operational records:', opError.message);
    } else {
      console.log(`✅ Operational records removed: ${opCount || 0}`);
    }

    // 2. Mark old incidents as resolved (GCP issue fix)
    console.log('\n2️⃣ Marking old incidents as resolved...');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { error: updateError, count: updateCount } = await supabase
      .from('cloud_status')
      .update({ is_active: false }, { count: 'exact' })
      .eq('provider', 'gcp')
      .lt('created_at', oneHourAgo)
      .in('status', ['degraded', 'outage']);

    if (updateError) {
      console.error('❌ Error updating old incidents:', updateError.message);
    } else {
      console.log(`✅ Old incidents marked as resolved: ${updateCount || 0}`);
    }

    // 3. Clean up duplicate active incidents (more efficient approach)
    console.log('\n3️⃣ Cleaning up duplicate active incidents...');
    
    const providers = ['aws', 'azure', 'gcp', 'oci'];
    
    for (const provider of providers) {
      console.log(`  Processing ${provider}...`);
      
      // First, get a count of active incidents
      const { count: activeCount, error: countError } = await supabase
        .from('cloud_status')
        .select('*', { count: 'exact', head: true })
        .eq('provider', provider)
        .eq('is_active', true);

      if (countError) {
        console.error(`❌ Error counting ${provider} active incidents:`, countError.message);
        continue;
      }

      console.log(`  ${provider}: ${activeCount || 0} active incidents`);

      if (activeCount && activeCount > 100) {
        // If too many active incidents, use a simpler approach - keep only recent ones
        console.log(`  ${provider}: Too many active incidents (${activeCount}), keeping only last 50`);
        
        const { data: recentActive, error: recentError } = await supabase
          .from('cloud_status')
          .select('id')
          .eq('provider', provider)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(50);

        if (recentError) {
          console.error(`❌ Error fetching recent ${provider} incidents:`, recentError.message);
          continue;
        }

        if (recentActive && recentActive.length > 0) {
          const keepIds = recentActive.map(r => r.id);
          
          const { error: deleteError, count: deleteCount } = await supabase
            .from('cloud_status')
            .delete({ count: 'exact' })
            .eq('provider', provider)
            .eq('is_active', true)
            .not('id', 'in', `(${keepIds.join(',')})`);

          if (deleteError) {
            console.error(`❌ Error cleaning ${provider} active incidents:`, deleteError.message);
          } else {
            console.log(`✅ ${provider}: Kept 50 recent, deleted ${deleteCount || 0} old active incidents`);
          }
        }
      } else {
        console.log(`✅ ${provider}: Active incident count is manageable`);
      }
    }

    // 4. Archive very old resolved incidents (keep last 90 days for reporting)
    console.log('\n4️⃣ Archiving very old resolved incidents...');
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    
    const { error: oldError, count: oldCount } = await supabase
      .from('cloud_status')
      .delete({ count: 'exact' })
      .eq('is_active', false)
      .lt('created_at', ninetyDaysAgo);

    if (oldError) {
      console.error('❌ Error archiving old resolved incidents:', oldError.message);
    } else {
      console.log(`✅ Very old resolved incidents archived: ${oldCount || 0} (kept 90 days for reporting)`);
    }

    // 5. Final analysis
    console.log('\n📊 Post-cleanup Analysis:');
    
    const { data: finalCount } = await supabase
      .from('cloud_status')
      .select('provider, status, is_active')
      .order('created_at', { ascending: false });

    if (finalCount) {
      const finalByProvider = finalCount.reduce((acc, incident) => {
        acc[incident.provider] = (acc[incident.provider] || 0) + 1;
        return acc;
      }, {});
      
      const finalActive = finalCount.filter(i => i.is_active).length;
      const finalResolved = finalCount.length - finalActive;
      
      console.log(`Total records: ${finalCount.length}`);
      console.log('By provider:', finalByProvider);
      console.log(`Active: ${finalActive}, Resolved: ${finalResolved}`);
      
      // Estimate new size
      const avgSize = 4800; // bytes per record (from previous analysis)
      const estimatedMB = (finalCount.length * avgSize) / (1024 * 1024);
      console.log(`Estimated size: ${estimatedMB.toFixed(2)} MB`);
    }

    console.log('\n✅ Database maintenance completed!');

  } catch (error) {
    console.error('❌ Maintenance failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Ensure the process exits
    process.exit(0);
  }
}

// Add timeout to prevent hanging
const timeout = setTimeout(() => {
  console.error('❌ Script timeout after 5 minutes');
  process.exit(1);
}, 5 * 60 * 1000);

performMaintenance().finally(() => {
  clearTimeout(timeout);
});