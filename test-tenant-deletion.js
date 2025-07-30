// Test script to debug tenant deletion
// Run this in the browser console to test tenant deletion

async function testTenantDeletion() {
  try {
    console.log('=== Testing Tenant Deletion ===');
    
    // Import the tenant service (you'll need to adjust this path based on your setup)
    // const { tenantService } = await import('./src/lib/tenantService.ts');
    
    // Get current tenant list
    console.log('1. Getting current tenant list...');
    const tenants = await tenantService.getTenants();
    console.log(`Found ${tenants.length} tenants:`, tenants.map(t => ({ id: t.id, username: t.username, name: t.name })));
    
    if (tenants.length === 0) {
      console.log('No tenants found to delete. Please create a tenant first.');
      return;
    }
    
    // Select the first tenant for testing
    const tenantToDelete = tenants[0];
    console.log('2. Selected tenant for deletion:', { 
      id: tenantToDelete.id, 
      username: tenantToDelete.username, 
      name: tenantToDelete.name 
    });
    
    // Verify tenant exists before deletion
    console.log('3. Verifying tenant exists...');
    const existsBefore = await tenantService.verifyTenantExists(tenantToDelete.id);
    console.log('Tenant exists before deletion:', existsBefore);
    
    if (!existsBefore) {
      console.log('Tenant does not exist in database. Skipping deletion test.');
      return;
    }
    
    // Delete the tenant
    console.log('4. Deleting tenant...');
    await tenantService.deleteTenant(tenantToDelete.id);
    console.log('Deletion completed successfully');
    
    // Verify tenant is deleted
    console.log('5. Verifying tenant is deleted...');
    const existsAfter = await tenantService.verifyTenantExists(tenantToDelete.id);
    console.log('Tenant exists after deletion:', existsAfter);
    
    // Refresh tenant list
    console.log('6. Refreshing tenant list...');
    const tenantsAfter = await tenantService.refreshTenants();
    console.log(`Tenant list after deletion: ${tenantsAfter.length} tenants found`);
    
    // Check if the deleted tenant is still in the list
    const stillInList = tenantsAfter.find(t => t.id === tenantToDelete.id);
    console.log('Deleted tenant still in list:', !!stillInList);
    
    if (!existsAfter && !stillInList) {
      console.log('✅ SUCCESS: Tenant deletion worked correctly!');
    } else {
      console.log('❌ ISSUE: Tenant was not properly deleted');
      console.log('- Exists in database:', existsAfter);
      console.log('- Still in tenant list:', !!stillInList);
    }
    
  } catch (error) {
    console.error('❌ ERROR during tenant deletion test:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

// Instructions for use:
console.log('To test tenant deletion, run: testTenantDeletion()');
console.log('Make sure you have tenants in your system first.');

// Export the function for manual testing
window.testTenantDeletion = testTenantDeletion;
