import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { AgentWorkerRatingDialog } from "@/components/agent/AgentWorkerRatingDialog";
import {
  Edit,
  Save,
  Calendar,
  User,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  UserCheck,
  Star,
  Award,
  X,
  DollarSign,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getWorkerById, getWorkersByCategory } from "@/data/workers";
import { useAuth } from "@/contexts/AuthContext";

interface AgentMaintenanceDetailProps {
  issue: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  activeTab?: string;
}

const priorities = [
  { value: "urgent", label: "Urgent", color: "destructive" },
  { value: "high", label: "High", color: "warning" },
  { value: "medium", label: "Medium", color: "secondary" },
  { value: "low", label: "Low", color: "outline" },
];

export const AgentMaintenanceDetail: React.FC<AgentMaintenanceDetailProps> = ({
  issue,
  open,
  onOpenChange,
  onUpdate,
  activeTab,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [assignedWorker, setAssignedWorker] = useState(null);
  const [showWorkerSelection, setShowWorkerSelection] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [landlordInfo, setLandlordInfo] = useState(null);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quoteData, setQuoteData] = useState({
    estimatedCost: "",
    estimatedTime: "",
    description: "",
  });
  const [submittedQuote, setSubmittedQuote] = useState(null); // Store submitted quote details
  const [workerRatings, setWorkerRatings] = useState([]);
  const [agentRating, setAgentRating] = useState<any>(null);
  const [isAgentRatingDialogOpen, setIsAgentRatingDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    priority: "",
    category: "",
    estimated_cost: "",
    actual_cost: "",
    agent_notes: "",
  });
  const { toast } = useToast();

  // Helper functions for badge styling
  const getPriorityBadgeConfig = (priority: string) => {
    switch (priority) {
      case "urgent":
        return {
          variant: "destructive" as const,
          className: "bg-red-500 text-white border-red-500",
        };
      case "high":
        return {
          variant: "destructive" as const,
          className: "bg-orange-500 text-white border-orange-500",
        };
      case "medium":
        return {
          variant: "secondary" as const,
          className: "bg-blue-500 text-white border-blue-500",
        };
      case "low":
        return {
          variant: "outline" as const,
          className: "bg-green-500 text-white border-green-500",
        };
      default:
        return {
          variant: "secondary" as const,
          className: "bg-gray-500 text-white border-gray-500",
        };
    }
  };

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          variant: "default" as const,
          className: "bg-green-600 text-white border-green-600",
        };
      case "in_process":
        return {
          variant: "secondary" as const,
          className: "bg-blue-500 text-white border-blue-500",
        };
      case "pending":
        return {
          variant: "outline" as const,
          className: "bg-yellow-100 text-yellow-700 border-yellow-300",
        };
      case "cancelled":
        return {
          variant: "destructive" as const,
          className: "bg-red-500 text-white border-red-500",
        };
      default:
        return {
          variant: "secondary" as const,
          className: "bg-gray-500 text-white border-gray-500",
        };
    }
  };

  // Dynamic AI predictions based on category
  const getAIPrediction = (category: string, priority: string) => {
    const predictions = {
      plumbing: {
        cost:
          priority === "urgent"
            ? "400-800"
            : priority === "high"
            ? "250-500"
            : "150-350",
        time:
          priority === "urgent"
            ? "2-6 hours"
            : priority === "high"
            ? "4-8 hours"
            : "2-4 hours",
        description:
          "Based on plumbing issue analysis, typical repair costs include parts and labor.",
      },
      electrical: {
        cost:
          priority === "urgent"
            ? "300-700"
            : priority === "high"
            ? "200-450"
            : "100-300",
        time:
          priority === "urgent"
            ? "1-4 hours"
            : priority === "high"
            ? "2-6 hours"
            : "1-3 hours",
        description:
          "Electrical work requires certified electrician and safety compliance checks.",
      },
      heating: {
        cost:
          priority === "urgent"
            ? "500-1200"
            : priority === "high"
            ? "300-800"
            : "200-600",
        time:
          priority === "urgent"
            ? "3-8 hours"
            : priority === "high"
            ? "4-12 hours"
            : "2-6 hours",
        description:
          "Heating system repairs may require boiler service or component replacement.",
      },
      "windows-doors": {
        cost:
          priority === "urgent"
            ? "200-600"
            : priority === "high"
            ? "150-400"
            : "100-250",
        time:
          priority === "urgent"
            ? "2-4 hours"
            : priority === "high"
            ? "2-6 hours"
            : "1-3 hours",
        description:
          "Window and door repairs include hardware, glass, or frame adjustments.",
      },
      appliances: {
        cost:
          priority === "urgent"
            ? "350-900"
            : priority === "high"
            ? "200-600"
            : "100-400",
        time:
          priority === "urgent"
            ? "1-3 hours"
            : priority === "high"
            ? "2-4 hours"
            : "1-2 hours",
        description:
          "Appliance repair costs vary by brand, age, and replacement parts availability.",
      },
      general: {
        cost:
          priority === "urgent"
            ? "250-600"
            : priority === "high"
            ? "150-400"
            : "80-250",
        time:
          priority === "urgent"
            ? "2-5 hours"
            : priority === "high"
            ? "2-6 hours"
            : "1-4 hours",
        description:
          "General maintenance covers various repair types with standard labor rates.",
      },
    };

    const normalizedCategory = category.toLowerCase().replace(/[\s\/]/g, "-");
    return predictions[normalizedCategory] || predictions["general"];
  };
  const { user } = useAuth();

  React.useEffect(() => {
    if (issue) {
      setEditData({
        title: issue.title || "",
        description: issue.description || "",
        priority: issue.priority || "medium",
        category: issue.category || "",
        estimated_cost: issue.estimated_cost || "",
        actual_cost: issue.actual_cost || "",
        agent_notes: issue.agent_notes || "",
      });

      // Reset submitted quote when issue changes
      if (!issue.estimated_cost) {
        setSubmittedQuote(null);
      }

      // Fetch assigned worker details
      fetchWorkerDetails();

      // Fetch worker ratings if assigned and completed
      const fetchWorkerRatings = async () => {
        if (issue.assigned_worker_id && issue.status === "completed") {
          try {
            const { data, error } = await supabase
              .from("worker_ratings")
              .select("*")
              .eq("maintenance_request_id", issue.id);

            if (error) throw error;
            setWorkerRatings(data || []);
          } catch (error) {
            console.error("Error fetching worker ratings:", error);
            setWorkerRatings([]);
          }
        }
      };

      // Fetch agent's existing rating if user is agent and issue is completed
      if (user && issue.status === "completed" && issue.assigned_worker_id) {
        fetchAgentRating();
      }

      fetchWorkerDetails();
      fetchWorkerRatings();
    }
  }, [issue, user]);

  const fetchWorkerDetails = async (workerId?: string) => {
    const targetWorkerId = workerId || issue?.assigned_worker_id;
    if (targetWorkerId) {
      // Validate worker ID format (should be UUID)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(targetWorkerId)) {
        console.warn("Invalid worker ID format:", targetWorkerId);
        setAssignedWorker(null);
        return;
      }

      try {
        const worker = await getWorkerById(targetWorkerId);
        setAssignedWorker(worker);
      } catch (error) {
        console.error("Error fetching worker details:", error);
        setAssignedWorker(null);
      }
    } else {
      setAssignedWorker(null);
    }
  };

  // Fetch landlord information
  const fetchLandlordInfo = async () => {
    if (issue.landlord_id) {
      try {
        const { data: landlord, error } = await supabase
          .from("profiles")
          .select("id, name, username, phone")
          .eq("id", issue.landlord_id)
          .single();

        if (!error && landlord) {
          setLandlordInfo(landlord);
        }
      } catch (error) {
        console.error("Error fetching landlord details:", error);
      }
    } else {
      // If no landlord_id, create mock landlord data
      setLandlordInfo({
        name: "John Smith",
        username: "johnsmith",
        phone: "+44 7800 654321",
      });
    }
  };

  const fetchAgentRating = async () => {
    if (!user || !issue.id || !issue.assigned_worker_id) return;

    try {
      const { data, error } = await supabase
        .from("worker_ratings")
        .select("*")
        .eq("maintenance_request_id", issue.id)
        .eq("rater_id", user.id)
        .eq("rater_type", "agent")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      setAgentRating(data);
    } catch (error) {
      console.error("Error fetching existing agent rating:", error);
    }
  };

  const handleAgentRatingSubmitted = () => {
    fetchAgentRating(); // Refresh the agent rating
    if (assignedWorker && issue.assigned_worker_id) {
      fetchWorkerDetails(issue.assigned_worker_id);
      fetchLandlordInfo();
    }
    // Also refresh all ratings to see the updated list
    if (issue.assigned_worker_id && issue.status === "completed") {
      const fetchAllRatings = async () => {
        try {
          const { data, error } = await supabase
            .from("worker_ratings")
            .select("*")
            .eq("maintenance_request_id", issue.id);

          if (error) throw error;
          setWorkerRatings(data || []);
        } catch (error) {
          console.error("Error fetching worker ratings:", error);
          setWorkerRatings([]);
        }
      };
      fetchAllRatings();
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
          category: editData.category,
          estimated_cost: editData.estimated_cost
            ? parseFloat(editData.estimated_cost)
            : null,
          actual_cost: editData.actual_cost
            ? parseFloat(editData.actual_cost)
            : null,
          agent_notes: editData.agent_notes,
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

  const handleAddNote = async () => {
    if (!internalNote.trim()) return;

    try {
      const currentNotes = issue.agent_notes || "";
      const newNotes = currentNotes
        ? `${currentNotes}\n\n[${new Date().toLocaleString()}] ${internalNote}`
        : `[${new Date().toLocaleString()}] ${internalNote}`;

      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          agent_notes: newNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", issue.id);

      if (error) throw error;

      setInternalNote("");
      toast({
        title: "Note Added",
        description: "Internal note has been added successfully.",
      });
      onUpdate();
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive",
      });
    }
  };

  const handleAssignWorker = async () => {
    try {
      // Fetch available workers for this category
      const categoryWorkers = await getWorkersByCategory(
        issue.category.toLowerCase()
      );

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
      console.error("Error loading workers for assignment:", error);
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
      const categoryWorkers = await getWorkersByCategory(
        issue.category.toLowerCase()
      );

      if (!categoryWorkers || categoryWorkers.length === 0) {
        toast({
          title: "No Workers Available",
          description: `No workers found for ${issue.category} category.`,
          variant: "destructive",
        });
        return;
      }

      // Filter out the currently assigned worker
      const filteredWorkers = categoryWorkers.filter(
        (worker) => worker.id !== issue.assigned_worker_id
      );

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
      console.error("Error loading workers for reassignment:", error);
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
        .from("maintenance_requests")
        .update({
          assigned_worker_id: workerId,
          status: "in_process",
        })
        .eq("id", issue.id);

      if (error) throw error;

      // Get the new worker details
      const newWorker = availableWorkers.find((w) => w.id === workerId);

      // Determine if this is an assignment or reassignment
      const isNewAssignment = !assignedWorker;

      toast({
        title: isNewAssignment ? "Worker Assigned" : "Worker Reassigned",
        description: `${
          newWorker?.name || "Worker"
        } has been assigned to this ticket.`,
      });

      // Update local state
      setAssignedWorker(newWorker);
      setShowWorkerSelection(false);
      setAvailableWorkers([]);
      onUpdate();
    } catch (error) {
      console.error("Error reassigning worker:", error);
      toast({
        title: "Error",
        description: "Failed to reassign worker",
        variant: "destructive",
      });
    }
  };

  const handleSubmitQuote = async () => {
    try {
      if (!issue?.id) {
        console.error("No issue ID found");
        toast({
          title: "Error",
          description: "Issue ID not found",
          variant: "destructive",
        });
        return;
      }

      if (!quoteData.estimatedCost) {
        console.error("No estimated cost provided");
        toast({
          title: "Error",
          description: "Please enter an estimated cost",
          variant: "destructive",
        });
        return;
      }

      const estimatedCostNum = parseFloat(quoteData.estimatedCost);
      if (isNaN(estimatedCostNum) || estimatedCostNum <= 0) {
        console.error("Invalid estimated cost:", quoteData.estimatedCost);
        toast({
          title: "Error",
          description: "Please enter a valid estimated cost greater than 0",
          variant: "destructive",
        });
        return;
      }

      console.log("Submitting quote:", {
        id: issue.id,
        estimatedCost: quoteData.estimatedCost,
        estimatedCostParsed: estimatedCostNum,
        estimatedTime: quoteData.estimatedTime,
        description: quoteData.description,
      });

      // Prepare update object with only fields that exist in DB
      const updateData: any = {
        estimated_cost: estimatedCostNum,
        status: "pending_approval",
      };

      // Don't add optional fields that might not exist in database
      // If you want to store estimated_time and quote_description,
      // you'll need to run the database migration first

      console.log("Update data to be sent:", updateData);

      const { error } = await supabase
        .from("maintenance_requests")
        .update(updateData)
        .eq("id", issue.id);

      if (error) {
        console.error("Database error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        toast({
          title: "Database Error",
          description: `Failed to submit quote: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log("Quote submitted successfully to database");

      // Store the submitted quote details locally
      setSubmittedQuote({
        estimatedCost: estimatedCostNum,
        estimatedTime: quoteData.estimatedTime,
        description: quoteData.description,
        submittedAt: new Date().toISOString(),
      });

      toast({
        title: "Quote Submitted",
        description: "Quote has been submitted for landlord approval.",
      });

      setShowQuoteDialog(false);
      setQuoteData({ estimatedCost: "", estimatedTime: "", description: "" });
      onUpdate();
    } catch (error) {
      console.error("Unexpected error submitting quote:", error);
      toast({
        title: "Error",
        description: `Failed to submit quote: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
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
                Agent View - Ticket #{issue.id?.slice(-8) || "12345678"}
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel Edit" : "Edit Details"}
              </Button>
            </div>
            <DialogDescription>
              View and manage maintenance request details including worker
              assignment and internal notes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Issue Information */}
            <div className="space-y-6">
              {/* Issue Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Issue Information
                </h3>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title:</label>
                      <Input
                        value={editData.title}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Description:
                      </label>
                      <Textarea
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Priority:</label>
                        <Select
                          value={editData.priority}
                          onValueChange={(val) =>
                            setEditData({ ...editData, priority: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
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
                        <Select
                          value={editData.category}
                          onValueChange={(val) =>
                            setEditData({ ...editData, category: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plumbing">Plumbing</SelectItem>
                            <SelectItem value="electrical">
                              Electrical
                            </SelectItem>
                            <SelectItem value="heating">Heating</SelectItem>
                            <SelectItem value="general">
                              General Maintenance
                            </SelectItem>
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
                            {issue.priority?.charAt(0).toUpperCase() +
                              issue.priority?.slice(1)}{" "}
                            Priority
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
                              issue.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {issue.status?.charAt(0).toUpperCase() +
                              issue.status?.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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

                  {/* Landlord Information */}
                  {landlordInfo && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Landlord:
                      </label>
                      <p className="font-medium">{landlordInfo.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="w-4 h-4" />
                        <span>{landlordInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{landlordInfo.username}@propertycare.app</span>
                      </div>
                    </div>
                  )}

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

              {/* Worker Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Worker Information
                </h3>

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
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-lg">
                                  {assignedWorker.name}
                                </h4>
                                {assignedWorker.rating && (
                                  <div className="flex items-center gap-1">
                                    <StarRating
                                      value={assignedWorker.rating}
                                      readonly
                                      size="sm"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      ({assignedWorker.rating.toFixed(1)})
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {assignedWorker.specialty}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {assignedWorker.phone}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {assignedWorker.email}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {issue.status !== "completed" && (
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
                              <h4 className="font-medium text-lg text-gray-700">
                                No Worker Assigned
                              </h4>
                              <p className="text-sm text-gray-500">
                                This ticket needs a worker to be assigned
                              </p>
                            </div>
                          </div>
                          {issue.status !== "completed" && (
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
                          {assignedWorker
                            ? "Select New Worker"
                            : "Select Worker"}
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
                          <Card
                            key={worker.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <UserCheck className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-medium">
                                        {worker.name}
                                      </h5>
                                      {worker.rating && (
                                        <div className="flex items-center gap-1">
                                          <StarRating
                                            value={worker.rating}
                                            readonly
                                            size="sm"
                                          />
                                          <span className="text-xs text-muted-foreground">
                                            ({worker.rating.toFixed(1)})
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {worker.specialty}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {worker.phone}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {worker.email}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleSelectNewWorker(worker.id)
                                  }
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
                              : `No workers available for ${issue.category} category`}
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
                      <p className="text-sm whitespace-pre-wrap">
                        {issue.agent_notes}
                      </p>
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
                      <span className="font-medium text-blue-900">
                        AI Estimate
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-700 mb-1">
                          Estimated Cost
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                          £
                          {issue.estimated_cost
                            ? `${issue.estimated_cost}.00`
                            : "450.00-650.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 mb-1">
                          Estimated Time
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                          {issue.status === "completed"
                            ? issue.completed_at
                              ? new Date(issue.completed_at).toLocaleString()
                              : "Completed"
                            : "2-4 hours"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Worker Quote & Approval */}
              {((issue.assigned_worker_id && issue.estimated_cost) ||
                submittedQuote) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Worker Quote & Approval Status
                  </h3>

                  {/* Approved Quote - Work in Progress */}
                  {issue.status === "in_process" && (
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-green-700 mb-1">
                                Approved Cost
                              </p>
                              <p className="text-xl font-bold text-green-900">
                                £
                                {issue.estimated_cost ||
                                  submittedQuote?.estimatedCost}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-green-700 mb-1">
                                Estimated Time
                              </p>
                              <p className="text-xl font-bold text-green-900">
                                {issue.estimated_time ||
                                  submittedQuote?.estimatedTime ||
                                  "Not specified"}
                              </p>
                            </div>
                          </div>

                          {(issue.quote_description ||
                            submittedQuote?.description) && (
                            <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                              <p className="text-sm font-medium text-green-800 mb-1">
                                Work Description:
                              </p>
                              <p className="text-sm text-green-700">
                                {issue.quote_description ||
                                  submittedQuote?.description}
                              </p>
                            </div>
                          )}

                          <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Status:
                              </span>
                              <Badge variant="default" className="bg-green-600">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Approved - Work in Progress
                              </Badge>
                            </div>
                            <p className="text-xs text-green-600">
                              Quote approved by landlord. Work can now begin.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Rejected Quote */}
                  {issue.status === "rejected" && (
                    <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-red-700 mb-1">
                                Rejected Cost
                              </p>
                              <p className="text-xl font-bold text-red-900 line-through">
                                £
                                {issue.estimated_cost ||
                                  submittedQuote?.estimatedCost}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-red-700 mb-1">
                                Estimated Time
                              </p>
                              <p className="text-xl font-bold text-red-900 line-through">
                                {issue.estimated_time ||
                                  submittedQuote?.estimatedTime ||
                                  "Not specified"}
                              </p>
                            </div>
                          </div>

                          {(issue.quote_description ||
                            submittedQuote?.description) && (
                            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                              <p className="text-sm font-medium text-red-800 mb-1">
                                Original Work Description:
                              </p>
                              <p className="text-sm text-red-700">
                                {issue.quote_description ||
                                  submittedQuote?.description}
                              </p>
                            </div>
                          )}

                          {issue.landlord_notes && (
                            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                              <p className="text-sm font-medium text-red-800 mb-1">
                                Rejection Reason:
                              </p>
                              <p className="text-sm text-red-700">
                                {issue.landlord_notes}
                              </p>
                            </div>
                          )}

                          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <X className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-medium text-red-800">
                                Status:
                              </span>
                              <Badge
                                variant="destructive"
                                className="bg-red-600"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Quote Rejected
                              </Badge>
                            </div>
                            <p className="text-xs text-red-600">
                              Quote was rejected by landlord. Please submit a
                              revised quote.
                            </p>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="default"
                              onClick={() => setShowQuoteDialog(true)}
                              className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Submit Revised Quote
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Completed Work */}
                  {issue.status === "completed" && (
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-green-700 mb-1">
                                Final Cost
                              </p>
                              <p className="text-xl font-bold text-green-900">
                                £
                                {issue.actual_cost ||
                                  issue.estimated_cost ||
                                  submittedQuote?.estimatedCost}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-green-700 mb-1">
                                Completed On
                              </p>
                              <p className="text-lg font-bold text-green-900">
                                {issue.completed_at
                                  ? new Date(
                                      issue.completed_at
                                    ).toLocaleDateString()
                                  : "Recently"}
                              </p>
                            </div>
                          </div>

                          {(issue.quote_description ||
                            submittedQuote?.description) && (
                            <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                              <p className="text-sm font-medium text-green-800 mb-1">
                                Work Completed:
                              </p>
                              <p className="text-sm text-green-700">
                                {issue.quote_description ||
                                  submittedQuote?.description}
                              </p>
                            </div>
                          )}

                          <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Status:
                              </span>
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Work Completed
                              </Badge>
                            </div>
                            <p className="text-xs text-green-600">
                              Maintenance work has been completed successfully.
                              Invoice has been generated.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Pending Approval */}
                  {issue.status === "pending_approval" && (
                    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-orange-700 mb-1">
                                Estimated Cost
                              </p>
                              <p className="text-xl font-bold text-orange-900">
                                £
                                {issue.estimated_cost ||
                                  submittedQuote?.estimatedCost}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-orange-700 mb-1">
                                Estimated Time
                              </p>
                              <p className="text-xl font-bold text-orange-900">
                                {issue.estimated_time ||
                                  submittedQuote?.estimatedTime ||
                                  "Not specified"}
                              </p>
                            </div>
                          </div>

                          {(issue.quote_description ||
                            submittedQuote?.description) && (
                            <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
                              <p className="text-sm font-medium text-orange-800 mb-1">
                                Work Description:
                              </p>
                              <p className="text-sm text-orange-700">
                                {issue.quote_description ||
                                  submittedQuote?.description}
                              </p>
                            </div>
                          )}

                          <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">
                                Status:
                              </span>
                              <Badge
                                variant="default"
                                className="bg-orange-600"
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                Waiting for Landlord Approval
                              </Badge>
                            </div>
                            <p className="text-xs text-orange-600">
                              Quote submitted and waiting for landlord approval.
                              You will be notified once reviewed.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Worker Assigned - Waiting for Quote */}
              {issue.assigned_worker_id &&
                !issue.estimated_cost &&
                !submittedQuote && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Worker Status
                    </h3>

                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-amber-900">
                                Waiting for Worker Quote
                              </h4>
                              <p className="text-sm text-amber-700">
                                Worker has been assigned and is preparing the
                                quote
                              </p>
                            </div>
                          </div>
                          {issue.status !== "completed" &&
                            activeTab !== "all-agency" &&
                            activeTab !== "unassigned" && (
                              <Button
                                variant="default"
                                onClick={() => setShowQuoteDialog(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Submit Quote
                              </Button>
                            )}
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

              {/* Agent Rating Section for Completed Tasks */}
              {issue.status === "completed" && assignedWorker && user && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Agent Rating</h3>

                  {agentRating ? (
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            <Award className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-blue-900">
                                Your Professional Rating
                              </span>
                              <StarRating
                                value={agentRating.rating}
                                readonly
                                size="sm"
                              />
                              <span className="text-sm text-blue-700">
                                {agentRating.rating}/5
                              </span>
                            </div>
                            {agentRating.comment && (
                              <p className="text-sm text-blue-700 italic">
                                "{agentRating.comment}"
                              </p>
                            )}
                            <p className="text-xs text-blue-600 mt-1">
                              Rated on{" "}
                              {new Date(
                                agentRating.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAgentRatingDialogOpen(true)}
                          className="mt-3"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Update Rating
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            <Star className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-blue-900">
                              Rate this worker's performance
                            </p>
                            <p className="text-sm text-blue-700">
                              Provide professional feedback on reliability,
                              quality, etc.
                            </p>
                          </div>
                          <Button
                            onClick={() => setIsAgentRatingDialogOpen(true)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Rate Worker
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* All Worker Ratings for Completed Tasks */}
              {issue.status === "completed" && assignedWorker && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">All Ratings</h3>

                  {workerRatings.length > 0 ? (
                    <div className="space-y-3">
                      {workerRatings.map((rating, index) => (
                        <Card
                          key={rating.id}
                          className={`bg-gradient-to-br ${
                            rating.rater_type === "agent"
                              ? "from-blue-50 to-indigo-50 border-blue-200"
                              : "from-yellow-50 to-amber-50 border-yellow-200"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                  rating.rater_type === "agent"
                                    ? "bg-blue-600"
                                    : "bg-yellow-600"
                                }`}
                              >
                                <Award className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`font-medium ${
                                      rating.rater_type === "agent"
                                        ? "text-blue-900"
                                        : "text-yellow-900"
                                    }`}
                                  >
                                    {rating.rater_type === "agent"
                                      ? "Agent Rating"
                                      : "Tenant Rating"}
                                  </span>
                                  <StarRating
                                    value={rating.rating}
                                    readonly
                                    size="sm"
                                  />
                                  <span
                                    className={`text-sm ${
                                      rating.rater_type === "agent"
                                        ? "text-blue-700"
                                        : "text-yellow-700"
                                    }`}
                                  >
                                    {rating.rating}/5
                                  </span>
                                </div>
                                {rating.comment && (
                                  <p
                                    className={`text-sm italic ${
                                      rating.rater_type === "agent"
                                        ? "text-blue-700"
                                        : "text-yellow-700"
                                    }`}
                                  >
                                    "{rating.comment}"
                                  </p>
                                )}
                                <p
                                  className={`text-xs mt-1 ${
                                    rating.rater_type === "agent"
                                      ? "text-blue-600"
                                      : "text-yellow-600"
                                  }`}
                                >
                                  Rated on{" "}
                                  {new Date(
                                    rating.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Star className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              No Ratings Yet
                            </p>
                            <p className="text-sm text-gray-500">
                              No ratings have been submitted for this worker yet
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

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
        </DialogContent>
      </Dialog>

      {/* Agent Worker Rating Dialog */}
      {issue.assigned_worker_id &&
        assignedWorker &&
        issue.status === "completed" &&
        user && (
          <AgentWorkerRatingDialog
            open={isAgentRatingDialogOpen}
            onOpenChange={setIsAgentRatingDialogOpen}
            workerId={issue.assigned_worker_id}
            workerName={assignedWorker.name}
            maintenanceRequestId={issue.id}
            onRatingSubmitted={handleAgentRatingSubmitted}
            existingRating={agentRating}
          />
        )}
    </>
  );
};
