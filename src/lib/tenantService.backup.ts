import { supabase } from '@/integrations/supabase/client';

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

export interface CreateTenantData {
  name: string;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  address?: string;
  landlord_id?: string;
  lease_start?: string;
  lease_end?: string;
  monthly_rent?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
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

export const tenantService = {
  async getTenants(): Promise<TenantProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'tenant')
      .order('name');
    
    if (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
    return data || [];
  },

  async getLandlords(): Promise<LandlordProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'landlord')
      .order('name');
    
    if (error) {
      console.error('Error fetching landlords:', error);
      throw error;
    }
    return data || [];
  },

  async createTenant(tenantData: CreateTenantData): Promise<void> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${tenantData.username}@propertycare.app`,
      password: tenantData.password,
      options: {
        data: {
          username: tenantData.username,
          role: 'tenant',
          name: tenantData.name
        }
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        username: tenantData.username,
        name: tenantData.name,
        role: 'tenant',
        email: tenantData.email,
        phone: tenantData.phone,
        address: tenantData.address,
        landlord_id: tenantData.landlord_id,
        lease_start: tenantData.lease_start,
        lease_end: tenantData.lease_end,
        monthly_rent: tenantData.monthly_rent,
        emergency_contact_name: tenantData.emergency_contact_name,
        emergency_contact_phone: tenantData.emergency_contact_phone,
        tenant_status: 'active',
        status: 'active'
      });

    if (profileError) {
      console.error('Error creating tenant profile:', profileError);
      throw profileError;
    }
  },

  async updateTenant(id: string, tenantData: Partial<TenantProfile>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(tenantData)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  },

  async deleteTenant(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }
};
