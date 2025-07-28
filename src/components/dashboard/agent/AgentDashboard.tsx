import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
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
  TreePine,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AgentMaintenanceDetail } from '@/components/pages/agent/AgentMaintenanceDetail';
import { getAllWorkers, getFavoriteWorkers, getWorkersByCategory, getWorkerById, deleteWorker } from '@/data/workers';
import { ErrorBoundary } from 'react-error-boundary';

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

// Create an error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="p-4 rounded-md bg-red-50 border border-red-200">
      <h2 className="text-lg font-semibold text-red-800">Something went wrong:</h2>
      <p className="text-sm text-red-600">{error.message}</p>
      <Button
        onClick={resetErrorBoundary}
        className="mt-4 bg-red-600 hover:bg-red-700 text-white"
      >
        Try again
      </Button>
    </div>
  );
};

// Wrap your component with ErrorBoundary
export const AgentDashboard = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state when the error boundary is reset
        window.location.reload();
      }}
    >
      <AgentDashboardContent />
    </ErrorBoundary>
  );
};

// Move your existing component code here
const AgentDashboardContent = () => {
  const navigate = useNavigate();
  
  // Add null checks for initial state
  const [tickets, setTickets] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteData, setQuoteData] = useState({
    estimatedCost: '',
    estimatedTime: '',
    description: ''
  });
  const [activeTab, setActiveTab] = useState('unassigned');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedTicketForComplete, setSelectedTicketForComplete] = useState(null);
  const [additionalCosts, setAdditionalCosts] = useState({
    amount: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchMaintenanceRequests(),
          fetchWorkers()
        ]);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        toast({
          title: "Error",
          description: "Failed to initialize dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    init();
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
          .select('*')
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

  const fetchWorkers = async () => {
    try {
      const allWorkers = await getAllWorkers();
      setWorkers(allWorkers);
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast({
        title: "Error",
        description: "Failed to load workers",
        variant: "destructive",
      });
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

  const handleQuickAssign = async (ticketId: string, ticketCategory: string) => {
    try {
      const favoriteWorkers = await getFavoriteWorkers();
      
      if (!favoriteWorkers || favoriteWorkers.length === 0) {
        toast({
          title: "No Favorite Workers",
          description: "Please mark a worker as favorite first.",
          variant: "destructive",
        });
        return;
      }

      // Filter favorite workers by the ticket's category with flexible matching
      const normalizeCategory = (cat) => cat?.toLowerCase().replace(/[\/\-\s]/g, '');
      const normalizedTicketCategory = normalizeCategory(ticketCategory);
      
      const categoryFavoriteWorkers = favoriteWorkers.filter(worker => {
        const normalizedWorkerCategory = normalizeCategory(worker.category);
        return normalizedWorkerCategory === normalizedTicketCategory;
      });

      if (categoryFavoriteWorkers.length === 0) {
        toast({
          title: "No Category Favorite Workers",
          description: `No favorite workers found for ${ticketCategory} category.`,
          variant: "destructive",
        });
        return;
      }

      const favoriteWorker = categoryFavoriteWorkers[0];
      
      if (!favoriteWorker.id) {
        throw new Error('Invalid worker ID');
      }

      const currentTicket = tickets.find(t => t.id === ticketId);

      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_worker_id: favoriteWorker.id,
          status: 'quote_submitted',
          // Clear previous quote data if reassigning
          ...(currentTicket?.status === 'rejected' && {
            estimated_cost: null,
            estimated_time: null,
            quote_description: null
          })
        })
        .eq('id', ticketId);

      if (error) throw error;

      const isReassign = currentTicket?.status === 'rejected';

      toast({
        title: isReassign ? "Worker Reassigned" : "Worker Assigned",
        description: `${favoriteWorker.name} has been ${isReassign ? 'reassigned to' : 'assigned to'} this ticket.`,
      });
      
      // Refresh both maintenance requests and workers
      await Promise.all([
        fetchMaintenanceRequests(),
        fetchWorkers()
      ]);
    } catch (error) {
      console.error('Error assigning worker:', error);
      toast({
        title: "Error",
        description: "Failed to assign worker",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTicket = async () => {
    try {
      if (!selectedTicketForComplete?.id) {
        toast({
          title: "Error",
          description: "No ticket selected for completion",
          variant: "destructive",
        });
        return;
      }

      // Calculate total cost
      const estimatedCost = parseFloat(selectedTicketForComplete.estimated_cost) || 0;
      const additionalCost = parseFloat(additionalCosts.amount) || 0;
      const totalCost = estimatedCost + additionalCost;

      const updateData: any = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        actual_cost: totalCost
      };

      // Add additional cost description if provided
      if (additionalCosts.description) {
        updateData.additional_cost_description = additionalCosts.description;
      }

      if (additionalCost > 0) {
        updateData.additional_cost = additionalCost;
      }

      const { error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', selectedTicketForComplete.id);

      if (error) throw error;

      toast({
        title: "Ticket Completed",
        description: "Ticket has been marked as completed and moved to invoices.",
      });

      // Close modal and reset state
      setCompleteModalOpen(false);
      setSelectedTicketForComplete(null);
      setAdditionalCosts({ amount: '', description: '' });

      // Refresh data
      await fetchMaintenanceRequests();

      // Navigate to invoices page after a short delay
      setTimeout(() => {
        navigate('/invoices');
      }, 1000);

    } catch (error) {
      console.error('Error completing ticket:', error);
      toast({
        title: "Error",
        description: "Failed to complete ticket",
        variant: "destructive",
      });
    }
  };

  const openCompleteModal = (ticket: any) => {
    setSelectedTicketForComplete(ticket);
    setCompleteModalOpen(true);
  };

  const handleAssignWorker = async (ticketId: string, workerId: string) => {
    try {
      const currentTicket = tickets.find(t => t.id === ticketId);
      
      // Update the ticket to assign it to a specific worker
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_worker_id: workerId,
          status: 'quote_submitted',
          // Clear previous quote data if reassigning
          ...(currentTicket?.status === 'rejected' && {
            estimated_cost: null,
            estimated_time: null,
            quote_description: null
          })
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

      const allWorkers = await getAllWorkers();
      const worker = allWorkers.find(w => w.id === workerId);
      const isReassign = currentTicket?.status === 'rejected';
      
      toast({
        title: isReassign ? "Worker Reassigned" : "Worker Assigned",
        description: `${worker?.name || 'Worker'} has been ${isReassign ? 'reassigned to' : 'assigned to'} this ticket.`,
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

  const handleDeleteWorker = async (workerId: string) => {
    try {
      await deleteWorker(workerId);
      toast({
        title: "Worker Deleted",
        description: "Worker has been permanently removed",
      });
      await fetchWorkers(); // Refresh workers list
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast({
        title: "Error",
        description: "Failed to delete worker",
        variant: "destructive",
      });
    }
  };

  const openAssignModal = async (ticket: any) => {
    try {
      setSelectedTicketForAssign(ticket);
      
      // Get workers by category using database query
      const categoryWorkers = await getWorkersByCategory(ticket.category);
      
      if (!categoryWorkers || categoryWorkers.length === 0) {
        // More flexible category matching
        const normalizeCategory = (cat) => cat?.toLowerCase().replace(/[\/\-\s]/g, '');
        const normalizedTicketCategory = normalizeCategory(ticket.category);
        
        const allWorkers = await getAllWorkers();
        const filteredWorkers = allWorkers.filter(worker => {
          const normalizedWorkerCategory = normalizeCategory(worker.category);
          
          // Debug log for testing
          console.log(`🔍 Category matching test:
            Ticket: "${ticket.category}" → normalized: "${normalizedTicketCategory}"
            Worker: "${worker.name}" category: "${worker.category}" → normalized: "${normalizedWorkerCategory}"
            Match: ${normalizedWorkerCategory === normalizedTicketCategory}`);
          
          return normalizedWorkerCategory === normalizedTicketCategory;
        });
        
        console.log(`✅ Found ${filteredWorkers.length} matching workers for category "${ticket.category}"`);
        setWorkers(filteredWorkers);
      } else {
        setWorkers(categoryWorkers);
      }
      
      setAssignModalOpen(true);
    } catch (error) {
      console.error('Error loading workers:', error);
      toast({
        title: "Error",
        description: "Failed to load workers",
        variant: "destructive",
      });
    }
  };

  const handleSubmitQuote = async () => {
    try {
      if (!selectedTicket?.id) return;

      if (!quoteData.estimatedCost) {
        toast({
          title: "Error",
          description: "Please enter an estimated cost",
          variant: "destructive",
        });
        return;
      }

      const estimatedCostNum = parseFloat(quoteData.estimatedCost);
      if (isNaN(estimatedCostNum) || estimatedCostNum <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid estimated cost greater than 0",
          variant: "destructive",
        });
        return;
      }

      console.log('Submitting quote from dashboard:', {
        id: selectedTicket.id,
        estimatedCost: quoteData.estimatedCost,
        estimatedCostParsed: estimatedCostNum
      });

      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          estimated_cost: estimatedCostNum,
          status: 'pending_approval'
        })
        .eq('id', selectedTicket.id);

      if (error) {
        console.error('Database error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Database Error",
          description: `Failed to submit quote: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Quote submitted successfully from dashboard');

      toast({
        title: "Quote Submitted",
        description: "Quote has been submitted for landlord approval.",
      });
      
      setQuoteModalOpen(false);
      setQuoteData({ estimatedCost: '', estimatedTime: '', description: '' });
      await fetchMaintenanceRequests();
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Error",
        description: `Failed to submit quote: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  // Helper function to check if there are favorite workers for a specific category
  const hasFavoriteWorkersForCategory = async (category: string) => {
    try {
      const favoriteWorkers = await getFavoriteWorkers();
      if (!favoriteWorkers || favoriteWorkers.length === 0) {
        return false;
      }
      
      const normalizeCategory = (cat) => cat?.toLowerCase().replace(/[\/\-\s]/g, '');
      const normalizedTicketCategory = normalizeCategory(category);
      
      const categoryFavoriteWorkers = favoriteWorkers.filter(worker => {
        const normalizedWorkerCategory = normalizeCategory(worker.category);
        return normalizedWorkerCategory === normalizedTicketCategory;
      });
      
      return categoryFavoriteWorkers.length > 0;
    } catch (error) {
      console.error('Error checking favorite workers:', error);
      return false;
    }
  };

  // Helper functions to filter tickets
  const getUnassignedTickets = () => tickets.filter(ticket => 
    ticket.status === 'submitted' || ticket.status === 'open'
  );

  const getMyTickets = () => tickets.filter(ticket => 
    (ticket.agent_notes === 'current_agent' || 
    ticket.status === 'claimed' || 
    ticket.status === 'in_process' || 
    ticket.status === 'quote_submitted' || 
    ticket.status === 'pending_approval' ||
    ticket.status === 'rejected') &&
    ticket.status !== 'completed'  // Exclude completed tickets from My Issues
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

  const renderTicketTable = (ticketList, isAllAgencyTab = false) => {
    if (!ticketList) return null;
    
    // Component to handle quick assign button visibility
    const QuickAssignButton = React.memo(({ ticket }: { ticket: any }) => {
      const [hasFavorites, setHasFavorites] = React.useState(null);

      React.useEffect(() => {
        const checkFavorites = async () => {
          const result = await hasFavoriteWorkersForCategory(ticket.category);
          setHasFavorites(result);
        };
        checkFavorites();
      }, [ticket.category]);

      // Show nothing while checking or if no favorites
      if (hasFavorites === null || !hasFavorites) {
        return null;
      }

      return (
        <Button 
          type="button"
          size="sm"
          onClick={() => handleQuickAssign(ticket.id, ticket.category)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Quick Assign
        </Button>
      );
    });
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Tenant Name</TableHead>
            <TableHead>Tenant Phone</TableHead>
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
                <p className="text-sm">{ticket.tenant_profile?.phone || ticket.tenant_phone || ticket.tenant_profile?.username || 'N/A'}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm">{ticket.tenant_profile?.address || ticket.property_address || ticket.tenant_address || 'Address Not Available'}</p>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline"
                  className={
                    ticket.priority === 'urgent' ? 'bg-red-500 text-white border-red-500' :
                    ticket.priority === 'high' ? 'bg-orange-500 text-white border-orange-500' :
                    ticket.priority === 'medium' ? 'bg-blue-500 text-white border-blue-500' :
                    ticket.priority === 'low' ? 'bg-green-500 text-white border-green-500' :
                    'bg-gray-500 text-white border-gray-500'
                  }
                >
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
                     ticket.status === 'quote_submitted' ? 'Quote Submitted' :
                     ticket.status === 'rejected' ? 'Rejected - Reassign' :
                     ticket.status}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm">
                  {ticket.assigned_worker_id
                    ? workers.find(w => w.id === ticket.assigned_worker_id)?.name || ticket.assigned_worker_id
                    : 'Unassigned'}
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
                          <QuickAssignButton ticket={ticket} />
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
                      {ticket.status === 'in_process' && !ticket.assigned_worker_id && (
                        <Button 
                          type="button"
                          size="sm"
                          onClick={() => openAssignModal(ticket)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Assign Worker
                        </Button>
                      )}
                      {ticket.status === 'quote_submitted' && (
                        <Button 
                          type="button"
                          size="sm"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setQuoteModalOpen(true);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Submit Quote
                        </Button>
                      )}
                      {ticket.status === 'rejected' && (
                        <div className="flex flex-col gap-1">
                          <QuickAssignButton ticket={ticket} />
                          <Button 
                            type="button"
                            size="sm"
                            onClick={() => openAssignModal(ticket)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Reassign Worker
                          </Button>
                        </div>
                      )}
                      {ticket.status === 'in_process' && activeTab !== 'all-agency' && activeTab !== 'unassigned' && (
                        <Button 
                          type="button"
                          size="sm"
                          onClick={() => openCompleteModal(ticket)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Complete
                        </Button>
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
  };

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                    <SelectItem value="quote_submitted">Quote Submitted</SelectItem>
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
        <AgentMaintenanceDetail
          issue={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onUpdate={fetchMaintenanceRequests}
          activeTab={activeTab}
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
                        <div className="flex space-x-2">
                          <Button 
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWorker(worker.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button"
                            onClick={() => handleAssignWorker(selectedTicketForAssign?.id, worker.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Assign
                          </Button>
                        </div>
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

      {/* Quote & Approval Modal */}
      <Dialog open={quoteModalOpen} onOpenChange={setQuoteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Quote & Request Approval</DialogTitle>
            <DialogDescription>
              Enter the estimated cost and time for this maintenance request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="estimatedCost" className="text-sm font-medium">
                Estimated Cost (£)
              </label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter estimated cost"
                value={quoteData.estimatedCost}
                onChange={(e) => setQuoteData({
                  ...quoteData,
                  estimatedCost: e.target.value
                })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="estimatedTime" className="text-sm font-medium">
                Estimated Time
              </label>
              <Input
                id="estimatedTime"
                type="text"
                placeholder="e.g., 2-3 hours, 1 day"
                value={quoteData.estimatedTime}
                onChange={(e) => setQuoteData({
                  ...quoteData,
                  estimatedTime: e.target.value
                })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quoteDescription" className="text-sm font-medium">
                Work Description
              </label>
              <textarea
                id="quoteDescription"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                placeholder="Describe the work to be done..."
                value={quoteData.description}
                onChange={(e) => setQuoteData({
                  ...quoteData,
                  description: e.target.value
                })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuoteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmitQuote}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Issue Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Issue Details</DialogTitle>
            <DialogDescription>
              Update the details for this maintenance request.
            </DialogDescription>
          </DialogHeader>
          {editData && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const { error } = await supabase
                    .from('maintenance_requests')
                    .update({
                      priority: editData.priority,
                      category: editData.category,
                      title: editData.title,
                      description: editData.description,
                    })
                    .eq('id', editData.id);
                  if (error) throw error;
                  toast({ title: "Updated", description: "Issue updated successfully." });
                  setEditModalOpen(false);
                  await fetchMaintenanceRequests();
                } catch (error) {
                  toast({ title: "Error", description: "Failed to update issue.", variant: "destructive" });
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={editData.title}
                  onChange={e => setEditData({ ...editData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full min-h-[60px] px-3 py-2 border rounded-md"
                  value={editData.description}
                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <Select value={editData.priority} onValueChange={val => setEditData({ ...editData, priority: val })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select value={editData.category} onValueChange={val => setEditData({ ...editData, category: val })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(issueCategories).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Complete Ticket Modal */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Ticket</DialogTitle>
            <DialogDescription>
              Add any additional costs and mark the ticket as completed.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicketForComplete && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium">{selectedTicketForComplete.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Estimated Cost: £{selectedTicketForComplete.estimated_cost}
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="additionalAmount" className="text-sm font-medium">
                  Additional Costs (£)
                </label>
                <Input
                  id="additionalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter additional costs if any"
                  value={additionalCosts.amount}
                  onChange={(e) => setAdditionalCosts(prev => ({...prev, amount: e.target.value}))}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="additionalDescription" className="text-sm font-medium">
                  Additional Cost Description
                </label>
                <Textarea
                  id="additionalDescription"
                  placeholder="Describe additional costs (optional)..."
                  rows={3}
                  value={additionalCosts.description}
                  onChange={(e) => setAdditionalCosts(prev => ({...prev, description: e.target.value}))}
                />
              </div>

              {additionalCosts.amount && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">Total Cost Summary:</p>
                  <p className="text-sm text-green-700">
                    Estimated: £{selectedTicketForComplete.estimated_cost} + 
                    Additional: £{additionalCosts.amount} = 
                    <span className="font-medium"> £{(parseFloat(selectedTicketForComplete.estimated_cost) + parseFloat(additionalCosts.amount || '0')).toFixed(2)}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCompleteModalOpen(false);
                setAdditionalCosts({ amount: '', description: '' });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteTicket}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Complete & Move to Invoices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show predicted time if not completed, else show real completion time */}
      {/*
      <div className="progress-timeline">
        <div className="ai-prediction">
          <span className="font-semibold">Estimated Time</span>
          <span className="text-lg">
            {ticket.status !== 'completed'
              ? (ticket.preferred_time_slots?.join(', ') || ticket.preferred_date || 'N/A')
              : (ticket.completed_at
                  ? `Completed at ${new Date(ticket.completed_at).toLocaleString()}`
                  : 'Completed')}
          </span>
        </div>
      </div>
      */}
    </div>
  );
};