// Test script to verify landlord information in maintenance requests
// Run this in the browser console to test landlord information loading

async function testLandlordContactInfo() {
  try {
    console.log('=== Testing Landlord Contact Information in Maintenance Requests ===');
    
    // Import the tenant service (you'll need to adjust this path based on your setup)
    // const { tenantService } = await import('./src/lib/tenantService.ts');
    
    // Test the new function to get maintenance requests with details
    console.log('1. Getting maintenance requests with landlord details...');
    const requests = await tenantService.getMaintenanceRequestsWithDetails();
    console.log(`Found ${requests.length} maintenance requests:`, requests);
    
    if (requests.length === 0) {
      console.log('No maintenance requests found. Please create some test data first.');
      return;
    }
    
    // Check landlord information for each request
    requests.forEach((request, index) => {
      console.log(`\n--- Request ${index + 1}: ${request.title} ---`);
      console.log('Tenant:', request.tenant_profile?.name || 'Unknown');
      console.log('Landlord:', request.landlord_profile?.name || 'Not found');
      
      if (request.landlord_profile) {
        console.log('Landlord Contact:');
        console.log('  - Name:', request.landlord_profile.name);
        console.log('  - Email:', request.landlord_profile.email || `${request.landlord_profile.username}@propertycare.app`);
        console.log('  - Phone:', request.landlord_profile.phone || 'Not provided');
      } else {
        console.log('❌ No landlord information found for this request');
        console.log('Tenant details:', {
          id: request.tenant_profile?.id,
          landlord_id: request.tenant_profile?.landlord_id,
          property_id: request.tenant_profile?.property_id
        });
      }
    });
    
    // Summary
    const requestsWithLandlord = requests.filter(r => r.landlord_profile);
    const requestsWithoutLandlord = requests.filter(r => !r.landlord_profile);
    
    console.log('\n=== Summary ===');
    console.log(`✅ Requests with landlord info: ${requestsWithLandlord.length}`);
    console.log(`❌ Requests without landlord info: ${requestsWithoutLandlord.length}`);
    
    if (requestsWithoutLandlord.length > 0) {
      console.log('\nRequests missing landlord info:');
      requestsWithoutLandlord.forEach(r => {
        console.log(`- ${r.title} (Tenant: ${r.tenant_profile?.name || 'Unknown'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ ERROR during landlord contact info test:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

// Instructions for use:
console.log('To test landlord contact information, run: testLandlordContactInfo()');
console.log('Make sure you have maintenance requests in your system first.');

// Export the function for manual testing
window.testLandlordContactInfo = testLandlordContactInfo;
