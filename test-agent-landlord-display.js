import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://kcrxoqjbuhbcfevydkkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjcnhvcWpidWhiY2Zldnlka2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MTI1MzEsImV4cCI6MjA1MzQ4ODUzMX0.oWCWlHHHR5QW3J1W6gR5DdQeV-q2G7zOjVHJPLLbNmI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getMaintenanceRequestsWithDetails() {
  try {
    console.log('🔍 Testing enhanced maintenance request fetching with landlord info...\n');

    // First get maintenance requests
    const { data: requests, error: requestsError } = await supabase
      .from('maintenance_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (requestsError) {
      console.error('❌ Error fetching maintenance requests:', requestsError);
      return;
    }

    if (!requests || requests.length === 0) {
      console.log('ℹ️ No maintenance requests found.');
      return;
    }

    console.log(`📋 Found ${requests.length} maintenance requests. Fetching enhanced details...\n`);

    // Get unique tenant and property IDs
    const tenantIds = [...new Set(requests.map(r => r.tenant_id).filter(Boolean))];
    const propertyIds = [...new Set(requests.map(r => r.property_id).filter(Boolean))];

    console.log(`👥 Unique tenants: ${tenantIds.length}`);
    console.log(`🏠 Unique properties: ${propertyIds.length}\n`);

    // Fetch tenant profiles
    let tenantProfiles = [];
    if (tenantIds.length > 0) {
      const { data: tenants, error: tenantsError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', tenantIds);

      if (tenantsError) {
        console.error('❌ Error fetching tenant profiles:', tenantsError);
      } else {
        tenantProfiles = tenants || [];
        console.log(`✅ Fetched ${tenantProfiles.length} tenant profiles`);
      }
    }

    // Fetch properties
    let properties = [];
    if (propertyIds.length > 0) {
      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      if (propsError) {
        console.error('❌ Error fetching properties:', propsError);
      } else {
        properties = props || [];
        console.log(`✅ Fetched ${properties.length} properties`);
      }
    }

    // Get unique landlord IDs from all sources
    const landlordIdsFromTenants = tenantProfiles
      .map(t => t.landlord_id)
      .filter(Boolean);
    
    const landlordIdsFromProperties = properties
      .map(p => p.owner_id)
      .filter(Boolean);

    const allLandlordIds = [...new Set([...landlordIdsFromTenants, ...landlordIdsFromProperties])];

    console.log(`🏘️ Unique landlords to fetch: ${allLandlordIds.length}\n`);

    // Fetch landlord profiles
    let landlordProfiles = [];
    if (allLandlordIds.length > 0) {
      const { data: landlords, error: landlordsError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', allLandlordIds);

      if (landlordsError) {
        console.error('❌ Error fetching landlord profiles:', landlordsError);
      } else {
        landlordProfiles = landlords || [];
        console.log(`✅ Fetched ${landlordProfiles.length} landlord profiles\n`);
      }
    }

    // Combine all data
    const enhancedRequests = requests.map(request => {
      const tenant = tenantProfiles.find(t => t.id === request.tenant_id);
      const property = properties.find(p => p.id === request.property_id);
      
      // Try multiple paths to find landlord
      let landlord = null;
      
      // 1. Direct from tenant landlord_id
      if (tenant?.landlord_id) {
        landlord = landlordProfiles.find(l => l.id === tenant.landlord_id);
      }
      
      // 2. From property owner_id  
      if (!landlord && property?.owner_id) {
        landlord = landlordProfiles.find(l => l.id === property.owner_id);
      }
      
      // 3. If tenant IS a landlord (role-based)
      if (!landlord && tenant?.role === 'landlord') {
        landlord = tenant;
      }

      return {
        ...request,
        tenant_profile: tenant || null,
        property_profile: property || null,
        landlord_profile: landlord || null
      };
    });

    // Display results
    console.log('📊 ENHANCED MAINTENANCE REQUESTS WITH LANDLORD INFO:');
    console.log('='.repeat(80));

    enhancedRequests.forEach((req, index) => {
      console.log(`\n${index + 1}. 🔧 ${req.title || 'No Title'}`);
      console.log(`   📍 Status: ${req.status}`);
      console.log(`   📅 Created: ${new Date(req.created_at).toLocaleDateString()}`);
      
      // Tenant info
      if (req.tenant_profile) {
        console.log(`   👤 Tenant: ${req.tenant_profile.name || 'No Name'}`);
        console.log(`   📞 Tenant Phone: ${req.tenant_profile.phone || 'No Phone'}`);
      } else {
        console.log(`   👤 Tenant: ❌ No tenant profile found`);
      }

      // Property info
      if (req.property_profile) {
        console.log(`   🏠 Property: ${req.property_profile.address || 'No Address'}`);
      } else if (req.property_address) {
        console.log(`   🏠 Property: ${req.property_address} (from request)`);
      } else {
        console.log(`   🏠 Property: ❌ No property info`);
      }

      // Landlord info (this is what we're testing!)
      if (req.landlord_profile) {
        console.log(`   🏘️ Landlord: ✅ ${req.landlord_profile.name || 'No Name'}`);
        console.log(`   📞 Landlord Phone: ${req.landlord_profile.phone || 'No Phone'}`);
        console.log(`   📧 Landlord Email: ${req.landlord_profile.email || 'No Email'}`);
      } else {
        console.log(`   🏘️ Landlord: ❌ No landlord info found`);
      }
    });

    // Summary
    const withLandlordInfo = enhancedRequests.filter(req => req.landlord_profile).length;
    const totalRequests = enhancedRequests.length;
    
    console.log('\n' + '='.repeat(80));
    console.log('📈 SUMMARY:');
    console.log(`✅ Requests with landlord info: ${withLandlordInfo}/${totalRequests} (${Math.round(withLandlordInfo/totalRequests*100)}%)`);
    
    if (withLandlordInfo === totalRequests) {
      console.log('🎉 SUCCESS: All maintenance requests have landlord contact information!');
    } else {
      console.log('⚠️ WARNING: Some maintenance requests are missing landlord info.');
      console.log('   This might be expected if some requests don\'t have associated properties or landlords.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
getMaintenanceRequestsWithDetails()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
