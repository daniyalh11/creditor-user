
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, FileText, Download, RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";

interface Submission {
  id: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  status: "graded" | "pending";
  feedback?: string;
  files: string[];
}

export function AssignmentSubmissions() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  // Sample submissions data - in real app this would come from API
  const [submissions] = useState<Submission[]>([
    {
      id: "sub-1",
      submittedAt: "2024-01-15 14:30",
      score: 75,
      maxScore: 100,
      status: "graded",
      feedback: "Good implementation of Context API. Could improve error handling.",
      files: ["theme-provider.tsx", "app.tsx", "styles.css"]
    },
    {
      id: "sub-2",
      submittedAt: "2024-01-18 16:45",
      score: 88,
      maxScore: 100,
      status: "graded",
      feedback: "Excellent work! Great TypeScript implementation and clean code structure.",
      files: ["theme-context.tsx", "theme-provider.tsx", "app.tsx", "components.tsx"]
    },
    {
      id: "sub-3",
      submittedAt: "2024-01-20 10:15",
      score: 0,
      maxScore: 100,
      status: "pending",
      files: ["updated-theme-provider.tsx", "improved-app.tsx"]
    }
  ]);

  const assignment = {
    title: "Context Provider Implementation",
    description: "Build a theme provider using React Context API and implement dark/light mode switching",
    dueDate: "2024-02-20"
  };

  const latestSubmission = submissions[submissions.length - 1];
  const bestScore = Math.max(...submissions.filter(s => s.status === "graded").map(s => s.score));

  const handleResubmit = () => {
    navigate(`/assignment/${assignmentId}/submit`);
    toast.success("Redirecting to resubmit assignment");
  };

  const handleViewSubmission = (submissionId: string) => {
    toast.success(`Viewing submission ${submissionId}`);
    // In real app, this would show submission details
  };

  const handleDownloadFile = (fileName: string) => {
    toast.success(`Downloading ${fileName}`);
    // In real app, this would download the file
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      
      <main className="flex-1">
        <div className="container py-6 max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft size={16} />
              Back
            </Button>
          </div>

          <div className="space-y-6">
            {/* Assignment Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
                    <p className="text-muted-foreground">{assignment.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      Best Score: {bestScore}/100
                    </Badge>
                    <Badge variant={latestSubmission?.status === "pending" ? "outline" : "default"}>
                      {latestSubmission?.status === "pending" ? "Pending Review" : "Graded"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button onClick={handleResubmit} className="flex items-center gap-2">
                <RotateCcw size={16} />
                Resubmit Assignment
              </Button>
              <Button variant="outline" onClick={() => toast.info("Assignment guidelines opened")}>
                View Guidelines
              </Button>
            </div>

            {/* Submissions History */}
            <Card>
              <CardHeader>
                <CardTitle>Submission History ({submissions.length} submissions)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Files</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">
                            {submission.submittedAt}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={submission.status === "graded" ? 
                                (submission.score >= 70 ? "text-green-600" : "text-red-600") : 
                                "text-muted-foreground"
                              }>
                                {submission.status === "graded" ? 
                                  `${submission.score}/${submission.maxScore}` : 
                                  "Pending"
                                }
                              </span>
                              {submission.status === "graded" && submission.score >= 70 && (
                                <Badge variant="default" className="text-xs">Pass</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={submission.status === "graded" ? "default" : "outline"}>
                              {submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {submission.files.map((file, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <FileText size={14} />
                                  <span className="text-sm">{file}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDownloadFile(file)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Download size={12} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewSubmission(submission.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye size={14} />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Feedback Section */}
                {submissions.filter(s => s.feedback).length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-semibold">Recent Feedback</h4>
                    {submissions
                      .filter(s => s.feedback)
                      .slice(-2)
                      .map((submission) => (
                        <div key={submission.id} className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Submission from {submission.submittedAt}
                            </span>
                            <Badge variant="outline">
                              Score: {submission.score}/{submission.maxScore}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {submission.feedback}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AssignmentSubmissions;
