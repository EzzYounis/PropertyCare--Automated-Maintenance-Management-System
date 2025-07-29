import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Crown, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  User,
  Building,
  Plus,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { tenantService } from '@/lib/tenantService';
import type { LandlordProfile, CreateLandlordData, CreatePropertyData } from '@/lib/tenantService';

export const AgentLandlords = () => {
  const [landlords, setLandlords] = useState<LandlordProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState<LandlordProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    address: '',
    company_name: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    license_number: '',
    preferred_payment_method: '',
    status: 'active'
  });
  const [propertyData, setPropertyData] = useState({
    name: '',
    address: '',
    type: '',
    rent_per_unit: '',
    status: 'active'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const landlordsData = await tenantService.getLandlords();
      setLandlords(landlordsData);
    } catch (error) {
      console.error('Error loading landlords:', error);
      toast({
        title: 'Error',
        description: 'Failed to load landlords. Please try again.',
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
      company_name: '',
      business_email: '',
      business_phone: '',
      business_address: '',
      license_number: '',
      preferred_payment_method: '',
      status: 'active'
    });
    setSelectedLandlord(null);
  };

  const handleCreateLandlord = async () => {
    try {
      const createData: CreateLandlordData = {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        company_name: formData.company_name || undefined,
        business_email: formData.business_email || undefined,
        business_phone: formData.business_phone || undefined,
        business_address: formData.business_address || undefined,
        license_number: formData.license_number || undefined,
        preferred_payment_method: formData.preferred_payment_method || undefined,
      };

      await tenantService.createLandlord(createData);
      await loadData();
      setIsCreateModalOpen(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: `${formData.name} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error creating landlord:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create landlord. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEditLandlord = async () => {
    if (!selectedLandlord) return;

    try {
      await tenantService.updateLandlord(selectedLandlord.id, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        company_name: formData.company_name || undefined,
        business_email: formData.business_email || undefined,
        business_phone: formData.business_phone || undefined,
        business_address: formData.business_address || undefined,
        license_number: formData.license_number || undefined,
        preferred_payment_method: formData.preferred_payment_method || undefined,
        status: formData.status,
      });

      await loadData();
      setIsEditModalOpen(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: `${formData.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating landlord:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update landlord. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLandlord = async (landlord: LandlordProfile) => {
    if (!window.confirm(`Are you sure you want to delete ${landlord.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await tenantService.deleteLandlord(landlord.id);
      await loadData();
      
      toast({
        title: 'Success',
        description: `${landlord.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting landlord:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete landlord. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (landlord: LandlordProfile) => {
    setSelectedLandlord(landlord);
    setFormData({
      name: landlord.name,
      username: landlord.username,
      password: '', // Don't show existing password
      email: landlord.email || '',
      phone: landlord.phone || '',
      address: landlord.address || '',
      company_name: landlord.company_name || '',
      business_email: landlord.business_email || '',
      business_phone: landlord.business_phone || '',
      business_address: landlord.business_address || '',
      license_number: landlord.license_number || '',
      preferred_payment_method: landlord.preferred_payment_method || '',
      status: landlord.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const openAddPropertyModal = (landlord: LandlordProfile) => {
    setSelectedLandlord(landlord);
    setPropertyData({
      name: '',
      address: '',
      type: '',
      rent_per_unit: '',
      status: 'active'
    });
    setIsAddPropertyModalOpen(true);
  };

  const resetPropertyForm = () => {
    setPropertyData({
      name: '',
      address: '',
      type: '',
      rent_per_unit: '',
      status: 'active'
    });
  };

  const handleAddProperty = async () => {
    if (!selectedLandlord) return;

    try {
      const createData: CreatePropertyData = {
        name: propertyData.name,
        address: propertyData.address,
        type: propertyData.type,
        landlord_id: selectedLandlord.id,
        rent_per_unit: propertyData.rent_per_unit ? parseFloat(propertyData.rent_per_unit) : undefined,
        status: propertyData.status || 'active',
      };

      await tenantService.createProperty(createData);
      await loadData(); // Reload to update property counts
      setIsAddPropertyModalOpen(false);
      resetPropertyForm();
      
      toast({
        title: 'Success',
        description: `Property "${propertyData.name}" has been added to ${selectedLandlord.name}'s portfolio.`,
      });
    } catch (error) {
      console.error('Error adding property:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add property. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const filteredLandlords = landlords.filter(landlord => {
    const matchesSearch = landlord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         landlord.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         landlord.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || landlord.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading landlords...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Landlord Management</h1>
          <p className="text-muted-foreground">
            {landlords.length} total landlords
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Landlord
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search landlords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Landlords Table */}
      <Card>
        <CardHeader>
          <CardTitle>Landlords</CardTitle>
          <CardDescription>Manage landlord accounts and information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLandlords.map((landlord) => (
                <TableRow key={landlord.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Crown className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{landlord.name}</div>
                        <div className="text-sm text-muted-foreground">@{landlord.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{landlord.company_name || 'No company'}</div>
                      {landlord.license_number && (
                        <div className="text-sm text-muted-foreground">License: {landlord.license_number}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {landlord.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {landlord.email}
                        </div>
                      )}
                      {landlord.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {landlord.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{landlord.total_properties || 0} Properties</div>
                    <div className="text-sm text-muted-foreground">
                      ${landlord.total_revenue || 0} revenue
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={landlord.status === 'active' ? 'default' : 'secondary'}>
                      {landlord.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(landlord)}
                        title="Edit Landlord"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddPropertyModal(landlord)}
                        title="Add Property"
                      >
                        <Building className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLandlord(landlord)}
                        title="Delete Landlord"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Landlord Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Landlord</DialogTitle>
            <DialogDescription>
              Create a new landlord account. All required fields are marked with *.
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
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder="Enter company name"
                />
              </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_email">Business Email</Label>
                <Input
                  id="business_email"
                  type="email"
                  value={formData.business_email}
                  onChange={(e) => setFormData({...formData, business_email: e.target.value})}
                  placeholder="Enter business email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_phone">Business Phone</Label>
                <Input
                  id="business_phone"
                  value={formData.business_phone}
                  onChange={(e) => setFormData({...formData, business_phone: e.target.value})}
                  placeholder="Enter business phone"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  placeholder="Enter license number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred_payment_method">Payment Method</Label>
                <Select value={formData.preferred_payment_method} onValueChange={(value) => setFormData({...formData, preferred_payment_method: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateLandlord} 
              disabled={!formData.name || !formData.username || !formData.password}
            >
              Create Landlord
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Landlord Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Landlord</DialogTitle>
            <DialogDescription>
              Update landlord information. Password field is optional for updates.
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
                <Label htmlFor="edit_company_name">Company Name</Label>
                <Input
                  id="edit_company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
              onClick={handleEditLandlord} 
              disabled={!formData.name || !formData.username}
            >
              Update Landlord
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Property Modal */}
      <Dialog open={isAddPropertyModalOpen} onOpenChange={setIsAddPropertyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Property for {selectedLandlord?.name}</DialogTitle>
            <DialogDescription>
              Add a new property to this landlord's portfolio. All required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_name">Property Name *</Label>
                <Input
                  id="property_name"
                  value={propertyData.name}
                  onChange={(e) => setPropertyData({...propertyData, name: e.target.value})}
                  placeholder="Enter property name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type *</Label>
                <Select value={propertyData.type} onValueChange={(value) => setPropertyData({...propertyData, type: value})}>
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
              <Label htmlFor="property_address">Address *</Label>
              <Input
                id="property_address"
                value={propertyData.address}
                onChange={(e) => setPropertyData({...propertyData, address: e.target.value})}
                placeholder="Enter property address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_rent">Monthly Rent ($)</Label>
                <Input
                  id="property_rent"
                  type="number"
                  min="0"
                  step="0.01"
                  value={propertyData.rent_per_unit}
                  onChange={(e) => setPropertyData({...propertyData, rent_per_unit: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_status">Status</Label>
                <Select value={propertyData.status} onValueChange={(value) => setPropertyData({...propertyData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPropertyModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddProperty} 
              disabled={!propertyData.name || !propertyData.address || !propertyData.type}
            >
              Add Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
