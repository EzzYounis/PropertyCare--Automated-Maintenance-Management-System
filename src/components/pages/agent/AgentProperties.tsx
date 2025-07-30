import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Building2, 
  MapPin, 
  User, 
  DollarSign, 
  Filter,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  ChevronDown,
  Home,
  Building,
  Users,
  ExternalLink
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { tenantService, Property, LandlordProfile } from '@/lib/tenantService';

interface PropertyWithLandlord extends Property {
  landlord_name?: string;
  landlord_email?: string;
  landlord_phone?: string;
}

export const AgentProperties = () => {
  const [properties, setProperties] = useState<PropertyWithLandlord[]>([]);
  const [landlords, setLandlords] = useState<LandlordProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithLandlord | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    type: '',
    units: '',
    rent_per_unit: '',
    status: 'available'
  });
  const [addFormData, setAddFormData] = useState({
    name: '',
    address: '',
    type: '',
    landlord_id: 'none',
    rent_per_unit: '',
    status: 'available'
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propertiesData, landlordsData, tenantsData] = await Promise.all([
        tenantService.getProperties(),
        tenantService.getLandlords(),
        tenantService.getTenants()
      ]);

      // Enhance properties with landlord and occupancy information
      const enhancedProperties: PropertyWithLandlord[] = propertiesData.map(property => {
        const landlord = landlordsData.find(l => l.id === property.landlord_id);
        const tenant = tenantsData.find(t => t.property_id === property.id);
        
        // Determine real status based on tenant assignment
        let realStatus = property.status;
        if (tenant && tenant.tenant_status === 'active') {
          realStatus = 'occupied';
        } else if (!tenant || tenant.tenant_status === 'inactive') {
          realStatus = 'available';
        } else if (property.status === 'maintenance') {
          realStatus = 'maintenance';
        }

        return {
          ...property,
          status: realStatus, // Use real status based on data
          landlord_name: landlord?.name || 'No Landlord',
          landlord_email: landlord?.email,
          landlord_phone: landlord?.phone,
        };
      });

      setProperties(enhancedProperties);
      setLandlords(landlordsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique property types for filter
  const propertyTypes = useMemo(() => {
    const types = [...new Set(properties.map(p => p.type))];
    return types.sort();
  }, [properties]);

  // Filtered and sorted properties
  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(property => {
      const matchesSearch = 
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (property.landlord_name && property.landlord_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (property.short_id && property.short_id.toLowerCase().includes(searchTerm.toLowerCase()));

      // Handle status filtering with mapping between display and database statuses
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const propertyStatus = property.status.toLowerCase();
        if (statusFilter === 'occupied') {
          matchesStatus = propertyStatus === 'occupied' || propertyStatus === 'active';
        } else if (statusFilter === 'available') {
          matchesStatus = propertyStatus === 'available' || propertyStatus === 'inactive';
        } else {
          matchesStatus = propertyStatus === statusFilter;
        }
      }
      
      const matchesType = typeFilter === 'all' || property.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort properties
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'address':
          aVal = a.address;
          bVal = b.address;
          break;
        case 'type':
          aVal = a.type;
          bVal = b.type;
          break;
        case 'landlord':
          aVal = a.landlord_name || '';
          bVal = b.landlord_name || '';
          break;
        case 'rent':
          aVal = a.rent_per_unit || 0;
          bVal = b.rent_per_unit || 0;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [properties, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'occupied':
      case 'active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Occupied</Badge>;
      case 'available':
      case 'inactive':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Available</Badge>;
      case 'maintenance':
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-200">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'apartment':
        return <Building className="w-4 h-4" />;
      case 'house':
        return <Home className="w-4 h-4" />;
      case 'condo':
        return <Building2 className="w-4 h-4" />;
      case 'townhouse':
        return <Users className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const handleViewDetails = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const openEditModal = (property: PropertyWithLandlord) => {
    setSelectedProperty(property);
    setEditFormData({
      name: property.name,
      address: property.address,
      type: property.type,
      units: property.units?.toString() || '',
      rent_per_unit: property.rent_per_unit?.toString() || '',
      status: property.status || 'available'
    });
    setIsEditModalOpen(true);
  };

  const resetEditForm = () => {
    setEditFormData({
      name: '',
      address: '',
      type: '',
      units: '',
      rent_per_unit: '',
      status: 'available'
    });
    setSelectedProperty(null);
  };

  const resetAddForm = () => {
    setAddFormData({
      name: '',
      address: '',
      type: '',
      landlord_id: 'none',
      rent_per_unit: '',
      status: 'available'
    });
  };

  const handleEditProperty = async () => {
    if (!selectedProperty) return;

    try {
      // Map display status back to database status
      let dbStatus = editFormData.status;
      if (editFormData.status === 'occupied') {
        dbStatus = 'active';
      } else if (editFormData.status === 'available') {
        dbStatus = 'inactive';
      }

      const updateData = {
        name: editFormData.name,
        address: editFormData.address,
        type: editFormData.type,
        units: editFormData.units ? parseInt(editFormData.units) : undefined,
        rent_per_unit: editFormData.rent_per_unit ? parseFloat(editFormData.rent_per_unit) : undefined,
        status: dbStatus,
      };

      await tenantService.updateProperty(selectedProperty.id, updateData);
      await loadData();
      setIsEditModalOpen(false);
      resetEditForm();
      
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

  const handleAddProperty = async () => {
    try {
      // Validate required fields
      if (!addFormData.name || !addFormData.address || !addFormData.type) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields (Name, Address, Type).',
          variant: 'destructive',
        });
        return;
      }

      // Map display status back to database status
      let dbStatus = addFormData.status;
      if (addFormData.status === 'occupied') {
        dbStatus = 'active';
      } else if (addFormData.status === 'available') {
        dbStatus = 'inactive';
      }

      const propertyData = {
        name: addFormData.name,
        address: addFormData.address,
        type: addFormData.type,
        landlord_id: addFormData.landlord_id === 'none' ? undefined : addFormData.landlord_id,
        rent_per_unit: addFormData.rent_per_unit ? parseFloat(addFormData.rent_per_unit) : undefined,
        status: dbStatus,
      };

      await tenantService.createProperty(propertyData);
      await loadData();
      setIsAddModalOpen(false);
      resetAddForm();
      
      toast({
        title: 'Success',
        description: `Property "${addFormData.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating property:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create property. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground">
            Manage and view all properties ({filteredProperties.length} of {properties.length})
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold text-green-600">
                  {properties.filter(p => p.status === 'occupied' || p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-blue-600">
                  {properties.filter(p => p.status === 'available' || p.status === 'inactive').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Landlords</p>
                <p className="text-2xl font-bold">{landlords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Rent</p>
                <p className="text-2xl font-bold">
                  ${Math.round(properties.reduce((sum, p) => sum + (p.rent_per_unit || 0), 0) / properties.length || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Properties</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by name, address, landlord, or property ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Property Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="address">Address</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Sort Order</Label>
              <div className="flex gap-2">
                <Button
                  variant={sortOrder === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('asc')}
                >
                  A-Z
                </Button>
                <Button
                  variant={sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('desc')}
                >
                  Z-A
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProperties.length} of {properties.length} properties
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      <div className="space-y-4">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Property Icon and Basic Info */}
                  <div className="flex items-center gap-3">
                    {getPropertyTypeIcon(property.type)}
                    <div>
                      <h3 className="text-lg font-semibold">{property.name}</h3>
                      {property.short_id && (
                        <p className="text-sm text-muted-foreground">ID: {property.short_id}</p>
                      )}
                    </div>
                  </div>

                  {/* Property Details Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 ml-6">
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{property.address}</span>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline">
                          {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{property.landlord_name}</span>
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(property.status)}
                      </div>
                    </div>

                    <div>
                      {property.rent_per_unit && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-green-600">
                            ${property.rent_per_unit}/month
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">
                        Units: {property.units || 1}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleViewDetails(property.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewDetails(property.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditModal(property)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Property
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Property
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search criteria.'
                : 'No properties have been added yet.'}
            </p>
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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
                    <SelectItem value="townhouse">Townhouse</SelectItem>
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
            <div className="grid grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="edit_property_rent">Monthly Rent ($)</Label>
                <Input
                  id="edit_property_rent"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.rent_per_unit}
                  onChange={(e) => setEditFormData({...editFormData, rent_per_unit: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_property_status">Status</Label>
                <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditProperty} 
              disabled={!editFormData.name || !editFormData.address || !editFormData.type}
            >
              Update Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Property Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Add a new property to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add_property_name">Property Name *</Label>
                <Input
                  id="add_property_name"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                  placeholder="Enter property name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_property_type">Property Type *</Label>
                <Select value={addFormData.type} onValueChange={(value) => setAddFormData({...addFormData, type: value})}>
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
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="add_property_address">Property Address *</Label>
                <Input
                  id="add_property_address"
                  value={addFormData.address}
                  onChange={(e) => setAddFormData({...addFormData, address: e.target.value})}
                  placeholder="Enter full property address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_property_landlord">Landlord</Label>
                <Select value={addFormData.landlord_id} onValueChange={(value) => setAddFormData({...addFormData, landlord_id: value === 'none' ? '' : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select landlord (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Landlord</SelectItem>
                    {landlords.map((landlord) => (
                      <SelectItem key={landlord.id} value={landlord.id}>
                        {landlord.name} ({landlord.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_property_rent">Monthly Rent ($)</Label>
                <Input
                  id="add_property_rent"
                  type="number"
                  min="0"
                  step="0.01"
                  value={addFormData.rent_per_unit}
                  onChange={(e) => setAddFormData({...addFormData, rent_per_unit: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_property_status">Status</Label>
                <Select value={addFormData.status} onValueChange={(value) => setAddFormData({...addFormData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddProperty} 
              disabled={!addFormData.name || !addFormData.address || !addFormData.type}
            >
              Add Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
