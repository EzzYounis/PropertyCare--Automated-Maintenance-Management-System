import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Edit, 
  Save, 
  X, 
  Calendar, 
  User, 
  DollarSign, 
  Camera,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Home,
  UserCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getWorkerById, getWorkersByCategory } from '@/data/workers';

interface AgentMaintenanceDetailProps {
  issue: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const priorities = [
  { value: 'urgent', label: 'Urgent', color: 'destructive' },
  { value: 'high', label: 'High', color: 'warning' },
  { value: 'medium', label: 'Medium', color: 'secondary' },
  { value: 'low', label: 'Low', color: 'outline' }
];

export const AgentMaintenanceDetail: React.FC<AgentMaintenanceDetailProps> = ({
  issue,
  open,
  onOpenChange,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [assignedWorker, setAssignedWorker] = useState(null);
  const [showWorkerSelection, setShowWorkerSelection] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    priority: '',
    category: '',
    estimated_cost: '',
    actual_cost: '',
    agent_notes: ''
  });
  const { toast } = useToast();

  React.useEffect(() => {
    if (issue) {
      setEditData({
        title: issue.title || '',
        description: issue.description || '',
        priority: issue.priority || 'medium',
        category: issue.category || '',
        estimated_cost: issue.estimated_cost || '',
        actual_cost: issue.actual_cost || '',
        agent_notes: issue.agent_notes || ''
      });

      // Fetch assigned worker details
      const fetchWorkerDetails = async () => {
        if (issue.assigned_worker_id) {
          // Validate worker ID format (should be UUID)
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          
          if (!uuidRegex.test(issue.assigned_worker_id)) {
            console.warn('Invalid worker ID format:', issue.assigned_worker_id);
            setAssignedWorker(null);
            return;
          }
          
          try {
            const worker = await getWorkerById(issue.assigned_worker_id);
            setAssignedWorker(worker);
          } catch (error) {
            console.error('Error fetching worker details:', error);
            setAssignedWorker(null);
          }
        } else {
          setAssignedWorker(null);
        }
      };

      fetchWorkerDetails();
    }
  }, [issue]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          title: editData.title,
          description: editData.description,
          priority: editData.priority,
          category: editData.category,
          estimated_cost: editData.estimated_cost ? parseFloat(editData.estimated_cost) : null,
          actual_cost: editData.actual_cost ? parseFloat(editData.actual_cost) : null,
          agent_notes: editData.agent_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', issue.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance request updated successfully.",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      toast({
        title: "Error",
        description: "Failed to update maintenance request.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!internalNote.trim()) return;

    try {
      const currentNotes = issue.agent_notes || '';
      const newNotes = currentNotes 
        ? `${currentNotes}\n\n[${new Date().toLocaleString()}] ${internalNote}`
        : `[${new Date().toLocaleString()}] ${internalNote}`;

      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          agent_notes: newNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', issue.id);

      if (error) throw error;

      setInternalNote('');
      toast({
        title: "Note Added",
        description: "Internal note has been added successfully.",
      });
      onUpdate();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive"
      });
    }
  };

  const handleAssignWorker = async () => {
    try {
      // Fetch available workers for this category
      const categoryWorkers = await getWorkersByCategory(issue.category.toLowerCase());
      
      if (!categoryWorkers || categoryWorkers.length === 0) {
        toast({
          title: "No Workers Available",
          description: `No workers found for ${issue.category} category.`,
          variant: "destructive",
        });
        return;
      }

      setAvailableWorkers(categoryWorkers);
      setShowWorkerSelection(true);
    } catch (error) {
      console.error('Error loading workers for assignment:', error);
      toast({
        title: "Error",
        description: "Failed to load available workers",
        variant: "destructive",
      });
    }
  };

  const handleReassignWorker = async () => {
    try {
      // Fetch available workers for this category
      const categoryWorkers = await getWorkersByCategory(issue.category.toLowerCase());
      
      if (!categoryWorkers || categoryWorkers.length === 0) {
        toast({
          title: "No Workers Available",
          description: `No workers found for ${issue.category} category.`,
          variant: "destructive",
        });
        return;
      }

      // Filter out the currently assigned worker
      const filteredWorkers = categoryWorkers.filter(worker => worker.id !== issue.assigned_worker_id);
      
      if (filteredWorkers.length === 0) {
        toast({
          title: "No Alternative Workers",
          description: `No other workers available for ${issue.category} category.`,
          variant: "destructive",
        });
        return;
      }

      setAvailableWorkers(filteredWorkers);
      setShowWorkerSelection(true);
    } catch (error) {
      console.error('Error loading workers for reassignment:', error);
      toast({
        title: "Error",
        description: "Failed to load available workers",
        variant: "destructive",
      });
    }
  };

  const handleSelectNewWorker = async (workerId: string) => {
    try {
      // Update the ticket with the new worker
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_worker_id: workerId,
          status: 'in_process'
        })
        .eq('id', issue.id);

      if (error) throw error;

      // Get the new worker details
      const newWorker = availableWorkers.find(w => w.id === workerId);
      
      // Determine if this is an assignment or reassignment
      const isNewAssignment = !assignedWorker;
      
      toast({
        title: isNewAssignment ? "Worker Assigned" : "Worker Reassigned",
        description: `${newWorker?.name || 'Worker'} has been assigned to this ticket.`,
      });
      
      // Update local state
      setAssignedWorker(newWorker);
      setShowWorkerSelection(false);
      setAvailableWorkers([]);
      onUpdate();
    } catch (error) {
      console.error('Error reassigning worker:', error);
      toast({
        title: "Error",
        description: "Failed to reassign worker",
        variant: "destructive",
      });
    }
  };

  if (!issue) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              Agent View - Ticket #{issue.id?.slice(-8) || '12345678'}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </Button>
          </div>
          <DialogDescription>
            View and manage maintenance request details including worker assignment and internal notes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Issue Information */}
          <div className="space-y-6">
            {/* Issue Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Issue Information</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title:</label>
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description:</label>
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Priority:</label>
                      <Select value={editData.priority} onValueChange={(val) => setEditData({...editData, priority: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category:</label>
                      <Select value={editData.category} onValueChange={(val) => setEditData({...editData, category: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="heating">Heating</SelectItem>
                          <SelectItem value="general">General Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title:</label>
                    <p className="font-medium">{issue.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description:</label>
                    <p className="text-sm">{issue.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Priority:</label>
                      <div className="mt-1">
                        <Badge variant={issue.priority === 'urgent' ? 'destructive' : 
                                     issue.priority === 'high' ? 'destructive' : 
                                     issue.priority === 'medium' ? 'secondary' : 'outline'}>
                          {issue.priority?.charAt(0).toUpperCase() + issue.priority?.slice(1)} Priority
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status:</label>
                      <div className="mt-1">
                        <Badge variant={issue.status === 'completed' ? 'default' : 'secondary'}>
                          {issue.status?.charAt(0).toUpperCase() + issue.status?.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tenant:</label>
                  <p className="font-medium">{issue.tenant_profile?.name || 'Unknown'}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="w-4 h-4" />
                    <span>+44 7700 123456</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{issue.tenant_profile?.username}@propertycare.app</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Property:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{issue.property_address || '45 Baker Street, London NW1 6XE'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Worker Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Worker Information</h3>
              
              {!showWorkerSelection ? (
                // Show current worker or assignment prompt
                assignedWorker ? (
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">{assignedWorker.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {assignedWorker.specialty} • Rating: {assignedWorker.rating}/5
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{assignedWorker.phone}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{assignedWorker.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {issue.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReassignWorker}
                            className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                          >
                            Reassign Worker
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-lg text-gray-700">No Worker Assigned</h4>
                            <p className="text-sm text-gray-500">
                              This ticket needs a worker to be assigned
                            </p>
                          </div>
                        </div>
                        {issue.status !== 'completed' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleAssignWorker}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Assign Worker
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              ) : (
                // Show worker selection interface inline
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        {assignedWorker ? "Select New Worker" : "Select Worker"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Choose a worker for {issue.category} category
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowWorkerSelection(false);
                        setAvailableWorkers([]);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {availableWorkers.length > 0 ? (
                      availableWorkers.map((worker) => (
                        <Card key={worker.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <UserCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h5 className="font-medium">{worker.name}</h5>
                                  <p className="text-sm text-muted-foreground">
                                    {worker.specialty} • Rating: {worker.rating}/5
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">{worker.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Mail className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">{worker.email}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => handleSelectNewWorker(worker.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Assign
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>
                          {assignedWorker 
                            ? `No alternative workers available for ${issue.category} category`
                            : `No workers available for ${issue.category} category`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Internal Notes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Internal Notes</h3>
              
              <div className="space-y-3">
                {issue.agent_notes && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{issue.agent_notes}</p>
                  </div>
                )}
                <Textarea
                  placeholder="Add internal note..."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  rows={3}
                />
                <Button size="sm" onClick={handleAddNote} className="w-fit">
                  <Save className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Financial & Timeline */}
          <div className="space-y-6">
            {/* AI Prediction with Price */}
            <div>
              <h3 className="text-lg font-semibold mb-4">AI Prediction</h3>
              
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">AI Estimate</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Estimated Cost</p>
                      <p className="text-xl font-bold text-blue-900">
                        £{issue.estimated_cost ? `${issue.estimated_cost}.00` : '450.00-650.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Estimated Time</p>
                      <p className="text-xl font-bold text-blue-900">
                        {issue.status === 'completed' 
                          ? (issue.completed_at 
                              ? new Date(issue.completed_at).toLocaleString()
                              : 'Completed')
                          : '2-4 hours'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Worker Quote & Approval */}
            {issue.assigned_worker_id && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Worker Quote & Approval</h3>
                
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-green-700 mb-1">Worker Quote - Cost</p>
                          <p className="text-xl font-bold text-green-900">
                            £{issue.actual_cost || '75.00'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-green-700 mb-1">Worker Quote - Time</p>
                          <p className="text-xl font-bold text-green-900">45 min</p>
                        </div>
                      </div>
                      
                      <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-green-800">Landlord Approval:</span>
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        </div>
                        <p className="text-xs text-green-600">Approved 30 minutes ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Timeline Events */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    <strong>Reported:</strong> {new Date(issue.created_at).toLocaleString()}
                  </span>
                </div>
                
                {issue.updated_at !== issue.created_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <Edit className="w-4 h-4 text-muted-foreground" />
                    <span>
                      <strong>Last Updated:</strong> {new Date(issue.updated_at).toLocaleString()}
                    </span>
                  </div>
                )}

                {issue.completed_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>
                      <strong>Completed:</strong> {new Date(issue.completed_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            {issue.photos && issue.photos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Photos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {issue.photos.map((photo: string, index: number) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={photo} 
                        alt={`Issue photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};
