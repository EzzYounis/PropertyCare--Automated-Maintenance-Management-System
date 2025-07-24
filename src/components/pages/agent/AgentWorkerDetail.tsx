import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Edit2, 
  Save, 
  X,
  Calendar,
  DollarSign,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Worker {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  rating: number;
  phone: string;
  description: string;
  favorite: boolean;
  category: string;
}

interface AgentWorkerDetailProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedWorker: Worker) => void;
}

export const AgentWorkerDetail: React.FC<AgentWorkerDetailProps> = ({
  worker,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedWorker, setEditedWorker] = useState<Worker | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (worker) {
      setEditedWorker({ ...worker });
    }
  }, [worker]);

  const handleSave = () => {
    if (!editedWorker) return;

    onUpdate(editedWorker);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Worker details updated successfully",
    });
  };

  const handleCancel = () => {
    setEditedWorker(worker);
    setIsEditing(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!worker || !editedWorker) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Worker Details</span>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-agent rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {editedWorker.initials}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editedWorker.name}
                          onChange={(e) => setEditedWorker({ ...editedWorker, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="specialty">Specialty</Label>
                        <Input
                          id="specialty"
                          value={editedWorker.specialty}
                          onChange={(e) => setEditedWorker({ ...editedWorker, specialty: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold">{editedWorker.name}</h3>
                      <p className="text-muted-foreground">{editedWorker.specialty}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {renderStars(editedWorker.rating)}
                <span className="ml-2 text-sm text-muted-foreground">
                  {editedWorker.rating}.0 rating
                </span>
              </div>

              <Badge variant="outline" className="w-fit">
                {editedWorker.category}
              </Badge>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editedWorker.phone}
                      onChange={(e) => setEditedWorker({ ...editedWorker, phone: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{editedWorker.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={editedWorker.description}
                    onChange={(e) => setEditedWorker({ ...editedWorker, description: e.target.value })}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground">{editedWorker.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Work Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Work Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-agent">24</div>
                  <div className="text-sm text-muted-foreground">Jobs Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-agent">3</div>
                  <div className="text-sm text-muted-foreground">Active Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-agent">98%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Jobs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">Kitchen Faucet Repair</p>
                    <p className="text-sm text-muted-foreground">123 Main St, Apt 4B</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-green-600">Completed</Badge>
                    <p className="text-sm text-muted-foreground mt-1">2 days ago</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">Heating System Check</p>
                    <p className="text-sm text-muted-foreground">456 Oak Ave, Unit 2A</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-blue-600">In Progress</Badge>
                    <p className="text-sm text-muted-foreground mt-1">Started today</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};