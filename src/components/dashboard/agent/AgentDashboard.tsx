import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  Eye,
  UserPlus,
  Zap,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for tickets
const mockTickets = [
  {
    id: 1,
    category: 'Heating & Boiler',
    title: 'Heating System Failure',
    description: 'Boiler not working, no heat',
    propertyAddress: '45 Baker Street, London NW1 6XE',
    tenantName: 'Sarah Johnson',
    phoneNumber: '+44 7700 123456',
    priority: 'Urgent',
    status: 'Open',
    assignedWorker: 'Not assigned',
    claimedBy: 'Not claimed',
    claimedDate: '8 minutes ago',
    actions: ['view', 'claim'],
    categoryColor: 'bg-orange-100 text-orange-700',
    priorityColor: 'bg-red-100 text-red-700',
    statusColor: 'bg-blue-100 text-blue-700'
  },
  {
    id: 2,
    category: 'Plumbing',
    title: 'Kitchen Sink Leak',
    description: 'Water dripping from kitchen sink',
    propertyAddress: '78 High Street, London N1 2AB',
    tenantName: 'Emma Wilson',
    phoneNumber: '+44 7700 234567',
    priority: 'Medium',
    status: 'Claimed',
    assignedWorker: 'Sarah Davis Electrician',
    claimedBy: 'Michael Brown',
    claimedDate: '11 minutes ago',
    actions: ['view', 'assign', 'quickAssign'],
    categoryColor: 'bg-blue-100 text-blue-700',
    priorityColor: 'bg-yellow-100 text-yellow-700',
    statusColor: 'bg-gray-100 text-gray-700'
  },
  {
    id: 3,
    category: 'Electrical',
    title: 'Electrical Outlet Not Working',
    description: 'Bedroom power outlet needs repair',
    propertyAddress: '156 Cambridge Road, London E2 7QB',
    tenantName: 'Michael Chen',
    phoneNumber: '+44 7700 456789',
    priority: 'High',
    status: 'In progress',
    assignedWorker: 'David Wilson Kitchen Specialist',
    claimedBy: 'Emma Wilson',
    claimedDate: '16 minutes ago',
    actions: ['view'],
    categoryColor: 'bg-yellow-100 text-yellow-700',
    priorityColor: 'bg-orange-100 text-orange-700',
    statusColor: 'bg-orange-100 text-orange-700'
  },
  {
    id: 4,
    category: 'General',
    title: 'Squeaky Door Hinges',
    description: 'Front door hinges making noise',
    propertyAddress: '92 Queen Street, London SW1 3CD',
    tenantName: 'Robert Taylor',
    phoneNumber: '+44 7700 345678',
    priority: 'Low',
    status: 'Open',
    assignedWorker: 'Not assigned',
    claimedBy: 'Not claimed',
    claimedDate: '43 minutes ago',
    actions: ['view', 'claim'],
    categoryColor: 'bg-gray-100 text-gray-700',
    priorityColor: 'bg-green-100 text-green-700',
    statusColor: 'bg-blue-100 text-blue-700'
  }
];

export const AgentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [addressFilter, setAddressFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const { toast } = useToast();

  const handleClaimTicket = (ticketId: number) => {
    toast({
      title: "Ticket Claimed",
      description: "You have successfully claimed this ticket.",
    });
  };

  const handleQuickAssign = (ticketId: number) => {
    toast({
      title: "Worker Assigned",
      description: "Your favorite worker has been automatically assigned to this ticket.",
    });
  };

  const handleAssignWorker = (ticketId: number) => {
    toast({
      title: "Worker Assignment",
      description: "Worker has been assigned to this ticket.",
    });
  };

  const getUnassignedTickets = () => mockTickets.filter(t => t.status === 'Open' && t.claimedBy === 'Not claimed');
  const getMyTickets = () => mockTickets.filter(t => t.claimedBy !== 'Not claimed');
  const getAllTickets = () => mockTickets;

  const renderTicketTable = (tickets: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Issue Category</TableHead>
          <TableHead>Issue Description</TableHead>
          <TableHead>Property Address</TableHead>
          <TableHead>Tenant Name</TableHead>
          <TableHead>Phone Number</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned Worker</TableHead>
          <TableHead>Claimed Date/Time</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell>
              <Badge className={ticket.categoryColor}>
                {ticket.category}
              </Badge>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{ticket.title}</div>
                <div className="text-sm text-muted-foreground">{ticket.description}</div>
              </div>
            </TableCell>
            <TableCell>{ticket.propertyAddress}</TableCell>
            <TableCell>{ticket.tenantName}</TableCell>
            <TableCell>{ticket.phoneNumber}</TableCell>
            <TableCell>
              <Badge className={ticket.priorityColor}>
                {ticket.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={ticket.statusColor}>
                {ticket.status}
              </Badge>
            </TableCell>
            <TableCell>{ticket.assignedWorker}</TableCell>
            <TableCell>{ticket.claimedDate}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setSelectedTicket(ticket)}>
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                {ticket.actions.includes('claim') && (
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleClaimTicket(ticket.id)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Claim
                  </Button>
                )}
                {ticket.actions.includes('quickAssign') && (
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleQuickAssign(ticket.id)}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Quick Assign
                  </Button>
                )}
                {ticket.actions.includes('assign') && (
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleAssignWorker(ticket.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Assign Worker
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Maintenance Tickets</h1>
          <p className="text-muted-foreground">10 total tickets • 5 active • 2 urgent</p>
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
                <span className="text-sm">Issue Category</span>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Categories">All Categories</SelectItem>
                    <SelectItem value="Heating & Boiler">Heating & Boiler</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="General">General</SelectItem>
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
                    <SelectItem value="All Priorities">All Priorities</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
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
                    <SelectItem value="All Statuses">All Statuses</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Claimed">Claimed</SelectItem>
                    <SelectItem value="In progress">In progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Property Address</span>
                <Input
                  placeholder="Search address..."
                  value={addressFilter}
                  onChange={(e) => setAddressFilter(e.target.value)}
                  className="w-60"
                />
              </div>

              <Button variant="outline" size="sm">
                Clear Filters
              </Button>

              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
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
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              Complete information about this maintenance ticket
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Issue Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Category</Label>
                      <p className="text-sm">{selectedTicket.category}</p>
                    </div>
                    <div>
                      <Label>Title</Label>
                      <p className="text-sm">{selectedTicket.title}</p>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm">{selectedTicket.description}</p>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Badge className={selectedTicket.priorityColor}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Property Address</Label>
                      <p className="text-sm">{selectedTicket.propertyAddress}</p>
                    </div>
                    <div>
                      <Label>Tenant Name</Label>
                      <p className="text-sm">{selectedTicket.tenantName}</p>
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <p className="text-sm">{selectedTicket.phoneNumber}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge className={selectedTicket.statusColor}>
                        {selectedTicket.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos/Videos Section */}
              <div>
                <h3 className="font-semibold mb-4">Photos & Videos</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="font-semibold mb-4">Milestones</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Ticket Reported</p>
                      <p className="text-xs text-muted-foreground">{selectedTicket.claimedDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="font-semibold mb-4">Notes</h3>
                <Textarea
                  placeholder="Add notes about this ticket..."
                  className="min-h-24"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
                {selectedTicket.actions.includes('claim') && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      handleClaimTicket(selectedTicket.id);
                      setSelectedTicket(null);
                    }}
                  >
                    Claim Ticket
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};