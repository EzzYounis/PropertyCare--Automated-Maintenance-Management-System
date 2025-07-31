import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Building, 
  DollarSign, 
  Wrench, 
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Eye
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const LandlordDashboard = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [tickets, setTickets] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [enhancedStats, setEnhancedStats] = useState({
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
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProperties = async () => {
    if (!profile?.id) return;
    
    try {
      // Import tenantService dynamically to avoid circular import
      const { tenantService } = await import('@/lib/tenantService');
      const allProperties = await tenantService.getProperties();
      // Filter properties by landlord
      const propertiesData = allProperties.filter(p => p.landlord_id === profile.id);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchEnhancedDashboardStats = async () => {
    if (!profile?.id) return;
    
    try {
      // Import tenantService dynamically to avoid circular import
      const { tenantService } = await import('@/lib/tenantService');
      const stats = await tenantService.getEnhancedLandlordDashboardStats(profile.id);
      setEnhancedStats(stats);
    } catch (error) {
      console.error('Error fetching enhanced dashboard stats:', error);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const { data: requests, error: requestsError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (requests && requests.length > 0) {
        const tenantIds = [...new Set(requests.map(r => r.tenant_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, username')
          .in('id', tenantIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        const requestsWithProfiles = requests.map(request => ({
          ...request,
          tenant_profile: profiles?.find(p => p.id === request.tenant_id) || null
        }));

        setTickets(requestsWithProfiles);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      setTickets([]);
    }
  };

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('name');

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setWorkers([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchMaintenanceRequests(),
          fetchWorkers(),
          fetchProperties(),
          fetchEnhancedDashboardStats()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (profile?.id) {
      fetchData();
    }
  }, [profile?.id]);

  const getInvoiceTickets = () => {
    return tickets.filter(ticket => 
      ticket.status === 'completed' && 
      (ticket.actual_cost || ticket.estimated_cost)
    );
  };

  const getInvoiceStatus = (ticket: any) => {
    // Since invoices are based on completed maintenance requests,
    // we'll determine status based on payment and processing state
    const daysSinceCompletion = ticket.completed_at 
      ? Math.floor((new Date().getTime() - new Date(ticket.completed_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSinceCompletion <= 7) {
      return { status: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    } else if (daysSinceCompletion <= 30) {
      return { status: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else {
      return { status: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200' };
    }
  };

  const renderInvoiceTable = () => {
    const invoiceTickets = getInvoiceTickets();

    if (invoiceTickets.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Invoices Available</h3>
          <p className="text-muted-foreground">
            Completed maintenance requests will appear here for invoicing
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Completed Date</TableHead>
            <TableHead>Worker</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoiceTickets.map((ticket) => {
            const invoiceStatus = getInvoiceStatus(ticket);
            return (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">
                  INV-{ticket.id?.slice(-8) || '12345678'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={invoiceStatus.color}>
                    {invoiceStatus.label}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.tenant_profile?.name || 'Unknown'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ticket.category}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                <TableCell>
                  {ticket.completed_at ? new Date(ticket.completed_at).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {ticket.assigned_worker_id ? 
                    workers.find(w => w.id === ticket.assigned_worker_id)?.name || 'Unknown Worker'
                    : 'Unassigned'
                  }
                </TableCell>
                <TableCell>
                  <p className="text-sm font-bold text-green-600">
                    ${ticket.actual_cost ? ticket.actual_cost.toFixed(2) : (ticket.estimated_cost || 0).toFixed(2)}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Invoice Details",
                          description: `Viewing invoice INV-${ticket.id?.slice(-8) || '12345678'}`,
                        });
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground">Monitor your property portfolio and maintenance operations</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-l-4 border-landlord">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-landlord" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-landlord">{enhancedStats.basicStats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {enhancedStats.basicStats.occupiedProperties} occupied • {enhancedStats.basicStats.availableProperties} available
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <Wrench className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{tickets.filter(t => t.status !== 'completed').length}</div>
            <p className="text-xs text-muted-foreground">Maintenance requests</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${enhancedStats.basicStats.monthlyRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">From {enhancedStats.basicStats.totalTenants} active tenants</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-error">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Costs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">
              ${enhancedStats.totalSpentThisMonth.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Maintenance costs</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {tickets.filter(t => {
                if (!t.completed_at) return false;
                const completedDate = new Date(t.completed_at);
                const now = new Date();
                return completedDate.getMonth() === now.getMonth() && 
                       completedDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Maintenance completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Top Stats Cards - Like the image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Cost per Property */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Cost per Property</p>
                      <div className="text-2xl font-bold">${enhancedStats.averageCostPerProperty.toFixed(0)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      ↘ 5% from last month
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Invoices */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Invoices</p>
                      <div className="text-2xl font-bold">{enhancedStats.pendingInvoices}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      ${(enhancedStats.pendingInvoices * enhancedStats.averageCostPerProperty).toFixed(0)} total
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>Overview of maintenance costs over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 relative">
                  {enhancedStats.monthlyExpenses.length > 0 ? (
                    <div className="h-full flex items-end justify-between gap-2 px-4 pb-8">
                      {enhancedStats.monthlyExpenses.map((expense, index) => {
                        const maxExpense = Math.max(...enhancedStats.monthlyExpenses.map(e => e.amount));
                        const heightPixels = maxExpense > 0 ? (expense.amount / maxExpense) * 240 : 4;
                        return (
                          <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
                            <div className="text-xs text-muted-foreground mb-2 h-6 flex items-center">
                              ${expense.amount.toFixed(0)}
                            </div>
                            <div 
                              className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                              style={{ 
                                height: `${Math.max(heightPixels, 4)}px`,
                                maxWidth: '60px'
                              }}
                            />
                            <div className="text-xs text-muted-foreground mt-2 h-6 flex items-center">
                              {expense.month}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No expense data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Repairs Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Repairs Trend</CardTitle>
                <CardDescription>Number of repairs completed each month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 relative">
                  {enhancedStats.monthlyRepairsTrend.length > 0 ? (
                    <div className="h-full flex">
                      {/* Y-axis labels */}
                      <div className="w-12 h-full flex flex-col justify-between py-4 pr-2">
                        {(() => {
                          const maxCount = Math.max(...enhancedStats.monthlyRepairsTrend.map(r => r.count), 1);
                          const steps = 5;
                          const stepSize = Math.ceil(maxCount / steps);
                          return Array.from({ length: steps + 1 }, (_, i) => {
                            const value = stepSize * (steps - i);
                            return (
                              <div key={i} className="text-xs text-muted-foreground text-right leading-none">
                                {value}
                              </div>
                            );
                          });
                        })()}
                      </div>
                      
                      {/* Chart area */}
                      <div className="flex-1 relative">
                        <svg width="100%" height="100%" viewBox="0 0 300 200" className="overflow-visible">
                          <defs>
                            <linearGradient id="repairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                          
                          {/* Grid lines */}
                          {(() => {
                            const steps = 5;
                            return Array.from({ length: steps + 1 }, (_, i) => {
                              const y = (i / steps) * 180 + 10;
                              return (
                                <line
                                  key={i}
                                  x1="0"
                                  y1={y}
                                  x2="300"
                                  y2={y}
                                  stroke="#e5e7eb"
                                  strokeWidth="0.5"
                                  opacity="0.5"
                                />
                              );
                            });
                          })()}
                          
                          {enhancedStats.monthlyRepairsTrend.length > 1 && (
                            <>
                              {/* Area fill */}
                              <path
                                d={`M 0 190 ${enhancedStats.monthlyRepairsTrend.map((repair, index) => {
                                  const x = (index / Math.max(enhancedStats.monthlyRepairsTrend.length - 1, 1)) * 300;
                                  const maxCount = Math.max(...enhancedStats.monthlyRepairsTrend.map(r => r.count), 1);
                                  const y = 190 - (repair.count / maxCount) * 180;
                                  return `L ${x} ${y}`;
                                }).join(' ')} L 300 190 Z`}
                                fill="url(#repairGradient)"
                              />
                              {/* Line */}
                              <path
                                d={`M ${enhancedStats.monthlyRepairsTrend.map((repair, index) => {
                                  const x = (index / Math.max(enhancedStats.monthlyRepairsTrend.length - 1, 1)) * 300;
                                  const maxCount = Math.max(...enhancedStats.monthlyRepairsTrend.map(r => r.count), 1);
                                  const y = 190 - (repair.count / maxCount) * 180;
                                  return `${index === 0 ? '' : 'L '}${x} ${y}`;
                                }).join(' ')}`}
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                              {/* Points */}
                              {enhancedStats.monthlyRepairsTrend.map((repair, index) => {
                                const x = (index / Math.max(enhancedStats.monthlyRepairsTrend.length - 1, 1)) * 300;
                                const maxCount = Math.max(...enhancedStats.monthlyRepairsTrend.map(r => r.count), 1);
                                const y = 190 - (repair.count / maxCount) * 180;
                                return (
                                  <g key={index}>
                                    <circle
                                      cx={x}
                                      cy={y}
                                      r="4"
                                      fill="#8b5cf6"
                                      stroke="white"
                                      strokeWidth="2"
                                    />
                                    {/* Value labels on hover */}
                                    <text
                                      x={x}
                                      y={y - 10}
                                      textAnchor="middle"
                                      className="text-xs fill-gray-600"
                                      fontSize="10"
                                    >
                                      {repair.count}
                                    </text>
                                  </g>
                                );
                              })}
                            </>
                          )}
                        </svg>
                        
                        {/* X-axis labels */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
                          {enhancedStats.monthlyRepairsTrend.map((repair, index) => (
                            <span key={index} className="text-center">{repair.month}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No repair data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Properties by Maintenance Cost */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Top 5 Properties by Maintenance Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancedStats.topPropertiesByMaintenanceCost.length > 0 ? (
                  enhancedStats.topPropertiesByMaintenanceCost.map((property, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-sm font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{property.propertyName}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <span>•</span>
                            <span>{property.repairCount} repair{property.repairCount !== 1 ? 's' : ''} this month</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          index === 0 ? 'text-red-600' : 
                          index === 1 ? 'text-orange-600' : 
                          index === 2 ? 'text-yellow-600' : 
                          index === 3 ? 'text-green-600' : 
                          'text-gray-600'
                        }`}>
                          ${property.cost.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No maintenance costs recorded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-landlord" />
                Portfolio Summary
              </CardTitle>
              <CardDescription>Overview of your property portfolio performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-landlord">{enhancedStats.basicStats.totalProperties}</div>
                  <p className="text-xs text-muted-foreground">Total Properties</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{enhancedStats.basicStats.occupiedProperties}</div>
                  <p className="text-xs text-muted-foreground">Occupied</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{enhancedStats.basicStats.availableProperties}</div>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">${enhancedStats.basicStats.monthlyRevenue.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Occupancy Rate</span>
                  <span className="font-medium">{enhancedStats.basicStats.occupancyRate.toFixed(0)}%</span>
                </div>
                <Progress value={enhancedStats.basicStats.occupancyRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {enhancedStats.basicStats.occupiedProperties} of {enhancedStats.basicStats.totalProperties} properties occupied
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Maintenance Invoices
              </CardTitle>
              <CardDescription>
                Generate and manage invoices for completed maintenance requests
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderInvoiceTable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};