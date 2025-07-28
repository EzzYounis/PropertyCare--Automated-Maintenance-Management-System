import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Ticket, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Wrench,
  User,
  Calendar,
  DollarSign,
  Plus,
  Phone,
  MapPin
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const statusOptions = [
  { value: 'all', label: 'All Tickets' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

export const AgentTickets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: '',
    timeSpent: '',
    actualCost: ''
  });
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMaintenanceRequests = async () => {
    try {
      const { data: requests, error: requestsError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        throw requestsError;
      }

      // Get tenant profiles to display tenant names
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

        setTickets(requestsWithProfiles || []);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch maintenance requests.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': 
        return (
          <Badge variant="outline" className="bg-red-500 text-white border-red-500">
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        );
      case 'high': 
        return (
          <Badge variant="outline" className="bg-orange-500 text-white border-orange-500">
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        );
      case 'medium': 
        return (
          <Badge variant="outline" className="bg-blue-500 text-white border-blue-500">
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        );
      case 'low': 
        return (
          <Badge variant="outline" className="bg-green-500 text-white border-green-500">
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        );
      default: 
        return (
          <Badge variant="outline" className="bg-gray-500 text-white border-gray-500">
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-warning';
      case 'in_progress': return 'text-agent';
      case 'completed': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Wrench className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  const handleClaimTicket = (ticketId: number) => {
    toast({
      title: "Ticket Claimed",
      description: "You have successfully claimed this ticket.",
    });
  };

  const handleUpdateTicket = () => {
    toast({
      title: "Ticket Updated",
      description: "Ticket status has been updated successfully.",
    });
    setSelectedTicket(null);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const myTickets = tickets.filter(ticket => ticket.assigned_worker_id === user?.id).length;
  const unassignedTickets = tickets.filter(ticket => ticket.status === 'submitted').length;
  const urgentTickets = tickets.filter(ticket => ticket.priority === 'urgent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Maintenance Tickets</h1>
          <p className="text-muted-foreground">Manage and track all maintenance requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
          <Button variant="agent">
            <Wrench className="w-4 h-4 mr-2" />
            My Tickets ({myTickets})
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-agent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-agent" />
              <div>
                <p className="text-2xl font-bold">{tickets.length}</p>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{unassignedTickets}</p>
                <p className="text-sm text-muted-foreground">Unassigned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-error">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-error" />
              <div>
                <p className="text-2xl font-bold">{urgentTickets}</p>
                <p className="text-sm text-muted-foreground">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-info">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-info" />
              <div>
                <p className="text-2xl font-bold">{myTickets}</p>
                <p className="text-sm text-muted-foreground">My Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading maintenance requests...</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{ticket.title}</h3>
                          {getPriorityBadge(ticket.priority)}
                          <Badge variant="outline">{ticket.category}</Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                          <p><strong>Tenant:</strong> {ticket.tenant_profile?.name || 'Unknown'}</p>
                          <p><strong>Reported:</strong> {new Date(ticket.created_at).toLocaleDateString()}</p>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span><strong>Phone:</strong> {ticket.tenant_phone || ticket.tenant_profile?.username || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span><strong>Address:</strong> {ticket.property_address || ticket.tenant_address || 'Address not available'}</span>
                          </div>
                          {ticket.room && <p><strong>Room:</strong> {ticket.room}</p>}
                          {ticket.subcategory && <p><strong>Type:</strong> {ticket.subcategory}</p>}
                          {ticket.assigned_worker_id && <p><strong>Assigned to:</strong> Agent</p>}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{ticket.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          {ticket.estimated_cost && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>Est. ${ticket.estimated_cost}</span>
                            </div>
                          )}
                          {ticket.actual_cost && (
                            <div className="flex items-center gap-1 text-success">
                              <DollarSign className="w-4 h-4" />
                              <span>Actual: ${ticket.actual_cost}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Badge 
                      variant={ticket.status === 'completed' ? 'default' : 'secondary'}
                      className="w-fit"
                    >
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </Badge>
                    
                    <div className="flex gap-2">
                      {ticket.status === 'submitted' && (
                        <Button 
                          variant="agent" 
                          size="sm"
                          onClick={() => handleClaimTicket(ticket.id)}
                        >
                          Claim Ticket
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredTickets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No maintenance tickets available at the moment'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};