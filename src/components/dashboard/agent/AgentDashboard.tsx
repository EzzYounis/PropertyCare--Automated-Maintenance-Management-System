import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  Wrench,
  Droplets,
  Zap,
  Thermometer,
  Shield,
  Home,
  Wifi,
  Search,
  Filter,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceDetail } from '@/components/tenant/MaintenanceDetail';

// Issue categories mapping to match database
const issueCategories = {
  'heating': {
    icon: Thermometer,
    color: 'text-orange-500',
    bg: 'bg-orange-100'
  },
  'plumbing': {
    icon: Droplets,
    color: 'text-blue-500',
    bg: 'bg-blue-100'
  },
  'electrical': {
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100'
  },
  'kitchen': {
    icon: Home,
    color: 'text-purple-500',
    bg: 'bg-purple-100'
  },
  'general': {
    icon: Wrench,
    color: 'text-gray-500',
    bg: 'bg-gray-100'
  }
};

export const AgentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      
      // First get maintenance requests
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

      // Then get profiles for each request
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

  const handleClaimTicket = async (ticketId: string) => {
    try {
      // Update the ticket to assign it to current agent
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_worker_id: 'current_agent', // You should replace this with actual agent ID
          status: 'assigned'
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error claiming ticket:', error);
        toast({
          title: "Error",
          description: "Failed to claim ticket",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Ticket Claimed",
        description: "You have successfully claimed this ticket.",
      });
      
      // Refresh the data to show updated status
      await fetchMaintenanceRequests();
    } catch (error) {
      console.error('Error claiming ticket:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleQuickAssign = async (ticketId: string) => {
    try {
      // Update the ticket to assign it to a favorite worker
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_worker_id: 'favorite_worker', // You should replace this with actual favorite worker ID
          status: 'assigned'
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error assigning worker:', error);
        toast({
          title: "Error",
          description: "Failed to assign worker",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Worker Assigned",
        description: "Your favorite worker has been automatically assigned to this ticket.",
      });
      
      // Refresh the data to show updated status
      await fetchMaintenanceRequests();
    } catch (error) {
      console.error('Error assigning worker:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAssignWorker = async (ticketId: string) => {
    try {
      // Update the ticket to assign it to a specific worker
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_worker_id: 'selected_worker', // You should replace this with actual selected worker ID
          status: 'assigned'
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error assigning worker:', error);
        toast({
          title: "Error",
          description: "Failed to assign worker",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Worker Assignment",
        description: "Worker has been assigned to this ticket.",
      });
      
      // Refresh the data to show updated status
      await fetchMaintenanceRequests();
    } catch (error) {
      console.error('Error assigning worker:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Helper functions to filter tickets
  const getUnassignedTickets = () => tickets.filter(ticket => 
    ticket.status === 'submitted' && (!ticket.assigned_worker_id || ticket.assigned_worker_id === null)
  );

  const getMyTickets = () => tickets.filter(ticket => 
    ticket.assigned_worker_id === 'current_agent' || ticket.status === 'assigned'
  );

  const getAllTickets = () => tickets;

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

  const renderTicketTable = (ticketList) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Issue</TableHead>
          <TableHead>Tenant</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned Worker</TableHead>
          <TableHead>Created</TableHead>
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
              <div>
                <p className="text-sm font-medium">{ticket.tenant_profile?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{ticket.room || 'N/A'}</p>
              </div>
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
                {ticket.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-500" />}
                {ticket.status === 'assigned' && <User className="h-4 w-4 text-yellow-500" />}
                {ticket.status === 'submitted' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                <span className={`text-sm capitalize ${
                  ticket.status === 'completed' ? 'text-green-700' :
                  ticket.status === 'in_progress' ? 'text-blue-700' :
                  ticket.status === 'assigned' ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <p className="text-sm">{ticket.assigned_worker_id || 'Unassigned'}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm">{new Date(ticket.created_at).toLocaleDateString()}</p>
            </TableCell>
            <TableCell>
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                {(ticket.status === 'submitted' && (!ticket.assigned_worker_id || ticket.assigned_worker_id === null)) && (
                  <Button 
                    size="sm"
                    onClick={() => handleClaimTicket(ticket.id)}
                    className="bg-agent hover:bg-agent-secondary text-white"
                  >
                    Claim
                  </Button>
                )}
                {ticket.assigned_worker_id && ticket.status === 'assigned' && (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAssign(ticket.id)}
                  >
                    Start Work
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            {tickets.length} total tickets • {getUnassignedTickets().length} unassigned • 
            {tickets.filter(t => t.priority === 'urgent').length} urgent
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
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
                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Unassigned</p>
                <p className="text-2xl font-bold">{getUnassignedTickets().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold">{tickets.filter(t => t.priority === 'urgent').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">My Tickets</p>
                <p className="text-2xl font-bold">{getMyTickets().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="unassigned" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unassigned">Unassigned Issues</TabsTrigger>
          <TabsTrigger value="my-issues">My Issues</TabsTrigger>
          <TabsTrigger value="all-agency">All Agency Issues</TabsTrigger>
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
                    <SelectItem value="heating">Heating</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="general">General</SelectItem>
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
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="unassigned" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {renderTicketTable(getUnassignedTickets())}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-issues" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {renderTicketTable(getMyTickets())}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-agency" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {renderTicketTable(getAllTickets())}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <MaintenanceDetail
          issue={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onUpdate={fetchMaintenanceRequests}
        />
      )}
    </div>
  );
};