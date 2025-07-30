import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Phone,
  Mail,
  Building,
  Wrench,
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAllWorkers } from '@/data/workers';
import { tenantService } from '@/lib/tenantService';

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

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return <Badge className="bg-green-100 text-green-700 border-green-200">✓ Paid</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">⏳ Pending</Badge>;
    case 'overdue':
      return <Badge className="bg-red-100 text-red-700 border-red-200">⚠ Overdue</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return <Badge variant="outline" className="bg-red-500 text-white border-red-500">Urgent</Badge>;
    case 'high':
      return <Badge variant="outline" className="bg-orange-500 text-white border-orange-500">High</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-blue-500 text-white border-blue-500">Medium</Badge>;
    case 'low':
      return <Badge variant="outline" className="bg-green-500 text-white border-green-500">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export const AgentInvoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
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
          description: "Failed to load invoices",
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
      // Get all maintenance requests with enhanced details
      const requests = await tenantService.getMaintenanceRequestsWithDetails();
      
      // Filter only completed requests for invoicing
      const completedRequests = requests.filter(request => request.status === 'completed');

      const requestsWithPaymentStatus = completedRequests.map(request => ({
        ...request,
        // Add payment status (you might want to add this field to your database)
        payment_status: request.actual_cost ? (Math.random() > 0.3 ? 'paid' : 'pending') : 'pending'
      }));

      setTickets(requestsWithPaymentStatus);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const fetchWorkers = async () => {
    try {
      const allWorkers = await getAllWorkers();
      setWorkers(allWorkers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  // Get completed tickets with actual costs for invoicing
  const getInvoiceTickets = () => tickets.filter(ticket => 
    ticket.status === 'completed' && ticket.actual_cost && ticket.actual_cost > 0
  );

  const filteredInvoices = getInvoiceTickets().filter(ticket => {
    const matchesSearch = 
      ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.tenant_profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'paid' && ticket.payment_status === 'paid') ||
      (activeTab === 'pending' && ticket.payment_status === 'pending');
    return matchesSearch && matchesTab;
  });

  const totalAmount = filteredInvoices.reduce((sum, ticket) => sum + (ticket.actual_cost || 0), 0);
  const paidAmount = filteredInvoices.filter(t => t.payment_status === 'paid').reduce((sum, ticket) => sum + (ticket.actual_cost || 0), 0);
  const pendingAmount = filteredInvoices.filter(t => t.payment_status === 'pending').reduce((sum, ticket) => sum + (ticket.actual_cost || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage payments for completed maintenance jobs</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-80"
            />
          </div>
          <Button variant="outline" className="bg-agent hover:bg-agent-secondary text-white border-agent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{filteredInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
                <p className="text-2xl font-bold">£{paidAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold">£{pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">£{totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Invoices ({getInvoiceTickets().length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({getInvoiceTickets().filter(t => t.payment_status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({getInvoiceTickets().filter(t => t.payment_status === 'paid').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4">
                {filteredInvoices.map((ticket) => {
                  const worker = workers.find(w => w.id === ticket.assigned_worker_id);
                  
                  return (
                    <Card key={ticket.id} className="mx-4 mt-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-4">
                            {/* Header Row */}
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-semibold">{ticket.title}</h3>
                                  {getPriorityBadge(ticket.priority)}
                                  {getStatusBadge(ticket.payment_status)}
                                </div>
                                <p className="text-sm text-muted-foreground">{ticket.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-agent">£{(ticket.actual_cost || 0).toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground">Ticket #{ticket.id}</p>
                              </div>
                            </div>

                            {/* Details Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{worker?.name || 'Unassigned'}</p>
                                    <p className="text-xs text-muted-foreground">{worker?.specialization || ''}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium">{ticket.tenant_profile?.name || 'Unknown Tenant'}</p>
                                    <p className="text-xs text-muted-foreground">{ticket.property_address || 'No address'}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      Completed: {ticket.completed_at ? new Date(ticket.completed_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Created: {new Date(ticket.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions Row */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="text-sm text-muted-foreground">
                                Category: {ticket.category} • Priority: {ticket.priority}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedInvoice(ticket)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                                {ticket.payment_status === 'pending' && (
                                  <Button size="sm" className="bg-agent hover:bg-agent-secondary text-white">
                                    Mark as Paid
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredInvoices.length === 0 && (
                <div className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? 'Try adjusting your search criteria'
                      : 'No invoices match the selected filter'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Invoice Details - {selectedInvoice.title}</span>
                {getStatusBadge(selectedInvoice.payment_status)}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Invoice Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedInvoice.title}</span>
                    <span className="text-2xl font-bold text-agent">£{(selectedInvoice.actual_cost || 0).toFixed(2)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{selectedInvoice.description}</p>
                  <div className="flex items-center gap-4">
                    {getPriorityBadge(selectedInvoice.priority)}
                    <span className="text-sm text-muted-foreground">
                      Completed on {selectedInvoice.completed_at ? new Date(selectedInvoice.completed_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Worker Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Worker Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-semibold">{selectedInvoice.workerName}</p>
                      <p className="text-sm text-muted-foreground">{selectedInvoice.workerSpecialty}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedInvoice.workerPhone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="w-5 h-5" />
                      <span>Customer Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-semibold">{selectedInvoice.tenant}</p>
                      <p className="text-sm text-muted-foreground">{selectedInvoice.property}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedInvoice.tenantPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedInvoice.tenantEmail}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Cost Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Labor ({selectedInvoice.hours} hours)</span>
                      <span>£{selectedInvoice.laborCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Materials & Parts</span>
                      <span>£{selectedInvoice.materialsCost.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="text-agent">£{selectedInvoice.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Payment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Invoice Date</p>
                      <p>{selectedInvoice.invoiceDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                      <p>{selectedInvoice.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                      <p>{selectedInvoice.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      {getStatusBadge(selectedInvoice.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button className="bg-agent hover:bg-agent-secondary text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                {selectedInvoice.status === 'Pending' && (
                  <Button variant="outline">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reminder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}