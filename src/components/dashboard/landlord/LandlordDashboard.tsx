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
  Eye,
  Droplets,
  Zap,
  Thermometer,
  Settings,
  Bug,
  Key,
  Paintbrush,
  Grid3X3,
  DoorOpen,
  TreePine
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Issue categories mapping to match database
const issueCategories = {
  'Plumbing': { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-100' },
  'Electrical': { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  'HVAC': { icon: Thermometer, color: 'text-green-500', bg: 'bg-green-100' },
  'Appliances': { icon: Settings, color: 'text-purple-500', bg: 'bg-purple-100' },
  'Pest Control': { icon: Bug, color: 'text-red-500', bg: 'bg-red-100' },
  'Locks/Security': { icon: Key, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  'Painting/Walls': { icon: Paintbrush, color: 'text-orange-500', bg: 'bg-orange-100' },
  'Flooring': { icon: Grid3X3, color: 'text-amber-500', bg: 'bg-amber-100' },
  'Windows/Doors': { icon: DoorOpen, color: 'text-cyan-500', bg: 'bg-cyan-100' },
  'Landscaping': { icon: TreePine, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  'Other': { icon: Wrench, color: 'text-gray-500', bg: 'bg-gray-100' }
};

export const LandlordDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tickets, setTickets] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchMaintenanceRequests(),
          fetchWorkers()
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

    fetchData();
  }, []);

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
    }
  };

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase.from('workers').select('*');
      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const getInvoiceTickets = () => tickets.filter(ticket => 
    ticket.status === 'completed' && ticket.actual_cost && ticket.actual_cost > 0
  );

  const renderInvoiceTable = () => {
    const invoiceTickets = getInvoiceTickets();
    
    if (invoiceTickets.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No completed tickets with costs available for invoicing</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Completed Date</TableHead>
            <TableHead>Worker</TableHead>
            <TableHead>Estimated Cost</TableHead>
            <TableHead>Actual Cost</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoiceTickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <p className="font-medium text-sm">INV-{ticket.id?.slice(-8) || '12345678'}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm">{ticket.property_address || 'Property Address Not Available'}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium">{ticket.tenant_profile?.name || 'Unknown'}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${issueCategories[ticket.category]?.bg || 'bg-muted'}`}>
                    {React.createElement(issueCategories[ticket.category]?.icon || Wrench, {
                      className: `h-4 w-4 ${issueCategories[ticket.category]?.color || 'text-muted-foreground'}`
                    })}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{ticket.category}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm">
                  {ticket.completed_at 
                    ? new Date(ticket.completed_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-sm">
                  {ticket.assigned_worker_id
                    ? workers.find(w => w.id === ticket.assigned_worker_id)?.name || 'Unknown Worker'
                    : 'Unassigned'}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium">
                  £{ticket.estimated_cost ? ticket.estimated_cost.toFixed(2) : '0.00'}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-sm font-bold text-green-600">
                  £{ticket.actual_cost ? ticket.actual_cost.toFixed(2) : '0.00'}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // Could open a detailed invoice view here
                      toast({
                        title: "Invoice Details",
                        description: `Viewing invoice INV-${ticket.id?.slice(-8) || '12345678'}`,
                      });
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="default"
                    className="bg-landlord hover:bg-landlord/90 text-white"
                    onClick={() => {
                      // Generate and download invoice
                      const invoiceData = {
                        invoiceNumber: `INV-${ticket.id?.slice(-8) || '12345678'}`,
                        tenant: ticket.tenant_profile?.name || 'Unknown',
                        property: ticket.property_address || 'Property Address Not Available',
                        completedDate: ticket.completed_at ? new Date(ticket.completed_at).toLocaleDateString() : 'N/A',
                        worker: ticket.assigned_worker_id ? workers.find(w => w.id === ticket.assigned_worker_id)?.name || 'Unknown Worker' : 'Unassigned',
                        category: ticket.category,
                        title: ticket.title,
                        estimatedCost: ticket.estimated_cost || 0,
                        actualCost: ticket.actual_cost || 0
                      };
                      
                      const invoiceContent = `
PROPERTY MAINTENANCE INVOICE

Invoice Number: ${invoiceData.invoiceNumber}
Date: ${new Date().toLocaleDateString()}

Property Owner: Ezzaldeen
Tenant: ${invoiceData.tenant}
Property Address: ${invoiceData.property}

Work Completed:
Category: ${invoiceData.category}
Description: ${invoiceData.title}
Completed Date: ${invoiceData.completedDate}
Worker: ${invoiceData.worker}

Cost Summary:
Estimated Cost: £${invoiceData.estimatedCost.toFixed(2)}
Actual Cost: £${invoiceData.actualCost.toFixed(2)}

Total Amount Due: £${invoiceData.actualCost.toFixed(2)}

Payment Terms: Net 30 days
                      `;
                      
                      const element = document.createElement('a');
                      const file = new Blob([invoiceContent], { type: 'text/plain' });
                      element.href = URL.createObjectURL(file);
                      element.download = `${invoiceData.invoiceNumber}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                      
                      toast({
                        title: "Invoice Downloaded",
                        description: `Invoice ${invoiceData.invoiceNumber} has been generated and downloaded.`,
                      });
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
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
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Ezzaldeen!</h1>
          <p className="text-muted-foreground">Monitor your property portfolio and maintenance operations</p>
        </div>
        <Button className="bg-gradient-landlord hover:opacity-90 text-white border-0">
          <BarChart3 className="w-4 h-4 mr-2" />
          View Analytics
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-l-4 border-landlord">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-landlord" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-landlord">12</div>
            <p className="text-xs text-muted-foreground">Across 3 locations</p>
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
            <div className="text-2xl font-bold text-success">$22,200</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-error">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Costs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">
              £{getInvoiceTickets().reduce((sum, ticket) => sum + (ticket.actual_cost || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total completed costs</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{getInvoiceTickets().length}</div>
            <p className="text-xs text-muted-foreground">Ready for billing</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Approvals */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-landlord" />
                  Pending Approvals
                </CardTitle>
                <CardDescription>Maintenance requests requiring your approval</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-error" />
                      </div>
                      <div>
                        <p className="font-medium">HVAC System Replacement</p>
                        <p className="text-sm text-muted-foreground">123 Maple Street, Unit 4B • Est. Cost: $3,200</p>
                        <p className="text-xs text-muted-foreground">Submitted by Murat • 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Urgent</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="text-error border-error">Deny</Button>
                        <Button size="sm" className="bg-landlord hover:bg-landlord/90">Approve</Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium">Kitchen Cabinet Repair</p>
                        <p className="text-sm text-muted-foreground">456 Oak Avenue • Est. Cost: $850</p>
                        <p className="text-xs text-muted-foreground">Submitted by Murat • 1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Medium</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">Deny</Button>
                        <Button size="sm" className="bg-landlord hover:bg-landlord/90">Approve</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-landlord" />
                  Portfolio Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Occupancy Rate</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">11 of 12 units occupied</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Maintenance Budget</span>
                    <span className="font-medium">68% used</span>
                  </div>
                  <Progress value={68} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">$6,800 of $10,000</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Properties by Status</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Excellent</span>
                      <span className="text-success font-semibold">7</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Good</span>
                      <span className="text-info font-semibold">3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Needs Attention</span>
                      <span className="text-warning font-semibold">2</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-landlord" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates across your property portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Plumbing repair completed at 789 Pine Street</p>
                      <p className="text-sm text-muted-foreground">Cost: $420 • Completed by John Smith • 2 hours ago</p>
                    </div>
                  </div>
                  <Badge className="bg-success text-white">Completed</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <p className="font-medium">Rent payment received from Unit 3A</p>
                      <p className="text-sm text-muted-foreground">Amount: $1,850 • 456 Oak Avenue • 1 day ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">Payment</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">New tenant application for Unit 1C</p>
                      <p className="text-sm text-muted-foreground">123 Maple Street • Background check pending • 2 days ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Application</Badge>
                </div>
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