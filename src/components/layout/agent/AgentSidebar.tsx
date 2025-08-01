import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Ticket, 
  Users, 
  Calculator, 
  MessageSquare, 
  FileText,
  Calendar,
  Settings,
  Wrench,
  Crown,
  UserPlus,
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Workers', url: '/workers', icon: Users },
  { title: 'Tenants', url: '/agent-tenants', icon: UserPlus },
  { title: 'Landlords', url: '/agent-landlords', icon: Crown },
  { title: 'Properties', url: '/agent-properties', icon: Building2 },
  { title: 'Messages', url: '/messages', icon: MessageSquare },
  { title: 'Invoices', url: '/invoices', icon: FileText },
];

export const AgentSidebar = () => {
  const { open } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const [ticketStats, setTicketStats] = useState({
    urgentTickets: 0,
    myTickets: 0
  });

  useEffect(() => {
    const fetchTicketStats = async () => {
      try {
        if (!user) return;

        const { data: tickets, error } = await supabase
          .from('maintenance_requests')
          .select('*');

        if (error) {
          console.error('Error fetching tickets:', error);
          return;
        }

        const urgentTickets = tickets?.filter(t => t.priority === 'urgent').length || 0;
        const myTickets = tickets?.filter(t => t.assigned_worker_id === user.id).length || 0;

        setTicketStats({
          urgentTickets,
          myTickets
        });
      } catch (error) {
        console.error('Error fetching ticket stats:', error);
      }
    };

    fetchTicketStats();
  }, [user]);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-agent-secondary text-agent border-l-4 border-agent' : 'hover:bg-agent-secondary/50 text-muted-foreground hover:text-agent';

  return (
    <Sidebar className={open ? 'w-64' : 'w-14'} collapsible="icon">
      <SidebarContent className="bg-background border-r">
        {/* Logo/Brand */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-agent rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div>
                <h2 className="font-bold text-lg text-agent">Maintenance</h2>
                <p className="text-xs text-muted-foreground">Agent Portal</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-agent font-semibold">
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
              <div className="text-xs text-muted-foreground">Today</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Urgent Tickets</span>
                  <span className="text-error font-semibold">{ticketStats.urgentTickets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>My Tickets</span>
                  <span className="text-agent font-semibold">{ticketStats.myTickets}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};