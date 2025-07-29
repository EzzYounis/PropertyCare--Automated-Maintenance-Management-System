import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { tenantService } from '@/lib/tenantService';
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
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);

  // Array of random property images categorized by type
  const propertyImages = {
    apartment: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop&crop=center"
    ],
    house: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400&h=300&fit=crop&crop=center"
    ],
    condo: [
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop&crop=center"
    ],
    townhouse: [
      "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1601760562234-9814eea6663a?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1565402170291-8491f14678db?w=400&h=300&fit=crop&crop=center"
    ]
  };

  // Function to get a consistent random image for a property based on type
  const getPropertyImage = (propertyId: string, propertyType: string) => {
    const typeImages = propertyImages[propertyType.toLowerCase() as keyof typeof propertyImages] || propertyImages.apartment;
    
    // Use property ID to generate a consistent hash for image selection
    let hash = 0;
    for (let i = 0; i < propertyId.length; i++) {
      const char = propertyId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const index = Math.abs(hash) % typeImages.length;
    return typeImages[index];
  };

  React.useEffect(() => {
    if (profile?.id) {
      fetchLandlordData();
    }
  }, [profile?.id]);

  const fetchLandlordData = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch all properties and filter by landlord_id
      const allProperties = await tenantService.getProperties();
      const propertiesData = allProperties.filter((p: any) => p.landlord_id === profile.id);
      setProperties(propertiesData);

      // Fetch maintenance requests for landlord's properties
      if (propertiesData.length > 0) {
        // Fetch tenants and maintenance requests using the service
        const [tenantsData, requestsData] = await Promise.all([
          supabase
            .from('profiles' as any)
            .select('*')
            .eq('landlord_id', profile.id)
            .eq('role', 'tenant')
            .then(({ data }) => data || []),
          tenantService.getMaintenanceRequestsForLandlord(profile.id)
        ]);
        
        setTenants(tenantsData);
        setMaintenanceRequests(requestsData);
      }
    } catch (error) {
      console.error('Error fetching landlord data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get maintenance count for a property
  const getMaintenanceCount = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return 0;
    
    // Find tenant for this property
    const tenant = tenants.find((t: any) => t.property_id === propertyId);
    if (!tenant) return 0;
    
    // Count open maintenance requests for this tenant
    return maintenanceRequests.filter((r: any) => 
      r.tenant_id === tenant.id && 
      r.status !== 'completed'
    ).length;
  };

  // Get tenant for a property
  const getTenantForProperty = (propertyId: string) => {
    const tenant = tenants.find((t: any) => t.property_id === propertyId);
    return tenant ? tenant.name : 'Vacant';
  };

  // Get last maintenance date for a property
  const getLastMaintenanceDate = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return 'Never';
    
    const tenant = tenants.find((t: any) => t.property_id === propertyId);
    if (!tenant) return 'Never';
    
    const lastRequest = maintenanceRequests
      .filter((r: any) => r.tenant_id === tenant.id && r.status === 'completed')
      .sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];
    
    return lastRequest ? new Date(lastRequest.completed_at).toLocaleDateString() : 'Never';
  };

  // Get property status based on maintenance and occupancy
  const getPropertyStatus = (propertyId: string) => {
    const openTickets = getMaintenanceCount(propertyId);
    const tenant = getTenantForProperty(propertyId);
    
    if (tenant === 'Vacant') return { status: 'Vacant', color: 'yellow' };
    if (openTickets > 1) return { status: 'Issue Reported', color: 'red' };
    if (openTickets === 1) return { status: 'In Progress', color: 'blue' };
    return { status: 'Active', color: 'green' };
  };

  // Get actual property status from database with proper mapping
  const getActualPropertyStatus = (property: any) => {
    const tenant = getTenantForProperty(property.id);
    
    // Map database status to display status
    if (property.status === 'active') {
      return { status: 'Occupied', color: 'blue' };
    } else if (property.status === 'inactive') {
      return { status: 'Available', color: 'green' };
    } else if (property.status === 'maintenance') {
      return { status: 'Maintenance', color: 'yellow' };
    } else {
      // Fallback to tenant-based status if status is unclear
      return tenant === 'Vacant' ? 
        { status: 'Available', color: 'green' } : 
        { status: 'Occupied', color: 'blue' };
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getTenantForProperty(property.id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const propertyStatus = getActualPropertyStatus(property); // Use actual property status
    const matchesStatus = statusFilter === 'all' || 
                         propertyStatus.status.toLowerCase().includes(statusFilter.toLowerCase());
    
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Properties</h1>
          <p className="text-muted-foreground">
            {properties.length} total properties • {properties.filter(p => getMaintenanceCount(p.id) > 0).length} with issues
          </p>
        </div>
        <Button 
          onClick={fetchLandlordData} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Search className="h-4 w-4" />
          )}
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
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
        {filteredProperties.map((property) => {
          const propertyStatus = getActualPropertyStatus(property); // Use actual property status
          const tenant = getTenantForProperty(property.id);
          const lastMaintenance = getLastMaintenanceDate(property.id);
          const openTickets = getMaintenanceCount(property.id);
          
          return (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              <div className="relative h-48 bg-muted">
                <img 
                  src={getPropertyImage(property.id, property.type)} 
                  alt={property.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute top-3 right-3">
                  <Badge 
                    className={
                      propertyStatus.color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                      propertyStatus.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                      propertyStatus.color === 'red' ? 'bg-red-500 hover:bg-red-600' :
                      propertyStatus.color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' :
                      'bg-gray-500 hover:bg-gray-600'
                    }
                  >
                    {propertyStatus.status}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Property Name & Address */}
                <div>
                  <h3 className="font-semibold text-lg">{property.name}</h3>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                </div>

                {/* Property Type */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{property.type.charAt(0).toUpperCase() + property.type.slice(1)}</span>
                </div>

                {/* Tenant Info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Tenant: {tenant}</span>
                </div>

                {/* Rent Info */}
                {property.rent_per_unit && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Rent: ${property.rent_per_unit}/month</span>
                  </div>
                )}

                {/* Last Maintenance */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last maintenance: {lastMaintenance}</span>
                </div>

                {/* Open Tickets */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wrench className="h-4 w-4" />
                  <span>Open tickets: {openTickets}</span>
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
          );
        })}
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