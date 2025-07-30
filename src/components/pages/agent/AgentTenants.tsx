import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, User, Mail, Phone, Home, LogOut, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { tenantService } from '@/lib/tenantService';
import type { TenantProfile, LandlordProfile, CreateTenantData, Property } from '@/lib/tenantService';

export const AgentTenants = () => {
  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const [landlords, setLandlords] = useState<LandlordProfile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignPropertyModal, setIsAssignPropertyModal] = useState(false);
  const [isMoveOutModalOpen, setIsMoveOutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantProfile | null>(null);
  const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const propertySearchRef = useRef<HTMLDivElement>(null);

  // Filter properties based on search term
  const filteredProperties = properties.filter(property =>
    propertySearchTerm && (
      property.name.toLowerCase().includes(propertySearchTerm.toLowerCase()) ||
      property.short_id?.toLowerCase().includes(propertySearchTerm.toLowerCase()) ||
      property.id.toString().includes(propertySearchTerm) ||
      property.address.toLowerCase().includes(propertySearchTerm.toLowerCase())
    )
  );

  // Handle click outside to close property dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (propertySearchRef.current && !propertySearchRef.current.contains(event.target as Node)) {
        setShowPropertyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    // Keep these for edit modal compatibility
    address: '',
    property_id: 'none',
    property_name: '',
    landlord_id: 'none',
    lease_start: '',
    lease_end: '',
    monthly_rent: '',
    tenant_status: 'active'
  });

  const [assignPropertyData, setAssignPropertyData] = useState({
    property_id: 'none',
    property_name: '',
    landlord_id: 'none',
    lease_start: '',
    lease_end: '',
    monthly_rent: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantsData, landlordsData, propertiesData] = await Promise.all([
        tenantService.getTenants(),
        tenantService.getLandlords(),
        tenantService.getProperties()
      ]);
      setTenants(tenantsData);
      setLandlords(landlordsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      // Keep these for edit modal compatibility
      address: '',
      property_id: 'none',
      property_name: '',
      landlord_id: 'none',
      lease_start: '',
      lease_end: '',
      monthly_rent: '',
      tenant_status: 'active'
    });
    setSelectedTenant(null);
    setPropertySearchTerm('');
    setShowPropertyDropdown(false);
  };

  // Format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper function to check if tenant is currently active based on lease dates and property assignment
  const isTenantActive = (tenant: any) => {
    // If tenant has no property assigned, they are inactive
    if (!tenant.property_id || tenant.property_id === 'none') return false;
    
    // If tenant status is explicitly set to inactive, return false
    if (tenant.tenant_status === 'inactive') return false;
    
    // If no lease dates, consider inactive
    if (!tenant.lease_start || !tenant.lease_end) return false;
    
    const today = new Date();
    const leaseStart = new Date(tenant.lease_start);
    const leaseEnd = new Date(tenant.lease_end);
    
    return today >= leaseStart && today <= leaseEnd;
  };

  const handleCreateTenant = async () => {
    try {
      const createData: CreateTenantData = {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone || undefined,
        emergency_contact_name: formData.emergency_contact_name || undefined,
        emergency_contact_phone: formData.emergency_contact_phone || undefined,
        // Don't include property-related fields for initial creation
        address: undefined,
        property_id: undefined,
        landlord_id: undefined,
        lease_start: undefined,
        lease_end: undefined,
        monthly_rent: undefined,
      };

      await tenantService.createTenant(createData);
      await loadData();
      setIsCreateModalOpen(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: `${formData.name} has been created successfully. Use the "Assign to Property" button to assign them to a property.`,
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create tenant. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEditTenant = async () => {
    if (!selectedTenant) return;

    try {
      await tenantService.updateTenant(selectedTenant.id, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone || undefined,
        emergency_contact_name: formData.emergency_contact_name || undefined,
        emergency_contact_phone: formData.emergency_contact_phone || undefined,
        // Don't update property-related fields in edit - use "Assign to Property" for that
      });

      await loadData();
      setIsEditModalOpen(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: `${formData.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tenant. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openDeleteModal = (tenant: TenantProfile) => {
    setSelectedTenant(tenant);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;

    try {
      await tenantService.deleteTenant(selectedTenant.id);
      await loadData();
      setIsDeleteModalOpen(false);
      setSelectedTenant(null);
      
      toast({
        title: 'Success',
        description: `${selectedTenant.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tenant. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignProperty = async () => {
    if (!selectedTenant) return;

    // Validate that all required fields are filled
    if (!assignPropertyData.property_id || assignPropertyData.property_id === 'none') {
      toast({
        title: 'Validation Error',
        description: 'Please select a property.',
        variant: 'destructive',
      });
      return;
    }

    if (!assignPropertyData.monthly_rent || assignPropertyData.monthly_rent.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter monthly rent amount.',
        variant: 'destructive',
      });
      return;
    }

    if (!assignPropertyData.lease_start || assignPropertyData.lease_start.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please select lease start date.',
        variant: 'destructive',
      });
      return;
    }

    if (!assignPropertyData.lease_end || assignPropertyData.lease_end.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please select lease end date.',
        variant: 'destructive',
      });
      return;
    }

    // Validate that lease end date is after lease start date
    const startDate = new Date(assignPropertyData.lease_start);
    const endDate = new Date(assignPropertyData.lease_end);
    
    if (endDate <= startDate) {
      toast({
        title: 'Validation Error',
        description: 'Lease end date must be after lease start date.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await tenantService.updateTenant(selectedTenant.id, {
        property_id: (assignPropertyData.property_id && assignPropertyData.property_id !== 'none') ? assignPropertyData.property_id : undefined,
        landlord_id: (assignPropertyData.landlord_id && assignPropertyData.landlord_id !== 'none') ? assignPropertyData.landlord_id : undefined,
        lease_start: assignPropertyData.lease_start || undefined,
        lease_end: assignPropertyData.lease_end || undefined,
        monthly_rent: assignPropertyData.monthly_rent ? parseFloat(assignPropertyData.monthly_rent) : undefined,
      });

      await loadData();
      setIsAssignPropertyModal(false);
      setAssignPropertyData({
        property_id: 'none',
        property_name: '',
        landlord_id: 'none',
        lease_start: '',
        lease_end: '',
        monthly_rent: '',
      });
      
      toast({
        title: 'Success',
        description: `${selectedTenant.name} has been assigned to property successfully.`,
      });
    } catch (error) {
      console.error('Error assigning property:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMoveOut = async () => {
    if (!selectedTenant) return;

    try {
      console.log('Starting move out process for tenant:', selectedTenant.id, selectedTenant.name);
      console.log('Current tenant data:', {
        property_id: selectedTenant.property_id,
        landlord_id: selectedTenant.landlord_id,
        lease_start: selectedTenant.lease_start,
        lease_end: selectedTenant.lease_end,
        monthly_rent: selectedTenant.monthly_rent
      });

      // Use null instead of undefined for proper database clearing
      const moveOutData = {
        property_id: null,
        landlord_id: null,
        lease_start: null,
        lease_end: null,
        monthly_rent: null,
        tenant_status: 'inactive', // Mark tenant as inactive when moved out
      };

      console.log('Updating tenant with move out data:', moveOutData);

      await tenantService.updateTenant(selectedTenant.id, moveOutData);

      console.log('Move out update completed, reloading data...');
      await loadData();
      
      setIsEditModalOpen(false);
      setIsMoveOutModalOpen(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: `${selectedTenant.name} has been marked as moved out.`,
      });

      console.log('Move out process completed successfully');
    } catch (error) {
      console.error('Error moving tenant out:', error);
      toast({
        title: 'Error',
        description: 'Failed to process tenant move out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openMoveOutModal = () => {
    setIsMoveOutModalOpen(true);
  };

  const openEditModal = (tenant: TenantProfile) => {
    setSelectedTenant(tenant);
    const selectedProperty = properties.find(p => p.id === tenant.property_id);
    setFormData({
      name: tenant.name || '',
      username: tenant.username || '',
      password: '', // Don't populate password for editing
      email: tenant.email || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      property_id: tenant.property_id || 'none',
      property_name: selectedProperty?.name || '',
      landlord_id: tenant.landlord_id || 'none',
      lease_start: tenant.lease_start || '',
      lease_end: tenant.lease_end || '',
      monthly_rent: tenant.monthly_rent?.toString() || '',
      emergency_contact_name: tenant.emergency_contact_name || '',
      emergency_contact_phone: tenant.emergency_contact_phone || '',
      tenant_status: tenant.tenant_status || 'active'
    });
    setPropertySearchTerm(selectedProperty?.name || '');
    setIsEditModalOpen(true);
  };

  const openAssignPropertyModal = (tenant: TenantProfile) => {
    setSelectedTenant(tenant);
    const selectedProperty = properties.find(p => p.id === tenant.property_id);
    setAssignPropertyData({
      property_id: tenant.property_id || 'none',
      property_name: selectedProperty?.name || '',
      landlord_id: tenant.landlord_id || 'none',
      lease_start: tenant.lease_start || '',
      lease_end: tenant.lease_end || '',
      monthly_rent: tenant.monthly_rent?.toString() || '',
    });
    setPropertySearchTerm(selectedProperty?.name || '');
    setShowPropertyDropdown(false);
    setIsAssignPropertyModal(true);
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Use the isTenantActive function for better status filtering
    let matchesStatus = true;
    if (filterStatus === 'active') {
      matchesStatus = isTenantActive(tenant);
    } else if (filterStatus === 'inactive') {
      matchesStatus = !isTenantActive(tenant);
    }
    // If filterStatus is 'all' or any other value, show all tenants
    
    return matchesSearch && matchesStatus;
  });

  const getLandlordName = (landlordId?: string) => {
    if (!landlordId) return 'No landlord assigned';
    const landlord = landlords.find(l => l.id === landlordId);
    return landlord?.name || 'Unknown';
  };

  const getPropertyName = (propertyId?: string) => {
    if (!propertyId) return 'No property assigned';
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenants Management</h1>
          <p className="text-gray-600 mt-1">Manage tenant accounts and their information</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Tenant
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filterStatus === 'all' ? 'All Tenants' : 
             filterStatus === 'active' ? 'Active Tenants' : 
             filterStatus === 'inactive' ? 'Inactive Tenants' : 'Tenants'} 
            ({filteredTenants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Tenant</TableHead>
                <TableHead className="text-center">Contact</TableHead>
                <TableHead className="text-center">Property</TableHead>
                <TableHead className="text-center">Landlord</TableHead>
                <TableHead className="text-center">Lease Period</TableHead>
                <TableHead className="text-center">Monthly Rent</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="flex-shrink-0 relative">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        {/* Status indicator circle */}
                        <div 
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                            isTenantActive(tenant) ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          title={isTenantActive(tenant) ? 'Active tenant' : 'Inactive tenant'}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-gray-500 text-sm">@{tenant.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="space-y-1">
                      {tenant.email && (
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 mr-1" />
                          {tenant.email}
                        </div>
                      )}
                      {tenant.phone && (
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          {tenant.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{getPropertyName(tenant.property_id)}</TableCell>
                  <TableCell className="text-center">{getLandlordName(tenant.landlord_id)}</TableCell>
                  <TableCell className="text-center">
                    {tenant.lease_start && tenant.lease_end
                      ? `${formatDate(tenant.lease_start)}/${formatDate(tenant.lease_end)}`
                      : 'Not set'
                    }
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold text-green-600">
                      {tenant.monthly_rent ? `£${tenant.monthly_rent}` : 'Not set'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex space-x-2 justify-center">
                      {/* Only show Assign to Property button if tenant is not assigned to a property */}
                      {(!tenant.property_id || tenant.property_id === 'none') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAssignPropertyModal(tenant)}
                          className="text-orange-600 hover:text-orange-800"
                          title="Assign to Property"
                        >
                          <Home className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(tenant)}
                        title="Edit Tenant"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(tenant)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        title="Delete Tenant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No tenants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Tenant Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>
              Create a new tenant account with basic information and login credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Enter username"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                  placeholder="Enter emergency contact phone"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTenant} 
              disabled={!formData.name || !formData.username || !formData.password}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Create Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Tenant - {selectedTenant?.name}</DialogTitle>
            <DialogDescription>
              Update tenant basic information. Use "Assign to Property" button for property-related changes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Full Name *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_username">Username *</Label>
                <Input
                  id="edit_username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Enter username"
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone Number</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_emergency_contact_name">Emergency Contact Name</Label>
                <Input
                  id="edit_emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_emergency_contact_phone">Emergency Contact Phone</Label>
                <Input
                  id="edit_emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                  placeholder="Enter emergency contact phone"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {selectedTenant?.property_id && selectedTenant.property_id !== 'none' && (
                <Button 
                  variant="destructive" 
                  onClick={openMoveOutModal}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Move Out
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditTenant} 
                disabled={!formData.name || !formData.username}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Update Tenant
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Property Modal */}
      <Dialog open={isAssignPropertyModal} onOpenChange={setIsAssignPropertyModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Property to {selectedTenant?.name}</DialogTitle>
            <DialogDescription>
              Assign the tenant to a property with lease details and rental information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assign_property">Property Search *</Label>
              <div className="relative" ref={propertySearchRef}>
                <Input
                  id="assign_property"
                  value={propertySearchTerm}
                  onChange={(e) => {
                    setPropertySearchTerm(e.target.value);
                    setShowPropertyDropdown(e.target.value.length > 0);
                    // Find matching property and update assignPropertyData
                    const matchingProperty = properties.find(p => 
                      p.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      p.short_id?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      p.id.toString().includes(e.target.value)
                    );
                    
                    if (matchingProperty) {
                      setAssignPropertyData({
                        ...assignPropertyData, 
                        property_id: matchingProperty.id,
                        property_name: matchingProperty.name,
                        landlord_id: matchingProperty.landlord_id || 'none'
                      });
                    } else {
                      setAssignPropertyData({
                        ...assignPropertyData, 
                        property_id: 'none',
                        property_name: e.target.value,
                        landlord_id: 'none'
                      });
                    }
                  }}
                  onFocus={() => setShowPropertyDropdown(propertySearchTerm.length > 0)}
                  placeholder="Search by property name or ID"
                />
                {showPropertyDropdown && propertySearchTerm && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filteredProperties.map((property) => (
                      <div
                        key={property.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setPropertySearchTerm(property.name);
                          setShowPropertyDropdown(false);
                          setAssignPropertyData({
                            ...assignPropertyData, 
                            property_id: property.id,
                            property_name: property.name,
                            landlord_id: property.landlord_id || 'none'
                          });
                        }}
                      >
                        <div className="font-medium">{property.name}</div>
                        <div className="text-gray-500">ID: {property.short_id || property.id} | {property.address}</div>
                      </div>
                    ))}
                    {filteredProperties.length === 0 && (
                      <div className="p-2 text-gray-500 text-sm">No properties found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign_monthly_rent">Monthly Rent (£)</Label>
              <Input
                id="assign_monthly_rent"
                type="number"
                value={assignPropertyData.monthly_rent}
                onChange={(e) => setAssignPropertyData({...assignPropertyData, monthly_rent: e.target.value})}
                placeholder="Enter monthly rent amount"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assign_lease_start">Lease Start Date</Label>
                <Input
                  id="assign_lease_start"
                  type="date"
                  value={assignPropertyData.lease_start}
                  onChange={(e) => setAssignPropertyData({...assignPropertyData, lease_start: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign_lease_end">Lease End Date</Label>
                <Input
                  id="assign_lease_end"
                  type="date"
                  value={assignPropertyData.lease_end}
                  onChange={(e) => setAssignPropertyData({...assignPropertyData, lease_end: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignPropertyModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignProperty} 
              disabled={
                !assignPropertyData.property_id || 
                assignPropertyData.property_id === 'none' ||
                !assignPropertyData.monthly_rent ||
                assignPropertyData.monthly_rent.trim() === '' ||
                !assignPropertyData.lease_start ||
                assignPropertyData.lease_start.trim() === '' ||
                !assignPropertyData.lease_end ||
                assignPropertyData.lease_end.trim() === ''
              }
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Assign Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Out Confirmation Modal */}
      <Dialog open={isMoveOutModalOpen} onOpenChange={setIsMoveOutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-500" />
              Confirm Move Out
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {selectedTenant?.name} as moved out? This will remove them from their current property and clear all lease information.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Warning</span>
            </div>
            <p className="text-sm text-amber-700">
              This action will:
            </p>
            <ul className="text-sm text-amber-700 mt-1 ml-4 list-disc">
              <li>Remove tenant from current property</li>
              <li>Clear lease start and end dates</li>
              <li>Remove monthly rent information</li>
              <li>Unassign from landlord</li>
            </ul>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsMoveOutModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleMoveOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Confirm Move Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tenant Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Tenant
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the tenant account and all associated data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">{selectedTenant?.name}</p>
                  <p className="text-sm text-red-700">@{selectedTenant?.username}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <strong>{selectedTenant?.name}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                This will also remove any maintenance requests and rental history associated with this tenant.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTenant}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
