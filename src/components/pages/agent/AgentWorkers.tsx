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
  Edit,
  Paintbrush,
  Layers,
  TreePine,
  DoorOpen,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentWorkerDetail } from './AgentWorkerDetail';
import {
  getAllWorkers,
  addWorker,
  updateWorker,
  deleteWorker
} from '@/data/workers';


// Static category list for UI grouping/icons
const categories = [
  { id: 'plumbing', name: 'Plumbing', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'electrical', name: 'Electrical', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { id: 'hvac', name: 'HVAC', icon: Thermometer, color: 'text-green-500', bg: 'bg-green-100' },
  { id: 'appliances', name: 'Appliances', icon: Wrench, color: 'text-purple-500', bg: 'bg-purple-100' },
  { id: 'pest-control', name: 'Pest Control', icon: Shield, color: 'text-red-500', bg: 'bg-red-100' },
  { id: 'security', name: 'Locks/Security', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  { id: 'painting', name: 'Painting/Walls', icon: Paintbrush, color: 'text-orange-500', bg: 'bg-orange-100' },
  { id: 'flooring', name: 'Flooring', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-100' },
  { id: 'windows-doors', name: 'Windows/Doors', icon: DoorOpen, color: 'text-cyan-500', bg: 'bg-cyan-100' },
  { id: 'landscaping', name: 'Landscaping', icon: TreePine, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  { id: 'other', name: 'Other', icon: Wrench, color: 'text-gray-500', bg: 'bg-gray-100' },
];

export const AgentWorkers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const [newWorkerData, setNewWorkerData] = useState({
    name: '',
    phone: '',
    specialty: '',
    description: '',
    category: ''
  });
  // Group workers by category for UI
  const [workerData, setWorkerData] = useState<any[]>([]);
  // Fetch workers from Supabase and group by category
  React.useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const allWorkers = await getAllWorkers();
        // Group by category and sort favorites first
        const grouped = categories.map(category => {
          const categoryWorkers = allWorkers.filter(w => w.category === category.id);
          // Sort workers: favorites first, then alphabetically by name
          const sortedWorkers = categoryWorkers.sort((a, b) => {
            // First sort by favorite status (true first)
            if (a.favorite !== b.favorite) {
              return b.favorite ? 1 : -1;
            }
            // Then sort alphabetically by name
            return a.name.localeCompare(b.name);
          });
          
          return {
            ...category,
            workers: sortedWorkers
          };
        });
        setWorkerData(grouped);
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load workers', variant: 'destructive' });
      }
    };
    fetchWorkers();
  }, []);
  const { toast } = useToast();

  const handleAddWorker = async () => {
    if (!newWorkerData.name || !newWorkerData.phone || !newWorkerData.specialty || !newWorkerData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    try {
      await addWorker({
        initials: newWorkerData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        name: newWorkerData.name,
        specialty: newWorkerData.specialty,
        rating: 4.0,
        phone: newWorkerData.phone,
        description: newWorkerData.description,
        favorite: false,
        category: newWorkerData.category
      });
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
      setSelectedCategories([]);
      // Refresh workers
      const allWorkers = await getAllWorkers();
      const grouped = categories.map(category => ({
        ...category,
        workers: allWorkers.filter(w => w.category === category.id)
      }));
      setWorkerData(grouped);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to add worker', variant: 'destructive' });
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleFavorite = async (categoryId: string, workerId: string, currentFavorite: boolean) => {
    try {
      // Get all workers to manage favorites per category
      const allWorkers = await getAllWorkers();
      
      if (!currentFavorite) {
        // If setting as favorite, first remove favorite from other workers in the same category
        const categoryWorkers = allWorkers.filter(w => w.category === categoryId);
        const currentFavoriteWorker = categoryWorkers.find(w => w.favorite === true);
        
        if (currentFavoriteWorker) {
          // Remove favorite from current favorite worker
          await updateWorker(currentFavoriteWorker.id, { favorite: false });
        }
        
        // Set this worker as favorite
        await updateWorker(workerId, { favorite: true });
        
        toast({
          title: "Favorite Updated",
          description: `Worker set as favorite for ${categoryId} category.`,
        });
      } else {
        // If removing favorite, just set to false
        await updateWorker(workerId, { favorite: false });
        
        toast({
          title: "Favorite Removed",
          description: "Worker removed from favorites.",
        });
      }
      
      // Refresh workers
      const updatedWorkers = await getAllWorkers();
      const grouped = categories.map(category => ({
        ...category,
        workers: updatedWorkers
          .filter(w => w.category === category.id)
          .sort((a, b) => {
            // First, sort by favorite status (favorites first)
            if (a.favorite && !b.favorite) return -1;
            if (!a.favorite && b.favorite) return 1;
            // Then sort alphabetically by name
            return a.name.localeCompare(b.name);
          })
      }));
      setWorkerData(grouped);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update favorite', variant: 'destructive' });
    }
  };

  const handleWorkerUpdate = async (updatedWorker: any) => {
    try {
      await updateWorker(updatedWorker.id, updatedWorker);
      // Refresh workers
      const allWorkers = await getAllWorkers();
      const grouped = categories.map(category => ({
        ...category,
        workers: allWorkers.filter(w => w.category === category.id)
      }));
      setWorkerData(grouped);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update worker', variant: 'destructive' });
    }
  };

  const handleRemoveWorker = (worker: any) => {
    setWorkerToDelete(worker);
    setShowDeleteDialog(true);
  };

  const confirmDeleteWorker = async () => {
    if (!workerToDelete) return;
    
    try {
      await deleteWorker(workerToDelete.id);
      toast({
        title: "Worker Removed",
        description: "Worker has been successfully removed.",
      });
      
      // Refresh workers
      const allWorkers = await getAllWorkers();
      const grouped = categories.map(category => ({
        ...category,
        workers: allWorkers
          .filter(w => w.category === category.id)
          .sort((a, b) => {
            // First, sort by favorite status (favorites first)
            if (a.favorite && !b.favorite) return -1;
            if (!a.favorite && b.favorite) return 1;
            // Then sort alphabetically by name
            return a.name.localeCompare(b.name);
          })
      }));
      setWorkerData(grouped);
      
      // Close dialog and reset state
      setShowDeleteDialog(false);
      setWorkerToDelete(null);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to remove worker', variant: 'destructive' });
    }
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
        className={`w-3 h-3 ${
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {category.workers.map((worker) => (
                    <Card key={worker.id} className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex flex-col space-y-2">
                        {/* Header with avatar and favorite */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-agent rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {worker.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">{worker.name}</h4>
                              <p className="text-xs text-muted-foreground truncate">{worker.specialty}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(category.id, worker.id, worker.favorite)}
                              className="h-6 w-6 p-0"
                            >
                              <Heart className={`w-3 h-3 ${worker.favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewWorker(worker)}>
                                  <Edit className="w-3 h-3 mr-2" />
                                  Edit Worker
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleRemoveWorker(worker)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Delete Worker
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                          {renderStars(worker.rating)}
                          <span className="text-xs text-muted-foreground">
                            {worker.rating}.0
                          </span>
                        </div>
                        
                        {/* Phone */}
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span className="truncate">{worker.phone}</span>
                        </div>
                      </div>
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
                  <Label>Category *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {categories.map((category) => {
                      const isSelected = newWorkerData.category === category.id;
                      
                      return (
                        <div
                          key={category.id}
                          className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-agent bg-agent-secondary/10' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setNewWorkerData({...newWorkerData, category: category.id})}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span>Delete Worker</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete <strong>{workerToDelete?.name}</strong>? 
              This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setWorkerToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteWorker}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Worker
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};