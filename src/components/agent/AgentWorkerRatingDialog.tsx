import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AgentWorkerRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerId: string;
  workerName: string;
  maintenanceRequestId: string;
  onRatingSubmitted: () => void;
  existingRating?: {
    rating: number;
    comment: string | null;
  };
}

export const AgentWorkerRatingDialog: React.FC<
  AgentWorkerRatingDialogProps
> = ({
  open,
  onOpenChange,
  workerId,
  workerName,
  maintenanceRequestId,
  onRatingSubmitted,
  existingRating,
}) => {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [comment, setComment] = useState(existingRating?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit a rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData = {
        worker_id: workerId,
        maintenance_request_id: maintenanceRequestId,
        rater_id: user.id,
        rater_type: "agent",
        rating,
        comment: comment.trim() || null,
      };

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from("worker_ratings")
          .update(ratingData)
          .eq("maintenance_request_id", maintenanceRequestId)
          .eq("rater_id", user.id)
          .eq("rater_type", "agent");

        if (error) throw error;

        toast({
          title: "Rating Updated",
          description: "Your rating has been updated successfully.",
        });
      } else {
        // Create new rating
        const { error } = await supabase
          .from("worker_ratings")
          .insert(ratingData);

        if (error) throw error;

        toast({
          title: "Rating Submitted",
          description: "Thank you for rating the worker!",
        });
      }

      onRatingSubmitted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Worker: {workerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>How would you rate this worker's performance?</Label>
            <div className="flex items-center gap-2">
              <StarRating value={rating} onChange={setRating} size="lg" />
              {rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Professional Notes (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your professional assessment of this worker's performance, reliability, quality of work, etc..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting
              ? "Submitting..."
              : existingRating
              ? "Update Rating"
              : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
