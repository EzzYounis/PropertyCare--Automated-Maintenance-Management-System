import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  ExternalLink,
  Crown,
  Upload,
  X,
  Camera,
  Castle,
  Warehouse,
  Store,
  Briefcase,
  TreePine,
  Zap
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
    units: ''
  });
  const [addFormData, setAddFormData] = useState({
    name: '',
    address: '',
    type: '',
    landlord_id: '',
    photos: []
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
      case 'studio':
        return <Zap className="w-4 h-4" />;
      case 'townhouse':
        return <Building2 className="w-4 h-4" />;
      case 'duplex':
        return <Building className="w-4 h-4" />;
      case 'villa':
        return <Castle className="w-4 h-4" />;
      case 'penthouse':
        return <Crown className="w-4 h-4" />;
      case 'loft':
        return <Warehouse className="w-4 h-4" />;
      case 'cottage':
        return <TreePine className="w-4 h-4" />;
      case 'mansion':
        return <Castle className="w-4 h-4" />;
      case 'bungalow':
        return <Home className="w-4 h-4" />;
      case 'commercial':
        return <Briefcase className="w-4 h-4" />;
      case 'office':
        return <Briefcase className="w-4 h-4" />;
      case 'retail':
        return <Store className="w-4 h-4" />;
      case 'warehouse':
        return <Warehouse className="w-4 h-4" />;
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
    navigate(`/agent/property/${propertyId}`);
  };

  const openEditModal = (property: PropertyWithLandlord) => {
    setSelectedProperty(property);
    setEditFormData({
      name: property.name,
      address: property.address,
      type: property.type,
      units: property.units?.toString() || ''
    });
    setIsEditModalOpen(true);
  };

  const resetEditForm = () => {
    setEditFormData({
      name: '',
      address: '',
      type: '',
      units: ''
    });
    setSelectedProperty(null);
  };

  const resetAddForm = () => {
    setAddFormData({
      name: '',
      address: '',
      type: '',
      landlord_id: '',
      photos: []
    });
  };

  const handleEditProperty = async () => {
    if (!selectedProperty) return;

    try {
      const updateData = {
        name: editFormData.name,
        address: editFormData.address,
        type: editFormData.type,
        units: editFormData.units ? parseInt(editFormData.units) : undefined,
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
      if (!addFormData.name || !addFormData.address || !addFormData.type || !addFormData.landlord_id) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields (Name, Address, Type, Landlord).',
          variant: 'destructive',
        });
        return;
      }

      const propertyData = {
        name: addFormData.name,
        address: addFormData.address,
        type: addFormData.type,
        landlord_id: addFormData.landlord_id,
        status: 'inactive', // Always set as available (inactive in DB)
        photos: addFormData.photos.map(photo => photo.preview), // Convert photo objects to URLs
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

  // Photo handling functions
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto = {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target?.result as string,
            name: file.name
          };
          setAddFormData(prev => ({
            ...prev,
            photos: [...prev.photos, newPhoto]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
    // Reset the input
    event.target.value = '';
  };

  const removePhoto = (photoId: number) => {
    setAddFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
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
          <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
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
                  className={sortOrder === 'asc' ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}
                >
                  A-Z
                </Button>
                <Button
                  variant={sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('desc')}
                  className={sortOrder === 'desc' ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}
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

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>Manage property listings and information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Property</TableHead>
                <TableHead className="text-center">Location & Type</TableHead>
                <TableHead className="text-center">Landlord</TableHead>
                <TableHead className="text-center">Rent</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {getPropertyTypeIcon(property.type)}
                      </div>
                      <div>
                        <div className="font-medium">{property.name}</div>
                        {property.short_id && (
                          <div className="text-sm text-muted-foreground">ID: {property.short_id}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{property.address}</span>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline">
                          {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{property.landlord_name || 'Unassigned'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      {property.status !== 'available' && property.rent_per_unit && (
                        <div className="font-semibold text-green-600">
                          ${property.rent_per_unit}/month
                        </div>
                      )}
                      {property.status === 'available' && (
                        <div className="text-sm text-muted-foreground italic">
                          Available for rent
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Units: {property.units || 1}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {getStatusBadge(property.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="outline"
                        size="sm" 
                        onClick={() => handleViewDetails(property.id)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(property)}
                        title="Edit Property"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        title="Delete Property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProperties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
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
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
            <div className="grid grid-cols-1 gap-4">
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
                <Label htmlFor="add_property_landlord">Landlord *</Label>
                <Select value={addFormData.landlord_id} onValueChange={(value) => setAddFormData({...addFormData, landlord_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select landlord" />
                  </SelectTrigger>
                  <SelectContent>
                    {landlords.map((landlord) => (
                      <SelectItem key={landlord.id} value={landlord.id}>
                        {landlord.name} ({landlord.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Photo Upload Section */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="add_property_photos">Property Photos</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      id="add_property_photos"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('add_property_photos')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photos
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {addFormData.photos.length} photo(s) selected
                    </span>
                  </div>
                  
                  {/* Photo Preview Grid */}
                  {addFormData.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {addFormData.photos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                            <img
                              src={photo.preview}
                              alt={photo.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(photo.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {photo.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddProperty} 
              disabled={!addFormData.name || !addFormData.address || !addFormData.type || !addFormData.landlord_id}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Add Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
