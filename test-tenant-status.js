// Test script to check if tenant_status field exists in database
// Run this in browser console or as a node script

const testTenantStatus = async () => {
  try {
    // Get all tenants and check if tenant_status field exists
    const { data: tenants, error } = await supabase
      .from('profiles')
      .select('id, name, role, tenant_status')
      .eq('role', 'tenant')
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      console.log('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      if (error.code === '42703') {
        console.log('❌ tenant_status column does NOT exist in database');
        console.log('🔧 Migration needs to be run: 20250729000002_unify_profiles_table.sql');
      }
    } else {
      console.log('✅ tenant_status column exists in database');
      console.log('Sample tenant data:', tenants);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};

// Run the test
testTenantStatus();
