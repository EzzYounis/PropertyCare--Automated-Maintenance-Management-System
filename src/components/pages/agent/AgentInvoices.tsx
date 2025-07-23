import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
  Calendar
} from 'lucide-react';

const invoiceData = [
  {
    id: 1,
    jobTitle: 'Kitchen Oven Not Heating',
    priority: 'Medium',
    status: 'Paid',
    worker: 'Mike Johnson',
    workerSpecialty: 'Expert Boiler Repairs',
    property: '78 Bethnal Green Road, London E2 6DG',
    tenant: 'Nicole Anderson',
    amount: 275.00,
    date: 'Jul 19, 2025',
    completed: 'Completed Recently'
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Paid':
      return <Badge className="bg-green-100 text-green-700">✓ Paid</Badge>;
    case 'Pending':
      return <Badge className="bg-yellow-100 text-yellow-700">⏳ Pending</Badge>;
    case 'All Invoices':
      return <Badge className="bg-gray-100 text-gray-700">📄 All</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'High':
      return <Badge className="bg-red-100 text-red-700">High</Badge>;
    case 'Medium':
      return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>;
    case 'Low':
      return <Badge className="bg-green-100 text-green-700">Low</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-700">{priority}</Badge>;
  }
};

export const AgentInvoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('paid');

  const filteredInvoices = invoiceData.filter(invoice => {
    const matchesSearch = 
      invoice.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.property.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'paid' && invoice.status === 'Paid') ||
      (activeTab === 'pending' && invoice.status === 'Pending');
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage payments for completed maintenance jobs</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-80"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Invoices (2)</TabsTrigger>
          <TabsTrigger value="pending">Pending (1)</TabsTrigger>
          <TabsTrigger value="paid">Paid (1)</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
                <div>Job Details</div>
                <div>Worker</div>
                <div>Property</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Date</div>
                <div>Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="grid grid-cols-7 gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-medium text-sm mb-1">{invoice.jobTitle}</div>
                      <div className="flex items-center gap-2 mb-1">
                        {getPriorityBadge(invoice.priority)}
                      </div>
                      <div className="text-xs text-muted-foreground">{invoice.completed}</div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{invoice.worker}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{invoice.workerSpecialty}</div>
                    </div>
                    
                    <div>
                      <div className="flex items-start gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-sm">{invoice.property}</div>
                          <div className="text-xs text-muted-foreground">{invoice.tenant}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="font-semibold text-lg">
                      £{invoice.amount.toFixed(2)}
                    </div>
                    
                    <div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{invoice.date}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {invoice.status === 'Paid' && (
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Paid
                        </Button>
                      )}
                    </div>
                  </div>
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
    </div>
  );
};