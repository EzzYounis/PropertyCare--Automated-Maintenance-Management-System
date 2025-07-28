import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "@/components/ui/star-rating";
import { WorkerRatingDialog } from "./WorkerRatingDialog";
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
  Star,
  Award,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getWorkerById } from "@/data/workers";
import { useAuth } from "@/contexts/AuthContext";

interface MaintenanceDetailProps {
  issue: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const priorities = [
  { value: "urgent", label: "Urgent", color: "destructive" },
  { value: "high", label: "High", color: "warning" },
  { value: "medium", label: "Medium", color: "secondary" },
  { value: "low", label: "Low", color: "outline" },
];

export const MaintenanceDetail: React.FC<MaintenanceDetailProps> = ({
  issue,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [worker, setWorker] = useState<any>(null);
  const [workerRating, setWorkerRating] = useState<any>(null);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    priority: "",
    room: "",
    preferred_date: "",
    preferred_time_slots: [] as string[],
  });
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Fetch worker details and rating when issue changes
  useEffect(() => {
    if (issue) {
      setEditData({
        title: issue.title || "",
        description: issue.description || "",
        priority: issue.priority || "medium",
        room: issue.room || "",
        preferred_date: issue.preferred_date || "",
        preferred_time_slots: issue.preferred_time_slots || [],
      });

      // Fetch worker details if assigned
      if (issue.assigned_worker_id) {
        fetchWorkerDetails(issue.assigned_worker_id);
      }

      // Fetch existing rating if user is tenant and issue is completed
      if (
        user &&
        profile?.role === "tenant" &&
        issue.status === "completed" &&
        issue.assigned_worker_id
      ) {
        fetchExistingRating();
      }
    }
  }, [issue, user, profile]);

  const fetchWorkerDetails = async (workerId: string) => {
    try {
      const workerData = await getWorkerById(workerId);
      setWorker(workerData);
    } catch (error) {
      console.error("Error fetching worker details:", error);
    }
  };

  const fetchExistingRating = async () => {
    if (!user || !issue.id || !issue.assigned_worker_id) return;

    try {
      const { data, error } = await supabase
        .from("worker_ratings")
        .select("*")
        .eq("maintenance_request_id", issue.id)
        .eq("rater_id", user.id)
        .eq("rater_type", "tenant")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      setWorkerRating(data);
    } catch (error) {
      console.error("Error fetching existing rating:", error);
    }
  };

  const handleRatingSubmitted = () => {
    fetchExistingRating(); // Refresh the rating
    if (worker && issue.assigned_worker_id) {
      fetchWorkerDetails(issue.assigned_worker_id); // Refresh worker rating
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          title: editData.title,
          description: editData.description,
          priority: editData.priority,
          room: editData.room,
          preferred_date: editData.preferred_date || null,
          preferred_time_slots:
            editData.preferred_time_slots.length > 0
              ? editData.preferred_time_slots
              : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", issue.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance request updated successfully.",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      toast({
        title: "Error",
        description: "Failed to update maintenance request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "in progress":
        return <Clock className="w-5 h-5 text-warning" />;
      case "scheduled":
        return <Calendar className="w-5 h-5 text-info" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorities.find((p) => p.value === priority);
    return <Badge variant={config?.color as any}>{config?.label}</Badge>;
  };

  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Ticket Details - #{issue.id?.slice(-8) || "12345678"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Issue Information */}
          <div className="space-y-6">
            {/* Issue Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Issue Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Title:
                  </label>
                  <p className="font-medium">{issue.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description:
                  </label>
                  <p className="text-sm">{issue.description}</p>
                </div>

                <div className="flex gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Priority:
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          issue.priority === "urgent"
                            ? "destructive"
                            : issue.priority === "high"
                            ? "destructive"
                            : issue.priority === "medium"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {issue.priority === "urgent"
                          ? "Urgent Priority"
                          : issue.priority === "high"
                          ? "High Priority"
                          : issue.priority === "medium"
                          ? "Medium Priority"
                          : "Low Priority"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status:
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          issue.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {issue.status === "open"
                          ? "Open"
                          : issue.status === "claimed"
                          ? "Open"
                          : issue.status?.charAt(0).toUpperCase() +
                            issue.status?.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Date Information */}
            {(issue.preferred_date ||
              issue.preferred_time_slots?.length > 0) && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Available Date Information
                </h3>

                <div className="space-y-3">
                  {issue.preferred_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Preferred Date:
                      </label>
                      <p className="font-medium">
                        {new Date(issue.preferred_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {issue.preferred_time_slots?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Preferred Time Slots:
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {issue.preferred_time_slots.map(
                          (slot: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {slot}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Contact Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tenant:
                  </label>
                  <p className="font-medium">
                    {issue.tenant_profile?.name || "Unknown"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="w-4 h-4" />
                    <span>+44 7700 123456</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>
                      {issue.tenant_profile?.username}@propertycare.app
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Landlord:
                  </label>
                  <p className="font-medium">Michael Brown</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="w-4 h-4" />
                    <span>+44 7700 987654</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>michael.brown@email.com</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Property:
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {issue.property_address ||
                        "45 Baker Street, London NW1 6XE"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>

          {/* Right Column - Progress Timeline & Worker Info */}
          <div className="space-y-6">
            {/* Worker Information */}
            {issue.assigned_worker_id && worker && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Assigned Worker</h3>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {worker.initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-green-900">
                            {worker.name}
                          </h4>
                          {worker.rating && (
                            <div className="flex items-center gap-1">
                              <StarRating
                                value={worker.rating}
                                readonly
                                size="sm"
                              />
                              <span className="text-sm text-green-700">
                                ({worker.rating.toFixed(1)})
                              </span>
                            </div>
                          )}
                        </div>
                        {worker.specialty && (
                          <p className="text-sm text-green-700 mb-2">
                            {worker.specialty}
                          </p>
                        )}
                        {worker.description && (
                          <p className="text-sm text-green-700">
                            {worker.description}
                          </p>
                        )}
                        {worker.phone && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-green-700">
                            <Phone className="w-4 h-4" />
                            <span>{worker.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rating Section for Completed Tasks - Only for Tenants */}
                {issue.status === "completed" &&
                  user &&
                  profile?.role === "tenant" && (
                    <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 mt-4">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-5 h-5 text-yellow-600" />
                          <span className="font-medium text-yellow-900">
                            Worker Rating
                          </span>
                        </div>

                        {workerRating ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <StarRating
                                value={workerRating.rating}
                                readonly
                              />
                              <span className="text-sm text-yellow-700">
                                Your rating: {workerRating.rating}/5
                              </span>
                            </div>
                            {workerRating.comment && (
                              <p className="text-sm text-yellow-700 italic">
                                "{workerRating.comment}"
                              </p>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsRatingDialogOpen(true)}
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
                              onClick={() => setIsRatingDialogOpen(true)}
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
                  )}
              </div>
            )}

            {/* Progress Timeline */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Progress Timeline</h3>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Time Estimate
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-blue-700 mb-1">
                      {issue.status === "completed"
                        ? "Completed Time"
                        : "Estimated Time"}
                    </p>
                    <p className="text-xl font-bold text-blue-900">
                      {issue.status === "completed"
                        ? issue.completed_at
                          ? new Date(issue.completed_at).toLocaleString()
                          : "Completed"
                        : issue.preferred_date
                        ? `${issue.preferred_date} ${
                            issue.preferred_time_slots?.join(", ") || ""
                          }`
                        : "2-4 hours"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline Events */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    <strong>Reported:</strong>{" "}
                    {new Date(issue.created_at).toLocaleString()}
                  </span>
                </div>

                {issue.updated_at !== issue.created_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <Edit className="w-4 h-4 text-muted-foreground" />
                    <span>
                      <strong>Last Updated:</strong>{" "}
                      {new Date(issue.updated_at).toLocaleString()}
                    </span>
                  </div>
                )}

                {issue.completed_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>
                      <strong>Completed:</strong>{" "}
                      {new Date(issue.completed_at).toLocaleString()}
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
                    <div
                      key={index}
                      className="aspect-square bg-muted rounded-lg overflow-hidden"
                    >
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

        {/* Milestone Section - Full Width */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-6">Milestone Progress</h3>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-6">
              {/* Reported */}
              <div className="flex items-center gap-4">
                <div className="relative z-10 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Reported</h4>
                      <p className="text-sm text-muted-foreground">
                        Issue has been reported by tenant
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(issue.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acknowledged */}
              <div className="flex items-center gap-4">
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    issue.status !== "submitted" ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <CheckCircle
                    className={`w-4 h-4 ${
                      issue.status !== "submitted"
                        ? "text-primary-foreground"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Acknowledged</h4>
                      <p className="text-sm text-muted-foreground">
                        Issue has been reviewed and acknowledged
                      </p>
                    </div>
                    {issue.status !== "submitted" && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(issue.updated_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Worker Assigned */}
              <div className="flex items-center gap-4">
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    issue.assigned_worker_id ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <User
                    className={`w-4 h-4 ${
                      issue.assigned_worker_id
                        ? "text-primary-foreground"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Worker Assigned</h4>
                      <p className="text-sm text-muted-foreground">
                        {issue.assigned_worker_id
                          ? "Worker has been assigned to this issue"
                          : "Waiting for worker assignment"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* In Progress */}
              <div className="flex items-center gap-4">
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    issue.status === "in_progress" ||
                    issue.status === "completed"
                      ? "bg-primary"
                      : "bg-gray-200"
                  }`}
                >
                  <Clock
                    className={`w-4 h-4 ${
                      issue.status === "in_progress" ||
                      issue.status === "completed"
                        ? "text-primary-foreground"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">In Progress</h4>
                      <p className="text-sm text-muted-foreground">
                        Work is currently in progress
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className="flex items-center gap-4">
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    issue.status === "completed" ? "bg-success" : "bg-gray-200"
                  }`}
                >
                  <CheckCircle
                    className={`w-4 h-4 ${
                      issue.status === "completed"
                        ? "text-white"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Completed</h4>
                      <p className="text-sm text-muted-foreground">
                        {issue.status === "completed"
                          ? "Issue has been resolved"
                          : "Waiting for completion"}
                      </p>
                    </div>
                    {issue.completed_at && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(issue.completed_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Worker Rating Dialog - Only for Tenants */}
        {issue.assigned_worker_id &&
          worker &&
          issue.status === "completed" &&
          user &&
          profile?.role === "tenant" && (
            <WorkerRatingDialog
              open={isRatingDialogOpen}
              onOpenChange={setIsRatingDialogOpen}
              workerId={issue.assigned_worker_id}
              workerName={worker.name}
              maintenanceRequestId={issue.id}
              onRatingSubmitted={handleRatingSubmitted}
              existingRating={workerRating}
            />
          )}
      </DialogContent>
    </Dialog>
  );
};
