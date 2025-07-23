import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  DollarSign, 
  Wrench, 
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const LandlordDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Ezzaldeen!</h1>
          <p className="text-muted-foreground">Monitor your property portfolio and maintenance operations</p>
        </div>
        <Button className="bg-gradient-landlord hover:opacity-90 text-white border-0">
          <BarChart3 className="w-4 h-4 mr-2" />
          View Analytics
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-landlord">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-landlord" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-landlord">12</div>
            <p className="text-xs text-muted-foreground">Across 3 locations</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <Wrench className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">5</div>
            <p className="text-xs text-muted-foreground">2 awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">$22,200</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-error">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
            <AlertTriangle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">$3,450</div>
            <p className="text-xs text-muted-foreground">3 overdue invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-landlord" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Maintenance requests requiring your approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-error" />
                  </div>
                  <div>
                    <p className="font-medium">HVAC System Replacement</p>
                    <p className="text-sm text-muted-foreground">123 Maple Street, Unit 4B • Est. Cost: $3,200</p>
                    <p className="text-xs text-muted-foreground">Submitted by Murat • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Urgent</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-error border-error">Deny</Button>
                    <Button size="sm" className="bg-landlord hover:bg-landlord/90">Approve</Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Kitchen Cabinet Repair</p>
                    <p className="text-sm text-muted-foreground">456 Oak Avenue • Est. Cost: $850</p>
                    <p className="text-xs text-muted-foreground">Submitted by Murat • 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Medium</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">Deny</Button>
                    <Button size="sm" className="bg-landlord hover:bg-landlord/90">Approve</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-landlord" />
              Portfolio Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Occupancy Rate</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">11 of 12 units occupied</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Maintenance Budget</span>
                <span className="font-medium">68% used</span>
              </div>
              <Progress value={68} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">$6,800 of $10,000</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-3">Properties by Status</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Excellent</span>
                  <span className="text-success font-semibold">7</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Good</span>
                  <span className="text-info font-semibold">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Needs Attention</span>
                  <span className="text-warning font-semibold">2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-landlord" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates across your property portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">Plumbing repair completed at 789 Pine Street</p>
                  <p className="text-sm text-muted-foreground">Cost: $420 • Completed by John Smith • 2 hours ago</p>
                </div>
              </div>
              <Badge className="bg-success text-white">Completed</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="font-medium">Rent payment received from Unit 3A</p>
                  <p className="text-sm text-muted-foreground">Amount: $1,850 • 456 Oak Avenue • 1 day ago</p>
                </div>
              </div>
              <Badge variant="outline">Payment</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">New tenant application for Unit 1C</p>
                  <p className="text-sm text-muted-foreground">123 Maple Street • Background check pending • 2 days ago</p>
                </div>
              </div>
              <Badge variant="secondary">Application</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};