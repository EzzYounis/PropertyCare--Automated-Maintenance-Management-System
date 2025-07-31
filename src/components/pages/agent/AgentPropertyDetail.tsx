import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Crown,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Settings,
  Camera,
  UserPlus
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
  photos?: string[];
}

export const AgentPropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<PropertyWithDetails | null>(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [allTenants, setAllTenants] = useState<TenantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignTenantModalOpen, setIsAssignTenantModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    type: '',
    units: ''
  });
  const [assignTenantData, setAssignTenantData] = useState({
    tenant_id: '',
    lease_start: '',
    lease_end: '',
    monthly_rent: ''
  });

  useEffect(() => {
    if (id) {
      loadPropertyData(id);
    }
  }, [id]);

  const loadPropertyData = async (propertyId: string) => {
    try {
      setLoading(true);
      setError(null);

      const [properties, landlords, tenants, maintenance] = await Promise.all([
        tenantService.getProperties(),
        tenantService.getLandlords(),
        tenantService.getTenants(),
        tenantService.getMaintenanceRequestsWithDetails()
      ]);

      setAllTenants(tenants);

      const foundProperty = properties.find(p => p.id === propertyId);
      if (!foundProperty) {
        setError('Property not found');
        return;
      }

      const landlord = landlords.find(l => l.id === foundProperty.landlord_id);
      const tenant = tenants.find(t => t.property_id === foundProperty.id);
      
      // Filter maintenance requests by finding tenants of this property
      const propertyTenants = tenants.filter(t => t.property_id === foundProperty.id);
      const propertyTenantIds = propertyTenants.map(t => t.id);
      const propertyMaintenance = maintenance.filter(m => propertyTenantIds.includes(m.tenant_id));

      // Determine real status based on tenant assignment
      let realStatus = foundProperty.status;
      if (tenant && tenant.tenant_status === 'active') {
        realStatus = 'occupied';
      } else if (!tenant || tenant.tenant_status === 'inactive') {
        realStatus = 'available';
      } else if (foundProperty.status === 'maintenance') {
        realStatus = 'maintenance';
      }

      const enhancedProperty: PropertyWithDetails = {
        ...foundProperty,
        status: realStatus,
        landlord_name: landlord?.name,
        landlord_email: landlord?.email,
        landlord_phone: landlord?.phone,
        tenant_name: tenant?.name,
        tenant_email: tenant?.email,
        tenant_phone: tenant?.phone,
      };

      setProperty(enhancedProperty);
      setMaintenanceRequests(propertyMaintenance);
    } catch (error) {
      console.error('Error loading property data:', error);
      setError('Failed to load property details');
      toast({
        title: 'Error',
        description: 'Failed to load property details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'occupied':
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Occupied</Badge>;
      case 'available':
      case 'inactive':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMaintenanceStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Low</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority || 'Not Set'}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const openEditModal = () => {
    if (property) {
      setEditFormData({
        name: property.name,
        address: property.address,
        type: property.type,
        units: property.units?.toString() || ''
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditProperty = async () => {
    if (!property) return;

    try {
      const updateData = {
        name: editFormData.name,
        address: editFormData.address,
        type: editFormData.type,
        units: editFormData.units ? parseInt(editFormData.units) : undefined,
      };

      await tenantService.updateProperty(property.id, updateData);
      await loadPropertyData(property.id);
      setIsEditModalOpen(false);
      
      toast({
        title: 'Success',
        description: `Property "${editFormData.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating property:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update property. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const openAssignTenantModal = () => {
    setAssignTenantData({
      tenant_id: '',
      lease_start: '',
      lease_end: '',
      monthly_rent: ''
    });
    setIsAssignTenantModalOpen(true);
  };

  const handleAssignTenant = async () => {
    if (!property) return;

    try {
      // Validate required fields
      if (!assignTenantData.tenant_id || !assignTenantData.lease_start || !assignTenantData.lease_end || !assignTenantData.monthly_rent) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }

      // Validate that lease end date is after lease start date
      const startDate = new Date(assignTenantData.lease_start);
      const endDate = new Date(assignTenantData.lease_end);
      
      if (endDate <= startDate) {
        toast({
          title: 'Validation Error',
          description: 'Lease end date must be after lease start date.',
          variant: 'destructive',
        });
        return;
      }

      try {
        // First try to assign with tenant_status
        await tenantService.updateTenant(assignTenantData.tenant_id, {
          property_id: property.id,
          landlord_id: property.landlord_id,
          lease_start: assignTenantData.lease_start,
          lease_end: assignTenantData.lease_end,
          monthly_rent: parseFloat(assignTenantData.monthly_rent),
          tenant_status: 'active'
        });

        console.log('✅ Tenant assigned successfully with status active');
      } catch (updateError: any) {
        console.log('⚠️ First update failed, trying without tenant_status:', updateError);
        
        // If tenant_status field doesn't exist (error code 42703), try without it
        if (updateError.message && updateError.message.includes('tenant_status')) {
          try {
            await tenantService.updateTenant(assignTenantData.tenant_id, {
              property_id: property.id,
              landlord_id: property.landlord_id,
              lease_start: assignTenantData.lease_start,
              lease_end: assignTenantData.lease_end,
              monthly_rent: parseFloat(assignTenantData.monthly_rent)
            });
            
            console.log('⚠️ Tenant assigned without status (migration needed for tenant_status field)');
            
            // Show warning to user
            toast({
              title: 'Partial Success',
              description: 'Tenant assigned but status not updated. Database migration needed.',
              variant: 'default',
            });
          } catch (fallbackError) {
            console.error('❌ Fallback update also failed:', fallbackError);
            throw fallbackError;
          }
        } else {
          throw updateError;
        }
      }

      await loadPropertyData(property.id);
      setIsAssignTenantModalOpen(false);
      
      toast({
        title: 'Success',
        description: 'Tenant has been assigned to the property successfully.',
      });
    } catch (error) {
      console.error('Error assigning tenant:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign tenant. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Get available tenants (those without property assignment)
  const availableTenants = allTenants.filter(tenant => 
    !tenant.property_id || tenant.property_id === 'none' || tenant.tenant_status === 'inactive'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-semibold">Error Loading Property</h2>
        <p className="text-muted-foreground">{error || 'Property not found'}</p>
        <Button onClick={() => navigate('/agent-properties')} className="bg-orange-600 hover:bg-orange-700 text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/agent-properties')}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <p className="text-muted-foreground">Property Details & Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadPropertyData(property.id)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={openEditModal} 
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Property
          </Button>
        </div>
      </div>

      {/* Property Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Property Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusBadge(property.status)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="outline">{property.type.charAt(0).toUpperCase() + property.type.slice(1)}</Badge>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">{property.address}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Units</span>
              <span className="font-medium">{property.units || 1}</span>
            </div>
            {property.short_id && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Property ID</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">{property.short_id}</code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Property Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {property.photos && Array.isArray(property.photos) && property.photos.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground mb-2">
                  {property.photos.length} photo{property.photos.length !== 1 ? 's' : ''} available
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {property.photos.slice(0, 4).map((photo, index) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden border hover:shadow-md transition-shadow">
                      <img
                        src={photo}
                        alt={`${property.name} - Photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onClick={() => window.open(photo, '_blank')}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  ))}
                </div>
                {property.photos.length > 4 && (
                  <div className="text-xs text-muted-foreground text-center mt-2">
                    +{property.photos.length - 4} more photos
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No Photos Added</p>
                <p className="text-xs text-muted-foreground mt-1">No photos have been uploaded for this property yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Landlord Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Landlord
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {property.landlord_name ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{property.landlord_name}</span>
                </div>
                {property.landlord_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{property.landlord_email}</span>
                  </div>
                )}
                {property.landlord_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{property.landlord_phone}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No landlord assigned</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Current Tenant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {property.tenant_name ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{property.tenant_name}</span>
                </div>
                {property.tenant_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{property.tenant_email}</span>
                  </div>
                )}
                {property.tenant_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{property.tenant_phone}</span>
                  </div>
                )}
                {property.rent_per_unit && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">${property.rent_per_unit}/month</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No tenant assigned</p>
                <Button 
                  size="sm" 
                  onClick={openAssignTenantModal}
                  className="mt-2 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Tenant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Maintenance Requests ({maintenanceRequests.length})
          </CardTitle>
          <CardDescription>
            Recent maintenance requests for this property
          </CardDescription>
        </CardHeader>
        <CardContent>
          {maintenanceRequests.length > 0 ? (
            <div className="space-y-4">
              {maintenanceRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{request.title || 'Maintenance Request'}</h4>
                    <div className="flex gap-2">
                      {getPriorityBadge(request.priority)}
                      {getMaintenanceStatusBadge(request.status)}
                    </div>
                  </div>
                  {request.description && (
                    <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(request.created_at)}
                    </div>
                    {request.tenant_name && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {request.tenant_name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {maintenanceRequests.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    View All Maintenance Requests ({maintenanceRequests.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Maintenance Requests</h3>
              <p className="text-muted-foreground">
                This property has no maintenance requests at the moment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Property Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update property information. All required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_property_name">Property Name *</Label>
                <Input
                  id="edit_property_name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  placeholder="Enter property name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_property_type">Property Type *</Label>
                <Select value={editFormData.type} onValueChange={(value) => setEditFormData({...editFormData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="duplex">Duplex</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                    <SelectItem value="loft">Loft</SelectItem>
                    <SelectItem value="cottage">Cottage</SelectItem>
                    <SelectItem value="mansion">Mansion</SelectItem>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_property_address">Address *</Label>
              <Input
                id="edit_property_address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                placeholder="Enter property address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_property_units">Units</Label>
              <Input
                id="edit_property_units"
                type="number"
                min="1"
                value={editFormData.units}
                onChange={(e) => setEditFormData({...editFormData, units: e.target.value})}
                placeholder="Number of units"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditProperty} 
              disabled={!editFormData.name || !editFormData.address || !editFormData.type}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Update Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tenant Modal */}
      <Dialog open={isAssignTenantModalOpen} onOpenChange={setIsAssignTenantModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Tenant to {property?.name}</DialogTitle>
            <DialogDescription>
              Assign a tenant to this property with lease details and rental information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assign_tenant">Select Tenant *</Label>
              <Select value={assignTenantData.tenant_id} onValueChange={(value) => setAssignTenantData({...assignTenantData, tenant_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an available tenant" />
                </SelectTrigger>
                <SelectContent>
                  {availableTenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name} (@{tenant.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableTenants.length === 0 && (
                <p className="text-sm text-muted-foreground">No available tenants. All tenants are already assigned to properties.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign_monthly_rent">Monthly Rent (£) *</Label>
              <Input
                id="assign_monthly_rent"
                type="number"
                min="0"
                step="0.01"
                value={assignTenantData.monthly_rent}
                onChange={(e) => setAssignTenantData({...assignTenantData, monthly_rent: e.target.value})}
                placeholder="Enter monthly rent amount"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assign_lease_start">Lease Start Date *</Label>
                <Input
                  id="assign_lease_start"
                  type="date"
                  value={assignTenantData.lease_start}
                  onChange={(e) => setAssignTenantData({...assignTenantData, lease_start: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign_lease_end">Lease End Date *</Label>
                <Input
                  id="assign_lease_end"
                  type="date"
                  value={assignTenantData.lease_end}
                  onChange={(e) => setAssignTenantData({...assignTenantData, lease_end: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignTenantModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTenant} 
              disabled={
                !assignTenantData.tenant_id ||
                !assignTenantData.monthly_rent ||
                !assignTenantData.lease_start ||
                !assignTenantData.lease_end ||
                availableTenants.length === 0
              }
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Assign Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
