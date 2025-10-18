import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🧹 Starting Database Cleanup...')

    // 1. Remove operational records
    const { error: opError, count: opCount } = await supabase
      .from('cloud_status')
      .delete({ count: 'exact' })
      .eq('status', 'operational')

    // 2. Mark old GCP incidents as resolved
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { error: updateError, count: updateCount } = await supabase
      .from('cloud_status')
      .update({ is_active: false }, { count: 'exact' })
      .eq('provider', 'gcp')
      .lt('created_at', oneHourAgo)
      .in('status', ['degraded', 'outage'])

    // 3. Clean duplicate active incidents for each provider
    const providers = ['aws', 'azure', 'gcp', 'oci']
    const cleanupResults = []

    for (const provider of providers) {
      const { count: activeCount } = await supabase
        .from('cloud_status')
        .select('*', { count: 'exact', head: true })
        .eq('provider', provider)
        .eq('is_active', true)

      if (activeCount && activeCount > 50) {
        const { data: recentActive } = await supabase
          .from('cloud_status')
          .select('id')
          .eq('provider', provider)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(50)

        if (recentActive && recentActive.length > 0) {
          const keepIds = recentActive.map(r => r.id)
          const { count: deleteCount } = await supabase
            .from('cloud_status')
            .delete({ count: 'exact' })
            .eq('provider', provider)
            .eq('is_active', true)
            .not('id', 'in', `(${keepIds.join(',')})`)

          cleanupResults.push({ provider, deleted: deleteCount || 0 })
        }
      }
    }

    // 4. Archive very old resolved incidents (90+ days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const { error: oldError, count: oldCount } = await supabase
      .from('cloud_status')
      .delete({ count: 'exact' })
      .eq('is_active', false)
      .lt('created_at', ninetyDaysAgo)

    // Final count
    const { count: finalCount } = await supabase
      .from('cloud_status')
      .select('*', { count: 'exact', head: true })

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      operationalRemoved: opCount || 0,
      oldIncidentsResolved: updateCount || 0,
      duplicatesRemoved: cleanupResults,
      archivedOldIncidents: oldCount || 0,
      finalRecordCount: finalCount || 0,
      estimatedSizeMB: ((finalCount || 0) * 4800) / (1024 * 1024)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})