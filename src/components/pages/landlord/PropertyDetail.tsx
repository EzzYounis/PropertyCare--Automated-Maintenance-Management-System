import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Wrench,
  FileText,
  Home,
  Building2,
  MapPin,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { tenantService, Property, TenantProfile, LandlordProfile, MaintenanceRequest } from '@/lib/tenantService';

interface PropertyWithDetails extends Property {
  landlord_name?: string;
  landlord_email?: string;
  landlord_phone?: string;
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
}

export const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<PropertyWithDetails | null>(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPropertyData(id);
    }
  }, [id]);

  const loadPropertyData = async (propertyId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [properties, tenants, landlords, maintenance] = await Promise.all([
        tenantService.getProperties(),
        tenantService.getTenants(),
        tenantService.getLandlords(),
        tenantService.getMaintenanceRequestsForProperty(propertyId)
      ]);

      // Find the specific property
      const foundProperty = properties.find(p => p.id === propertyId);
      
      if (!foundProperty) {
        setError('Property not found');
        return;
      }

      // Find associated landlord and tenant
      const landlord = landlords.find(l => l.id === foundProperty.landlord_id);
      const tenant = tenants.find(t => t.property_id === foundProperty.id);

      // Map database status to display status
      let displayStatus = foundProperty.status;
      if (foundProperty.status === 'active') {
        displayStatus = tenant ? 'occupied' : 'available';
      } else if (foundProperty.status === 'inactive') {
        displayStatus = 'available';
      }

      // Enhance property with additional details
      const enhancedProperty: PropertyWithDetails = {
        ...foundProperty,
        status: displayStatus, // Use mapped status for display
        landlord_name: landlord?.name,
        landlord_email: landlord?.email,
        landlord_phone: landlord?.phone,
        tenant_name: tenant?.name,
        tenant_email: tenant?.email,
        tenant_phone: tenant?.phone,
      };

      setProperty(enhancedProperty);
      setMaintenanceRequests(maintenance);
    } catch (error) {
      console.error('Error loading property data:', error);
      setError('Failed to load property data');
      toast({
        title: 'Error',
        description: 'Failed to load property data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'occupied':
      case 'active': // Map database 'active' to 'occupied' display
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Occupied</Badge>;
      case 'available':
      case 'inactive': // Map database 'inactive' to 'available' display
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Available</Badge>;
      case 'maintenance':
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-200">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'apartment':
        return <Building2 className="w-5 h-5" />;
      case 'house':
        return <Home className="w-5 h-5" />;
      case 'condo':
        return <Building2 className="w-5 h-5" />;
      case 'townhouse':
        return <Home className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  // Calculate maintenance statistics
  const maintenanceStats = {
    total: maintenanceRequests.length,
    pending: maintenanceRequests.filter(r => r.status === 'pending' || r.status === 'submitted').length,
    inProgress: maintenanceRequests.filter(r => r.status === 'in_progress' || r.status === 'assigned').length,
    completed: maintenanceRequests.filter(r => r.status === 'completed').length,
    totalCost: maintenanceRequests.reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost || 0), 0),
    avgCost: maintenanceRequests.length > 0 
      ? maintenanceRequests.reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost || 0), 0) / maintenanceRequests.length 
      : 0,
    highPriority: maintenanceRequests.filter(r => r.priority === 'high' || r.priority === 'urgent').length,
    recent: maintenanceRequests.filter(r => {
      const requestDate = new Date(r.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return requestDate >= thirtyDaysAgo;
    }).length,
  };

  const getMaintenanceStatusBadge = (status: string, size: 'sm' | 'md' = 'md') => {
    const baseClasses = size === 'sm' ? 'text-xs px-2 py-1' : '';
    switch (status.toLowerCase()) {
      case 'pending':
      case 'submitted':
        return <Badge variant="outline" className={`bg-yellow-50 text-yellow-700 border-yellow-200 ${baseClasses}`}>Pending</Badge>;
      case 'in_progress':
      case 'assigned':
        return <Badge variant="outline" className={`bg-blue-50 text-blue-700 border-blue-200 ${baseClasses}`}>In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className={`bg-green-50 text-green-700 border-green-200 ${baseClasses}`}>Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className={`bg-red-50 text-red-700 border-red-200 ${baseClasses}`}>Cancelled</Badge>;
      default:
        return <Badge variant="outline" className={baseClasses}>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Property Not Found</h3>
              <p className="text-muted-foreground mb-4">
                {error || 'The requested property could not be found.'}
              </p>
              <Button onClick={() => navigate('/agent-properties')}>
                Back to Properties
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/agent-properties')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Button>
      </div>

      {/* Property Title and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getPropertyTypeIcon(property.type)}
          <div>
            <h1 className="text-3xl font-bold">{property.name || property.address}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {property.address}
            </p>
            <p className="text-sm text-muted-foreground">
              Property Type: {property.type}
              {property.units && ` | Units: ${property.units}`}
              {property.rent_per_unit && ` | Rent: $${property.rent_per_unit}/unit`}
            </p>
          </div>
        </div>
        {getStatusBadge(property.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property Details
              </CardTitle>
              <CardDescription>
                Comprehensive property information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Property Name</label>
                  <p className="text-lg font-semibold">{property.name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                  <p className="text-lg font-semibold">{property.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(property.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Property ID</label>
                  <p className="text-lg font-semibold">{property.short_id || property.id}</p>
                </div>
                {property.units && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Number of Units</label>
                    <p className="text-lg font-semibold">{property.units}</p>
                  </div>
                )}
                {property.rent_per_unit && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rent per Unit</label>
                    <p className="text-lg font-semibold">${property.rent_per_unit}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Maintenance Overview
              </CardTitle>
              <CardDescription>
                Maintenance tracking and statistics for this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Maintenance Requests</h3>
                  <p>This property has no maintenance requests yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border">
                      <div className="flex items-center justify-center mb-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{maintenanceStats.total}</p>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">{maintenanceStats.pending}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg border">
                      <div className="flex items-center justify-center mb-2">
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{maintenanceStats.inProgress}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">{maintenanceStats.completed}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>

                  {/* Cost Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg border">
                      <div className="flex items-center justify-center mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-xl font-bold text-green-600">${maintenanceStats.totalCost.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg border">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-xl font-bold text-purple-600">${maintenanceStats.avgCost.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Avg Cost</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border">
                      <div className="flex items-center justify-center mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-xl font-bold text-red-600">{maintenanceStats.highPriority}</p>
                      <p className="text-sm text-muted-foreground">High Priority</p>
                    </div>
                  </div>

                  {/* Recent Requests */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Recent Requests ({maintenanceStats.recent} in last 30 days)
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {maintenanceRequests.slice(0, 5).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{request.title}</p>
                            <p className="text-xs text-muted-foreground">{request.category}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getMaintenanceStatusBadge(request.status, 'sm')}
                              {getPriorityBadge(request.priority)}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {request.actual_cost 
                                ? `$${request.actual_cost.toFixed(2)}` 
                                : request.estimated_cost 
                                  ? `~$${request.estimated_cost.toFixed(2)}` 
                                  : 'N/A'
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {maintenanceRequests.length > 5 && (
                      <div className="mt-3 text-center">
                        <Button variant="outline" size="sm">
                          View All Requests ({maintenanceRequests.length})
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Property & Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Details */}
              <div>
                <h4 className="font-medium mb-2">Property Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Status: {getStatusBadge(property.status)}</span>
                  </div>
                </div>
              </div>

              {/* Landlord Information */}
              {property.landlord_name && (
                <div>
                  <h4 className="font-medium mb-2">Landlord Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{property.landlord_name}</span>
                    </div>
                    {property.landlord_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{property.landlord_phone}</span>
                      </div>
                    )}
                    {property.landlord_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{property.landlord_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tenant Information */}
              {property.tenant_name ? (
                <div>
                  <h4 className="font-medium mb-2">Current Tenant</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{property.tenant_name}</span>
                    </div>
                    {property.tenant_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{property.tenant_phone}</span>
                      </div>
                    )}
                    {property.tenant_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{property.tenant_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium mb-2">Tenant Status</h4>
                  <p className="text-sm text-muted-foreground">No tenant assigned</p>
                </div>
              )}

              {/* Property Dates */}
              <div>
                <h4 className="font-medium mb-2">Property Records</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Created: {new Date(property.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Updated: {new Date(property.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
