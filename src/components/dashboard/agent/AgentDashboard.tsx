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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Eye,
  Users,
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
import { MaintenanceDetail } from '@/components/tenant/MaintenanceDetail';
import { getAllWorkers, getFavoriteWorkers, getWorkersByCategory, getWorkerById } from '@/data/workers';

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

export const AgentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState(null);
  const [workers, setWorkers] = useState([]);
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
      // Update the ticket to claim it by current agent
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          agent_notes: 'current_agent', // Store agent ID who claimed it
          status: 'claimed'
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
      // Get favorite workers and assign first one
      const favoriteWorkers = getFavoriteWorkers();
      
      if (favoriteWorkers.length === 0) {
        toast({
          title: "No Favorite Workers",
          description: "Please mark a worker as favorite first.",
          variant: "destructive",
        });
        return;
      }

      const favoriteWorker = favoriteWorkers[0]; // Use first favorite worker
      
      // Update the ticket to assign it to the favorite worker
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_worker_id: favoriteWorker.id,
          status: 'in_process'
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
        description: `${favoriteWorker.name} has been automatically assigned to this ticket.`,
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

  const handleAssignWorker = async (ticketId: string, workerId: string) => {
    try {
      // Update the ticket to assign it to a specific worker
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_worker_id: workerId,
          status: 'in_process'
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

      const worker = getAllWorkers().find(w => w.id === workerId);
      toast({
        title: "Worker Assigned",
        description: `${worker?.name || 'Worker'} has been assigned to this ticket.`,
      });
      
      // Close modal and refresh data
      setAssignModalOpen(false);
      setSelectedTicketForAssign(null);
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

  const openAssignModal = (ticket: any) => {
    setSelectedTicketForAssign(ticket);
    // Filter workers by ticket category - use workers from the matching category or general
    const categoryWorkers = getWorkersByCategory(ticket.category);
    const generalWorkers = getWorkersByCategory('general');
    const allAvailableWorkers = [...categoryWorkers, ...generalWorkers];
    setWorkers(allAvailableWorkers);
    setAssignModalOpen(true);
  };

  // Helper functions to filter tickets
  const getUnassignedTickets = () => tickets.filter(ticket => 
    ticket.status === 'submitted' || ticket.status === 'open'
  );

  const getMyTickets = () => tickets.filter(ticket => 
    ticket.agent_notes === 'current_agent' || ticket.status === 'claimed' || ticket.status === 'in_process'
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

  const renderTicketTable = (ticketList, isAllAgencyTab = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Tenant Name</TableHead>
          <TableHead>Tenant Number</TableHead>
          <TableHead>Property Address</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned Worker</TableHead>
          {isAllAgencyTab && <TableHead>Claimed By</TableHead>}
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
              <p className="text-sm">{ticket.tenant_profile?.username || 'N/A'}</p>
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
                {ticket.status === 'claimed' && <User className="h-4 w-4 text-yellow-500" />}
                {(ticket.status === 'submitted' || ticket.status === 'open') && <AlertTriangle className="h-4 w-4 text-red-500" />}
                <span className={`text-sm capitalize ${
                  ticket.status === 'completed' ? 'text-green-700' :
                  ticket.status === 'in_process' ? 'text-blue-700' :
                  ticket.status === 'claimed' ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  {ticket.status === 'in_process' ? 'In Process' : 
                   ticket.status === 'submitted' ? 'Open' : 
                   ticket.status}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <p className="text-sm">
                {ticket.assigned_worker_id ? 
                  (getWorkerById(ticket.assigned_worker_id)?.name || ticket.assigned_worker_id) : 
                  'Unassigned'}
              </p>
            </TableCell>
            {isAllAgencyTab && (
              <TableCell>
                <p className="text-sm">{ticket.agent_notes === 'current_agent' ? 'You' : ticket.agent_notes || 'Not claimed'}</p>
              </TableCell>
            )}
            <TableCell>
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                {!isAllAgencyTab && (
                  <>
                    {(ticket.status === 'submitted' || ticket.status === 'open') && !ticket.agent_notes && (
                      <Button 
                        type="button"
                        size="sm"
                        onClick={() => handleClaimTicket(ticket.id)}
                        className="bg-agent hover:bg-agent-secondary text-white"
                      >
                        Claim
                      </Button>
                    )}
                    {ticket.status === 'claimed' && ticket.agent_notes === 'current_agent' && !ticket.assigned_worker_id && (
                      <div className="flex flex-col gap-1">
                        <Button 
                          type="button"
                          size="sm"
                          onClick={() => handleQuickAssign(ticket.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Quick Assign
                        </Button>
                        <Button 
                          type="button"
                          size="sm"
                          onClick={() => openAssignModal(ticket)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Assign
                        </Button>
                      </div>
                    )}
                  </>
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
                    <SelectItem value="in_process">In Process</SelectItem>
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
              {renderTicketTable(getAllTickets(), true)}
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

      {/* Worker Assignment Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Worker</DialogTitle>
            <DialogDescription>
              Select a worker to assign to "{selectedTicketForAssign?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {workers.length > 0 ? (
              <div className="grid gap-4">
                {workers.map((worker) => (
                  <Card key={worker.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{worker.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {worker.specialty} • Rating: {worker.rating}/5
                            </p>
                            <p className="text-xs text-muted-foreground">{worker.phone}</p>
                          </div>
                        </div>
                        <Button 
                          type="button"
                          onClick={() => handleAssignWorker(selectedTicketForAssign?.id, worker.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Assign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No workers available for {selectedTicketForAssign?.category} category</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};