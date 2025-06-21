
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Upload, FileText, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

export function AssignmentSubmit() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Sample assignment data - in real app this would come from API
  const assignment = {
    id: assignmentId,
    title: "Context Provider Implementation",
    description: "Build a theme provider using React Context API and implement dark/light mode switching",
    dueDate: "2024-02-20",
    estimatedTime: "4 hours",
    maxScore: 100,
    requirements: [
      "Create a ThemeContext with light and dark themes",
      "Implement a ThemeProvider component",
      "Add theme switching functionality",
      "Style components to respond to theme changes",
      "Include proper TypeScript types"
    ]
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!submissionText.trim() && selectedFiles.length === 0) {
      toast.error("Please add submission text or upload files");
      return;
    }

    // In real app, this would submit to API
    toast.success("Assignment submitted successfully!");
    
    // Navigate to submissions page
    setTimeout(() => {
      navigate(`/assignment/${assignmentId}/submissions`);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      
      <main className="flex-1">
        <div className="container py-6 max-w-4xl">
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
                  <Badge variant="outline">Submit Assignment</Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Due: {assignment.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{assignment.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={16} />
                    <span>Max Score: {assignment.maxScore}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {assignment.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Submission Form */}
            <Card>
              <CardHeader>
                <CardTitle>Your Submission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="submission-text">Submission Description</Label>
                  <Textarea
                    id="submission-text"
                    placeholder="Describe your solution and implementation approach..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="min-h-[120px] mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="file-upload">Upload Files</Label>
                  <div className="mt-2">
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="mb-4"
                    />
                    
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Selected Files:</p>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                            <div className="flex items-center gap-2">
                              <FileText size={16} />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeFile(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} className="flex-1">
                    <Upload size={16} className="mr-2" />
                    Submit Assignment
                  </Button>
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AssignmentSubmit;
