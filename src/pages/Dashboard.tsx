import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TenantDashboard } from '@/components/dashboard/tenant/TenantDashboard';
import { AgentDashboard } from '@/components/dashboard/agent/AgentDashboard';
import { LandlordDashboard } from '@/components/dashboard/landlord/LandlordDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderDashboard = () => {
    switch (user.role) {
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