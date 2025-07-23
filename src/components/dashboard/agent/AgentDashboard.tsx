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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details - #{selectedTicket?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Issue Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Issue Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Title:</Label>
                      <p className="text-sm mt-1">{selectedTicket.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description:</Label>
                      <p className="text-sm mt-1">{selectedTicket.description}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <Label className="text-sm font-medium">Priority:</Label>
                        <Badge className={`mt-1 ${selectedTicket.priorityColor}`}>
                          {selectedTicket.priority} Priority
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status:</Label>
                        <Badge className={`mt-1 ${selectedTicket.statusColor}`}>
                          {selectedTicket.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Tenant:</Label>
                      <p className="text-sm mt-1">{selectedTicket.tenantName}</p>
                      <p className="text-sm text-muted-foreground">📞 {selectedTicket.phoneNumber}</p>
                      <p className="text-sm text-muted-foreground">✉️ sarah.johnson@email.com</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Landlord:</Label>
                      <p className="text-sm mt-1">Michael Brown</p>
                      <p className="text-sm text-muted-foreground">📞 +44 7700 987654</p>
                      <p className="text-sm text-muted-foreground">✉️ michael.brown@email.com</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Property:</Label>
                      <p className="text-sm mt-1">📍 {selectedTicket.propertyAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Progress Timeline */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Progress Timeline</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">AI Prediction</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Estimated Cost</Label>
                        <p className="text-lg font-semibold">£450.00-650.00</p>
                      </div>
                      <div>
                        <Label className="text-sm">Estimated Time</Label>
                        <p className="text-lg font-semibold">2-4 hours</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Worker Quote & Approval (for assigned tickets) */}
                {selectedTicket.status !== 'Open' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Worker Quote & Approval</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Worker Quote - Cost</Label>
                          <p className="text-lg font-semibold">£75.00</p>
                        </div>
                        <div>
                          <Label className="text-sm">Worker Quote - Time</Label>
                          <p className="text-lg font-semibold">0 hours 45 min</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Quote submitted 34 minutes ago</p>
                      
                      <div>
                        <Label className="text-sm">Landlord Approval:</Label>
                        <Badge className="ml-2 bg-green-100 text-green-700">✓ Approved</Badge>
                        <p className="text-sm text-muted-foreground mt-1">Approved 30 minutes ago</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Actions</h3>
                  <Button variant="outline" className="w-full mb-3">
                    💬 Message Tenant
                  </Button>
                </div>

                {/* Internal Notes */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Internal Notes</h3>
                  <Textarea
                    placeholder="Add internal note..."
                    className="min-h-24 mb-3"
                  />
                  <Button variant="outline" size="sm">
                    + Add Note
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};