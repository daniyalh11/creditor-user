import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  BookOpen, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  Download,
  Share2,
  Settings,
  Maximize,
  Minimize,
  X
} from "lucide-react";
import { toast } from "sonner";
import ScormService from "@/services/scormService";

const ScormPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let data;
        try {
          data = await ScormService.fetchCourseData(courseId);
        } catch (error) {
          // Fallback to mock data if backend is not available
          console.warn("Backend not available, using mock data:", error);
          data = {
            id: courseId,
            title: "Complete React Developer in 2023",
            description: "Learn React from scratch with hooks, Redux, and more",
            instructor: "John Smith",
            duration: "25 hours",
            progress: 0,
            scormUrl: `/ModulePackages/${courseId}/index.html`,
            modules: [
              {
                id: "1",
                title: "Introduction to React",
                duration: "45 min",
                completed: false,
                scormUrl: `/ModulePackages/${courseId}/module1/index.html`
              },
              {
                id: "2", 
                title: "React Hooks Fundamentals",
                duration: "60 min",
                completed: false,
                scormUrl: `/ModulePackages/${courseId}/module2/index.html`
              },
              {
                id: "3",
                title: "State Management with Redux",
                duration: "90 min", 
                completed: false,
                scormUrl: `/ModulePackages/${courseId}/module3/index.html`
              }
            ],
            currentModule: "1"
          };
        }
        
        setCourseData(data);
        setCurrentModule(data.modules.find(m => m.id === data.currentModule) || data.modules[0]);
        
        // Load progress from localStorage or backend
        const savedProgress = localStorage.getItem(`course-progress-${courseId}`);
        if (savedProgress) {
          setProgress(parseInt(savedProgress));
        }
        
      } catch (err) {
        setError("Failed to load course data. Please try again.");
        toast.error("Failed to load course");
        console.error("Error loading course:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  const handleModuleChange = (module) => {
    setCurrentModule(module);
    toast.success(`Switched to ${module.title}`);
  };

  const handleProgressUpdate = async (newProgress) => {
    setProgress(newProgress);
    localStorage.setItem(`course-progress-${courseId}`, newProgress.toString());
    
    try {
      // Send progress to backend
      await ScormService.updateCourseProgress(courseId, currentModule?.id, newProgress);
      toast.success("Progress saved successfully");
    } catch (error) {
      toast.error("Failed to save progress");
      console.error("Error saving progress:", error);
    }
  };

  const handleFullscreen = () => {
    const iframe = document.getElementById('scorm-iframe');
    if (iframe) {
      if (isFullscreen) {
        document.exitFullscreen();
      } else {
        iframe.requestFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleClose = () => {
    navigate('/courses');
  };

  // Debug logging
  console.log('SCORM DEBUG:', { isLoading, error, courseData, currentModule });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Course</h2>
          <p className="text-muted-foreground">Please wait while we prepare your learning experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-lg font-semibold">{courseData?.title}</h1>
              <p className="text-sm text-muted-foreground">
                Module {currentModule?.id}: {currentModule?.title}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {currentModule?.duration}
            </Badge>
            
            <Button variant="ghost" size="icon" onClick={handleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => setShowControls(!showControls)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="container pb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Course Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        {showControls && (
          <div className="w-80 border-r bg-muted/30 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Course Modules</h3>
              
              <div className="space-y-2">
                {courseData?.modules.map((module) => (
                  <div
                    key={module.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentModule?.id === module.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => handleModuleChange(module)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Module {module.id}</p>
                        <p className="text-xs opacity-80">{module.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{module.duration}</span>
                        {module.completed && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-background rounded-lg border">
                <h4 className="font-medium mb-3">Course Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span>{courseData?.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{courseData?.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modules:</span>
                    <span>{courseData?.modules.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCORM Content */}
        <div className="flex-1 relative">
          {currentModule ? (
            <iframe
              id="scorm-iframe"
              title={`SCORM Module ${currentModule.id}`}
              src={currentModule.scormUrl}
              className="w-full h-full border-0"
              allowFullScreen
              onLoad={() => {
                toast.success(`Loaded ${currentModule.title}`);
              }}
              onError={() => {
                toast.error("Failed to load SCORM content");
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Module Selected</h3>
                <p className="text-muted-foreground">Please select a module from the sidebar to begin learning.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScormPage;
