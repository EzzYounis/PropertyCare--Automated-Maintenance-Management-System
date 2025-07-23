import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const mockTickets = [
  {
    id: 1,
    title: 'Kitchen faucet leaking',
    property: '123 Maple Street, Unit 4B',
    tenant: 'Furkan',
    category: 'Plumbing',
    priority: 'urgent',
    status: 'unassigned',
    reportedDate: '2024-01-16',
    description: 'Water is constantly dripping from the kitchen faucet, causing water waste.',
    estimatedCost: 150,
    estimatedTime: '2 hours'
  },
  {
    id: 2,
    title: 'HVAC not heating properly',
    property: '456 Oak Avenue, Unit 2A',
    tenant: 'Sarah Wilson',
    category: 'HVAC',
    priority: 'high',
    status: 'claimed',
    reportedDate: '2024-01-15',
    assignedTo: 'Murat',
    description: 'Heating system not maintaining consistent temperature.',
    estimatedCost: 300,
    estimatedTime: '4 hours'
  },
  {
    id: 3,
    title: 'Bathroom light flickering',
    property: '789 Pine Street, Unit 1C',
    tenant: 'Mike Johnson',
    category: 'Electrical',
    priority: 'medium',
    status: 'in_progress',
    reportedDate: '2024-01-14',
    assignedTo: 'Murat',
    description: 'The main bathroom light keeps flickering intermittently.',
    estimatedCost: 80,
    estimatedTime: '1 hour'
  },
  {
    id: 4,
    title: 'Kitchen cabinet door broken',
    property: '321 Elm Street',
    tenant: 'Lisa Brown',
    category: 'General',
    priority: 'low',
    status: 'completed',
    reportedDate: '2024-01-10',
    completedDate: '2024-01-12',
    assignedTo: 'John Smith',
    description: 'Kitchen cabinet door hinge is broken and door won\'t close properly.',
    estimatedCost: 45,
    actualCost: 50,
    timeSpent: '45 minutes'
  }
];

const statusOptions = [
  { value: 'all', label: 'All Tickets' },
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'claimed', label: 'Claimed' },
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
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: '',
    timeSpent: '',
    actualCost: ''
  });
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unassigned': return 'text-warning';
      case 'claimed': return 'text-info';
      case 'in_progress': return 'text-agent';
      case 'completed': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unassigned': return <Clock className="w-4 h-4" />;
      case 'claimed': return <User className="w-4 h-4" />;
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

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.tenant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const myTickets = mockTickets.filter(ticket => ticket.assignedTo === 'Murat').length;
  const unassignedTickets = mockTickets.filter(ticket => ticket.status === 'unassigned').length;
  const urgentTickets = mockTickets.filter(ticket => ticket.priority === 'urgent').length;

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
                <p className="text-2xl font-bold">{mockTickets.length}</p>
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
        {filteredTickets.map((ticket) => (
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
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </Badge>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground mb-3">
                        <p><strong>Property:</strong> {ticket.property}</p>
                        <p><strong>Tenant:</strong> {ticket.tenant}</p>
                        <p><strong>Reported:</strong> {new Date(ticket.reportedDate).toLocaleDateString()}</p>
                        {ticket.assignedTo && <p><strong>Assigned to:</strong> {ticket.assignedTo}</p>}
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{ticket.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>Est. ${ticket.estimatedCost}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Est. {ticket.estimatedTime}</span>
                        </div>
                        {ticket.actualCost && (
                          <div className="flex items-center gap-1 text-success">
                            <DollarSign className="w-4 h-4" />
                            <span>Actual: ${ticket.actualCost}</span>
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
                    {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                  </Badge>
                  
                  <div className="flex gap-2">
                    {ticket.status === 'unassigned' && (
                      <Button 
                        variant="agent" 
                        size="sm"
                        onClick={() => handleClaimTicket(ticket.id)}
                      >
                        Claim Ticket
                      </Button>
                    )}
                    
                    {(ticket.status === 'claimed' || ticket.status === 'in_progress') && ticket.assignedTo === 'Murat' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Ticket</DialogTitle>
                            <DialogDescription>
                              Update the status and details of this maintenance ticket
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({...updateForm, status: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="on_hold">On Hold</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="notes">Work Notes</Label>
                              <Textarea
                                id="notes"
                                placeholder="Describe the work performed..."
                                value={updateForm.notes}
                                onChange={(e) => setUpdateForm({...updateForm, notes: e.target.value})}
                                rows={3}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="timeSpent">Time Spent</Label>
                                <Input
                                  id="timeSpent"
                                  placeholder="e.g., 2 hours"
                                  value={updateForm.timeSpent}
                                  onChange={(e) => setUpdateForm({...updateForm, timeSpent: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="actualCost">Actual Cost ($)</Label>
                                <Input
                                  id="actualCost"
                                  type="number"
                                  placeholder="0"
                                  value={updateForm.actualCost}
                                  onChange={(e) => setUpdateForm({...updateForm, actualCost: e.target.value})}
                                />
                              </div>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                              <Button variant="outline">Cancel</Button>
                              <Button variant="agent" onClick={handleUpdateTicket}>
                                Update Ticket
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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