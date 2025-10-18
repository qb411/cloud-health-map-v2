import { ServiceStatus, CloudRegion, CloudProvider } from '../types';
import { supabase } from '../lib/supabase';

interface RegionStatusData {
  provider: CloudProvider;
  region_id: string;
  region_name: string;
  overall_status: ServiceStatus;
  operational_services: number;
  degraded_services: number;
  outage_services: number;
  maintenance_services: number;
  total_services: number;
  active_incidents: number;
  last_incident_time: string | null;
  last_updated: string;
}

interface ActiveIncident {
  id: string;
  provider: CloudProvider;
  region_id: string;
  region_name: string;
  service_name: string;
  status: ServiceStatus;
  severity: string;
  incident_title: string;
  incident_description: string;
  start_time: string;
  end_time: string | null;
  last_updated: string;
}

export class SupabaseStatusService {
  private statusCache: Map<string, ServiceStatus> = new Map();
  private incidentCache: Map<string, ActiveIncident[]> = new Map();
  private lastUpdate: Date = new Date(0);
  private readonly CACHE_DURATION = 60 * 1000; // 1 minute cache to reduce DB queries

  /**
   * Get status for a specific region from Supabase
   */
  async getRegionStatus(region: CloudRegion): Promise<ServiceStatus> {
    const cacheKey = `${region.provider}-${region.id}`;

    // Check cache first
    if (this.isCacheValid() && this.statusCache.has(cacheKey)) {
      return this.statusCache.get(cacheKey)!;
    }

    try {
      if (!supabase) {
        console.warn('Supabase not configured, returning operational status');
        return 'operational';
      }

      // Query region_status_current table
      const { data, error } = await supabase
        .from('region_status_current')
        .select('overall_status')
        .eq('provider', region.provider)
        .eq('region_id', region.id)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching status for ${region.provider}/${region.id}:`, error);
        return 'operational';
      }

      const status = data?.overall_status || 'operational';
      this.statusCache.set(cacheKey, status);

      return status;
    } catch (error) {
      console.error('Failed to fetch region status:', error);
      return 'operational';
    }
  }

  /**
   * Get statuses for all regions (batch query for efficiency)
   */
  async getAllStatuses(regions: CloudRegion[]): Promise<Map<string, ServiceStatus>> {
    const statuses = new Map<string, ServiceStatus>();

    try {
      if (!supabase) {
        console.warn('Supabase not configured, returning operational status for all regions');
        regions.forEach(region => statuses.set(region.id, 'operational'));
        return statuses;
      }

      // Fetch all region statuses in one query
      const { data, error } = await supabase
        .from('region_status_current')
        .select('provider, region_id, overall_status');

      if (error) {
        console.error('Error fetching all region statuses:', error);
        // Fall back to operational status for all regions
        regions.forEach(region => statuses.set(region.id, 'operational'));
        return statuses;
      }

      // Create a lookup map from database results
      const dbStatusMap = new Map<string, ServiceStatus>();
      data?.forEach((row: { provider: string; region_id: string; overall_status: ServiceStatus }) => {
        const key = `${row.provider}-${row.region_id}`;
        dbStatusMap.set(key, row.overall_status);
        this.statusCache.set(key, row.overall_status);
      });

      // Map statuses to requested regions
      regions.forEach(region => {
        const key = `${region.provider}-${region.id}`;
        const status = dbStatusMap.get(key) || 'operational';
        statuses.set(region.id, status);
      });

      this.lastUpdate = new Date();

      return statuses;
    } catch (error) {
      console.error('Failed to fetch all region statuses:', error);
      // Fallback to operational for all
      regions.forEach(region => statuses.set(region.id, 'operational'));
      return statuses;
    }
  }

  /**
   * Get active incidents for a specific region
   */
  async getRegionIncidents(region: CloudRegion): Promise<ActiveIncident[]> {
    const cacheKey = `${region.provider}-${region.id}`;

    // Check cache first
    if (this.isCacheValid() && this.incidentCache.has(cacheKey)) {
      return this.incidentCache.get(cacheKey)!;
    }

    try {
      if (!supabase) {
        console.warn('Supabase not configured, returning empty incidents');
        return [];
      }

      const { data, error } = await supabase
        .from('active_incidents')
        .select('*')
        .eq('provider', region.provider)
        .eq('region_id', region.id)
        .order('start_time', { ascending: false });

      if (error) {
        console.error(`Error fetching incidents for ${region.provider}/${region.id}:`, error);
        return [];
      }

      const incidents = data || [];
      this.incidentCache.set(cacheKey, incidents);

      return incidents;
    } catch (error) {
      console.error('Failed to fetch region incidents:', error);
      return [];
    }
  }

  /**
   * Get all active incidents across all providers
   */
  async getAllActiveIncidents(): Promise<ActiveIncident[]> {
    try {
      if (!supabase) {
        console.warn('Supabase not configured, returning empty incidents');
        return [];
      }

      const { data, error } = await supabase
        .from('active_incidents')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(100); // Limit to most recent 100 incidents

      if (error) {
        console.error('Error fetching all active incidents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch all active incidents:', error);
      return [];
    }
  }

  /**
   * Get summary statistics for all providers
   */
  async getProviderSummaries(): Promise<Map<CloudProvider, {
    operational: number;
    degraded: number;
    outage: number;
    total: number;
  }>> {
    const summaries = new Map();

    try {
      if (!supabase) {
        console.warn('Supabase not configured, returning empty summaries');
        return summaries;
      }

      const { data, error } = await supabase
        .from('region_status_current')
        .select('provider, overall_status');

      if (error) {
        console.error('Error fetching provider summaries:', error);
        return summaries;
      }

      // Group by provider and count statuses
      const providers: CloudProvider[] = ['aws', 'azure', 'gcp', 'oci'];

      providers.forEach(provider => {
        const providerData = data?.filter((row: { provider: string; overall_status: ServiceStatus }) => row.provider === provider) || [];

        summaries.set(provider, {
          operational: providerData.filter(r => r.overall_status === 'operational').length,
          degraded: providerData.filter(r => r.overall_status === 'degraded').length,
          outage: providerData.filter(r => r.overall_status === 'outage').length,
          total: providerData.length
        });
      });

      return summaries;
    } catch (error) {
      console.error('Failed to fetch provider summaries:', error);
      return summaries;
    }
  }

  /**
   * Subscribe to real-time updates for region status changes
   */
  subscribeToRegionUpdates(
    callback: (region: { provider: CloudProvider; region_id: string; status: ServiceStatus }) => void
  ) {
    if (!supabase) {
      console.warn('Supabase not configured, cannot subscribe to updates');
      return null;
    }

    return supabase
      .channel('region_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'region_status_current'
        },
        (payload) => {
          const data = payload.new as RegionStatusData;

          // Update cache
          const cacheKey = `${data.provider}-${data.region_id}`;
          this.statusCache.set(cacheKey, data.overall_status);

          // Notify callback
          callback({
            provider: data.provider,
            region_id: data.region_id,
            status: data.overall_status
          });
        }
      )
      .subscribe();
  }

  /**
   * Clear the cache (useful for forcing fresh data)
   */
  clearCache(): void {
    this.statusCache.clear();
    this.incidentCache.clear();
    this.lastUpdate = new Date(0);
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    const now = new Date();
    return now.getTime() - this.lastUpdate.getTime() < this.CACHE_DURATION;
  }

  /**
   * Get connection status to Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase not configured');
        return false;
      }

      const { error } = await supabase
        .from('region_status_current')
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const supabaseStatusService = new SupabaseStatusService();
