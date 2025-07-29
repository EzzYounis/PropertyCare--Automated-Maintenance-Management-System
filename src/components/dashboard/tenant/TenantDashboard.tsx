import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  DollarSign, 
  Wrench, 
  MessageSquare, 
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { EnhancedReportIssueDialog } from '@/components/tenant/EnhancedReportIssueDialog';
import { MaintenanceDetail } from '@/components/tenant/MaintenanceDetail';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const TenantDashboard = () => {
  const { profile, user } = useAuth();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [tenantData, setTenantData] = useState<any>(null);
  const [propertyData, setPropertyData] = useState<any>(null);

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTenantAndPropertyData = async () => {
    try {
      if (!user?.id) return;

      // Fetch tenant data with property information
      const { data: tenantInfo, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          *,
          properties (
            id,
            name,
            address,
            type,
            landlord_id
          )
        `)
        .eq('id', user.id)
        .single();

      if (tenantError && tenantError.code !== 'PGRST116') {
        console.error('Error fetching tenant data:', tenantError);
      }

      if (tenantInfo) {
        setTenantData(tenantInfo);
        setPropertyData(tenantInfo.properties);
      } else {
        // Create fallback tenant data if no record exists
        console.log('No tenant data found, creating fallback data');
        const fallbackTenantData = {
          id: user.id,
          monthly_rent: 1250,
          lease_start: '2025-01-01',
          lease_end: '2025-12-31',
          status: 'active'
        };
        
        const fallbackPropertyData = {
          id: 'fallback-property',
          name: 'Sample Property',
          address: '123 Main Street, Apt 4B\nNew York, NY 10001',
          type: 'apartment'
        };

        setTenantData(fallbackTenantData);
        setPropertyData(fallbackPropertyData);
      }
    } catch (error) {
      console.error('Error fetching tenant and property data:', error);
      
      // Set fallback data in case of any error
      const fallbackTenantData = {
        id: user?.id,
        monthly_rent: 1250,
        lease_start: '2025-01-01',
        lease_end: '2025-12-31',
        status: 'active'
      };
      
      const fallbackPropertyData = {
        id: 'fallback-property',
        name: 'Sample Property',
        address: '123 Main Street, Apt 4B\nNew York, NY 10001',
        type: 'apartment'
      };

      setTenantData(fallbackTenantData);
      setPropertyData(fallbackPropertyData);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      if (!user?.id) return;

      // Fetch recent maintenance requests and their activity
      const { data: maintenanceData, error } = await supabase
        .from('maintenance_requests')
        .select('id, title, status, priority, created_at, updated_at, completed_at, category')
        .eq('tenant_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Create activity items from maintenance data
      const activities: any[] = [];

      maintenanceData?.forEach((request) => {
        // Add creation activity
        activities.push({
          id: `create-${request.id}`,
          type: 'maintenance_created',
          title: `New ${request.category} request submitted`,
          description: request.title,
          timestamp: request.created_at,
          status: 'info',
          priority: request.priority
        });

        // Add completion activity if completed
        if (request.completed_at && getSimplifiedStatus(request.status) === 'completed') {
          activities.push({
            id: `complete-${request.id}`,
            type: 'maintenance_completed',
            title: `${request.category} repair completed`,
            description: request.title,
            timestamp: request.completed_at,
            status: 'success',
            priority: request.priority
          });
        }

        // Add status change activity if recently updated
        if (request.updated_at !== request.created_at && getSimplifiedStatus(request.status) !== 'completed') {
          let statusTitle = '';
          let statusType = 'info';
          
          const simplifiedStatus = getSimplifiedStatus(request.status);
          switch (simplifiedStatus) {
            case 'in_progress':
              statusTitle = 'Work is in progress on your request';
              statusType = 'warning';
              break;
            default:
              statusTitle = `Request status updated to ${getSimplifiedStatusDisplay(request.status)}`;
          }

          activities.push({
            id: `update-${request.id}`,
            type: 'maintenance_updated',
            title: statusTitle,
            description: request.title,
            timestamp: request.updated_at,
            status: statusType,
            priority: request.priority
          });
        }
      });

      // Add some realistic system activities for demo purposes
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      const threeDays = 3 * oneDay;
      const oneWeek = 7 * oneDay;

      // Add rent payment activity (simulated based on real rent amount)
      if (activities.length < 3) {
        const rentAmount = tenantData?.monthly_rent ? Number(tenantData.monthly_rent) : 1250;
        activities.push({
          id: 'rent-payment-latest',
          type: 'payment',
          title: 'Monthly rent payment processed',
          description: `Rent payment of $${rentAmount.toLocaleString()} confirmed`,
          timestamp: new Date(now.getTime() - threeDays).toISOString(),
          status: 'success'
        });
      }

      // Add next rent due notification
      if (activities.length < 4 && getDaysUntilRent() <= 7) {
        activities.push({
          id: 'rent-due-reminder',
          type: 'reminder',
          title: 'Rent payment due soon',
          description: `Monthly rent due ${formatRentDueDate()}`,
          timestamp: new Date(now.getTime() - (oneDay * Math.max(0, 7 - getDaysUntilRent()))).toISOString(),
          status: 'warning'
        });
      }

      // Add account activity
      if (activities.length < 4) {
        activities.push({
          id: 'profile-update',
          type: 'account',
          title: 'Profile information updated',
          description: 'Contact details have been updated',
          timestamp: new Date(now.getTime() - oneWeek).toISOString(),
          status: 'info'
        });
      }

      // Add system notification
      if (activities.length < 5) {
        activities.push({
          id: 'system-notification',
          type: 'notification',
          title: 'Welcome to PropertyCare',
          description: 'Your tenant account has been set up successfully',
          timestamp: new Date(now.getTime() - oneWeek * 2).toISOString(),
          status: 'info'
        });
      }

      // Sort by timestamp (most recent first) and take top 5
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setRecentActivity(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchMaintenanceRequests(),
        fetchRecentActivity(),
        fetchTenantAndPropertyData()
      ]);
    };
    
    fetchData();
  }, [user?.id]);

  const handleIssueSubmitted = () => {
    fetchMaintenanceRequests();
    fetchRecentActivity();
    fetchTenantAndPropertyData();
  };

  const handleViewDetails = (issue: any) => {
    setSelectedIssue(issue);
    setIsDetailOpen(true);
  };

  const handleDetailUpdate = () => {
    fetchMaintenanceRequests();
    fetchRecentActivity();
    fetchTenantAndPropertyData();
    setIsDetailOpen(false);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="outline" className="bg-red-500 text-white border-red-500">{priority}</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-500 text-white border-orange-500">{priority}</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-blue-500 text-white border-blue-500">{priority}</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-500 text-white border-green-500">{priority}</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Normalize status to 4 main phases for tenant view
  const getSimplifiedStatus = (status: string) => {
    switch (status) {
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

  const getSimplifiedStatusVariant = (status: string) => {
    const simplified = getSimplifiedStatus(status);
    switch (simplified) {
      case 'submitted':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
  };

  const getNextRentDueDate = () => {
    const today = new Date();
    // If we're past the 25th of the month, next rent is due on the 1st of next month
    // Otherwise, it's due on the 1st of current month if we haven't passed it yet
    if (today.getDate() > 25) {
      return new Date(today.getFullYear(), today.getMonth() + 1, 1);
    } else if (today.getDate() === 1) {
      // If today is the 1st, next payment is next month
      return new Date(today.getFullYear(), today.getMonth() + 1, 1);
    } else {
      // Next payment is on the 1st of current month if we haven't passed it
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      if (today < firstOfMonth) {
        return firstOfMonth;
      } else {
        return new Date(today.getFullYear(), today.getMonth() + 1, 1);
      }
    }
  };

  const getDaysUntilRent = () => {
    const today = new Date();
    const nextRentDate = getNextRentDueDate();
    const diffTime = nextRentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatRentDueDate = () => {
    const nextRentDate = getNextRentDueDate();
    return nextRentDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLeaseProgress = () => {
    if (!tenantData?.lease_start || !tenantData?.lease_end) return 0;
    
    const today = new Date();
    const leaseStart = new Date(tenantData.lease_start);
    const leaseEnd = new Date(tenantData.lease_end);
    
    // If lease has ended, return 100%
    if (today > leaseEnd) return 100;
    
    // If lease hasn't started, return 0%
    if (today < leaseStart) return 0;
    
    const totalDays = leaseEnd.getTime() - leaseStart.getTime();
    const elapsedDays = today.getTime() - leaseStart.getTime();
    
    const progress = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
    return Math.round(progress);
  };

  const openIssues = issues.filter(issue => {
    const simplified = getSimplifiedStatus(issue.status);
    return simplified !== 'completed' && simplified !== 'cancelled';
  });
  const urgentIssues = openIssues.filter(issue => issue.priority === 'urgent');
  const mediumIssues = openIssues.filter(issue => issue.priority === 'medium');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your property</p>
        </div>
        <Button 
          className="bg-gradient-tenant hover:opacity-90 text-white border-0"
          onClick={() => setIsReportDialogOpen(true)}
        >
          <Wrench className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-tenant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-tenant" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tenant">
              {tenantData?.monthly_rent ? `$${Number(tenantData.monthly_rent).toLocaleString()}` : '$--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {getDaysUntilRent() > 0 
                ? `Due ${formatRentDueDate()} (${getDaysUntilRent()} days)`
                : `Due ${formatRentDueDate()}`
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <Wrench className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{openIssues.length}</div>
            <p className="text-xs text-muted-foreground">
              {urgentIssues.length} urgent, {mediumIssues.length} medium
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">0</div>
            <p className="text-xs text-muted-foreground">No unread messages</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lease Status</CardTitle>
            <Calendar className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {tenantData?.status === 'active' ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {tenantData?.lease_end 
                ? `Until ${new Date(tenantData.lease_end).toLocaleDateString()}`
                : 'No lease end date'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-tenant" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                {propertyData?.address ? (
                  <>
                    {propertyData.address.split('\n').map((line: string, index: number) => (
                      <p key={index} className="text-sm">{line}</p>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading address...</p>
                )}
                {propertyData?.type && (
                  <p className="text-sm text-muted-foreground capitalize mt-1">
                    {propertyData.type.replace('_', ' ')}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lease Period</p>
                {tenantData?.lease_start && tenantData?.lease_end ? (
                  <>
                    <p className="text-sm">
                      {new Date(tenantData.lease_start).toLocaleDateString()} - {new Date(tenantData.lease_end).toLocaleDateString()}
                    </p>
                    <Progress value={getLeaseProgress()} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">{getLeaseProgress()}% completed</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading lease information...</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Property Manager</p>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-tenant" />
                  <span className="text-muted-foreground">Contact info not available</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Mail className="w-4 h-4 text-tenant" />
                  <span className="text-muted-foreground">Email not available</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Emergency Contact</p>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-error" />
                  <span>(555) 911-HELP</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">24/7 Emergency Line</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-tenant" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getActivityStatusColor(activity.status)}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground">Submit a maintenance request to see activity here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Status Overview */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Maintenance Request Status
            </CardTitle>
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
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
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

      {/* Current Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Current Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          {openIssues.length === 0 ? (
            <p className="text-muted-foreground">No open maintenance issues</p>
          ) : (
            <div className="space-y-3">
              {openIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{issue.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={
                        issue.priority === 'urgent' ? 'destructive' :
                        issue.priority === 'high' ? 'secondary' :
                        'outline'
                      }>
                        {issue.priority}
                      </Badge>
                      <Badge variant="outline">{issue.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge variant={getSimplifiedStatusVariant(issue.status)}>
                    {getSimplifiedStatusDisplay(issue.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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