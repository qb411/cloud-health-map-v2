#!/usr/bin/env node

/**
 * Supabase Integration Test
 * 
 * Comprehensive test of database integration:
 * - Connection and table structure
 * - Data retrieval and quality
 * - Enhanced incident detection fields
 * - Real-time subscriptions
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Starting Comprehensive Supabase Integration Test...\n');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log('1️⃣ Testing Database Connection...');

    try {
        const { data, error } = await supabase
            .from('region_status_current')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Connection failed:', error.message);
            return false;
        }

        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        return false;
    }
}

async function testTableStructure() {
    console.log('\n2️⃣ Testing Table Structure...');

    try {
        // Test cloud_status table
        console.log('📋 Testing cloud_status table...');
        const { data: cloudStatus, error: cloudError } = await supabase
            .from('cloud_status')
            .select('*')
            .limit(1);

        if (cloudError) {
            console.error('❌ cloud_status table error:', cloudError.message);
        } else {
            console.log('✅ cloud_status table accessible');
            if (cloudStatus && cloudStatus.length > 0) {
                console.log('📊 Sample record structure:', Object.keys(cloudStatus[0]));
            }
        }

        // Test region_status_current table
        console.log('📋 Testing region_status_current table...');
        const { data: regionStatus, error: regionError } = await supabase
            .from('region_status_current')
            .select('*')
            .limit(1);

        if (regionError) {
            console.error('❌ region_status_current table error:', regionError.message);
        } else {
            console.log('✅ region_status_current table accessible');
            if (regionStatus && regionStatus.length > 0) {
                console.log('📊 Sample record structure:', Object.keys(regionStatus[0]));
            }
        }

        return true;
    } catch (error) {
        console.error('❌ Table structure test failed:', error.message);
        return false;
    }
}

async function testDataRetrieval() {
    console.log('\n3️⃣ Testing Data Retrieval...');

    try {
        // Test current region status
        const { data: regions, error: regionError } = await supabase
            .from('region_status_current')
            .select('*')
            .order('provider')
            .order('region_name');

        if (regionError) {
            console.error('❌ Region status retrieval failed:', regionError.message);
            return false;
        }

        console.log(`✅ Retrieved ${regions?.length || 0} region status records`);

        if (regions && regions.length > 0) {
            // Group by provider
            const byProvider = regions.reduce((acc, region) => {
                acc[region.provider] = (acc[region.provider] || 0) + 1;
                return acc;
            }, {});

            console.log('📊 Regions by provider:', byProvider);

            // Show status distribution
            const byStatus = regions.reduce((acc, region) => {
                acc[region.overall_status] = (acc[region.overall_status] || 0) + 1;
                return acc;
            }, {});

            console.log('📊 Status distribution:', byStatus);
        }

        // Test incident data
        const { data: incidents, error: incidentError } = await supabase
            .from('cloud_status')
            .select('*')
            .neq('status', 'operational')
            .order('last_updated', { ascending: false })
            .limit(10);

        if (incidentError) {
            console.error('❌ Incident data retrieval failed:', incidentError.message);
        } else {
            console.log(`✅ Retrieved ${incidents?.length || 0} recent incidents`);

            if (incidents && incidents.length > 0) {
                console.log('🚨 Recent incidents:');
                incidents.slice(0, 3).forEach((incident, index) => {
                    console.log(`  ${index + 1}. ${incident.provider}/${incident.region_id}: ${incident.status} - ${incident.incident_title?.substring(0, 60)}...`);
                });
            }
        }

        return true;
    } catch (error) {
        console.error('❌ Data retrieval test failed:', error.message);
        return false;
    }
}

async function testEnhancedFields() {
    console.log('\n4️⃣ Testing Enhanced Incident Detection Fields...');

    try {
        // Check for new fields from our enhanced detection
        const { data: incidents, error } = await supabase
            .from('cloud_status')
            .select('provider, region_id, status, severity, is_active, incident_severity, end_time, start_time')
            .limit(5);

        if (error) {
            console.error('❌ Enhanced fields test failed:', error.message);
            return false;
        }

        console.log(`✅ Retrieved ${incidents?.length || 0} records with enhanced fields`);

        if (incidents && incidents.length > 0) {
            // Check which enhanced fields are present
            const sampleRecord = incidents[0];
            const enhancedFields = ['severity', 'is_active', 'incident_severity', 'end_time'];

            console.log('📊 Enhanced field availability:');
            enhancedFields.forEach(field => {
                const hasField = sampleRecord.hasOwnProperty(field);
                const hasData = hasField && sampleRecord[field] !== null;
                console.log(`  ${field}: ${hasField ? '✅' : '❌'} present, ${hasData ? '✅' : '❌'} has data`);
            });

            // Show severity distribution if available
            if (incidents.some(i => i.severity)) {
                const severityDist = incidents.reduce((acc, incident) => {
                    if (incident.severity) {
                        acc[incident.severity] = (acc[incident.severity] || 0) + 1;
                    }
                    return acc;
                }, {});
                console.log('📊 Severity distribution:', severityDist);
            }

            // Show active vs resolved if available
            if (incidents.some(i => i.is_active !== null)) {
                const activeDist = incidents.reduce((acc, incident) => {
                    const key = incident.is_active ? 'active' : 'resolved';
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});
                console.log('📊 Active vs Resolved:', activeDist);
            }
        }

        return true;
    } catch (error) {
        console.error('❌ Enhanced fields test failed:', error.message);
        return false;
    }
}

async function testRealTimeSubscription() {
    console.log('\n5️⃣ Testing Real-Time Subscription...');

    try {
        let messageReceived = false;

        const channel = supabase
            .channel('test-subscription')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'region_status_current',
                },
                (payload) => {
                    console.log('📡 Real-time update received:', payload);
                    messageReceived = true;
                }
            );

        const subscriptionResult = await channel.subscribe();

        if (subscriptionResult === 'SUBSCRIBED') {
            console.log('✅ Real-time subscription established');

            // Wait a moment to see if we get any updates
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Clean up
            await supabase.removeChannel(channel);

            if (messageReceived) {
                console.log('✅ Real-time updates working');
            } else {
                console.log('ℹ️  No real-time updates received (normal if no changes occurring)');
            }
        } else {
            console.error('❌ Real-time subscription failed:', subscriptionResult);
            return false;
        }

        return true;
    } catch (error) {
        console.error('❌ Real-time subscription test failed:', error.message);
        return false;
    }
}

async function testDatabaseFunctions() {
    console.log('\n6️⃣ Testing Database Functions...');

    try {
        // Test the update_region_status_summary function
        const { data, error } = await supabase
            .rpc('update_region_status_summary', {
                p_provider: 'aws',
                p_region_id: 'us-east-1'
            });

        if (error) {
            console.error('❌ Database function test failed:', error.message);
            return false;
        }

        console.log('✅ Database function update_region_status_summary working');
        return true;
    } catch (error) {
        console.error('❌ Database function test failed:', error.message);
        return false;
    }
}

async function generateSummaryReport() {
    console.log('\n📊 SUMMARY REPORT');
    console.log('==================');

    try {
        // Overall statistics
        const { data: totalRegions } = await supabase
            .from('region_status_current')
            .select('*');

        const { data: totalIncidents } = await supabase
            .from('cloud_status')
            .select('*')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const { data: activeIncidents } = await supabase
            .from('cloud_status')
            .select('*')
            .eq('is_active', true);

        console.log(`📈 Total regions monitored: ${totalRegions?.length || 0}`);
        console.log(`📈 Incidents in last 24h: ${totalIncidents?.length || 0}`);
        console.log(`🚨 Currently active incidents: ${activeIncidents?.length || 0}`);

        if (totalRegions && totalRegions.length > 0) {
            const healthyRegions = totalRegions.filter(r => r.overall_status === 'operational').length;
            const healthPercentage = ((healthyRegions / totalRegions.length) * 100).toFixed(1);
            console.log(`💚 Overall health: ${healthPercentage}% (${healthyRegions}/${totalRegions.length} regions operational)`);
        }

    } catch (error) {
        console.error('❌ Summary report generation failed:', error.message);
    }
}

async function main() {
    console.log(`🔗 Connecting to: ${SUPABASE_URL}`);
    console.log(`🔑 Using key: ${SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'MISSING'}\n`);

    const tests = [
        testConnection,
        testTableStructure,
        testDataRetrieval,
        testEnhancedFields,
        testRealTimeSubscription,
        testDatabaseFunctions
    ];

    let passedTests = 0;

    for (const test of tests) {
        const result = await test();
        if (result) passedTests++;
    }

    await generateSummaryReport();

    console.log(`\n🎯 TEST RESULTS: ${passedTests}/${tests.length} tests passed`);

    if (passedTests === tests.length) {
        console.log('🎉 All tests passed! Supabase integration is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the output above for details.');
    }
}

main().catch(console.error);