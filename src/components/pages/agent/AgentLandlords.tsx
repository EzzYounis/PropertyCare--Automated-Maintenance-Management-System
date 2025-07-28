import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
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

// Sample landlord data
const sampleLandlords = [
  {
    id: 1,
    name: "John Mitchell",
    email: "john.mitchell@email.com",
    phone: "(555) 111-2222",
    address: "456 Business Ave, Suite 100",
    company: "Mitchell Properties LLC",
    propertiesCount: 5,
    totalRevenue: 14000,
    status: "Active",
    joinDate: "2023-01-15",
    properties: ["Sunset Gardens", "Riverside Apartments", "Oak Street Complex"]
  },
  {
    id: 2,
    name: "Emma Davis",
    email: "emma.davis@email.com", 
    phone: "(555) 333-4444",
    address: "789 Corporate Blvd",
    company: "Davis Real Estate Group",
    propertiesCount: 8,
    totalRevenue: 22400,
    status: "Active",
    joinDate: "2023-03-20",
    properties: ["Downtown Towers", "City Center Condos", "Metro Apartments"]
  },
  {
    id: 3,
    name: "Robert Wilson",
    email: "robert.wilson@email.com",
    phone: "(555) 555-6666", 
    address: "321 Executive Way",
    company: "Wilson Property Management",
    propertiesCount: 3,
    totalRevenue: 8700,
    status: "Active",
    joinDate: "2023-06-10",
    properties: ["Garden View Condos", "Hillside Apartments", "Park Place"]
  }
];

export const AgentLandlords = () => {
  const [landlords, setLandlords] = useState(sampleLandlords);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    status: 'Active'
  });
  const [propertyData, setPropertyData] = useState({
    name: '',
    address: '',
    type: '',
    units: '',
    rent: ''
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      status: 'Active'
    });
  };

  const resetPropertyForm = () => {
    setPropertyData({
      name: '',
      address: '',
      type: '',
      units: '',
      rent: ''
    });
  };

  const handleCreateLandlord = () => {
    try {
      const newLandlord = {
        id: Date.now(),
        ...formData,
        propertiesCount: 0,
        totalRevenue: 0,
        joinDate: new Date().toISOString().split('T')[0],
        properties: []
      };
      
      setLandlords([...landlords, newLandlord]);
      setIsCreateModalOpen(false);
      resetForm();
      
      toast({
        title: "Landlord Created",
        description: `${formData.name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create landlord.",
        variant: "destructive",
      });
    }
  };

  const handleEditLandlord = () => {
    try {
      const updatedLandlords = landlords.map(landlord => 
        landlord.id === selectedLandlord.id 
          ? { ...landlord, ...formData }
          : landlord
      );
      
      setLandlords(updatedLandlords);
      setIsEditModalOpen(false);
      setSelectedLandlord(null);
      resetForm();
      
      toast({
        title: "Landlord Updated",
        description: `${formData.name} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update landlord.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLandlord = (landlordId) => {
    try {
      const updatedLandlords = landlords.filter(landlord => landlord.id !== landlordId);
      setLandlords(updatedLandlords);
      
      toast({
        title: "Landlord Deleted",
        description: "Landlord has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete landlord.",
        variant: "destructive",
      });
    }
  };

  const handleAddProperty = () => {
    try {
      const updatedLandlords = landlords.map(landlord => 
        landlord.id === selectedLandlord.id 
          ? { 
              ...landlord, 
              properties: [...landlord.properties, propertyData.name],
              propertiesCount: landlord.propertiesCount + 1,
              totalRevenue: landlord.totalRevenue + (parseFloat(propertyData.rent) * parseInt(propertyData.units))
            }
          : landlord
      );
      
      setLandlords(updatedLandlords);
      setIsAddPropertyModalOpen(false);
      setSelectedLandlord(null);
      resetPropertyForm();
      
      toast({
        title: "Property Added",
        description: `${propertyData.name} has been added to ${selectedLandlord.name}'s portfolio.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add property.",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (landlord) => {
    setSelectedLandlord(landlord);
    setFormData({
      name: landlord.name,
      email: landlord.email,
      phone: landlord.phone,
      address: landlord.address,
      company: landlord.company,
      status: landlord.status
    });
    setIsEditModalOpen(true);
  };

  const openAddPropertyModal = (landlord) => {
    setSelectedLandlord(landlord);
    setIsAddPropertyModalOpen(true);
  };

  const filteredLandlords = landlords.filter(landlord => {
    const matchesSearch = landlord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         landlord.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         landlord.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || landlord.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Landlord Management</h1>
          <p className="text-muted-foreground">
            {landlords.length} total landlords • {landlords.reduce((sum, l) => sum + l.propertiesCount, 0)} properties managed
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-agent hover:bg-agent-secondary text-white">
              <Crown className="h-4 w-4 mr-2" />
              Add Landlord
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Landlord</DialogTitle>
              <DialogDescription>
                Add a new landlord to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Enter landlord name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input
                  placeholder="Enter company name"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateLandlord} className="bg-agent hover:bg-agent-secondary text-white">
                Create Landlord
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search landlords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter Status" />
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

      {/* Landlords Table */}
      <Card>
        <CardHeader>
          <CardTitle>Landlords ({filteredLandlords.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Landlord</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLandlords.map((landlord) => (
                <TableRow key={landlord.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Crown className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">{landlord.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(landlord.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{landlord.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{landlord.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{landlord.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-semibold">{landlord.propertiesCount} Properties</div>
                      <div className="text-muted-foreground">
                        {landlord.properties.slice(0, 2).join(', ')}
                        {landlord.properties.length > 2 && ` +${landlord.properties.length - 2} more`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">${landlord.totalRevenue.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={landlord.status === 'Active' ? 'default' : 'secondary'}
                      className={landlord.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      {landlord.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddPropertyModal(landlord)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(landlord)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLandlord(landlord.id)}
                        className="text-red-600 hover:text-red-700"
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Landlord</DialogTitle>
            <DialogDescription>
              Update landlord information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="Enter landlord name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input
                placeholder="Enter company name"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                placeholder="Enter full address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLandlord} className="bg-agent hover:bg-agent-secondary text-white">
              Update Landlord
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Property Modal */}
      <Dialog open={isAddPropertyModalOpen} onOpenChange={setIsAddPropertyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Property</DialogTitle>
            <DialogDescription>
              Add a new property for {selectedLandlord?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Property Name</label>
              <Input
                placeholder="Enter property name"
                value={propertyData.name}
                onChange={(e) => setPropertyData({...propertyData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Property Type</label>
              <Select 
                value={propertyData.type} 
                onValueChange={(value) => setPropertyData({...propertyData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                placeholder="Enter property address"
                value={propertyData.address}
                onChange={(e) => setPropertyData({...propertyData, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Units</label>
              <Input
                type="number"
                placeholder="Enter number of units"
                value={propertyData.units}
                onChange={(e) => setPropertyData({...propertyData, units: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rent per Unit ($)</label>
              <Input
                type="number"
                placeholder="Enter rent per unit"
                value={propertyData.rent}
                onChange={(e) => setPropertyData({...propertyData, rent: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPropertyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProperty} className="bg-agent hover:bg-agent-secondary text-white">
              Add Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
