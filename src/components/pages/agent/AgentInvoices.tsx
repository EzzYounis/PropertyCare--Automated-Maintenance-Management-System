import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Building
} from 'lucide-react';

const invoiceData = [
  {
    id: 'INV-001',
    jobTitle: 'Kitchen Oven Not Heating',
    description: 'Repair and replace faulty heating element in kitchen oven',
    priority: 'Medium',
    status: 'Paid',
    worker: 'Mike Johnson',
    workerSpecialty: 'Expert Boiler Repairs',
    workerPhone: '+44 7700 123456',
    workerEmail: 'mike.johnson@maintenance.com',
    property: '78 Bethnal Green Road, London E2 6DG',
    tenant: 'Nicole Anderson',
    tenantPhone: '+44 7700 654321',
    tenantEmail: 'nicole.anderson@email.com',
    amount: 275.00,
    date: 'Jul 19, 2025',
    completedDate: 'Jul 18, 2025',
    hours: 3.5,
    materialsCost: 125.00,
    laborCost: 150.00,
    completed: 'Completed Recently',
    paymentMethod: 'Bank Transfer',
    invoiceDate: 'Jul 19, 2025',
    dueDate: 'Aug 2, 2025'
  },
  {
    id: 'INV-002',
    jobTitle: 'Bathroom Leak Repair',
    description: 'Fix leaking pipe under bathroom sink and replace damaged flooring',
    priority: 'High',
    status: 'Pending',
    worker: 'Sarah Davis',
    workerSpecialty: 'Senior Plumber',
    workerPhone: '+44 7700 789012',
    workerEmail: 'sarah.davis@maintenance.com',
    property: '45 Baker Street, London NW1 6XE',
    tenant: 'John Smith',
    tenantPhone: '+44 7700 345678',
    tenantEmail: 'john.smith@email.com',
    amount: 185.00,
    date: 'Jul 20, 2025',
    completedDate: 'Jul 19, 2025',
    hours: 2.5,
    materialsCost: 75.00,
    laborCost: 110.00,
    completed: 'Completed Yesterday',
    paymentMethod: 'Pending',
    invoiceDate: 'Jul 20, 2025',
    dueDate: 'Aug 3, 2025'
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Paid':
      return <Badge className="bg-green-100 text-green-700 border-green-200">✓ Paid</Badge>;
    case 'Pending':
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">⏳ Pending</Badge>;
    case 'Overdue':
      return <Badge className="bg-red-100 text-red-700 border-red-200">⚠ Overdue</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'High':
      return <Badge variant="destructive">High</Badge>;
    case 'Medium':
      return <Badge variant="default">Medium</Badge>;
    case 'Low':
      return <Badge variant="secondary">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export const AgentInvoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filteredInvoices = invoiceData.filter(invoice => {
    const matchesSearch = 
      invoice.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.tenant.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'paid' && invoice.status === 'Paid') ||
      (activeTab === 'pending' && invoice.status === 'Pending');
    
    return matchesSearch && matchesTab;
  });

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = filteredInvoices.filter(i => i.status === 'Paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = filteredInvoices.filter(i => i.status === 'Pending').reduce((sum, invoice) => sum + invoice.amount, 0);

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
          <TabsTrigger value="all">All Invoices ({invoiceData.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({invoiceData.filter(i => i.status === 'Pending').length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({invoiceData.filter(i => i.status === 'Paid').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="mx-4 mt-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          {/* Header Row */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">{invoice.jobTitle}</h3>
                                {getPriorityBadge(invoice.priority)}
                                {getStatusBadge(invoice.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">{invoice.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-agent">£{invoice.amount.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">Invoice #{invoice.id}</p>
                            </div>
                          </div>

                          {/* Details Row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{invoice.worker}</p>
                                  <p className="text-xs text-muted-foreground">{invoice.workerSpecialty}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">{invoice.tenant}</p>
                                  <p className="text-xs text-muted-foreground">{invoice.property}</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">Completed: {invoice.completedDate}</p>
                                  <p className="text-xs text-muted-foreground">Invoice: {invoice.date}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions Row */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-sm text-muted-foreground">
                              {invoice.completed} • {invoice.hours} hours worked
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedInvoice(invoice)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                              {invoice.status === 'Pending' && (
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
                ))}
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
                <span>Invoice Details - {selectedInvoice.id}</span>
                {getStatusBadge(selectedInvoice.status)}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Invoice Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedInvoice.jobTitle}</span>
                    <span className="text-2xl font-bold text-agent">£{selectedInvoice.amount.toFixed(2)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{selectedInvoice.description}</p>
                  <div className="flex items-center gap-4">
                    {getPriorityBadge(selectedInvoice.priority)}
                    <span className="text-sm text-muted-foreground">
                      Completed on {selectedInvoice.completedDate}
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
                      <p className="font-semibold">{selectedInvoice.worker}</p>
                      <p className="text-sm text-muted-foreground">{selectedInvoice.workerSpecialty}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedInvoice.workerPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedInvoice.workerEmail}</span>
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
};