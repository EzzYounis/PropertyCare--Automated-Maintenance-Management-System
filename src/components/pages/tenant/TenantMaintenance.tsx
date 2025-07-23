import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wrench, 
  Plus, 
  Upload, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const priorities = [
  { value: 'urgent', label: 'Urgent', color: 'destructive' },
  { value: 'high', label: 'High', color: 'warning' },
  { value: 'medium', label: 'Medium', color: 'secondary' },
  { value: 'low', label: 'Low', color: 'outline' }
];

const categories = [
  'Plumbing', 'Electrical', 'HVAC', 'Kitchen', 'Bathroom', 'Flooring', 'Windows/Doors', 'General'
];

const mockIssues = [
  {
    id: 1,
    title: 'Kitchen faucet leaking',
    category: 'Plumbing',
    priority: 'urgent',
    status: 'In Progress',
    reportedDate: '2024-01-15',
    description: 'Water is constantly dripping from the kitchen faucet, causing water waste.',
    assignedTo: 'John Smith',
    estimatedCompletion: '2024-01-16'
  },
  {
    id: 2,
    title: 'Bathroom light flickering',
    category: 'Electrical',
    priority: 'medium',
    status: 'Scheduled',
    reportedDate: '2024-01-10',
    description: 'The main bathroom light keeps flickering intermittently.',
    assignedTo: 'Mike Johnson',
    estimatedCompletion: '2024-01-18'
  },
  {
    id: 3,
    title: 'HVAC not heating properly',
    category: 'HVAC',
    priority: 'high',
    status: 'Completed',
    reportedDate: '2024-01-08',
    description: 'Heating system not maintaining consistent temperature.',
    assignedTo: 'Sarah Wilson',
    completedDate: '2024-01-12'
  }
];

export const TenantMaintenance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newIssue, setNewIssue] = useState({
    title: '',
    category: '',
    priority: 'medium',
    description: '',
    location: '',
    availableTime: ''
  });

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newIssue.title || !newIssue.category || !newIssue.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Issue Reported",
      description: "Your maintenance request has been submitted successfully.",
    });

    setNewIssue({
      title: '',
      category: '',
      priority: 'medium',
      description: '',
      location: '',
      availableTime: ''
    });
    setIsDialogOpen(false);
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorities.find(p => p.value === priority);
    return <Badge variant={config?.color as any}>{config?.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'in progress':
        return <Wrench className="w-4 h-4 text-warning" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-info" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const filteredIssues = mockIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || issue.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Maintenance Requests</h1>
          <p className="text-muted-foreground">Report issues and track repair progress</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="tenant" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Report New Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Maintenance Issue</DialogTitle>
              <DialogDescription>
                Provide details about the maintenance issue you're experiencing
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitIssue} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newIssue.category} onValueChange={(value) => setNewIssue({...newIssue, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newIssue.priority} onValueChange={(value) => setNewIssue({...newIssue, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location/Room</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Kitchen, Bathroom, Living Room"
                    value={newIssue.location}
                    onChange={(e) => setNewIssue({...newIssue, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the issue"
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableTime">Preferred Time for Repair</Label>
                <Input
                  id="availableTime"
                  placeholder="e.g., Weekdays 9AM-5PM, Weekends anytime"
                  value={newIssue.availableTime}
                  onChange={(e) => setNewIssue({...newIssue, availableTime: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Photos (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag photos here or click to browse
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="tenant">
                  Submit Request
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <Card key={issue.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-tenant/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(issue.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{issue.title}</h3>
                        <Badge variant="outline">{issue.category}</Badge>
                        {getPriorityBadge(issue.priority)}
                      </div>
                      <p className="text-muted-foreground mb-3">{issue.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Reported: {new Date(issue.reportedDate).toLocaleDateString()}</span>
                        {issue.assignedTo && <span>Assigned to: {issue.assignedTo}</span>}
                        {issue.estimatedCompletion && (
                          <span>Est. completion: {new Date(issue.estimatedCompletion).toLocaleDateString()}</span>
                        )}
                        {issue.completedDate && (
                          <span className="text-success">Completed: {new Date(issue.completedDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Badge variant={issue.status === 'Completed' ? 'default' : 'secondary'} className="w-fit">
                    {issue.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No maintenance requests found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'You haven\'t submitted any maintenance requests yet'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button variant="tenant" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Report Your First Issue
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};