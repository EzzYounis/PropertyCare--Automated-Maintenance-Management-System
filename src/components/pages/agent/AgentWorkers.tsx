import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Star, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Wrench,
  Plus,
  Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const mockWorkers = [
  {
    id: 1,
    name: 'John Smith',
    specialties: ['Plumbing', 'General Maintenance'],
    rating: 4.8,
    completedJobs: 156,
    location: 'Downtown Area',
    phone: '(555) 123-4567',
    email: 'john.smith@workers.com',
    availability: 'Available',
    hourlyRate: 65,
    responseTime: '< 2 hours',
    certifications: ['Licensed Plumber', 'OSHA Certified'],
    joinDate: '2022-03-15'
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    specialties: ['HVAC', 'Electrical'],
    rating: 4.9,
    completedJobs: 203,
    location: 'North Side',
    phone: '(555) 234-5678',
    email: 'sarah.wilson@workers.com',
    availability: 'Busy until Friday',
    hourlyRate: 75,
    responseTime: '< 1 hour',
    certifications: ['HVAC License', 'Electrical License', 'Energy Efficiency Certified'],
    joinDate: '2021-08-22'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    specialties: ['Electrical', 'Security Systems'],
    rating: 4.7,
    completedJobs: 89,
    location: 'South District',
    phone: '(555) 345-6789',
    email: 'mike.johnson@workers.com',
    availability: 'Available',
    hourlyRate: 70,
    responseTime: '< 3 hours',
    certifications: ['Master Electrician', 'Security Systems Certified'],
    joinDate: '2023-01-10'
  },
  {
    id: 4,
    name: 'Lisa Brown',
    specialties: ['Kitchen', 'Bathroom', 'Flooring'],
    rating: 4.6,
    completedJobs: 134,
    location: 'West End',
    phone: '(555) 456-7890',
    email: 'lisa.brown@workers.com',
    availability: 'Available weekends only',
    hourlyRate: 60,
    responseTime: '< 4 hours',
    certifications: ['Interior Renovation Specialist', 'Tile Installation Certified'],
    joinDate: '2022-11-05'
  }
];

const specialtyOptions = [
  'All Specialties',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Kitchen',
  'Bathroom',
  'Flooring',
  'General Maintenance',
  'Security Systems'
];

const availabilityOptions = [
  'All',
  'Available',
  'Busy',
  'Limited Availability'
];

export const AgentWorkers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);
  const [newWorkerForm, setNewWorkerForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: '',
    hourlyRate: '',
    certifications: ''
  });

  const getAvailabilityColor = (availability: string) => {
    if (availability.includes('Available')) return 'bg-success text-white';
    if (availability.includes('Busy')) return 'bg-error text-white';
    return 'bg-warning text-white';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const filteredWorkers = mockWorkers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialty = specialtyFilter === 'All Specialties' || 
                            worker.specialties.includes(specialtyFilter);
    const matchesAvailability = availabilityFilter === 'All' ||
                               (availabilityFilter === 'Available' && worker.availability.includes('Available')) ||
                               (availabilityFilter === 'Busy' && worker.availability.includes('Busy')) ||
                               (availabilityFilter === 'Limited Availability' && 
                                !worker.availability.includes('Available') && 
                                !worker.availability.includes('Busy'));
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  const totalWorkers = mockWorkers.length;
  const availableWorkers = mockWorkers.filter(w => w.availability.includes('Available')).length;
  const avgRating = (mockWorkers.reduce((sum, w) => sum + w.rating, 0) / mockWorkers.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Worker Management</h1>
          <p className="text-muted-foreground">Manage your maintenance worker network</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="agent" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
              <DialogDescription>
                Add a new maintenance worker to your network
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Worker name"
                    value={newWorkerForm.name}
                    onChange={(e) => setNewWorkerForm({...newWorkerForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="worker@email.com"
                    value={newWorkerForm.email}
                    onChange={(e) => setNewWorkerForm({...newWorkerForm, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={newWorkerForm.phone}
                    onChange={(e) => setNewWorkerForm({...newWorkerForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="65"
                    value={newWorkerForm.hourlyRate}
                    onChange={(e) => setNewWorkerForm({...newWorkerForm, hourlyRate: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                <Input
                  id="specialties"
                  placeholder="Plumbing, HVAC, Electrical"
                  value={newWorkerForm.specialties}
                  onChange={(e) => setNewWorkerForm({...newWorkerForm, specialties: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                  id="certifications"
                  placeholder="List relevant certifications and licenses..."
                  value={newWorkerForm.certifications}
                  onChange={(e) => setNewWorkerForm({...newWorkerForm, certifications: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button variant="agent">Add Worker</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-agent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-agent" />
              <div>
                <p className="text-2xl font-bold">{totalWorkers}</p>
                <p className="text-sm text-muted-foreground">Total Workers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{availableWorkers}</p>
                <p className="text-sm text-muted-foreground">Available Now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{avgRating}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-info">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-info" />
              <div>
                <p className="text-2xl font-bold">582</p>
                <p className="text-sm text-muted-foreground">Jobs Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workers by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {specialtyOptions.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((availability) => (
                    <SelectItem key={availability} value={availability}>
                      {availability}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((worker) => (
          <Card key={worker.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{worker.name}</CardTitle>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(worker.rating)}
                    <span className="text-sm text-muted-foreground ml-1">
                      {worker.rating} ({worker.completedJobs} jobs)
                    </span>
                  </div>
                </div>
                <Badge className={getAvailabilityColor(worker.availability)}>
                  {worker.availability}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Specialties</p>
                <div className="flex flex-wrap gap-1">
                  {worker.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{worker.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Response: {worker.responseTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-semibold">${worker.hourlyRate}/hour</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Certifications</p>
                <div className="text-xs text-muted-foreground">
                  {worker.certifications.slice(0, 2).join(', ')}
                  {worker.certifications.length > 2 && '...'}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                <Button size="sm" variant="agent">
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workers found</h3>
            <p className="text-muted-foreground">
              {searchTerm || specialtyFilter !== 'All Specialties' || availabilityFilter !== 'All'
                ? 'Try adjusting your search or filter criteria'
                : 'No workers are currently registered'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};