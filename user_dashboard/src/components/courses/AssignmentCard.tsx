import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssignmentData } from "@/types/unit";

interface AssignmentCardProps {
  assignment: AssignmentData;
  className?: string;
  onSubmit?: () => void;
  onViewSubmission?: () => void;
}

export function AssignmentCard({ assignment, className, onSubmit, onViewSubmission }: AssignmentCardProps) {
  // Check if assignment is due soon (within 2 days)
  const isDueSoon = () => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays <= 2 && diffDays > 0;
  };
  
  // Check if assignment is overdue
  const isOverdue = () => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    return now > dueDate && assignment.status !== "submitted" && assignment.status !== "graded";
  };

  const getStatusBadge = () => {
    switch (assignment.status) {
      case "graded":
        return assignment.score && assignment.score >= (assignment.maxScore * 0.6) ? "default" : "destructive";
      case "submitted":
        return "default";
      case "in-progress":
        return "outline";
      case "not-started":
        return isOverdue() ? "destructive" : isDueSoon() ? "outline" : "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusText = () => {
    switch (assignment.status) {
      case "graded":
        return "Graded";
      case "submitted":
        return "Submitted";
      case "in-progress":
        return "In Progress";
      case "not-started":
        return isOverdue() ? "Overdue" : isDueSoon() ? "Due Soon" : "Not Submitted";
      default:
        return "Unknown";
    }
  };

  const getButtonText = () => {
    switch (assignment.status) {
      case "graded":
        return "View Feedback";
      case "submitted":
        return "View Submission";
      case "in-progress":
        return "Continue Assignment";
      case "not-started":
        return "Submit Assignment";
      default:
        return "Start Assignment";
    }
  };

  const getButtonVariant = () => {
    return assignment.status === "graded" || assignment.status === "submitted" ? "outline" : "default";
  };

  const handleButtonClick = () => {
    if (assignment.status === "submitted" || assignment.status === "graded") {
      onViewSubmission?.();
    } else {
      onSubmit?.();
    }
  };

  const getLinkPath = () => {
    if (assignment.status === "submitted" || assignment.status === "graded") {
      return `/assignment/${assignment.id}/submissions`;
    }
    return `/assignment/${assignment.id}/submit`;
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all border-l-4",
        assignment.status === "graded" 
          ? (assignment.score && assignment.score >= (assignment.maxScore * 0.6) ? "border-l-green-500" : "border-l-red-500") 
          : assignment.status === "submitted" ? "border-l-blue-500" 
          : assignment.status === "in-progress" ? "border-l-amber-500" 
          : isOverdue() ? "border-l-red-500" : "border-l-gray-300",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            <span className="mr-2">{assignment.title}</span>
            {assignment.status === "graded" && (
              <Badge variant={assignment.score && assignment.score >= (assignment.maxScore * 0.6) ? "default" : "destructive"}>
                {assignment.score}/{assignment.maxScore}
              </Badge>
            )}
          </CardTitle>
          
          <Badge variant={getStatusBadge()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{assignment.description}</p>
        
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>Due: {assignment.dueDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{assignment.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText size={14} />
            <span>{assignment.fileCount} Files</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          variant={getButtonVariant()} 
          className="w-full"
          onClick={handleButtonClick}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AssignmentCard;
