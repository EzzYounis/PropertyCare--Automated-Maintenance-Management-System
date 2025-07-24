import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  Star, 
  Heart, 
  Phone, 
  User,
  Wrench,
  Droplets,
  Zap,
  Thermometer,
  Shield,
  Home,
  Wifi,
  MoreHorizontal,
  Eye,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentWorkerDetail } from './AgentWorkerDetail';

// Category data with icons
const categories = [
  {
    id: 'heating',
    name: 'Heating & Boiler',
    icon: Thermometer,
    color: 'text-orange-500',
    bg: 'bg-orange-100',
    workers: [
      {
        id: 'mj',
        initials: 'MJ',
        name: 'Mike Johnson',
        specialty: 'Boiler Specialist',
        rating: 4.2,
        phone: '+44 7700 654321',
        description: 'Expert Boiler Repairs',
        favorite: false,
        category: 'heating'
      }
    ]
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: Droplets,
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    workers: [
      {
        id: 'sd',
        initials: 'SD',
        name: 'Sarah Davis',
        specialty: 'Senior Plumber',
        rating: 4.8,
        phone: '+44 7700 123456',
        description: 'Professional Plumbing Services',
        favorite: true,
        category: 'plumbing'
      }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100',
    workers: []
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: Home,
    color: 'text-purple-500',
    bg: 'bg-purple-100',
    workers: []
  },
  {
    id: 'damp',
    name: 'Damp & Mould',
    icon: Droplets,
    color: 'text-teal-500',
    bg: 'bg-teal-100',
    workers: []
  },
  {
    id: 'general',
    name: 'General',
    icon: Wrench,
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    workers: []
  }
];

export const AgentWorkers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newWorkerData, setNewWorkerData] = useState({
    name: '',
    phone: '',
    specialty: '',
    description: '',
    category: ''
  });
  const [workerData, setWorkerData] = useState(categories);
  const { toast } = useToast();

  const handleAddWorker = () => {
    toast({
      title: "Worker Added",
      description: "New worker has been successfully added to your team.",
    });
    setIsModalOpen(false);
    setNewWorkerData({
      name: '',
      phone: '',
      specialty: '',
      description: '',
      category: ''
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
    const updatedData = workerData.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          workers: category.workers.map(worker => 
            worker.id === workerId 
              ? { ...worker, favorite: !worker.favorite }
              : worker
          )
        };
      }
      return category;
    });
    
    setWorkerData(updatedData);
    toast({
      title: "Favorite Updated",
      description: "Worker favorite status has been updated.",
    });
  };

  const handleWorkerUpdate = (updatedWorker: any) => {
    const updatedData = workerData.map(category => ({
      ...category,
      workers: category.workers.map(worker => 
        worker.id === updatedWorker.id ? updatedWorker : worker
      )
    }));
    
    setWorkerData(updatedData);
  };

  const handleViewWorker = (worker: any) => {
    setSelectedWorker(worker);
    setIsDetailModalOpen(true);
  };

  const handleAddWorkerToCategory = (categoryId: string) => {
    setNewWorkerData({ ...newWorkerData, category: categoryId });
    setIsModalOpen(true);
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
          onClick={() => setIsModalOpen(true)}
          className="bg-agent hover:bg-agent-secondary text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Worker
        </Button>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {workerData.map((category) => (
          <Card key={category.id} className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${category.bg}`}>
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <span className="text-xl">{category.name}</span>
                  <Badge variant="secondary">{category.workers.length}</Badge>
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAddWorkerToCategory(category.id)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Worker
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {category.workers.length > 0 ? (
                <div className="grid gap-4">
                  {category.workers.map((worker) => (
                    <Card key={worker.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-agent rounded-full flex items-center justify-center text-white font-bold">
                            {worker.initials}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{worker.name}</h4>
                            <p className="text-muted-foreground">{worker.specialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(category.id, worker.id)}
                          >
                            <Heart className={`w-4 h-4 ${worker.favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewWorker(worker)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewWorker(worker)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Worker
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-1">
                        {renderStars(worker.rating)}
                        <span className="text-sm text-muted-foreground ml-2">
                          {worker.rating}.0 rating
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{worker.phone}</span>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-sm text-muted-foreground">{worker.description}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No workers in this category yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleAddWorkerToCategory(category.id)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add First Worker
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Worker Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Add New Worker</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={newWorkerData.name}
                    onChange={(e) => setNewWorkerData({...newWorkerData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+44 7XXX XXXXXX"
                    value={newWorkerData.phone}
                    onChange={(e) => setNewWorkerData({...newWorkerData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="specialty">Specialty *</Label>
                  <Input
                    id="specialty"
                    placeholder="Heating Engineer, Electrician, etc."
                    value={newWorkerData.specialty}
                    onChange={(e) => setNewWorkerData({...newWorkerData, specialty: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of expertise..."
                    value={newWorkerData.description}
                    onChange={(e) => setNewWorkerData({...newWorkerData, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Categories *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category.id);
                      
                      return (
                        <div
                          key={category.id}
                          className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-agent bg-agent-secondary/10' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleCategoryToggle(category.id)}
                        >
                          <div className={`p-1 rounded ${category.bg}`}>
                            <category.icon className={`w-4 h-4 ${category.color}`} />
                          </div>
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddWorker}
                className="flex-1 bg-agent hover:bg-agent-secondary text-white"
              >
                Add Worker
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Worker Detail Modal */}
      <AgentWorkerDetail
        worker={selectedWorker}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedWorker(null);
        }}
        onUpdate={handleWorkerUpdate}
      />
    </div>
  );
};