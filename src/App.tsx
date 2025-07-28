import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Import page components
import { TenantMaintenance } from "@/components/pages/tenant/TenantMaintenance";
import { TenantPayments } from "@/components/pages/tenant/TenantPayments";
import { TenantMessages } from "@/components/pages/tenant/TenantMessages";
import { AgentTickets } from "@/components/pages/agent/AgentTickets";
import { AgentWorkers } from "@/components/pages/agent/AgentWorkers";
import { AgentTenants } from "@/components/pages/agent/AgentTenants";
import { AgentLandlords } from "@/components/pages/agent/AgentLandlords";
import { AgentMessages } from "@/components/pages/agent/AgentMessages";
import { AgentInvoices } from "@/components/pages/agent/AgentInvoices";
import { LandlordMaintenance } from "@/components/pages/landlord/LandlordMaintenance";
import { PropertyDetail } from "@/components/pages/landlord/PropertyDetail";
import { Properties } from "@/components/pages/Properties";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
      />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <Layout>
              <TenantMaintenance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/landlord-maintenance"
        element={
          <ProtectedRoute>
            <Layout>
              <LandlordMaintenance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <Layout>
              <AgentTickets />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workers"
        element={
          <ProtectedRoute>
            <Layout>
              <AgentWorkers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent-tenants"
        element={
          <ProtectedRoute>
            <Layout>
              <AgentTenants />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent-landlords"
        element={
          <ProtectedRoute>
            <Layout>
              <AgentLandlords />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Layout>
              <TenantPayments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Layout>
              <AgentMessages />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Layout>
              <AgentInvoices />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <ProtectedRoute>
            <Layout>
              <Properties />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/property/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <PropertyDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Analytics</h2>
                <p className="text-muted-foreground">Feature coming soon...</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <p className="text-muted-foreground">Feature coming soon...</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
