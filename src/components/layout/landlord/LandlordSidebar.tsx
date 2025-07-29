import { NavLink, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Home, 
  Building, 
  Wrench, 
  MessageSquare, 
  Crown
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Properties', url: '/properties', icon: Building },
  { title: 'Maintenance', url: '/landlord-maintenance', icon: Wrench },
  { title: 'Messages', url: '/messages', icon: MessageSquare },
];

export const LandlordSidebar = () => {
  const { open } = useSidebar();
  const { profile } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({ properties: 0, openRequests: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.id) return;
      
      try {
        // Import tenantService dynamically to avoid circular import
        const { tenantService } = await import('@/lib/tenantService');
        
        // Fetch properties count
        const allProperties = await tenantService.getProperties();
        const propertiesData = allProperties.filter(p => p.landlord_id === profile.id);
        
        // Fetch open maintenance requests for this landlord's properties
        if (propertiesData.length > 0) {
          const { data: tenants } = await supabase
            .from('tenants')
            .select('id')
            .eq('landlord_id', profile.id);
          
          if (tenants && tenants.length > 0) {
            const tenantIds = tenants.map(t => t.id);
            const { data: requests } = await supabase
              .from('maintenance_requests')
              .select('id')
              .in('tenant_id', tenantIds)
              .neq('status', 'completed');
            
            setStats({
              properties: propertiesData.length,
              openRequests: requests?.length || 0
            });
          } else {
            setStats({
              properties: propertiesData.length,
              openRequests: 0
            });
          }
        } else {
          setStats({ properties: 0, openRequests: 0 });
        }
      } catch (error) {
        console.error('Error fetching sidebar stats:', error);
      }
    };

    fetchStats();
  }, [profile?.id]);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-landlord-secondary text-landlord border-l-4 border-landlord' : 'hover:bg-landlord-secondary/50 text-muted-foreground hover:text-landlord';

  return (
    <Sidebar className={open ? 'w-64' : 'w-14'} collapsible="icon">
      <SidebarContent className="bg-background border-r">
        {/* Logo/Brand */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-landlord rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div>
                <h2 className="font-bold text-lg text-landlord">PropertyCare</h2>
                <p className="text-xs text-muted-foreground">Landlord Portal</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-landlord font-semibold">
            {open && 'Management'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={`h-5 w-5 ${!open ? 'mx-auto' : 'mr-3'}`} />
                      {open && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats */}
        {open && (
          <div className="mt-auto p-4 border-t">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Portfolio</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Properties</span>
                  <span className="text-landlord font-semibold">{stats.properties}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Open Requests</span>
                  <span className="text-warning font-semibold">{stats.openRequests}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};