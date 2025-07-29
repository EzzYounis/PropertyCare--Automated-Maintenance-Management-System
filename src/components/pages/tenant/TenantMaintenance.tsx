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
        
        <Button 
          variant="tenant" 
          size="lg"
          onClick={() => setIsReportDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Report New Issue
        </Button>
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
                    <Badge variant={issue.status === 'completed' ? 'default' : 'secondary'} className="w-fit">
                      {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
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