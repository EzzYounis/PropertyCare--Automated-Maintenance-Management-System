import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, 
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
  TrendingUp,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const statusOptions = [
  { value: 'all', label: 'All Status' },
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

export const LandlordMaintenance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [approvalForm, setApprovalForm] = useState({
    approved: '',
    notes: '',
    maxBudget: ''
  });
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMaintenanceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRequests(data || []);
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
      case 'submitted': return 'text-warning';
      case 'in_progress': return 'text-landlord';
      case 'completed': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Wrench className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          status: 'in_progress',
          landlord_notes: approvalForm.notes
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Approved",
        description: "Maintenance request has been approved and is now in progress.",
      });
      
      fetchMaintenanceRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive"
      });
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(request => request.status === 'submitted').length;
  const inProgressRequests = requests.filter(request => request.status === 'in_progress').length;
  const completedRequests = requests.filter(request => request.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Property Maintenance</h1>
          <p className="text-muted-foreground">Review and approve maintenance requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Request
          </Button>
          <Button variant="landlord">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-landlord">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-landlord" />
              <div>
                <p className="text-2xl font-bold">{totalRequests}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{pendingRequests}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-info">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-info" />
              <div>
                <p className="text-2xl font-bold">{inProgressRequests}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{completedRequests}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
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
                  placeholder="Search maintenance requests..."
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

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-landlord mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading maintenance requests...</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{request.title}</h3>
                          <Badge variant={getPriorityColor(request.priority)}>
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                          </Badge>
                          <Badge variant="outline">{request.category}</Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                          <p><strong>Reported:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
                          {request.room && <p><strong>Room:</strong> {request.room}</p>}
                          {request.subcategory && <p><strong>Type:</strong> {request.subcategory}</p>}
                          {request.estimated_cost && <p><strong>Estimated Cost:</strong> ${request.estimated_cost}</p>}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{request.description}</p>
                        
                        {request.quick_fixes && request.quick_fixes.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Quick fixes attempted:</p>
                            <div className="flex flex-wrap gap-2">
                              {request.quick_fixes.map((fix: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {fix}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Badge 
                      variant={request.status === 'completed' ? 'default' : 'secondary'}
                      className="w-fit"
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                    
                    <div className="flex gap-2">
                      {request.status === 'submitted' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="landlord" 
                              size="sm"
                              onClick={() => setSelectedRequest(request.id)}
                            >
                              Review & Approve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Review Maintenance Request</DialogTitle>
                              <DialogDescription>
                                Review and approve or modify this maintenance request
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">{request.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  <span>Category: {request.category}</span>
                                  <span>Priority: {request.priority}</span>
                                  {request.room && <span>Room: {request.room}</span>}
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="approval-notes">Approval Notes</Label>
                                <Textarea
                                  id="approval-notes"
                                  placeholder="Add any notes or instructions for the maintenance team..."
                                  value={approvalForm.notes}
                                  onChange={(e) => setApprovalForm({...approvalForm, notes: e.target.value})}
                                  rows={3}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="max-budget">Maximum Budget ($)</Label>
                                <Input
                                  id="max-budget"
                                  type="number"
                                  placeholder="Set budget limit"
                                  value={approvalForm.maxBudget}
                                  onChange={(e) => setApprovalForm({...approvalForm, maxBudget: e.target.value})}
                                />
                              </div>
                              
                              <div className="flex gap-3 pt-4">
                                <Button variant="outline">Deny Request</Button>
                                <Button 
                                  variant="landlord" 
                                  onClick={() => handleApproveRequest(request.id)}
                                >
                                  Approve Request
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
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

      {filteredRequests.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No maintenance requests found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No maintenance requests have been submitted yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};