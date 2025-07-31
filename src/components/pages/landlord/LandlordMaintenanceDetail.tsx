import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Star,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LandlordWorkerRatingDialog } from '@/components/landlord/LandlordWorkerRatingDialog';
import { StarRating } from '@/components/ui/star-rating';

interface LandlordMaintenanceDetailProps {
  issue: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const LandlordMaintenanceDetail: React.FC<LandlordMaintenanceDetailProps> = ({
  issue,
  open,
  onOpenChange,
  onUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [assignedWorker, setAssignedWorker] = useState(null);
  const [landlordRating, setLandlordRating] = useState<any>(null);
  const [isLandlordRatingDialogOpen, setIsLandlordRatingDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Helper functions for badge styling
  const getPriorityBadgeConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { variant: 'destructive' as const, className: 'bg-red-600 text-white border-red-600' };
      case 'high':
        return { variant: 'destructive' as const, className: 'bg-orange-500 text-white border-orange-500' };
      case 'medium':
        return { variant: 'secondary' as const, className: 'bg-yellow-500 text-white border-yellow-500' };
      case 'low':
        return { variant: 'outline' as const, className: 'bg-green-100 text-green-700 border-green-300' };
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-500 text-white border-gray-500' };
    }
  };

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { variant: 'default' as const, className: 'bg-green-600 text-white border-green-600' };
      case 'in_process':
        return { variant: 'secondary' as const, className: 'bg-blue-500 text-white border-blue-500' };
      case 'pending_approval':
        return { variant: 'outline' as const, className: 'bg-orange-100 text-orange-700 border-orange-300' };
      case 'rejected':
        return { variant: 'destructive' as const, className: 'bg-red-500 text-white border-red-500' };
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-500 text-white border-gray-500' };
    }
  };

  // Dynamic AI predictions based on category
  const getAIPrediction = (category: string, priority: string) => {
    const predictions = {
      'plumbing': {
        cost: priority === 'urgent' ? '400-800' : priority === 'high' ? '250-500' : '150-350',
        time: priority === 'urgent' ? '2-6 hours' : priority === 'high' ? '4-8 hours' : '2-4 hours',
        description: 'Based on plumbing issue analysis, typical repair costs include parts and labor.'
      },
      'electrical': {
        cost: priority === 'urgent' ? '300-700' : priority === 'high' ? '200-450' : '100-300',
        time: priority === 'urgent' ? '1-4 hours' : priority === 'high' ? '2-6 hours' : '1-3 hours',
        description: 'Electrical work requires certified electrician and safety compliance checks.'
      },
      'heating': {
        cost: priority === 'urgent' ? '500-1200' : priority === 'high' ? '300-800' : '200-600',
        time: priority === 'urgent' ? '3-8 hours' : priority === 'high' ? '4-12 hours' : '2-6 hours',
        description: 'Heating system repairs may require boiler service or component replacement.'
      },
      'windows-doors': {
        cost: priority === 'urgent' ? '200-600' : priority === 'high' ? '150-400' : '100-250',
        time: priority === 'urgent' ? '2-4 hours' : priority === 'high' ? '2-6 hours' : '1-3 hours',
        description: 'Window and door repairs include hardware, glass, or frame adjustments.'
      },
      'appliances': {
        cost: priority === 'urgent' ? '350-900' : priority === 'high' ? '200-600' : '100-400',
        time: priority === 'urgent' ? '1-3 hours' : priority === 'high' ? '2-4 hours' : '1-2 hours',
        description: 'Appliance repair costs vary by brand, age, and replacement parts availability.'
      },
      'general': {
        cost: priority === 'urgent' ? '250-600' : priority === 'high' ? '150-400' : '80-250',
        time: priority === 'urgent' ? '2-5 hours' : priority === 'high' ? '2-6 hours' : '1-4 hours',
        description: 'General maintenance covers various repair types with standard labor rates.'
      }
    };

    const normalizedCategory = category.toLowerCase().replace(/[\s\/]/g, '-');
    return predictions[normalizedCategory] || predictions['general'];
  };

  React.useEffect(() => {
    if (issue) {
      // Fetch tenant information
      const fetchTenantInfo = async () => {
        if (issue.tenant_id) {
          try {
            const { data: tenant, error } = await supabase
              .from('profiles')
              .select('id, name, username, phone')
              .eq('id', issue.tenant_id)
              .single();
            
            if (!error && tenant) {
              setTenantInfo(tenant);
            }
          } catch (error) {
            console.error('Error fetching tenant details:', error);
          }
        } else {
          // Mock tenant data
          setTenantInfo({
            name: 'Sarah Johnson',
            username: 'sarahjohnson',
            phone: '+44 7700 987654'
          });
        }
      };

      // Fetch worker information if assigned
      const fetchWorkerInfo = async () => {
        if (issue.assigned_worker_id) {
          try {
            const { data: worker, error } = await supabase
              .from('workers')
              .select('*')
              .eq('id', issue.assigned_worker_id)
              .single();
            
            if (!error && worker) {
              setAssignedWorker(worker);
            }
          } catch (error) {
            console.error('Error fetching worker details:', error);
          }
        }
      };

      // Fetch landlord's existing rating if issue is completed
      const fetchLandlordRating = async () => {
        if (user && issue.status === 'completed' && issue.assigned_worker_id) {
          try {
            const { data, error } = await supabase
              .from('worker_ratings')
              .select('*')
              .eq('maintenance_request_id', issue.id)
              .eq('rater_id', user.id)
              .eq('rater_type', 'agent') // Use 'agent' temporarily until 'landlord' constraint is added
              .single();

            if (error && error.code !== 'PGRST116') {
              throw error;
            }

            setLandlordRating(data);
          } catch (error) {
            console.error('Error fetching landlord rating:', error);
          }
        }
      };

      fetchTenantInfo();
      fetchWorkerInfo();
      fetchLandlordRating();
    }
  }, [issue, user]);

  const handleApproveQuote = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          status: 'in_process',
          updated_at: new Date().toISOString()
        })
        .eq('id', issue.id);

      if (error) throw error;

      toast({
        title: "Quote Approved",
        description: "The maintenance quote has been approved and work can begin.",
      });

      onUpdate();
    } catch (error) {
      console.error('Error approving quote:', error);
      toast({
        title: "Error",
        description: "Failed to approve quote.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectQuote = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          status: 'rejected',
          landlord_notes: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', issue.id);

      if (error) throw error;

      toast({
        title: "Quote Rejected",
        description: "The maintenance quote has been rejected. Agent will be notified.",
      });

      setShowRejectionDialog(false);
      setRejectionReason('');
      onUpdate();
    } catch (error) {
      console.error('Error rejecting quote:', error);
      toast({
        title: "Error",
        description: "Failed to reject quote.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLandlordRatingSubmitted = () => {
    // Refresh the landlord rating and worker details
    if (user && issue.status === 'completed' && issue.assigned_worker_id) {
      const fetchLandlordRating = async () => {
        try {
          const { data, error } = await supabase
            .from('worker_ratings')
            .select('*')
            .eq('maintenance_request_id', issue.id)
            .eq('rater_id', user.id)
            .eq('rater_type', 'agent') // Use 'agent' temporarily until 'landlord' constraint is added
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          setLandlordRating(data);
        } catch (error) {
          console.error('Error fetching updated landlord rating:', error);
        }
      };

      const fetchWorkerInfo = async () => {
        if (issue.assigned_worker_id) {
          try {
            const { data: worker, error } = await supabase
              .from('workers')
              .select('*')
              .eq('id', issue.assigned_worker_id)
              .single();
            
            if (!error && worker) {
              setAssignedWorker(worker);
            }
          } catch (error) {
            console.error('Error fetching updated worker details:', error);
          }
        }
      };

      fetchLandlordRating();
      fetchWorkerInfo();
    }
  };

  if (!issue) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Landlord View - Maintenance Request #{issue.id?.slice(-8) || '12345678'}
            </DialogTitle>
            <DialogDescription>
              Review maintenance request details and approve or reject worker quotes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Issue Information */}
            <div className="space-y-6">
              {/* Issue Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Issue Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title:</label>
                    <p className="font-medium">{issue.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description:</label>
                    <p className="text-sm">{issue.description}</p>
                  </div>
                  {issue.special_circumstances && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <label className="text-sm font-medium text-amber-800">
                          Special Circumstances:
                        </label>
                      </div>
                      <p className="text-sm text-amber-700">{issue.special_circumstances}</p>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Priority:</label>
                      <div className="mt-1">
                        <Badge 
                          variant={getPriorityBadgeConfig(issue.priority || 'medium').variant}
                          className={getPriorityBadgeConfig(issue.priority || 'medium').className}
                        >
                          {issue.priority?.charAt(0).toUpperCase() + issue.priority?.slice(1)} Priority
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status:</label>
                      <div className="mt-1">
                        <Badge 
                          variant={getStatusBadgeConfig(issue.status || 'pending').variant}
                          className={getStatusBadgeConfig(issue.status || 'pending').className}
                        >
                          {issue.status?.charAt(0).toUpperCase() + issue.status?.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  {/* Tenant Information */}
                  {tenantInfo && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tenant:</label>
                      <p className="font-medium">{tenantInfo.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="w-4 h-4" />
                        <span>{tenantInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{tenantInfo.username}@propertycare.app</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{issue.property_address || '45 Baker Street, London NW1 6XE'}</span>
                    </div>
                  </div>
                </div>
              </div>

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
            </div>

            {/* Right Column - Financial & AI Predictions */}
            <div className="space-y-6">
              {/* AI Prediction */}
              <div>
                <h3 className="text-lg font-semibold mb-4">AI Cost Prediction</h3>
                
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">AI Estimate for {issue.category}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-blue-700 mb-1">Estimated Cost</p>
                        <p className="text-xl font-bold text-blue-900">
                          £{getAIPrediction(issue.category || 'general', issue.priority || 'medium').cost}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 mb-1">Estimated Time</p>
                        <p className="text-xl font-bold text-blue-900">
                          {getAIPrediction(issue.category || 'general', issue.priority || 'medium').time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-blue-100 rounded-md">
                      <p className="text-xs text-blue-700">
                        {getAIPrediction(issue.category || 'general', issue.priority || 'medium').description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Worker Quote Review */}
              {issue.estimated_cost && issue.status === 'pending_approval' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Worker Quote - Awaiting Approval</h3>
                  
                  <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-orange-700 mb-1">Quoted Cost</p>
                            <p className="text-2xl font-bold text-orange-900">
                              £{issue.estimated_cost}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-orange-700 mb-1">Estimated Time</p>
                            <p className="text-lg font-bold text-orange-900">
                              {issue.estimated_time || 'Not specified'}
                            </p>
                          </div>
                        </div>
                        
                        {issue.quote_description && (
                          <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
                            <p className="text-sm font-medium text-orange-800 mb-1">Work Description:</p>
                            <p className="text-sm text-orange-700">{issue.quote_description}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={handleApproveQuote}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white flex-1"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Approve Quote
                          </Button>
                          <Button
                            onClick={() => setShowRejectionDialog(true)}
                            disabled={isLoading}
                            variant="destructive"
                            className="flex-1"
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Reject Quote
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Approved Quote */}
              {issue.estimated_cost && issue.status === 'in_process' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Approved Quote - Work in Progress</h3>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-green-700 mb-1">Approved Cost</p>
                            <p className="text-2xl font-bold text-green-900">
                              £{issue.estimated_cost}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-green-700 mb-1">Status</p>
                            <Badge className="bg-blue-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Work in Progress
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-800">Quote approved on:</p>
                          <p className="text-sm text-green-700">{new Date(issue.updated_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Completed Work */}
              {issue.status === 'completed' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Completed Work</h3>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-green-700 mb-1">Final Cost</p>
                            <p className="text-2xl font-bold text-green-900">
                              £{issue.actual_cost || issue.estimated_cost}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-green-700 mb-1">Completed</p>
                            <p className="text-lg font-bold text-green-900">
                              {new Date(issue.completed_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Work Completed Successfully</span>
                          </div>
                          <p className="text-sm text-green-700">
                            This maintenance request has been completed and moved to invoices.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Landlord Rating Section for Completed Work */}
              {issue.status === 'completed' && assignedWorker && user && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Assigned Worker</h3>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {assignedWorker.name?.split(' ').map(n => n[0]).join('') || 'W'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-green-900">
                              {assignedWorker.name}
                            </h4>
                            {assignedWorker.rating && (
                              <div className="flex items-center gap-1">
                                <StarRating
                                  value={assignedWorker.rating}
                                  readonly
                                  size="sm"
                                />
                                <span className="text-sm text-green-700">
                                  ({assignedWorker.rating.toFixed(1)})
                                </span>
                              </div>
                            )}
                          </div>
                          {assignedWorker.specialty && (
                            <p className="text-sm text-green-700 mb-2">
                              {assignedWorker.specialty}
                            </p>
                          )}
                          {assignedWorker.description && (
                            <p className="text-sm text-green-700 mb-2">
                              {assignedWorker.description}
                            </p>
                          )}
                          {assignedWorker.phone && (
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <Phone className="w-4 h-4" />
                              <span>{assignedWorker.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rating Section */}
                  <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-900">
                          Worker Rating
                        </span>
                      </div>

                      {landlordRating ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StarRating
                              value={landlordRating.rating}
                              readonly
                            />
                            <span className="text-sm text-yellow-700">
                              Your rating: {landlordRating.rating}/5
                            </span>
                          </div>
                          {landlordRating.comment && (
                            <p className="text-sm text-yellow-700 italic">
                              "{landlordRating.comment}"
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsLandlordRatingDialogOpen(true)}
                            className="mt-2"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Update Rating
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-yellow-700">
                            How was your experience with this worker?
                          </p>
                          <Button
                            onClick={() => setIsLandlordRatingDialogOpen(true)}
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Rate Worker
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Photos & Videos */}
              {((issue.photos && issue.photos.length > 0) || (issue.videos && issue.videos.length > 0)) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Media Attachments</h3>
                  
                  {/* Photos */}
                  {issue.photos && issue.photos.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium mb-2 text-muted-foreground">Photos ({issue.photos.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {issue.photos.map((photo: string, index: number) => (
                          <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                            <img 
                              src={photo} 
                              alt={`Issue photo ${index + 1}`}
                              className="w-full h-full object-cover"
                              onClick={() => window.open(photo, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {issue.videos && issue.videos.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium mb-2 text-muted-foreground">Videos ({issue.videos.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {issue.videos.map((video: string, index: number) => (
                          <div key={index} className="bg-muted rounded-lg overflow-hidden">
                            <video 
                              src={video} 
                              controls
                              className="w-full h-auto max-h-64"
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Quote</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this maintenance quote.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="rejectionReason" className="text-sm font-medium">
                Rejection Reason
              </label>
              <Textarea
                id="rejectionReason"
                placeholder="Please explain why you're rejecting this quote..."
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectionDialog(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectQuote}
              disabled={!rejectionReason.trim() || isLoading}
              variant="destructive"
            >
              Reject Quote
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Landlord Worker Rating Dialog */}
      {issue.assigned_worker_id &&
        assignedWorker &&
        issue.status === 'completed' &&
        user && (
          <LandlordWorkerRatingDialog
            open={isLandlordRatingDialogOpen}
            onOpenChange={setIsLandlordRatingDialogOpen}
            workerId={issue.assigned_worker_id}
            workerName={assignedWorker.name}
            maintenanceRequestId={issue.id}
            onRatingSubmitted={handleLandlordRatingSubmitted}
            existingRating={landlordRating}
          />
        )}
    </>
  );
};
