import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  Users, 
  DollarSign, 
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Wrench
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const AgentDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Murat!</h1>
          <p className="text-muted-foreground">Manage maintenance tickets and coordinate with workers</p>
        </div>
        <Button className="bg-gradient-agent hover:opacity-90 text-white border-0">
          <Ticket className="w-4 h-4 mr-2" />
          View All Tickets
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-agent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-agent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agent">47</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-error">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">3</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Tickets</CardTitle>
            <Wrench className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">8</div>
            <p className="text-xs text-muted-foreground">Currently assigned to you</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">94%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-agent" />
              Unassigned Tickets
            </CardTitle>
            <CardDescription>Tickets waiting to be claimed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-error" />
                  </div>
                  <div>
                    <p className="font-medium">Kitchen faucet leaking - Unit 4B</p>
                    <p className="text-sm text-muted-foreground">123 Maple Street • Reported 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Urgent</Badge>
                  <Button size="sm" className="bg-agent hover:bg-agent/90">Claim</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">HVAC not heating properly</p>
                    <p className="text-sm text-muted-foreground">456 Oak Avenue • Reported 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">High</Badge>
                  <Button size="sm" variant="outline">Claim</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="font-medium">Bathroom light replacement</p>
                    <p className="text-sm text-muted-foreground">789 Pine Street • Reported 3 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Medium</Badge>
                  <Button size="sm" variant="outline">Claim</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-agent" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Tickets Completed</span>
                <span className="font-medium">24/30</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Avg Response Time</span>
                <span className="font-medium">2.4 hours</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Customer Rating</span>
                <span className="font-medium">4.8/5.0</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">This Week</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="text-success font-semibold">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>In Progress</span>
                  <span className="text-warning font-semibold">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending</span>
                  <span className="text-error font-semibold">3</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Active Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-agent" />
            My Active Tickets
          </CardTitle>
          <CardDescription>Tickets currently assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Electrical outlet repair - Unit 2A</p>
                  <p className="text-sm text-muted-foreground">Claimed 3 hours ago • Est. completion: Today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">In Progress</Badge>
                <Button size="sm" variant="outline">Update</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">Plumbing inspection</p>
                  <p className="text-sm text-muted-foreground">Completed yesterday • Awaiting landlord approval</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-success text-white">Completed</Badge>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};