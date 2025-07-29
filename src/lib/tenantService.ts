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
  created_at: string;
  updated_at: string;
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
}

const tenantServiceObject = {
  // Get all tenants
  async getTenants(): Promise<TenantProfile[]> {
    try {
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
        return [];
      }

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
        const { data: existingTenant, error: checkError } = await supabase
          .from('profiles' as any)
          .select('id, name')
          .eq('property_id', tenantData.property_id)
          .eq('role', 'tenant')
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error checking existing tenant:', checkError);
        }

        if (existingTenant) {
          throw new Error(`Property is already occupied by another tenant: ${(existingTenant as any).name}`);
        }
      }

      // First create the user in Supabase Auth
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

      // Insert into profiles table with all tenant data
      const { error: profileError } = await supabase
        .from('profiles' as any)
        .insert({
          id: authData.user.id,
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
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Failed to create tenant profile: ${profileError.message}`);
      }

      // Update property status if tenant was assigned to a property
      if (tenantData.property_id) {
        await this.updatePropertyStatus(tenantData.property_id);
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  },

  // Update tenant
  async updateTenant(tenantId: string, updateData: Partial<CreateTenantData>): Promise<void> {
    try {
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
        }
      } catch (err) {
        // If we can't get current tenant data, continue without property status updates
        console.warn('Could not get current tenant property assignment:', err);
      }
      const newPropertyId = updateData.property_id;

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

      // Update profiles table with all tenant data
      const { error: profileError } = await supabase
        .from('profiles' as any)
        .update({
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
        })
        .eq('id', tenantId);

      if (profileError) {
        throw new Error(`Failed to update tenant profile: ${profileError.message}`);
      }

      // Update property statuses if property assignment changed
      if (oldPropertyId !== newPropertyId) {
        // Update old property status (if tenant was unassigned from it)
        if (oldPropertyId) {
          await this.updatePropertyStatus(oldPropertyId);
        }
        
        // Update new property status (if tenant was assigned to it)
        if (newPropertyId) {
          await this.updatePropertyStatus(newPropertyId);
        }
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  },

  // Delete tenant
  async deleteTenant(tenantId: string): Promise<void> {
    try {
      // Get the tenant's property assignment before deletion
      let propertyId: string | null = null;
      try {
        const { data: tenant, error: getTenantError } = await supabase
          .from('profiles' as any)
          .select('property_id')
          .eq('id', tenantId)
          .eq('role', 'tenant')
          .single();

        if (!getTenantError && tenant) {
          propertyId = (tenant as any).property_id;
        }
      } catch (err) {
        console.warn('Could not get tenant property assignment before deletion:', err);
      }

      // Delete from profiles table (contains all tenant data)
      const { error } = await supabase
        .from('profiles' as any)
        .delete()
        .eq('id', tenantId);

      if (error) {
        throw new Error(`Failed to delete tenant: ${error.message}`);
      }

      // Update property status if tenant was assigned to a property
      if (propertyId) {
        await this.updatePropertyStatus(propertyId);
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
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
      // First create the user in Supabase Auth
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

      // Insert into profiles table with all landlord data
      const { error: profileError } = await supabase
        .from('profiles' as any)
        .insert({
          id: authData.user.id,
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
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Failed to create landlord profile: ${profileError.message}`);
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
        status: propertyData.status || 'active'
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
        .select('id')
        .eq('property_id', propertyId)
        .eq('role', 'tenant');

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
      
      await this.updateProperty(propertyId, { status });
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

  // Create a maintenance request (for testing)
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

      const occupiedProperties = properties.filter(p => p.status === 'active').length; // 'active' means occupied
      const availableProperties = properties.filter(p => p.status === 'inactive').length; // 'inactive' means available
      const occupancyRate = properties.length > 0 ? (occupiedProperties / properties.length) * 100 : 0;

      return {
        totalProperties: properties.length,
        occupiedProperties,
        availableProperties,
        totalTenants: tenants.length,
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

      const occupiedProperties = properties.filter(p => p.status === 'active').length; // 'active' means occupied in database
      const occupancyRate = properties.length > 0 ? (occupiedProperties / properties.length) * 100 : 0;

      return {
        totalProperties: properties.length,
        totalLandlords: landlords.length,
        totalTenants: tenants.length,
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
