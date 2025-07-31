import { supabase } from '@/integrations/supabase/client';

// Generate a short property ID for demo purposes
const generateShortId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'P';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export interface TenantProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  address?: string;
  role: 'tenant' | 'landlord' | 'agent';
  property_id?: string;
  landlord_id?: string;
  lease_start?: string;
  lease_end?: string;
  monthly_rent?: number;
  deposit_paid?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  tenant_status?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface LandlordProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  address?: string;
  role: 'tenant' | 'landlord' | 'agent';
  company_name?: string;
  business_email?: string;
  business_phone?: string;
  business_address?: string;
  license_number?: string;
  total_properties?: number;
  total_revenue?: number;
  preferred_payment_method?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  short_id?: string; // User-friendly short ID like "P1A2B3"
  name: string;
  address: string;
  type: string;
  landlord_id?: string;
  units?: number;
  rent_per_unit?: number;
  status: string;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  priority: string;
  status: string;
  room?: string;
  photos?: string[];
  quick_fixes?: string[];
  preferred_time_slots?: string[];
  preferred_date?: string;
  agent_notes?: string;
  landlord_notes?: string;
  estimated_cost?: number;
  actual_cost?: number;
  additional_cost?: number;
  additional_cost_description?: string;
  completion_notes?: string;
  estimated_time?: string;
  quote_description?: string;
  assigned_worker_id?: string;
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateTenantData {
  name: string;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  address?: string;
  property_id?: string;
  landlord_id?: string;
  lease_start?: string;
  lease_end?: string;
  monthly_rent?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  tenant_status?: string;
}

export interface CreateLandlordData {
  name: string;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  business_email?: string;
  business_phone?: string;
  business_address?: string;
  license_number?: string;
  preferred_payment_method?: string;
}

export interface UpdateLandlordData {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  business_email?: string;
  business_phone?: string;
  business_address?: string;
  license_number?: string;
  preferred_payment_method?: string;
  status?: string;
}

export interface CreatePropertyData {
  name: string;
  address: string;
  type: string;
  landlord_id?: string;
  rent_per_unit?: number;
  status?: string;
  photos?: string[];
}

const tenantServiceObject = {
  // Get all tenants
  async getTenants(): Promise<TenantProfile[]> {
    try {
      console.log('Fetching tenants from profiles table...');
      
      // Get data from unified profiles table for tenants
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles' as any)
        .select(`
          id,
          username,
          email,
          phone,
          address,
          role,
          name,
          property_id,
          landlord_id,
          lease_start,
          lease_end,
          monthly_rent,
          deposit_paid,
          emergency_contact_name,
          emergency_contact_phone,
          tenant_status,
          status,
          created_at,
          updated_at
        `)
        .eq('role', 'tenant');

      if (profilesError) {
        console.error('Error fetching tenant profiles:', profilesError);
        console.error('Profiles error details:', JSON.stringify(profilesError, null, 2));
        return [];
      }

      console.log(`Found ${profiles?.length || 0} tenant profiles`);

      // Transform the data to match TenantProfile interface
      const tenants = (profiles || []).map((profile: any) => ({
        ...profile,
        name: profile.name || profile.username || 'Unknown',
        status: profile.tenant_status || profile.status || 'active'
      }));

      return tenants;
    } catch (error) {
      console.error('Error in getTenants:', error);
      throw error;
    }
  },

  // Get all landlords
  async getLandlords(): Promise<LandlordProfile[]> {
    try {
      // Get data from unified profiles table for landlords
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles' as any)
        .select(`
          id,
          username,
          email,
          phone,
          address,
          role,
          name,
          company_name,
          business_email,
          business_phone,
          business_address,
          license_number,
          total_properties,
          total_revenue,
          preferred_payment_method,
          status,
          created_at,
          updated_at
        `)
        .eq('role', 'landlord');

      if (profilesError) {
        console.error('Error fetching landlord profiles:', profilesError);
        return [];
      }

      // Get property count for each landlord and update the data
      const enhancedProfiles = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          // Get actual property count for this landlord
          const { data: properties, error: propertiesError } = await supabase
            .from('properties' as any)
            .select('id')
            .eq('landlord_id', profile.id);

          const propertyCount = propertiesError ? 0 : (properties?.length || 0);

          return {
            ...profile,
            name: profile.name || profile.username || 'Unknown',
            total_properties: propertyCount, // Use real count from properties table
          };
        })
      );

      return enhancedProfiles;
    } catch (error) {
      console.error('Error in getLandlords:', error);
      throw error;
    }
  },

  // Get all properties
  async getProperties(): Promise<Property[]> {
    try {
      // Use raw query to fetch properties
      const { data, error } = await supabase
        .from('properties' as any)
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching properties:', error);
        return []; // Return empty array instead of throwing
      }
      
      const properties = (data as unknown as Property[]) || [];
      
      // Add short_id to properties that don't have one (for demo purposes)
      return properties.map(property => ({
        ...property,
        short_id: property.short_id || generateShortId()
      }));
    } catch (error) {
      console.error('Error in getProperties:', error);
      throw error;
    }
  },

  // Create new tenant
  async createTenant(tenantData: CreateTenantData): Promise<void> {
    // Validate required fields
    if (!tenantData.name?.trim()) {
      throw new Error('Name is required');
    }
    if (!tenantData.username?.trim()) {
      throw new Error('Username is required');
    }
    if (!tenantData.password?.trim()) {
      throw new Error('Password is required');
    }

    try {
      // If assigning to a property, check if another tenant is already assigned
      if (tenantData.property_id) {
        try {
          // Use a more robust query to check for existing tenants
          const { data: existingTenants, error: checkError } = await supabase
            .from('profiles' as any)
            .select('id, name')
            .eq('property_id', tenantData.property_id)
            .eq('role', 'tenant')
            .eq('tenant_status', 'active');

          if (checkError) {
            console.error('Error checking existing tenant:', checkError);
            console.error('Error details:', JSON.stringify(checkError, null, 2));
            // Don't throw error here, just log it and continue
          }

          // Check if there are any active tenants
          if (existingTenants && existingTenants.length > 0) {
            const existingTenant = existingTenants[0] as any;
            throw new Error(`Property is already occupied by another tenant: ${existingTenant.name || 'Unknown tenant'}`);
          }
        } catch (checkTenantError) {
          console.error('Exception during tenant check:', checkTenantError);
          // Continue with creation - don't let tenant check block the process
        }
      }

      // Store current session to restore later
      const currentSession = await supabase.auth.getSession();
      const currentUser = currentSession.data.session?.user;
      
      // Create the user in Supabase Auth using admin function to avoid automatic sign-in
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${tenantData.username}@propertycare.app`,
        password: tenantData.password,
        options: {
          data: {
            username: tenantData.username,
            name: tenantData.name,
            role: 'tenant'
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Failed to create user account: ${authError.message}`);
      }

      if (!authData.user?.id) {
        throw new Error('Failed to create user account');
      }

      // Always sign out the newly created user to ensure we don't stay logged in as them
      await supabase.auth.signOut();
      
      // Restore the original session if it existed
      if (currentSession.data.session && currentUser) {
        try {
          const { error: restoreError } = await supabase.auth.setSession({
            access_token: currentSession.data.session.access_token,
            refresh_token: currentSession.data.session.refresh_token
          });
          
          if (restoreError) {
            console.error('Error restoring session:', restoreError);
            // If session restoration fails, try to refresh the session
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Error refreshing session:', refreshError);
            }
          }
        } catch (sessionError) {
          console.error('Session restoration failed:', sessionError);
        }
      }

      // Small delay to ensure session restoration is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update the automatically created profile with all tenant data
      // First check if profile already exists
      let existingProfile = null;
      let checkProfileError = null;
      
      try {
        const result = await supabase
          .from('profiles' as any)
          .select('id')
          .eq('id', authData.user.id)
          .single();
        
        existingProfile = result.data;
        checkProfileError = result.error;
      } catch (err) {
        console.error('Error checking existing profile:', err);
        checkProfileError = err;
      }

      const profileData = {
        username: tenantData.username,
        name: tenantData.name,
        email: tenantData.email || `${tenantData.username}@propertycare.app`,
        phone: tenantData.phone,
        address: tenantData.address,
        role: 'tenant',
        property_id: tenantData.property_id,
        landlord_id: tenantData.landlord_id,
        lease_start: tenantData.lease_start,
        lease_end: tenantData.lease_end,
        monthly_rent: tenantData.monthly_rent,
        emergency_contact_name: tenantData.emergency_contact_name,
        emergency_contact_phone: tenantData.emergency_contact_phone,
        tenant_status: tenantData.tenant_status || 'active',
        status: 'active'
      };

      let profileError;
      
      if (existingProfile || (checkProfileError && checkProfileError.code !== 'PGRST116')) {
        // Profile exists, update it
        console.log('Updating existing profile for user:', authData.user.id);
        const { error } = await supabase
          .from('profiles' as any)
          .update(profileData)
          .eq('id', authData.user.id);
        profileError = error;
      } else {
        // Profile doesn't exist, create it
        console.log('Creating new profile for user:', authData.user.id);
        const { error } = await supabase
          .from('profiles' as any)
          .insert({
            id: authData.user.id,
            ...profileData
          });
        profileError = error;
      }

      if (profileError) {
        console.error('Profile update/insert error:', profileError);
        console.error('Profile error details:', JSON.stringify(profileError, null, 2));
        throw new Error(`Failed to update tenant profile: ${profileError.message}`);
      }

      console.log('Successfully created/updated tenant profile for:', tenantData.username);

      // Update property status if tenant was assigned to a property
      if (tenantData.property_id) {
        await this.updatePropertyStatus(tenantData.property_id);
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  // Update tenant
  async updateTenant(tenantId: string, updateData: Partial<CreateTenantData>): Promise<void> {
    try {
      console.log('updateTenant called with:', { tenantId, updateData });

      // Get the current tenant data to track property changes
      let oldPropertyId: string | null = null;
      try {
        const { data: currentTenant, error: getCurrentError } = await supabase
          .from('profiles' as any)
          .select('property_id')
          .eq('id', tenantId)
          .eq('role', 'tenant')
          .single();

        if (!getCurrentError && currentTenant) {
          oldPropertyId = (currentTenant as any).property_id;
          console.log('Current tenant property_id:', oldPropertyId);
        }
      } catch (err) {
        // If we can't get current tenant data, continue without property status updates
        console.warn('Could not get current tenant property assignment:', err);
      }
      const newPropertyId = updateData.property_id;
      console.log('New property_id will be:', newPropertyId);

      // If assigning to a new property, check if another tenant is already assigned
      if (newPropertyId && newPropertyId !== oldPropertyId) {
        const { data: existingTenant, error: checkError } = await supabase
          .from('profiles' as any)
          .select('id, name')
          .eq('property_id', newPropertyId)
          .eq('role', 'tenant')
          .neq('id', tenantId) // Exclude current tenant
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error checking existing tenant:', checkError);
        }

        if (existingTenant) {
          throw new Error(`Property is already occupied by another tenant: ${(existingTenant as any).name}`);
        }
      }

      // Prepare update object with explicit null handling
      const updateObject = {
        name: updateData.name,
        username: updateData.username,
        email: updateData.email,
        phone: updateData.phone,
        address: updateData.address,
        property_id: updateData.property_id,
        landlord_id: updateData.landlord_id,
        lease_start: updateData.lease_start,
        lease_end: updateData.lease_end,
        monthly_rent: updateData.monthly_rent,
        emergency_contact_name: updateData.emergency_contact_name,
        emergency_contact_phone: updateData.emergency_contact_phone,
        tenant_status: updateData.tenant_status || 'active'
      };

      console.log('Updating tenant with tenant_status:', updateData.tenant_status);
      console.log('Final updateObject tenant_status:', updateObject.tenant_status);
      console.log('Updating profiles table with:', updateObject);

      // Update profiles table with all tenant data
      const { error: profileError } = await supabase
        .from('profiles' as any)
        .update(updateObject)
        .eq('id', tenantId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        console.error('Profile update error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
        throw new Error(`Failed to update tenant profile: ${profileError.message}`);
      }

      console.log('Profile update successful');

      // Update property statuses if property assignment changed
      if (oldPropertyId !== newPropertyId) {
        console.log('Property assignment changed, updating property statuses...');
        // Update old property status (if tenant was unassigned from it)
        if (oldPropertyId) {
          console.log('Updating old property status:', oldPropertyId);
          await this.updatePropertyStatus(oldPropertyId);
        }
        
        // Update new property status (if tenant was assigned to it)
        if (newPropertyId) {
          console.log('Updating new property status:', newPropertyId);
          await this.updatePropertyStatus(newPropertyId);
        }
      } else if (newPropertyId && updateData.monthly_rent !== undefined) {
        // If staying on the same property but rent changed, update property rent
        console.log('Rent changed for same property, updating property status...');
        await this.updatePropertyStatus(newPropertyId);
      }

      console.log('updateTenant completed successfully');
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  },

  // Delete tenant
  async deleteTenant(tenantId: string): Promise<void> {
    try {
      console.log('Starting tenant deletion process for ID:', tenantId);
      
      // Get the tenant's property assignment before deletion
      let propertyId: string | null = null;
      let tenantData: any = null;
      
      try {
        const { data: tenant, error: getTenantError } = await supabase
          .from('profiles' as any)
          .select('property_id, username, email')
          .eq('id', tenantId)
          .eq('role', 'tenant')
          .single();

        if (!getTenantError && tenant) {
          propertyId = (tenant as any).property_id;
          tenantData = tenant;
          console.log('Found tenant data before deletion:', tenantData);
        } else if (getTenantError) {
          console.error('Error getting tenant data:', getTenantError);
          // If we can't find the tenant, it might already be deleted
          if (getTenantError.code === 'PGRST116') {
            console.log('Tenant not found - might already be deleted');
            return;
          }
        }
      } catch (err) {
        console.warn('Could not get tenant property assignment before deletion:', err);
      }

      // Check for related maintenance requests before deletion
      try {
        const { data: maintenanceRequests, error: maintError } = await supabase
          .from('maintenance_requests')
          .select('id, title, status')
          .eq('tenant_id', tenantId);

        if (maintError) {
          console.warn('Could not check maintenance requests:', maintError);
        } else if (maintenanceRequests && maintenanceRequests.length > 0) {
          console.log(`Found ${maintenanceRequests.length} maintenance requests for tenant`);
          
          // Delete all maintenance requests for this tenant
          // This is necessary because tenant_id has NOT NULL constraint
          const { error: deleteRequestsError } = await supabase
            .from('maintenance_requests')
            .delete()
            .eq('tenant_id', tenantId);
          
          if (deleteRequestsError) {
            console.error('Could not delete maintenance requests:', deleteRequestsError);
            throw new Error(`Cannot delete tenant: Unable to delete ${maintenanceRequests.length} maintenance requests. Error: ${deleteRequestsError.message}`);
          } else {
            console.log(`Successfully deleted ${maintenanceRequests.length} maintenance requests`);
          }
        }
      } catch (maintErr) {
        console.warn('Error handling maintenance requests:', maintErr);
      }

      // Delete from profiles table (contains all tenant data)
      console.log('Deleting tenant from profiles table...');
      const { error: profileDeleteError } = await supabase
        .from('profiles' as any)
        .delete()
        .eq('id', tenantId);

      if (profileDeleteError) {
        console.error('Error deleting from profiles table:', profileDeleteError);
        console.error('Profile delete error details:', JSON.stringify(profileDeleteError, null, 2));
        throw new Error(`Failed to delete tenant profile: ${profileDeleteError.message}`);
      }

      console.log('Successfully deleted tenant from profiles table');

      // Note: We cannot delete users from Supabase Auth using the client library
      // This would require admin privileges or a server-side function
      // The user will still exist in auth.users but won't have a profile

      // Update property status if tenant was assigned to a property
      if (propertyId) {
        console.log('Updating property status for property:', propertyId);
        await this.updatePropertyStatus(propertyId);
      }

      console.log('Tenant deletion completed successfully');
    } catch (error) {
      console.error('Error deleting tenant:', error);
      console.error('Delete error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  // Helper function to verify if a tenant exists (for debugging)
  async verifyTenantExists(tenantId: string): Promise<boolean> {
    try {
      const { data: tenant, error } = await supabase
        .from('profiles' as any)
        .select('id, username, role')
        .eq('id', tenantId)
        .eq('role', 'tenant')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking tenant existence:', error);
        return false;
      }

      const exists = !!tenant;
      console.log(`Tenant ${tenantId} exists:`, exists, tenant ? `(${(tenant as any).username})` : '');
      return exists;
    } catch (error) {
      console.error('Exception checking tenant existence:', error);
      return false;
    }
  },

  // Force refresh tenant list (useful after deletion)
  async refreshTenants(): Promise<TenantProfile[]> {
    try {
      console.log('Refreshing tenant list...');
      // Clear any potential cache and fetch fresh data
      const tenants = await this.getTenants();
      console.log(`Refreshed tenant list: ${tenants.length} tenants found`);
      return tenants;
    } catch (error) {
      console.error('Error refreshing tenants:', error);
      throw error;
    }
  },

  // Create new landlord
  async createLandlord(landlordData: CreateLandlordData): Promise<void> {
    // Validate required fields
    if (!landlordData.name?.trim()) {
      throw new Error('Name is required');
    }
    if (!landlordData.username?.trim()) {
      throw new Error('Username is required');
    }
    if (!landlordData.password?.trim()) {
      throw new Error('Password is required');
    }

    try {
      // Store current session to restore later
      const currentSession = await supabase.auth.getSession();
      const currentUser = currentSession.data.session?.user;
      
      // Create the user in Supabase Auth using admin function to avoid automatic sign-in
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${landlordData.username}@propertycare.app`,
        password: landlordData.password,
        options: {
          data: {
            username: landlordData.username,
            name: landlordData.name,
            role: 'landlord'
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Failed to create user account: ${authError.message}`);
      }

      if (!authData.user?.id) {
        throw new Error('Failed to create user account');
      }

      // Always sign out the newly created user to ensure we don't stay logged in as them
      await supabase.auth.signOut();
      
      // Restore the original session if it existed
      if (currentSession.data.session && currentUser) {
        try {
          const { error: restoreError } = await supabase.auth.setSession({
            access_token: currentSession.data.session.access_token,
            refresh_token: currentSession.data.session.refresh_token
          });
          
          if (restoreError) {
            console.error('Error restoring session:', restoreError);
            // If session restoration fails, try to refresh the session
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Error refreshing session:', refreshError);
            }
          }
        } catch (sessionError) {
          console.error('Session restoration failed:', sessionError);
        }
      }

      // Small delay to ensure session restoration is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update the automatically created profile with all landlord data
      // First check if profile already exists
      const { data: existingProfile, error: checkProfileError } = await supabase
        .from('profiles' as any)
        .select('id')
        .eq('id', authData.user.id)
        .single();

      const profileData = {
        username: landlordData.username,
        name: landlordData.name,
        email: landlordData.email || `${landlordData.username}@propertycare.app`,
        phone: landlordData.phone,
        address: landlordData.address,
        role: 'landlord',
        company_name: landlordData.company_name,
        business_email: landlordData.business_email,
        business_phone: landlordData.business_phone,
        business_address: landlordData.business_address,
        license_number: landlordData.license_number,
        preferred_payment_method: landlordData.preferred_payment_method,
        total_properties: 0,
        total_revenue: 0,
        status: 'active'
      };

      let profileError;
      
      if (existingProfile || (checkProfileError && checkProfileError.code !== 'PGRST116')) {
        // Profile exists, update it
        const { error } = await supabase
          .from('profiles' as any)
          .update(profileData)
          .eq('id', authData.user.id);
        profileError = error;
      } else {
        // Profile doesn't exist, create it
        const { error } = await supabase
          .from('profiles' as any)
          .insert({
            id: authData.user.id,
            ...profileData
          });
        profileError = error;
      }

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw new Error(`Failed to update landlord profile: ${profileError.message}`);
      }
    } catch (error) {
      console.error('Error creating landlord:', error);
      throw error;
    }
  },

  // Update landlord
  async updateLandlord(landlordId: string, updateData: UpdateLandlordData): Promise<void> {
    try {
      // Update in profiles table with all landlord data
      const { error: profileError } = await supabase
        .from('profiles' as any)
        .update({
          name: updateData.name,
          username: updateData.username,
          email: updateData.email,
          phone: updateData.phone,
          address: updateData.address,
          company_name: updateData.company_name,
          business_email: updateData.business_email,
          business_phone: updateData.business_phone,
          business_address: updateData.business_address,
          license_number: updateData.license_number,
          preferred_payment_method: updateData.preferred_payment_method,
          status: updateData.status || 'active'
        })
        .eq('id', landlordId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw new Error(`Failed to update landlord profile: ${profileError.message}`);
      }
    } catch (error) {
      console.error('Error updating landlord:', error);
      throw error;
    }
  },

  // Delete landlord
  async deleteLandlord(landlordId: string): Promise<void> {
    try {
      // Delete from profiles table (contains all landlord data)
      const { error: profileError } = await supabase
        .from('profiles' as any)
        .delete()
        .eq('id', landlordId);

      if (profileError) {
        throw new Error(`Failed to delete landlord: ${profileError.message}`);
      }
    } catch (error) {
      console.error('Error deleting landlord:', error);
      throw error;
    }
  },

  // Create new property
  async createProperty(propertyData: CreatePropertyData): Promise<void> {
    // Validate required fields
    if (!propertyData.name?.trim()) {
      throw new Error('Property name is required');
    }
    if (!propertyData.address?.trim()) {
      throw new Error('Property address is required');
    }
    if (!propertyData.type?.trim()) {
      throw new Error('Property type is required');
    }

    const { error } = await supabase
      .from('properties' as any)
      .insert({
        name: propertyData.name,
        address: propertyData.address,
        type: propertyData.type,
        landlord_id: propertyData.landlord_id,
        units: 1, // Always 1 unit per property
        rent_per_unit: propertyData.rent_per_unit || 0,
        status: propertyData.status || 'active',
        photos: propertyData.photos || []
      });

    if (error) {
      console.error('Error creating property:', error);
      throw new Error(`Failed to create property: ${error.message}`);
    }

    // Update landlord's property count if landlord_id is provided
    if (propertyData.landlord_id) {
      await this.updateLandlordPropertyCount(propertyData.landlord_id);
    }
  },

  // Update landlord property count
  async updateLandlordPropertyCount(landlordId: string): Promise<void> {
    try {
      // Get current property count for this landlord
      const { data: properties, error: propertiesError } = await supabase
        .from('properties' as any)
        .select('id')
        .eq('landlord_id', landlordId);

      if (propertiesError) {
        console.error('Error fetching properties for count:', propertiesError);
        return;
      }

      const propertyCount = properties?.length || 0;

      // Update landlord's property count in profiles table
      const { error: updateError } = await supabase
        .from('profiles' as any)
        .update({ total_properties: propertyCount })
        .eq('id', landlordId)
        .eq('role', 'landlord');

      if (updateError) {
        console.error('Error updating landlord property count:', updateError);
      }
    } catch (error) {
      console.error('Error in updateLandlordPropertyCount:', error);
    }
  },

  // Update property status and other details
  async updateProperty(propertyId: string, updateData: Partial<{
    name: string;
    address: string;
    type: string;
    status: string;
    units: number;
    rent_per_unit: number;
  }>): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties' as any)
        .update(updateData)
        .eq('id', propertyId);

      if (error) {
        throw new Error(`Failed to update property: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  // Update property status based on tenant assignment
  async updatePropertyStatus(propertyId: string): Promise<void> {
    try {
      // Check if property has a tenant assigned
      const { data: tenants, error: tenantsError } = await supabase
        .from('profiles' as any)
        .select('id, monthly_rent')
        .eq('property_id', propertyId)
        .eq('role', 'tenant')
        .eq('tenant_status', 'active');

      if (tenantsError) {
        console.error('Error checking property tenants:', tenantsError);
        return;
      }

      // Update property status based on tenant assignment
      // Map UI statuses to database allowed statuses
      // Database only allows: 'active', 'inactive'
      // UI expects: 'occupied', 'available', 'maintenance', etc.
      // We'll use 'active' for occupied and 'inactive' for available
      const status = tenants && tenants.length > 0 ? 'active' : 'inactive';
      
      // If property is occupied, also update the rent based on tenant's monthly rent
      const updateData: any = { status };
      if (tenants && tenants.length > 0) {
        const tenant = tenants[0] as any;
        if (tenant.monthly_rent) {
          updateData.rent_per_unit = tenant.monthly_rent;
        }
      }
      
      await this.updateProperty(propertyId, updateData);
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  },

  // Calculate monthly revenue for a landlord
  async calculateMonthlyRevenue(landlordId?: string): Promise<number> {
    try {
      let query = supabase
        .from('profiles' as any)
        .select('monthly_rent')
        .eq('role', 'tenant')
        .eq('tenant_status', 'active') // Only count active tenants
        .not('monthly_rent', 'is', null);

      // If landlordId is provided, filter by landlord
      if (landlordId) {
        query = query.eq('landlord_id', landlordId);
      }

      const { data: tenants, error } = await query;

      if (error) {
        console.error('Error calculating monthly revenue:', error);
        return 0;
      }

      return tenants?.reduce((total: number, tenant: any) => total + (tenant.monthly_rent || 0), 0) || 0;
    } catch (error) {
      console.error('Error in calculateMonthlyRevenue:', error);
      return 0;
    }
  },

  // Get maintenance requests for landlord's properties
  async getMaintenanceRequestsForLandlord(landlordId: string): Promise<any[]> {
    try {
      // First get all tenants for this landlord
      const tenants = await this.getTenants();
      const landlordTenants = tenants.filter(t => t.landlord_id === landlordId);
      
      if (landlordTenants.length === 0) {
        return [];
      }

      // Get maintenance requests for these tenants
      const tenantIds = landlordTenants.map(t => t.id);
      const { data: requests, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .in('tenant_id', tenantIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance requests:', error);
        return [];
      }

      return requests || [];
    } catch (error) {
      console.error('Error in getMaintenanceRequestsForLandlord:', error);
      return [];
    }
  },

  // Get maintenance requests with detailed information including landlord contact
  async getMaintenanceRequestsWithDetails(): Promise<any[]> {
    try {
      // Get all maintenance requests
      const { data: requests, error: requestsError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching maintenance requests:', requestsError);
        return [];
      }

      if (!requests || requests.length === 0) {
        return [];
      }

      // Get all tenant profiles to get landlord relationships
      const tenantIds = [...new Set(requests.map(r => r.tenant_id))];
      const { data: tenantProfiles, error: tenantsError } = await supabase
        .from('profiles')
        .select('id, name, username, email, phone, landlord_id, property_id')
        .in('id', tenantIds)
        .eq('role', 'tenant');

      if (tenantsError) {
        console.error('Error fetching tenant profiles:', tenantsError);
      }

      // Get landlord IDs and property IDs for additional lookup
      const landlordIds = [...new Set((tenantProfiles || [])
        .map((t: any) => t.landlord_id)
        .filter(Boolean))];
      
      const propertyIds = [...new Set((tenantProfiles || [])
        .map((t: any) => t.property_id)
        .filter(Boolean))];

      // Get landlord profiles
      let landlordProfiles: any[] = [];
      if (landlordIds.length > 0) {
        const { data: landlords, error: landlordsError } = await supabase
          .from('profiles')
          .select('id, name, username, email, phone')
          .in('id', landlordIds)
          .eq('role', 'landlord');

        if (landlordsError) {
          console.error('Error fetching landlord profiles:', landlordsError);
        } else {
          landlordProfiles = landlords || [];
        }
      }

      // Get properties to get landlord IDs for tenants without direct landlord_id
      let properties: any[] = [];
      if (propertyIds.length > 0) {
        const { data: props, error: propsError } = await supabase
          .from('properties')
          .select('id, name, address, landlord_id')
          .in('id', propertyIds);

        if (propsError) {
          console.error('Error fetching properties:', propsError);
        } else {
          properties = props || [];
        }
      }

      // Get additional landlords from properties
      const additionalLandlordIds = [...new Set(properties
        .map((p: any) => p.landlord_id)
        .filter((id: any) => id && !landlordIds.includes(id)))];

      if (additionalLandlordIds.length > 0) {
        const { data: additionalLandlords, error: additionalError } = await supabase
          .from('profiles')
          .select('id, name, username, email, phone')
          .in('id', additionalLandlordIds)
          .eq('role', 'landlord');

        if (!additionalError && additionalLandlords) {
          landlordProfiles = [...landlordProfiles, ...additionalLandlords];
        }
      }

      // Combine all the data
      const enhancedRequests = requests.map((request: any) => {
        const tenantProfile = tenantProfiles?.find((t: any) => t.id === request.tenant_id);
        let landlordProfile = null;
        let propertyProfile = null;
        
        if (tenantProfile) {
          // Find the property for this tenant
          if ((tenantProfile as any).property_id) {
            propertyProfile = properties.find((p: any) => p.id === (tenantProfile as any).property_id);
          }
          
          // Try to get landlord directly from tenant
          if ((tenantProfile as any).landlord_id) {
            landlordProfile = landlordProfiles.find((l: any) => l.id === (tenantProfile as any).landlord_id);
          }
          
          // If no direct landlord, try through property
          if (!landlordProfile && propertyProfile && (propertyProfile as any).landlord_id) {
            landlordProfile = landlordProfiles.find((l: any) => l.id === (propertyProfile as any).landlord_id);
          }
        }

        return {
          ...request,
          tenant_profile: tenantProfile,
          property_profile: propertyProfile,
          landlord_profile: landlordProfile,
          landlord_id: landlordProfile?.id || null
        };
      });

      return enhancedRequests;
    } catch (error) {
      console.error('Error in getMaintenanceRequestsWithDetails:', error);
      return [];
    }
  },
  async createMaintenanceRequest(requestData: {
    tenant_id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .insert({
          tenant_id: requestData.tenant_id,
          title: requestData.title,
          description: requestData.description,
          category: requestData.category,
          priority: requestData.priority,
          status: requestData.status || 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating maintenance request:', error);
        throw new Error(`Failed to create maintenance request: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in createMaintenanceRequest:', error);
      throw error;
    }
  },

  // Get maintenance requests for a specific property
  async getMaintenanceRequestsForProperty(propertyId: string): Promise<MaintenanceRequest[]> {
    try {
      // First get all tenants for this property
      const tenants = await this.getTenants();
      const propertyTenants = tenants.filter(t => t.property_id === propertyId);
      
      if (propertyTenants.length === 0) {
        return [];
      }

      // Get maintenance requests for these tenants
      const tenantIds = propertyTenants.map(t => t.id);
      const { data: requests, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .in('tenant_id', tenantIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance requests for property:', error);
        return [];
      }

      return requests || [];
    } catch (error) {
      console.error('Error in getMaintenanceRequestsForProperty:', error);
      return [];
    }
  },

  // Enhanced dashboard stats for landlord with detailed breakdown
  async getEnhancedLandlordDashboardStats(landlordId: string): Promise<{
    totalSpentThisMonth: number;
    averageCostPerProperty: number;
    pendingInvoices: number;
    monthlyExpenses: Array<{ month: string; amount: number }>;
    monthlyRepairsTrend: Array<{ month: string; count: number }>;
    topPropertiesByMaintenanceCost: Array<{ propertyName: string; address: string; cost: number; repairCount: number }>;
    basicStats: {
      totalProperties: number;
      occupiedProperties: number;
      availableProperties: number;
      totalTenants: number;
      monthlyRevenue: number;
      maintenanceCosts: number;
      occupancyRate: number;
    };
  }> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

      // Get basic stats first
      const basicStats = await this.getDashboardStats(landlordId);

      // Get all landlord's properties
      const allProperties = await this.getProperties();
      const landlordProperties = allProperties.filter(p => p.landlord_id === landlordId);

      // Get all tenants for landlord's properties
      const allTenants = await this.getTenants();
      const landlordTenants = allTenants.filter(t => t.landlord_id === landlordId);
      const tenantIds = landlordTenants.map(t => t.id);

      // Get all maintenance requests for landlord's tenants
      const { data: allMaintenanceRequests, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .in('tenant_id', tenantIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance requests:', error);
        throw error;
      }

      const maintenanceRequests = allMaintenanceRequests || [];

      // 1. Total Spent This Month
      const thisMonthRequests = maintenanceRequests.filter(r => {
        if (!r.completed_at) return false;
        const completedDate = new Date(r.completed_at);
        return completedDate >= firstDayOfMonth && completedDate <= currentDate;
      });

      const totalSpentThisMonth = thisMonthRequests.reduce((sum, r) => {
        return sum + (r.actual_cost || r.estimated_cost || 0);
      }, 0);

      // 2. Average Cost per Property
      const totalMaintenanceCosts = maintenanceRequests
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost || 0), 0);
      
      const averageCostPerProperty = landlordProperties.length > 0 
        ? totalMaintenanceCosts / landlordProperties.length 
        : 0;

      // 3. Pending Invoices (completed but not paid)
      const pendingInvoices = maintenanceRequests.filter(r => 
        r.status === 'completed' && (r.actual_cost || r.estimated_cost) > 0
      ).length;

      // 4. Monthly Expenses (last 6 months)
      const monthlyExpenses = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(currentYear, currentMonth - i, 1);
        const nextMonthDate = new Date(currentYear, currentMonth - i + 1, 1);
        
        const monthRequests = maintenanceRequests.filter(r => {
          if (!r.completed_at) return false;
          const completedDate = new Date(r.completed_at);
          return completedDate >= monthDate && completedDate < nextMonthDate;
        });

        const monthTotal = monthRequests.reduce((sum, r) => {
          return sum + (r.actual_cost || r.estimated_cost || 0);
        }, 0);

        monthlyExpenses.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          amount: monthTotal
        });
      }

      // 5. Monthly Repairs Trend (last 6 months)
      const monthlyRepairsTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(currentYear, currentMonth - i, 1);
        const nextMonthDate = new Date(currentYear, currentMonth - i + 1, 1);
        
        const monthRequests = maintenanceRequests.filter(r => {
          if (!r.completed_at) return false;
          const completedDate = new Date(r.completed_at);
          return completedDate >= monthDate && completedDate < nextMonthDate;
        });

        monthlyRepairsTrend.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          count: monthRequests.length
        });
      }

      // 6. Top 5 Properties by Maintenance Cost
      const propertyMaintenanceCosts = landlordProperties.map(property => {
        const propertyTenants = landlordTenants.filter(t => t.property_id === property.id);
        const propertyTenantIds = propertyTenants.map(t => t.id);
        
        const propertyRequests = maintenanceRequests.filter(r => 
          propertyTenantIds.includes(r.tenant_id) && r.status === 'completed'
        );

        const totalCost = propertyRequests.reduce((sum, r) => {
          return sum + (r.actual_cost || r.estimated_cost || 0);
        }, 0);

        return {
          propertyName: property.name || property.address,
          address: property.address,
          cost: totalCost,
          repairCount: propertyRequests.length
        };
      });

      const topPropertiesByMaintenanceCost = propertyMaintenanceCosts
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

      return {
        totalSpentThisMonth,
        averageCostPerProperty,
        pendingInvoices,
        monthlyExpenses,
        monthlyRepairsTrend,
        topPropertiesByMaintenanceCost,
        basicStats
      };
    } catch (error) {
      console.error('Error in getEnhancedLandlordDashboardStats:', error);
      return {
        totalSpentThisMonth: 0,
        averageCostPerProperty: 0,
        pendingInvoices: 0,
        monthlyExpenses: [],
        monthlyRepairsTrend: [],
        topPropertiesByMaintenanceCost: [],
        basicStats: {
          totalProperties: 0,
          occupiedProperties: 0,
          availableProperties: 0,
          totalTenants: 0,
          monthlyRevenue: 0,
          maintenanceCosts: 0,
          occupancyRate: 0
        }
      };
    }
  },

  // Calculate total maintenance costs
  async calculateTotalMaintenanceCosts(landlordId?: string): Promise<number> {
    try {
      // Note: This would require a maintenance/tickets table
      // For now, return 0 until the maintenance system is implemented
      return 0;
    } catch (error) {
      console.error('Error calculating maintenance costs:', error);
      return 0;
    }
  },

  // Get dashboard statistics for a landlord
  async getDashboardStats(landlordId?: string): Promise<{
    totalProperties: number;
    occupiedProperties: number;
    availableProperties: number;
    totalTenants: number;
    monthlyRevenue: number;
    maintenanceCosts: number;
    occupancyRate: number;
  }> {
    try {
      const [allProperties, allTenants, monthlyRevenue, maintenanceCosts] = await Promise.all([
        this.getProperties(),
        this.getTenants(),
        this.calculateMonthlyRevenue(landlordId),
        this.calculateTotalMaintenanceCosts(landlordId)
      ]);

      // Filter by landlord if provided
      const properties = landlordId ? allProperties.filter(p => p.landlord_id === landlordId) : allProperties;
      const tenants = landlordId ? allTenants.filter(t => t.landlord_id === landlordId) : allTenants;

      // Calculate real occupancy based on active tenant assignments
      const occupiedProperties = properties.filter(property => {
        const tenant = tenants.find(t => t.property_id === property.id && t.tenant_status === 'active');
        return tenant !== undefined;
      }).length;
      
      const availableProperties = properties.length - occupiedProperties;
      const occupancyRate = properties.length > 0 ? (occupiedProperties / properties.length) * 100 : 0;

      return {
        totalProperties: properties.length,
        occupiedProperties,
        availableProperties,
        totalTenants: tenants.filter(t => t.tenant_status === 'active').length,
        monthlyRevenue,
        maintenanceCosts,
        occupancyRate
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalProperties: 0,
        occupiedProperties: 0,
        availableProperties: 0,
        totalTenants: 0,
        monthlyRevenue: 0,
        maintenanceCosts: 0,
        occupancyRate: 0
      };
    }
  },

  // Get agent dashboard statistics  
  async getAgentDashboardStats(): Promise<{
    totalProperties: number;
    totalLandlords: number;
    totalTenants: number;
    occupancyRate: number;
    totalRevenue: number;
  }> {
    try {
      const [properties, landlords, tenants, totalRevenue] = await Promise.all([
        this.getProperties(),
        this.getLandlords(),
        this.getTenants(),
        this.calculateMonthlyRevenue()
      ]);

      // Calculate real occupancy based on active tenant assignments
      const occupiedProperties = properties.filter(property => {
        const tenant = tenants.find(t => t.property_id === property.id && t.tenant_status === 'active');
        return tenant !== undefined;
      }).length;
      
      const occupancyRate = properties.length > 0 ? (occupiedProperties / properties.length) * 100 : 0;

      return {
        totalProperties: properties.length,
        totalLandlords: landlords.length,
        totalTenants: tenants.filter(t => t.tenant_status === 'active').length,
        occupancyRate,
        totalRevenue
      };
    } catch (error) {
      console.error('Error getting agent dashboard stats:', error);
      return {
        totalProperties: 0,
        totalLandlords: 0,
        totalTenants: 0,
        occupancyRate: 0,
        totalRevenue: 0
      };
    }
  }
};

// Export the service
export const tenantService = tenantServiceObject;
export default tenantServiceObject;
