import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, User, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { tenantService } from '@/lib/tenantService';
import type { TenantProfile, LandlordProfile, CreateTenantData } from '@/lib/tenantService';

export const AgentTenants = () => {
  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const [landlords, setLandlords] = useState<LandlordProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    address: '',
    landlord_id: 'none',
    lease_start: '',
    lease_end: '',
    monthly_rent: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    tenant_status: 'active'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantsData, landlordsData] = await Promise.all([
        tenantService.getTenants(),
        tenantService.getLandlords()
      ]);
      setTenants(tenantsData);
      setLandlords(landlordsData);
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
      address: '',
      landlord_id: 'none',
      lease_start: '',
      lease_end: '',
      monthly_rent: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      tenant_status: 'active'
    });
    setSelectedTenant(null);
  };

  const handleCreateTenant = async () => {
    try {
      const createData: CreateTenantData = {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        landlord_id: (formData.landlord_id && formData.landlord_id !== 'none') ? formData.landlord_id : undefined,
        lease_start: formData.lease_start || undefined,
        lease_end: formData.lease_end || undefined,
        monthly_rent: formData.monthly_rent ? parseFloat(formData.monthly_rent) : undefined,
        emergency_contact_name: formData.emergency_contact_name || undefined,
        emergency_contact_phone: formData.emergency_contact_phone || undefined,
      };

      await tenantService.createTenant(createData);
      await loadData();
      setIsCreateModalOpen(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: `${formData.name} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tenant. Please try again.',
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
        address: formData.address || undefined,
        landlord_id: (formData.landlord_id && formData.landlord_id !== 'none') ? formData.landlord_id : undefined,
        lease_start: formData.lease_start || undefined,
        lease_end: formData.lease_end || undefined,
        monthly_rent: formData.monthly_rent ? parseFloat(formData.monthly_rent) : undefined,
        emergency_contact_name: formData.emergency_contact_name || undefined,
        emergency_contact_phone: formData.emergency_contact_phone || undefined,
        tenant_status: formData.tenant_status,
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

  const handleDeleteTenant = async (tenant: TenantProfile) => {
    if (!confirm(`Are you sure you want to delete ${tenant.name}?`)) return;

    try {
      await tenantService.deleteTenant(tenant.id);
      await loadData();
      
      toast({
        title: 'Success',
        description: `${tenant.name} has been deleted successfully.`,
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

  const openEditModal = (tenant: TenantProfile) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name || '',
      username: tenant.username || '',
      password: '', // Don't populate password for editing
      email: tenant.email || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      landlord_id: tenant.landlord_id || 'none',
      lease_start: tenant.lease_start || '',
      lease_end: tenant.lease_end || '',
      monthly_rent: tenant.monthly_rent?.toString() || '',
      emergency_contact_name: tenant.emergency_contact_name || '',
      emergency_contact_phone: tenant.emergency_contact_phone || '',
      tenant_status: tenant.tenant_status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tenant.tenant_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getLandlordName = (landlordId?: string) => {
    if (!landlordId) return 'No landlord assigned';
    const landlord = landlords.find(l => l.id === landlordId);
    return landlord?.name || 'Unknown';
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
        <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }}>
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
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tenants ({filteredTenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Landlord</TableHead>
                <TableHead>Lease Period</TableHead>
                <TableHead>Monthly Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-gray-500 text-sm">@{tenant.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {tenant.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 mr-1" />
                          {tenant.email}
                        </div>
                      )}
                      {tenant.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          {tenant.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getLandlordName(tenant.landlord_id)}</TableCell>
                  <TableCell>
                    {tenant.lease_start && tenant.lease_end
                      ? `${tenant.lease_start} to ${tenant.lease_end}`
                      : 'Not set'
                    }
                  </TableCell>
                  <TableCell>
                    {tenant.monthly_rent ? `$${tenant.monthly_rent}` : 'Not set'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      tenant.tenant_status === 'active' ? 'default' :
                      tenant.tenant_status === 'inactive' ? 'secondary' : 'outline'
                    }>
                      {tenant.tenant_status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(tenant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTenant(tenant)}
                        className="text-red-600 hover:text-red-800"
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
              Create a new tenant account with login credentials.
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="landlord">Landlord</Label>
                <Select value={formData.landlord_id} onValueChange={(value) => setFormData({...formData, landlord_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a landlord" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No landlord assigned</SelectItem>
                    {landlords.map((landlord) => (
                      <SelectItem key={landlord.id} value={landlord.id}>
                        {landlord.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_rent">Monthly Rent</Label>
                <Input
                  id="monthly_rent"
                  type="number"
                  value={formData.monthly_rent}
                  onChange={(e) => setFormData({...formData, monthly_rent: e.target.value})}
                  placeholder="Enter monthly rent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lease_start">Lease Start Date</Label>
                <Input
                  id="lease_start"
                  type="date"
                  value={formData.lease_start}
                  onChange={(e) => setFormData({...formData, lease_start: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lease_end">Lease End Date</Label>
                <Input
                  id="lease_end"
                  type="date"
                  value={formData.lease_end}
                  onChange={(e) => setFormData({...formData, lease_end: e.target.value})}
                />
              </div>
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
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant information. Password field is optional for updates.
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
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_address">Address</Label>
              <Input
                id="edit_address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_landlord">Landlord</Label>
                <Select value={formData.landlord_id} onValueChange={(value) => setFormData({...formData, landlord_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a landlord" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No landlord assigned</SelectItem>
                    {landlords.map((landlord) => (
                      <SelectItem key={landlord.id} value={landlord.id}>
                        {landlord.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_tenant_status">Status</Label>
                <Select value={formData.tenant_status} onValueChange={(value) => setFormData({...formData, tenant_status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_monthly_rent">Monthly Rent</Label>
                <Input
                  id="edit_monthly_rent"
                  type="number"
                  value={formData.monthly_rent}
                  onChange={(e) => setFormData({...formData, monthly_rent: e.target.value})}
                  placeholder="Enter monthly rent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_lease_start">Lease Start Date</Label>
                <Input
                  id="edit_lease_start"
                  type="date"
                  value={formData.lease_start}
                  onChange={(e) => setFormData({...formData, lease_start: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_lease_end">Lease End Date</Label>
                <Input
                  id="edit_lease_end"
                  type="date"
                  value={formData.lease_end}
                  onChange={(e) => setFormData({...formData, lease_end: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_emergency_contact_name">Emergency Contact Name</Label>
                <Input
                  id="edit_emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                  placeholder="Enter emergency contact name"
                />
              </div>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditTenant} 
              disabled={!formData.name || !formData.username}
            >
              Update Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
