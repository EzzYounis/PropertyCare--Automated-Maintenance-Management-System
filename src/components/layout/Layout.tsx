import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from './Header';
import { TenantSidebar } from './tenant/TenantSidebar';
import { AgentSidebar } from './agent/AgentSidebar';
import { LandlordSidebar } from './landlord/LandlordSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  const renderSidebar = () => {
    switch (profile.role) {
      case 'tenant':
        return <TenantSidebar />;
      case 'agent':
        return <AgentSidebar />;
      case 'landlord':
        return <LandlordSidebar />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {renderSidebar()}
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};