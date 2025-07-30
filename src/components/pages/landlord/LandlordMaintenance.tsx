import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText,
  User,
  DollarSign,
  Building,
  Droplets,
  Zap,
  Thermometer,
  Settings,
  Bug,
  Key,
  Paintbrush,
  Grid3X3,
  DoorOpen,
  TreePine,
  Wrench,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LandlordMaintenanceDetail } from './LandlordMaintenanceDetail';

// Issue categories mapping to match database
const issueCategories = {
  'Plumbing': {
    icon: Droplets,
    color: 'text-blue-500',
    bg: 'bg-blue-100'
  },
  'Electrical': {
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100'
  },
  'HVAC': {
    icon: Thermometer,
    color: 'text-green-500',
    bg: 'bg-green-100'
  },
  'Appliances': {
    icon: Settings,
    color: 'text-purple-500',
    bg: 'bg-purple-100'
  },
  'Pest Control': {
    icon: Bug,
    color: 'text-red-500',
    bg: 'bg-red-100'
  },
  'Locks/Security': {
    icon: Key,
    color: 'text-indigo-500',
    bg: 'bg-indigo-100'
  },
  'Painting/Walls': {
    icon: Paintbrush,
    color: 'text-orange-500',
    bg: 'bg-orange-100'
  },
  'Flooring': {
    icon: Grid3X3,
    color: 'text-amber-500',
    bg: 'bg-amber-100'
  },
  'Windows/Doors': {
    icon: DoorOpen,
    color: 'text-cyan-500',
    bg: 'bg-cyan-100'
  },
  'Landscaping': {
    icon: TreePine,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100'
  },
  'Other': {
    icon: Wrench,
    color: 'text-gray-500',
    bg: 'bg-gray-100'
  }
};

export const LandlordMaintenance = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [selectedTicketForAction, setSelectedTicketForAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch maintenance requests with tenant profiles
      const { data: requests, error: requestsError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching maintenance requests:', requestsError);
        toast({
          title: "Error",
          description: "Failed to load maintenance requests",
          variant: "destructive",
        });
        return;
      }

      // Get profiles for each request
      if (requests && requests.length > 0) {
        const tenantIds = [...new Set(requests.map(r => r.tenant_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, username')
          .in('id', tenantIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Combine the data
        const requestsWithProfiles = requests.map(request => ({
          ...request,
          tenant_profile: profiles?.find(p => p.id === request.tenant_id) || null
        }));

        setTickets(requestsWithProfiles);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to filter tickets
  const getAllTickets = () => tickets;
  
  const getPendingApprovalTickets = () => tickets.filter(ticket => 
    ticket.status === 'pending_approval'
  );
  
  const getInProgressTickets = () => tickets.filter(ticket => 
    ticket.status === 'in_process'
  );
  
  const getCompletedTickets = () => tickets.filter(ticket => 
    ticket.status === 'completed'
  );

  // Filter tickets based on search and filters
  const filteredTickets = (ticketList) => {
    return ticketList.filter(ticket => {
      const matchesSearch = ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.tenant_profile?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  };

  // Quick approve function for table actions
  const handleQuickApprove = async (ticket) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          status: 'in_process',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (error) throw error;

      toast({
        title: "Quote Approved",
        description: "The maintenance quote has been approved and work can begin.",
      });

      fetchMaintenanceRequests(); // Refresh the list
    } catch (error) {
      console.error('Error approving quote:', error);
      toast({
        title: "Error",
        description: "Failed to approve quote.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick reject function
  const handleQuickReject = (ticket) => {
    setSelectedTicketForAction(ticket);
    setShowRejectionDialog(true);
  };

  const handleRejectQuote = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          status: 'rejected',
          landlord_notes: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicketForAction.id);

      if (error) throw error;

      toast({
        title: "Quote Rejected",
        description: "The maintenance quote has been rejected. Agent will be notified.",
      });

      setShowRejectionDialog(false);
      setRejectionReason('');
      setSelectedTicketForAction(null);
      fetchMaintenanceRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting quote:', error);
      toast({
        title: "Error",
        description: "Failed to reject quote.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTicketTable = (ticketList) => {
    if (!ticketList || ticketList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No maintenance requests found</p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Tenant Name</TableHead>
            <TableHead>Property Address</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Quote Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTickets(ticketList).map((ticket) => (
            <TableRow key={ticket.id}>
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
                <p className="text-sm font-medium">{ticket.tenant_profile?.name || 'Unknown'}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm">{ticket.property_address || 'Property Address Not Available'}</p>
              </TableCell>
              <TableCell>
                <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 
                              ticket.priority === 'high' ? 'destructive' : 
                              ticket.priority === 'medium' ? 'default' : 'secondary'}>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  {ticket.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {ticket.status === 'in_process' && <Clock className="h-4 w-4 text-blue-500" />}
                  {ticket.status === 'pending_approval' && <Clock className="h-4 w-4 text-orange-500" />}
                  {ticket.status === 'quote_submitted' && <FileText className="h-4 w-4 text-purple-500" />}
                  {ticket.status === 'claimed' && <User className="h-4 w-4 text-yellow-500" />}
                  {(ticket.status === 'submitted' || ticket.status === 'open') && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  {ticket.status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                  <span className={`text-sm capitalize ${
                    ticket.status === 'completed' ? 'text-green-700' :
                    ticket.status === 'in_process' ? 'text-blue-700' :
                    ticket.status === 'pending_approval' ? 'text-orange-700' :
                    ticket.status === 'quote_submitted' ? 'text-purple-700' :
                    ticket.status === 'claimed' ? 'text-yellow-700' :
                    ticket.status === 'rejected' ? 'text-red-700' :
                    'text-red-700'
                  }`}>
                    {ticket.status === 'in_process' ? 'In Process' : 
                     ticket.status === 'submitted' ? 'Open' : 
                     ticket.status === 'pending_approval' ? 'Pending Approval' :
                     ticket.status === 'quote_submitted' ? 'Quote Pending' :
                     ticket.status === 'rejected' ? 'Rejected' :
                     ticket.status}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {ticket.estimated_cost ? (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700">£{ticket.estimated_cost}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No quote yet</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  
                  {/* Show Approve/Reject buttons only if there's a quote and status is pending_approval */}
                  {ticket.estimated_cost && ticket.status === 'pending_approval' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleQuickApprove(ticket)}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleQuickReject(ticket)}
                        disabled={isLoading}
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
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
          <p className="text-muted-foreground mt-2">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Maintenance Management</h1>
          <p className="text-muted-foreground">
            Review and approve maintenance requests for your properties
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-80"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{getPendingApprovalTickets().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{getInProgressTickets().length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{getCompletedTickets().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-sm font-medium">Filter by:</span>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Category</span>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Appliances">Appliances</SelectItem>
                    <SelectItem value="Pest Control">Pest Control</SelectItem>
                    <SelectItem value="Locks/Security">Locks/Security</SelectItem>
                    <SelectItem value="Painting/Walls">Painting/Walls</SelectItem>
                    <SelectItem value="Flooring">Flooring</SelectItem>
                    <SelectItem value="Windows/Doors">Windows/Doors</SelectItem>
                    <SelectItem value="Landscaping">Landscaping</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Priority</span>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Status</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                    <SelectItem value="quote_submitted">Quote Pending</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="in_process">In Process</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {renderTicketTable(getAllTickets())}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {renderTicketTable(getPendingApprovalTickets())}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {renderTicketTable(getInProgressTickets())}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {renderTicketTable(getCompletedTickets())}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Maintenance Detail Modal */}
      {selectedTicket && (
        <LandlordMaintenanceDetail
          issue={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onUpdate={fetchMaintenanceRequests}
        />
      )}

      {/* Quick Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Quote</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this maintenance quote.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="rejectionReason" className="text-sm font-medium">
                Rejection Reason
              </label>
              <Textarea
                id="rejectionReason"
                placeholder="Please explain why you're rejecting this quote..."
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectionDialog(false);
                setRejectionReason('');
                setSelectedTicketForAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectQuote}
              disabled={!rejectionReason.trim() || isLoading}
              variant="destructive"
            >
              Reject Quote
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

