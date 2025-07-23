import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar,
  Wrench,
  Phone,
  Mail,
  Star,
  Plus,
  Edit,
  Eye,
  FileText,
  AlertTriangle
} from 'lucide-react';

const TenantProperties = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">My Property</h1>
      <Badge variant="default">Active Lease</Badge>
    </div>

    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Sunset Gardens Apartment
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <MapPin className="h-4 w-4" />
              123 Oak Street, Unit 4B, Downtown District
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Monthly Rent</p>
            <p className="text-2xl font-bold text-primary">$2,400</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Lease End Date</p>
            <p className="text-lg font-semibold">Dec 31, 2024</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Security Deposit</p>
            <p className="text-lg font-semibold">$2,400</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Property Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">Bedrooms</p>
              <p className="text-muted-foreground">2</p>
            </div>
            <div>
              <p className="font-medium">Bathrooms</p>
              <p className="text-muted-foreground">2</p>
            </div>
            <div>
              <p className="font-medium">Square Feet</p>
              <p className="text-muted-foreground">1,200</p>
            </div>
            <div>
              <p className="font-medium">Parking</p>
              <p className="text-muted-foreground">1 Space</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Property Manager</h4>
                <p className="text-sm text-muted-foreground mb-2">Sarah Johnson</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>sarah@propertycare.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Maintenance Team</h4>
                <p className="text-sm text-muted-foreground mb-2">Quick Fix Services</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>(555) 987-6543</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    <span>24/7 Emergency</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AgentProperties = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Managed Properties</h1>
      <div className="flex gap-2">
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Reports
        </Button>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
    </div>

    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All Properties (24)</TabsTrigger>
        <TabsTrigger value="active">Active Issues (5)</TabsTrigger>
        <TabsTrigger value="maintenance">Maintenance Due (3)</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        {[1, 2, 3, 4].map((property) => (
          <Card key={property}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Riverside Apartments - Unit {property}A</h3>
                    <Badge variant={property % 2 === 0 ? "default" : "secondary"}>
                      {property % 2 === 0 ? "Occupied" : "Vacant"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {456 + property} River Road, Suite {property}A
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {property % 2 === 0 ? "2 Tenants" : "Available"}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${2000 + property * 100}/month
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench className="h-4 w-4" />
                      {Math.floor(Math.random() * 5)} Open Issues
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="active" className="space-y-4">
        {[1, 2, 3].map((issue) => (
          <Card key={issue}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h3 className="text-lg font-semibold">Heating System Issue</h3>
                    <Badge variant="destructive">High Priority</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Riverside Apartments - Unit {issue}A
                  </p>
                  <p className="text-sm">
                    Tenant reports heating not working properly in main bedroom.
                  </p>
                </div>
                <Button size="sm">
                  View Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="maintenance" className="space-y-4">
        {[1, 2, 3].map((maintenance) => (
          <Card key={maintenance}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-warning" />
                    <h3 className="text-lg font-semibold">Annual HVAC Service</h3>
                    <Badge variant="outline">Due Soon</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Riverside Apartments - Unit {maintenance}A
                  </p>
                  <p className="text-sm">
                    Scheduled maintenance due within 30 days.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  </div>
);

const LandlordProperties = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Property Portfolio</h1>
      <div className="flex gap-2">
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Portfolio Report
        </Button>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
              <p className="text-3xl font-bold text-primary">12</p>
            </div>
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
              <p className="text-3xl font-bold text-primary">91%</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <p className="text-3xl font-bold text-primary">$28.4K</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
              <p className="text-3xl font-bold text-primary">4.7</p>
            </div>
            <Star className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[
        { name: "Riverside Apartments", units: 8, occupied: 7, revenue: "$16,800" },
        { name: "Downtown Towers", units: 4, occupied: 4, revenue: "$11,600" }
      ].map((property, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {property.name}
              </CardTitle>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
            <CardDescription>
              {property.units} units • {property.occupied}/{property.units} occupied
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Occupancy</span>
                <span>{Math.round((property.occupied / property.units) * 100)}%</span>
              </div>
              <Progress value={(property.occupied / property.units) * 100} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Monthly Revenue</p>
                <p className="text-lg font-semibold text-primary">{property.revenue}</p>
              </div>
              <div>
                <p className="font-medium">Open Issues</p>
                <p className="text-lg font-semibold">{Math.floor(Math.random() * 5) + 1}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const Properties = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'tenant':
      return <TenantProperties />;
    case 'agent':
      return <AgentProperties />;
    case 'landlord':
      return <LandlordProperties />;
    default:
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Properties</h2>
          <p className="text-muted-foreground">Feature coming soon...</p>
        </div>
      );
  }
};