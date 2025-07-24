import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MaintenanceDetailProps {
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

export const MaintenanceDetail: React.FC<MaintenanceDetailProps> = ({
  issue,
  open,
  onOpenChange,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    priority: '',
    room: '',
    preferred_date: '',
    preferred_time_slots: [] as string[]
  });
  const { toast } = useToast();

  React.useEffect(() => {
    if (issue) {
      setEditData({
        title: issue.title || '',
        description: issue.description || '',
        priority: issue.priority || 'medium',
        room: issue.room || '',
        preferred_date: issue.preferred_date || '',
        preferred_time_slots: issue.preferred_time_slots || []
      });
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
          room: editData.room,
          preferred_date: editData.preferred_date || null,
          preferred_time_slots: editData.preferred_time_slots.length > 0 ? editData.preferred_time_slots : null,
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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'in progress':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'scheduled':
        return <Calendar className="w-5 h-5 text-info" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorities.find(p => p.value === priority);
    return <Badge variant={config?.color as any}>{config?.label}</Badge>;
  };

  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Maintenance Request Details</span>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            {getStatusIcon(issue.status)}
            <Badge variant={issue.status === 'completed' ? 'default' : 'secondary'}>
              {issue.status?.charAt(0).toUpperCase() + issue.status?.slice(1)}
            </Badge>
            {getPriorityBadge(issue.priority)}
            <Badge variant="outline">{issue.category}</Badge>
          </div>

          {/* Main Info */}
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                {isEditing ? (
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg font-semibold mt-1">{issue.title}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                {isEditing ? (
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="mt-1"
                    rows={4}
                  />
                ) : (
                  <p className="mt-1">{issue.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  {isEditing ? (
                    <Select value={editData.priority} onValueChange={(value) => setEditData({...editData, priority: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1">{issue.priority}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Room/Location</label>
                  {isEditing ? (
                    <Input
                      value={editData.room}
                      onChange={(e) => setEditData({...editData, room: e.target.value})}
                      className="mt-1"
                      placeholder="e.g., Kitchen, Bathroom"
                    />
                  ) : (
                    <p className="mt-1">{issue.room || 'Not specified'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Date</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.preferred_date}
                      onChange={(e) => setEditData({...editData, preferred_date: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1">
                      {issue.preferred_date 
                        ? new Date(issue.preferred_date).toLocaleDateString()
                        : 'Not specified'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Time</label>
                  <p className="mt-1">
                    {issue.preferred_time_slots?.length > 0 
                      ? issue.preferred_time_slots.join(', ')
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Reported:</strong> {new Date(issue.created_at).toLocaleString()}
                </span>
              </div>
              
              {issue.updated_at !== issue.created_at && (
                <div className="flex items-center gap-3">
                  <Edit className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Last Updated:</strong> {new Date(issue.updated_at).toLocaleString()}
                  </span>
                </div>
              )}

              {issue.completed_at && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">
                    <strong>Completed:</strong> {new Date(issue.completed_at).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          {(issue.agent_notes || issue.landlord_notes || issue.estimated_cost || issue.actual_cost) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {issue.agent_notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Agent Notes</label>
                    <p className="mt-1 text-sm bg-muted/50 p-3 rounded-md">{issue.agent_notes}</p>
                  </div>
                )}

                {issue.landlord_notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Landlord Notes</label>
                    <p className="mt-1 text-sm bg-muted/50 p-3 rounded-md">{issue.landlord_notes}</p>
                  </div>
                )}

                {(issue.estimated_cost || issue.actual_cost) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {issue.estimated_cost && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>Estimated Cost:</strong> ${issue.estimated_cost}
                        </span>
                      </div>
                    )}

                    {issue.actual_cost && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-success" />
                        <span className="text-sm">
                          <strong>Actual Cost:</strong> ${issue.actual_cost}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {issue.photos && issue.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};