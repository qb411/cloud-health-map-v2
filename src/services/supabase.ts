import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found, using mock data');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface CloudStatusRecord {
  provider: string;
  status: 'operational' | 'degraded' | 'outage';
  incidents: Array<{
    title: string;
    description: string;
    pubDate: string;
    link: string;
  }>;
  lastUpdated: string;
}
