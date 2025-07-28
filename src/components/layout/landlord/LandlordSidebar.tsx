import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building, 
  Wrench, 
  DollarSign, 
  MessageSquare, 
  BarChart3,
  Users,
  Settings,
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
  { title: 'Finance', url: '/finance', icon: DollarSign },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Tenants', url: '/tenants', icon: Users },
  { title: 'Messages', url: '/messages', icon: MessageSquare },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export const LandlordSidebar = () => {
  const { open } = useSidebar();
  const location = useLocation();

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
                  <span className="text-landlord font-semibold">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Open Requests</span>
                  <span className="text-warning font-semibold">5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};