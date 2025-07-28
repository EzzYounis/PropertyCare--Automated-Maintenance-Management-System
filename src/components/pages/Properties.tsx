import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  AlertTriangle,
  Search,
  Filter,
  User,
  TicketIcon
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

const LandlordProperties = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Sample property data matching the image
  const properties = [
    {
      id: 1,
      address: "123 Oak Street",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
      tenant: "Sarah Johnson",
      lastMaintenance: "1/15/2024",
      openTickets: 0,
      status: "Active",
      statusColor: "green"
    },
    {
      id: 2,
      address: "456 Pine Avenue", 
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      tenant: "Michael Chen",
      lastMaintenance: "1/10/2024",
      openTickets: 1,
      status: "In Progress",
      statusColor: "blue"
    },
    {
      id: 3,
      address: "789 Elm Drive",
      image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop",
      tenant: "Emily Rodriguez", 
      lastMaintenance: "1/14/2024",
      openTickets: 2,
      status: "Issue Reported",
      statusColor: "red"
    },
    {
      id: 4,
      address: "321 Maple Lane",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
      tenant: "David Wilson",
      lastMaintenance: "1/12/2024", 
      openTickets: 0,
      status: "Active",
      statusColor: "green"
    },
    {
      id: 5,
      address: "654 Cedar Court",
      image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=300&fit=crop",
      tenant: "Lisa Thompson",
      lastMaintenance: "1/08/2024",
      openTickets: 1,
      status: "In Progress", 
      statusColor: "blue"
    },
    {
      id: 6,
      address: "987 Birch Road",
      image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400&h=300&fit=crop",
      tenant: "Robert Kim",
      lastMaintenance: "1/16/2024",
      openTickets: 0,
      status: "Active",
      statusColor: "green"
    }
  ];

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.tenant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesType = typeFilter === 'all'; // For now, treating all as same type
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Properties</h1>
          <p className="text-muted-foreground">
            {properties.length} total properties • {properties.filter(p => p.openTickets > 0).length} with issues
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="progress">In Progress</SelectItem>
                  <SelectItem value="issue">Issue Reported</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Property Image */}
            <div className="relative h-48 bg-muted">
              <img 
                src={property.image} 
                alt={property.address}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="absolute top-3 right-3">
                <Badge 
                  className={
                    property.statusColor === 'green' ? 'bg-green-500 hover:bg-green-600' :
                    property.statusColor === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                    property.statusColor === 'red' ? 'bg-red-500 hover:bg-red-600' :
                    'bg-gray-500 hover:bg-gray-600'
                  }
                >
                  {property.status}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Address */}
              <div>
                <h3 className="font-semibold text-lg">{property.address}</h3>
              </div>

              {/* Tenant Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Tenant: {property.tenant}</span>
              </div>

              {/* Last Maintenance */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last maintenance: {property.lastMaintenance}</span>
              </div>

              {/* Open Tickets */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="h-4 w-4" />
                <span>Open tickets: {property.openTickets}</span>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => navigate(`/property/${property.id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? "Try adjusting your search or filters"
              : "No properties available"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export const Properties = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  switch (profile.role) {
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