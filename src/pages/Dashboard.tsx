import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TenantDashboard } from '@/components/dashboard/tenant/TenantDashboard';
import { AgentDashboard } from '@/components/dashboard/agent/AgentDashboard';
import { LandlordDashboard } from '@/components/dashboard/landlord/LandlordDashboard';

const Dashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  const renderDashboard = () => {
    switch (profile.role) {
      case 'tenant':
        return <TenantDashboard />;
      case 'agent':
        return <AgentDashboard />;
      case 'landlord':
        return <LandlordDashboard />;
      default:
        return <div>Unknown user role</div>;
    }
  };

  return renderDashboard();
};

export default Dashboard;