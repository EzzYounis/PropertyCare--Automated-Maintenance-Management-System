import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Plus, 
  Star, 
  Phone, 
  Mail, 
  MapPin,
  Users,
  Clock,
  DollarSign,
  Heart,
  Filter,
  User,
  Building,
  Flame,
  Droplets,
  Zap,
  ChefHat,
  Wrench,
  Home,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Category data with icons
const categories = [
  {
    id: 'heating',
    name: 'Heating & Boiler',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    workers: [
      {
        id: 'mj',
        initials: 'MJ',
        name: 'Mike Johnson',
        specialty: 'Boiler Specialist',
        rating: 4.2,
        phone: '+44 7700 654321',
        description: 'Expert Boiler Repairs',
        isFavorite: false
      }
    ]
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: Droplets,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    workers: [
      {
        id: 'sd',
        initials: 'SD',
        name: 'Sarah Davis',
        specialty: 'Senior Plumber',
        rating: 4.8,
        phone: '+44 7700 123456',
        description: 'Professional Plumbing Services',
        isFavorite: true
      }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    workers: []
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: ChefHat,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    workers: []
  },
  {
    id: 'damp',
    name: 'Damp & Mould',
    icon: Droplets,
    color: 'text-teal-500',
    bgColor: 'bg-teal-100',
    workers: []
  },
  {
    id: 'general',
    name: 'General',
    icon: Wrench,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    workers: []
  }
];

export const AgentWorkers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newWorkerForm, setNewWorkerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    specialization: '',
    categories: [] as string[]
  });
  const { toast } = useToast();

  const handleAddWorker = () => {
    toast({
      title: "Worker Added",
      description: "New worker has been successfully added to your team.",
    });
    setIsAddWorkerOpen(false);
    setNewWorkerForm({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      specialization: '',
      categories: []
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleFavorite = (categoryId: string, workerId: string) => {
    toast({
      title: "Favorite Updated",
      description: "Worker favorite status has been updated.",
    });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workers</h1>
          <p className="text-muted-foreground">Manage your maintenance workers by category</p>
        </div>
        
        <Button 
          onClick={() => setIsAddWorkerOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Worker
        </Button>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const workerCount = category.workers.length;
          
          return (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.bgColor}`}>
                      <IconComponent className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {workerCount} worker{workerCount !== 1 ? 's' : ''}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {category.workers.length > 0 ? (
                <CardContent className="pt-0">
                  <div className="grid gap-4">
                    {category.workers.map((worker) => (
                      <div 
                        key={worker.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          worker.isFavorite 
                            ? 'border-yellow-300 bg-yellow-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                              {worker.initials}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{worker.name}</h4>
                                {worker.isFavorite && (
                                  <Heart className="w-4 h-4 text-yellow-500 fill-current" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{worker.specialty}</p>
                              
                              <div className="flex items-center gap-1 mb-2">
                                {renderStars(worker.rating)}
                                <span className="text-sm text-muted-foreground ml-1">{worker.rating}</span>
                              </div>
                              
                              <p className="text-sm text-muted-foreground">{worker.phone}</p>
                              <p className="text-sm text-muted-foreground">{worker.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(category.id, worker.id)}
                            >
                              <Heart 
                                className={`w-4 h-4 ${
                                  worker.isFavorite 
                                    ? 'text-yellow-500 fill-current' 
                                    : 'text-gray-400'
                                }`} 
                              />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              ) : (
                <CardContent className="pt-0">
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No workers in this category yet</p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add New Worker Modal */}
      <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Add New Worker
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Smith"
                    value={newWorkerForm.fullName}
                    onChange={(e) => setNewWorkerForm({...newWorkerForm, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={newWorkerForm.email}
                    onChange={(e) => setNewWorkerForm({...newWorkerForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+44 7XXX XXXXXX"
                    value={newWorkerForm.phone}
                    onChange={(e) => setNewWorkerForm({...newWorkerForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    placeholder="ABC Plumbing Ltd"
                    value={newWorkerForm.company}
                    onChange={(e) => setNewWorkerForm({...newWorkerForm, company: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    placeholder="Heating Engineer, Electrician, etc."
                    value={newWorkerForm.specialization}
                    onChange={(e) => setNewWorkerForm({...newWorkerForm, specialization: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Categories *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      const isSelected = selectedCategories.includes(category.id);
                      
                      return (
                        <div
                          key={category.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleCategoryToggle(category.id)}
                        >
                          <div className={`p-1 rounded ${category.bgColor}`}>
                            <IconComponent className={`w-4 h-4 ${category.color}`} />
                          </div>
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsAddWorkerOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddWorker}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Worker
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};