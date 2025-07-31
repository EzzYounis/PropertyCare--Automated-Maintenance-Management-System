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
  DollarSign,
  Upload,
  X,
  Castle,
  Warehouse,
  Store,
  Briefcase,
  TreePine,
  Zap,
  Home,
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { tenantService } from '@/lib/tenantService';
import type { LandlordProfile, CreateLandlordData, CreatePropertyData } from '@/lib/tenantService';

export const AgentLandlords = () => {
  const [landlords, setLandlords] = useState<LandlordProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState<LandlordProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    preferred_payment_method: ''
  });
  const [propertyData, setPropertyData] = useState({
    name: '',
    address: '',
    type: '',
    landlord_id: '',
    photos: []
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
      preferred_payment_method: ''
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
        preferred_payment_method: formData.preferred_payment_method || undefined,
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

  const openDeleteModal = (landlord: LandlordProfile) => {
    setSelectedLandlord(landlord);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteLandlord = async () => {
    if (!selectedLandlord) return;

    try {
      await tenantService.deleteLandlord(selectedLandlord.id);
      await loadData();
      setIsDeleteModalOpen(false);
      setSelectedLandlord(null);
      
      toast({
        title: 'Success',
        description: `${selectedLandlord.name} has been deleted successfully.`,
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
      preferred_payment_method: landlord.preferred_payment_method || ''
    });
    setIsEditModalOpen(true);
  };

  const openAddPropertyModal = (landlord: LandlordProfile) => {
    setSelectedLandlord(landlord);
    setPropertyData({
      name: '',
      address: '',
      type: '',
      landlord_id: landlord.id,
      photos: []
    });
    setIsAddPropertyModalOpen(true);
  };

  const resetPropertyForm = () => {
    setPropertyData({
      name: '',
      address: '',
      type: '',
      landlord_id: '',
      photos: []
    });
  };

  const handleAddProperty = async () => {
    if (!selectedLandlord) return;

    try {
      // Validate required fields
      if (!propertyData.name || !propertyData.address || !propertyData.type) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields (Name, Address, Type).',
          variant: 'destructive',
        });
        return;
      }

      const createData: CreatePropertyData = {
        name: propertyData.name,
        address: propertyData.address,
        type: propertyData.type,
        landlord_id: selectedLandlord.id,
        status: 'inactive', // Always set as available (inactive in DB)
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPhotos: string[] = [];
      const filePromises = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises)
        .then(results => {
          setPropertyData(prev => ({
            ...prev,
            photos: [...prev.photos, ...results]
          }));
        })
        .catch(error => {
          console.error('Error reading files:', error);
          toast({
            title: 'Error',
            description: 'Failed to upload photos. Please try again.',
            variant: 'destructive',
          });
        });
    }
  };

  const removePhoto = (index: number) => {
    setPropertyData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const filteredLandlords = landlords.filter(landlord => {
    const matchesSearch = landlord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         landlord.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
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
                <TableHead>Contact</TableHead>
                <TableHead>Properties</TableHead>
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
                        onClick={() => openDeleteModal(landlord)}
                        title="Delete Landlord"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
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
              <Label htmlFor="edit_preferred_payment_method">Payment Method</Label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="property_address">Property Address *</Label>
                <Input
                  id="property_address"
                  value={propertyData.address}
                  onChange={(e) => setPropertyData({...propertyData, address: e.target.value})}
                  placeholder="Enter full property address"
                />
              </div>
              
              {/* Photo Upload Section */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="property_photos">Property Photos</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      id="property_photos"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('property_photos')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photos
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {propertyData.photos.length} photo(s) selected
                    </span>
                  </div>
                  
                  {/* Photo Preview Grid */}
                  {propertyData.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {propertyData.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                            <img
                              src={photo}
                              alt={`Property photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Add Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Landlord Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Landlord
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the landlord account and all associated data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">{selectedLandlord?.name}</p>
                  <p className="text-sm text-red-700">@{selectedLandlord?.username}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <strong>{selectedLandlord?.name}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                This will also affect any properties and tenants associated with this landlord.
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
              onClick={handleDeleteLandlord}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Landlord
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
