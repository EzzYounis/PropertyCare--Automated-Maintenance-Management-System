import React, { useState } from 'react';
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
  CheckCircle,
  Clock
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { EnhancedReportIssueDialog } from '@/components/tenant/EnhancedReportIssueDialog';

export const TenantDashboard = () => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Furkan!</h1>
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
            <div className="text-2xl font-bold text-tenant">$1,850</div>
            <p className="text-xs text-muted-foreground">Due Jan 1st, 2024</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <Wrench className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">2</div>
            <p className="text-xs text-muted-foreground">1 urgent, 1 medium</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">3</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Visit</CardTitle>
            <Calendar className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Dec 28</div>
            <p className="text-xs text-muted-foreground">Maintenance check</p>
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
                <p className="text-sm">123 Maple Street, Apt 4B</p>
                <p className="text-sm">New York, NY 10001</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lease Period</p>
                <p className="text-sm">Jan 1, 2023 - Dec 31, 2024</p>
                <Progress value={65} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">65% completed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Property Manager</p>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-tenant" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Mail className="w-4 h-4 text-tenant" />
                  <span>manager@propertycare.com</span>
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
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Plumbing repair completed</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New message from agent</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-info rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Rent payment confirmed</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Current Maintenance Issues
          </CardTitle>
          <CardDescription>Track the status of your reported issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-error" />
                </div>
                <div>
                  <p className="font-medium">Kitchen faucet leaking</p>
                  <p className="text-sm text-muted-foreground">Reported 2 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Urgent</Badge>
                <Badge variant="outline">In Progress</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Bathroom light flickering</p>
                  <p className="text-sm text-muted-foreground">Reported 1 week ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Medium</Badge>
                <Badge variant="outline">Scheduled</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Report Issue Dialog */}
      <EnhancedReportIssueDialog 
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
      />
    </div>
  );
};