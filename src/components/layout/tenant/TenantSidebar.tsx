import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Wrench, 
  CreditCard, 
  MessageSquare, 
  FileText,
  Calendar,
  Settings,
  Building2
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
  { title: 'Maintenance', url: '/maintenance', icon: Wrench },
  { title: 'Payments', url: '/payments', icon: CreditCard },
  { title: 'Messages', url: '/messages', icon: MessageSquare },
];

export const TenantSidebar = () => {
  const { open } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-tenant-secondary text-tenant border-l-4 border-tenant' : 'hover:bg-tenant-secondary/50 text-muted-foreground hover:text-tenant';

  return (
    <Sidebar className={open ? 'w-64' : 'w-14'} collapsible="icon">
      <SidebarContent className="bg-background border-r">
        {/* Logo/Brand */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-tenant rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div>
                <h2 className="font-bold text-lg text-tenant">PropertyHub</h2>
                <p className="text-xs text-muted-foreground">Tenant Portal</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-tenant font-semibold">
            {open && 'Main Menu'}
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
              <div className="text-xs text-muted-foreground">Quick Stats</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Open Issues</span>
                  <span className="text-tenant font-semibold">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Next Payment</span>
                  <span className="text-tenant font-semibold">Jan 1</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};