import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { EnhancedReportIssueDialog } from '@/components/tenant/EnhancedReportIssueDialog';
import { MaintenanceDetail } from '@/components/tenant/MaintenanceDetail';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const priorities = [
  { value: 'urgent', label: 'Urgent', color: 'destructive' },
  { value: 'high', label: 'High', color: 'warning' },
  { value: 'medium', label: 'Medium', color: 'secondary' },
  { value: 'low', label: 'Low', color: 'outline' }
];

const categories = [
  'Plumbing', 'Electrical', 'HVAC', 'Kitchen', 'Bathroom', 'Flooring', 'Windows/Doors', 'General'
];

// Normalize status to 4 main phases for tenant view
const getSimplifiedStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'submitted':
    case 'pending':
      return 'submitted';
    case 'in_progress':
    case 'scheduled':
    case 'quote_provided':
    case 'quoted':
    case 'on_hold':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'in_progress'; // Default any unknown status to in_progress
  }
};

const getSimplifiedStatusDisplay = (status: string) => {
  const simplified = getSimplifiedStatus(status);
  switch (simplified) {
    case 'submitted':
      return 'Submitted';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'In Progress';
  }
};

export const TenantMaintenance = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMaintenanceRequests = async () => {
    try {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setIssues(data || []);
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
  }, [user?.id]);

  const getPriorityBadge = (priority: string) => {
    const config = priorities.find(p => p.value === priority);
    return <Badge variant={config?.color as any}>{config?.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const simplified = getSimplifiedStatus(status);
    switch (simplified) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'in_progress':
        return <Wrench className="w-4 h-4 text-warning" />;
      case 'submitted':
        return <Clock className="w-4 h-4 text-info" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleIssueSubmitted = (newIssue: any) => {
    fetchMaintenanceRequests(); // Refresh the list
  };

  const handleViewDetails = (issue: any) => {
    setSelectedIssue(issue);
    setIsDetailOpen(true);
  };

  const handleDetailUpdate = () => {
    fetchMaintenanceRequests(); // Refresh the list
    setIsDetailOpen(false);
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || getSimplifiedStatus(issue.status) === filterStatus;
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
        
        <Button 
          variant="tenant" 
          size="lg"
          onClick={() => setIsReportDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Report New Issue
        </Button>
      </div>

      {/* Status Overview */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Request Status Overview</CardTitle>
            <CardDescription>Overview of your maintenance requests by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { status: 'submitted', label: 'Submitted', color: 'bg-blue-500' },
                { status: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
                { status: 'completed', label: 'Completed', color: 'bg-green-500' },
                { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
              ].map(({ status, label, color }) => {
                const count = issues.filter(issue => getSimplifiedStatus(issue.status) === status).length;
                
                return (
                  <div
                    key={status}
                    className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      filterStatus === status ? 'ring-2 ring-tenant bg-tenant/5' : ''
                    }`}
                    onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <span className="text-sm font-medium text-muted-foreground">{label}</span>
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tenant mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading maintenance requests...</p>
            </CardContent>
          </Card>
        ) : (
          filteredIssues.map((issue) => (
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
                          <span>Reported: {new Date(issue.created_at).toLocaleDateString()}</span>
                          {issue.room && <span>Room: {issue.room}</span>}
                          {issue.subcategory && <span>Type: {issue.subcategory}</span>}
                          {issue.completed_at && (
                            <span className="text-success">Completed: {new Date(issue.completed_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Badge variant={
                      getSimplifiedStatus(issue.status) === 'completed' ? 'default' : 
                      getSimplifiedStatus(issue.status) === 'cancelled' ? 'destructive' :
                      'secondary'
                    } className="w-fit">
                      {getSimplifiedStatusDisplay(issue.status)}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(issue)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
              <Button variant="tenant" onClick={() => setIsReportDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Report Your First Issue
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Report Issue Dialog */}
      <EnhancedReportIssueDialog 
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onIssueSubmitted={handleIssueSubmitted}
      />

      {/* Maintenance Detail Modal */}
      <MaintenanceDetail
        issue={selectedIssue}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={handleDetailUpdate}
      />
    </div>
  );
};