import { supabase } from '../lib/supabase';

interface CleanupResult {
  success: boolean;
  timestamp: string;
  operationalRemoved: number;
  oldIncidentsResolved: number;
  duplicatesRemoved: Array<{ provider: string; deleted: number }>;
  archivedOldIncidents: number;
  finalRecordCount: number;
  estimatedSizeMB: number;
  error?: string;
}

/**
 * Triggers database cleanup via Supabase Edge Function
 */
export async function triggerDatabaseCleanup(): Promise<CleanupResult> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase.functions.invoke('database-cleanup', {
      method: 'POST'
    });

    if (error) {
      throw error;
    }

    return data as CleanupResult;
  } catch (error) {
    console.error('Database cleanup failed:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      operationalRemoved: 0,
      oldIncidentsResolved: 0,
      duplicatesRemoved: [],
      archivedOldIncidents: 0,
      finalRecordCount: 0,
      estimatedSizeMB: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Checks if cleanup should run based on last cleanup time
 * Runs cleanup if it's been more than 24 hours since last run
 */
export async function autoCleanupIfNeeded(): Promise<CleanupResult | null> {
  const lastCleanup = localStorage.getItem('lastDatabaseCleanup');
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  // Run cleanup if never run before or if 24+ hours have passed
  if (!lastCleanup || (now - parseInt(lastCleanup)) > twentyFourHours) {
    console.log('🧹 Running automatic database cleanup...');
    
    const result = await triggerDatabaseCleanup();
    
    if (result.success) {
      localStorage.setItem('lastDatabaseCleanup', now.toString());
      console.log('✅ Database cleanup completed:', {
        recordsRemaining: result.finalRecordCount,
        sizeMB: result.estimatedSizeMB
      });
    } else {
      console.error('❌ Database cleanup failed:', result.error);
    }
    
    return result;
  }

  return null; // No cleanup needed
}

/**
 * Force cleanup regardless of timing
 */
export async function forceCleanup(): Promise<CleanupResult> {
  console.log('🧹 Running forced database cleanup...');
  const result = await triggerDatabaseCleanup();
  
  if (result.success) {
    localStorage.setItem('lastDatabaseCleanup', Date.now().toString());
  }
  
  return result;
}