import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Building,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wrench,
  User,
  Calendar,
  DollarSign,
  Plus,
  TrendingUp,
  Eye,
  Star,
  Award,
  Phone,
  Mail,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getWorkerById } from "@/data/workers";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "submitted", label: "Submitted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const LandlordMaintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [approvalForm, setApprovalForm] = useState({
    approved: "",
    notes: "",
    maxBudget: "",
  });
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingRequest, setViewingRequest] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [assignedWorker, setAssignedWorker] = useState<any>(null);
  const [workerRatings, setWorkerRatings] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMaintenanceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch maintenance requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "text-warning";
      case "in_progress":
        return "text-landlord";
      case "completed":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const handleViewDetails = async (request: any) => {
    setViewingRequest(request);
    setIsViewDialogOpen(true);

    // Fetch assigned worker details if available
    if (request.assigned_worker_id) {
      try {
        const worker = await getWorkerById(request.assigned_worker_id);
        setAssignedWorker(worker);
      } catch (error) {
        console.error("Error fetching worker details:", error);
        setAssignedWorker(null);
      }
    }

    // Fetch worker ratings if completed
    if (request.status === "completed" && request.assigned_worker_id) {
      try {
        const { data, error } = await supabase
          .from("worker_ratings")
          .select("*")
          .eq("maintenance_request_id", request.id);

        if (error) throw error;
        setWorkerRatings(data || []);
      } catch (error) {
        console.error("Error fetching worker ratings:", error);
        setWorkerRatings([]);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <Wrench className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          status: "in_progress",
          landlord_notes: approvalForm.notes,
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Request Approved",
        description:
          "Maintenance request has been approved and is now in progress.",
      });

      fetchMaintenanceRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(
    (request) => request.status === "submitted"
  ).length;
  const inProgressRequests = requests.filter(
    (request) => request.status === "in_progress"
  ).length;
  const completedRequests = requests.filter(
    (request) => request.status === "completed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Property Maintenance
          </h1>
          <p className="text-muted-foreground">
            Review and approve maintenance requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Request
          </Button>
          <Button variant="landlord">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-landlord">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-landlord" />
              <div>
                <p className="text-2xl font-bold">{totalRequests}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{pendingRequests}</p>
                <p className="text-sm text-muted-foreground">
                  Pending Approval
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-info">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-info" />
              <div>
                <p className="text-2xl font-bold">{inProgressRequests}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{completedRequests}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
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
                  placeholder="Search maintenance requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-landlord mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading maintenance requests...
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {request.title}
                          </h3>
                          <Badge variant={getPriorityColor(request.priority)}>
                            {request.priority.charAt(0).toUpperCase() +
                              request.priority.slice(1)}
                          </Badge>
                          <Badge variant="outline">{request.category}</Badge>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                          <p>
                            <strong>Reported:</strong>{" "}
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                          {request.room && (
                            <p>
                              <strong>Room:</strong> {request.room}
                            </p>
                          )}
                          {request.subcategory && (
                            <p>
                              <strong>Type:</strong> {request.subcategory}
                            </p>
                          )}
                          {request.estimated_cost && (
                            <p>
                              <strong>Estimated Cost:</strong> $
                              {request.estimated_cost}
                            </p>
                          )}
                        </div>

                        <p className="text-muted-foreground mb-3">
                          {request.description}
                        </p>

                        {request.quick_fixes &&
                          request.quick_fixes.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-1">
                                Quick fixes attempted:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {request.quick_fixes.map(
                                  (fix: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {fix}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Badge
                      variant={
                        request.status === "completed" ? "default" : "secondary"
                      }
                      className="w-fit"
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </Badge>

                    <div className="flex gap-2">
                      {request.status === "submitted" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="landlord"
                              size="sm"
                              onClick={() => setSelectedRequest(request.id)}
                            >
                              Review & Approve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Review Maintenance Request
                              </DialogTitle>
                              <DialogDescription>
                                Review and approve or modify this maintenance
                                request
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">
                                  {request.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {request.description}
                                </p>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  <span>Category: {request.category}</span>
                                  <span>Priority: {request.priority}</span>
                                  {request.room && (
                                    <span>Room: {request.room}</span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="approval-notes">
                                  Approval Notes
                                </Label>
                                <Textarea
                                  id="approval-notes"
                                  placeholder="Add any notes or instructions for the maintenance team..."
                                  value={approvalForm.notes}
                                  onChange={(e) =>
                                    setApprovalForm({
                                      ...approvalForm,
                                      notes: e.target.value,
                                    })
                                  }
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label htmlFor="max-budget">
                                  Maximum Budget ($)
                                </Label>
                                <Input
                                  id="max-budget"
                                  type="number"
                                  placeholder="Set budget limit"
                                  value={approvalForm.maxBudget}
                                  onChange={(e) =>
                                    setApprovalForm({
                                      ...approvalForm,
                                      maxBudget: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div className="flex gap-3 pt-4">
                                <Button variant="outline">Deny Request</Button>
                                <Button
                                  variant="landlord"
                                  onClick={() =>
                                    handleApproveRequest(request.id)
                                  }
                                >
                                  Approve Request
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredRequests.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No maintenance requests found
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No maintenance requests have been submitted yet"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingRequest && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Maintenance Request Details - #
                  {viewingRequest.id?.slice(-8) || "12345678"}
                </DialogTitle>
                <DialogDescription>
                  Complete information about this maintenance request
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Request Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Request Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Title:
                        </label>
                        <p className="font-medium">{viewingRequest.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Description:
                        </label>
                        <p className="text-sm">{viewingRequest.description}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Priority:
                          </label>
                          <div className="mt-1">
                            <Badge
                              variant={getPriorityColor(
                                viewingRequest.priority
                              )}
                            >
                              {viewingRequest.priority
                                ?.charAt(0)
                                .toUpperCase() +
                                viewingRequest.priority?.slice(1)}
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
                                viewingRequest.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {viewingRequest.status?.charAt(0).toUpperCase() +
                                viewingRequest.status?.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Category:
                          </label>
                          <p>{viewingRequest.category}</p>
                        </div>
                        {viewingRequest.room && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Room:
                            </label>
                            <p>{viewingRequest.room}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Worker Information */}
                  {assignedWorker && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Assigned Worker
                      </h3>
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {assignedWorker.initials}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-blue-900">
                                  {assignedWorker.name}
                                </h4>
                                {assignedWorker.rating && (
                                  <div className="flex items-center gap-1">
                                    <StarRating
                                      value={assignedWorker.rating}
                                      readonly
                                      size="sm"
                                    />
                                    <span className="text-sm text-blue-700">
                                      ({assignedWorker.rating.toFixed(1)})
                                    </span>
                                  </div>
                                )}
                              </div>
                              {assignedWorker.specialty && (
                                <p className="text-sm text-blue-700 mb-2">
                                  {assignedWorker.specialty}
                                </p>
                              )}
                              {assignedWorker.phone && (
                                <div className="flex items-center gap-2 mt-2 text-sm text-blue-700">
                                  <Phone className="w-4 h-4" />
                                  <span>{assignedWorker.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Right Column - Timeline & Ratings */}
                <div className="space-y-6">
                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          <strong>Reported:</strong>{" "}
                          {new Date(viewingRequest.created_at).toLocaleString()}
                        </span>
                      </div>
                      {viewingRequest.completed_at && (
                        <div className="flex items-center gap-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>
                            <strong>Completed:</strong>{" "}
                            {new Date(
                              viewingRequest.completed_at
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Worker Ratings for Completed Tasks */}
                  {viewingRequest.status === "completed" && assignedWorker && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Worker Performance
                      </h3>

                      {workerRatings.length > 0 ? (
                        <div className="space-y-3">
                          {workerRatings.map((rating) => (
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
                                  No ratings have been submitted for this worker
                                  yet
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Cost Information */}
                  {(viewingRequest.estimated_cost ||
                    viewingRequest.actual_cost) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Cost Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {viewingRequest.estimated_cost && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Estimated Cost:
                            </label>
                            <p className="text-lg font-bold">
                              £{viewingRequest.estimated_cost}
                            </p>
                          </div>
                        )}
                        {viewingRequest.actual_cost && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Actual Cost:
                            </label>
                            <p className="text-lg font-bold">
                              £{viewingRequest.actual_cost}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {(viewingRequest.agent_notes ||
                    viewingRequest.landlord_notes) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Notes</h3>
                      <div className="space-y-3">
                        {viewingRequest.agent_notes && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Agent Notes:
                            </label>
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-sm whitespace-pre-wrap">
                                {viewingRequest.agent_notes}
                              </p>
                            </div>
                          </div>
                        )}
                        {viewingRequest.landlord_notes && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Landlord Notes:
                            </label>
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-sm whitespace-pre-wrap">
                                {viewingRequest.landlord_notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
