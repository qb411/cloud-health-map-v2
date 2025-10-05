import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We don't need user authentication for this public dashboard
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limit real-time events for performance
    },
  },
});

// Database types (generated from schema)
export interface CloudStatus {
  id: string;
  provider: 'aws' | 'azure' | 'gcp' | 'oci';
  region_id: string;
  region_name: string;
  service_name?: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  incident_id?: string;
  incident_title?: string;
  incident_description?: string;
  incident_severity?: 'low' | 'medium' | 'high' | 'critical';
  affected_services?: string[];
  start_time?: string;
  end_time?: string;
  last_updated: string;
  created_at: string;
}

export interface RegionStatusCurrent {
  id: string;
  provider: 'aws' | 'azure' | 'gcp' | 'oci';
  region_id: string;
  region_name: string;
  overall_status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  operational_services: number;
  degraded_services: number;
  outage_services: number;
  maintenance_services: number;
  total_services: number;
  active_incidents: number;
  last_incident_time?: string;
  last_updated: string;
}

// Helper functions for database operations
export class SupabaseService {
  
  /**
   * Get current status for all regions
   */
  static async getCurrentRegionStatus(): Promise<RegionStatusCurrent[]> {
    const { data, error } = await supabase
      .from('region_status_current')
      .select('*')
      .order('provider')
      .order('region_name');

    if (error) {
      console.error('Error fetching current region status:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get current status for a specific provider
   */
  static async getProviderStatus(provider: string): Promise<RegionStatusCurrent[]> {
    const { data, error } = await supabase
      .from('region_status_current')
      .select('*')
      .eq('provider', provider)
      .order('region_name');

    if (error) {
      console.error(`Error fetching ${provider} status:`, error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get detailed incidents for a specific region
   */
  static async getRegionIncidents(provider: string, regionId: string): Promise<CloudStatus[]> {
    const { data, error } = await supabase
      .from('cloud_status')
      .select('*')
      .eq('provider', provider)
      .eq('region_id', regionId)
      .neq('status', 'operational')
      .is('end_time', null) // Only active incidents
      .order('start_time', { ascending: false });

    if (error) {
      console.error(`Error fetching incidents for ${provider}/${regionId}:`, error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get historical status data for trend analysis
   */
  static async getHistoricalStatus(
    provider?: string, 
    regionId?: string, 
    hours: number = 24
  ): Promise<CloudStatus[]> {
    let query = supabase
      .from('cloud_status')
      .select('*')
      .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (provider) {
      query = query.eq('provider', provider);
    }

    if (regionId) {
      query = query.eq('region_id', regionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching historical status:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Subscribe to real-time status updates
   */
  static subscribeToStatusUpdates(
    callback: (payload: any) => void,
    provider?: string
  ) {
    let channel = supabase
      .channel('region-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'region_status_current',
          ...(provider && { filter: `provider=eq.${provider}` }),
        },
        callback
      );

    return channel.subscribe();
  }

  /**
   * Unsubscribe from real-time updates
   */
  static unsubscribeFromStatusUpdates(channel: any) {
    return supabase.removeChannel(channel);
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('region_status_current')
        .select('count')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

export default supabase;