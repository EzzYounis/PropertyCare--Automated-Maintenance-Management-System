import { createClient } from '@supabase/supabase-js';

// You'll need to update these with your actual Supabase project details
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleTenant() {
  try {
    // First, create a sample property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert([
        {
          name: 'Sunset Apartments',
          address: '123 Main Street, Apt 4B\nNew York, NY 10001',
          type: 'apartment',
          units: 1,
          rent_per_unit: 1250.00,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (propertyError) {
      console.error('Error creating property:', propertyError);
      return;
    }

    console.log('Created property:', property);

    // Then, create a sample tenant
    // You'll need to replace 'user-id-here' with an actual user ID from your auth.users table
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert([
        {
          id: 'user-id-here', // Replace with actual user ID
          property_id: property.id,
          monthly_rent: 1250.00,
          lease_start: '2025-01-01',
          lease_end: '2025-12-31',
          status: 'active'
        }
      ])
      .select()
      .single();

    if (tenantError) {
      console.error('Error creating tenant:', tenantError);
      return;
    }

    console.log('Created tenant:', tenant);
    console.log('Sample data created successfully!');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment the line below to run the script
// createSampleTenant();

console.log('Sample tenant creation script ready.');
console.log('Update the supabaseUrl, supabaseKey, and user ID, then uncomment the last line to run.');
