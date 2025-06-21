import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { QuizData, AssignmentData } from "@/types/unit";

interface ModuleManagementProps {
  moduleId: string;
  quizzes: QuizData[];
  assignments: AssignmentData[];
  onQuizAdd: (quiz: Omit<QuizData, 'id'>) => void;
  onQuizEdit: (id: string, quiz: Partial<QuizData>) => void;
  onQuizDelete: (id: string) => void;
  onAssignmentAdd: (assignment: Omit<AssignmentData, 'id'>) => void;
  onAssignmentEdit: (id: string, assignment: Partial<AssignmentData>) => void;
  onAssignmentDelete: (id: string) => void;
}

export function ModuleManagement({
  moduleId,
  quizzes,
  assignments,
  onQuizAdd,
  onQuizEdit,
  onQuizDelete,
  onAssignmentAdd,
  onAssignmentEdit,
  onAssignmentDelete
}: ModuleManagementProps) {
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizData | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentData | null>(null);

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    questionCount: 10,
    duration: '15 min',
    passingScore: 70,
    lessonId: ''
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    estimatedTime: '2 hours',
    maxScore: 100,
    dueDate: '',
    lessonId: ''
  });

  const handleQuizSubmit = () => {
    if (!quizForm.title || !quizForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quizData = {
      ...quizForm,
      moduleId,
      status: 'not-started' as const
    };

    if (editingQuiz) {
      onQuizEdit(editingQuiz.id, quizData);
      toast.success("Quiz updated successfully");
      setEditingQuiz(null);
    } else {
      onQuizAdd(quizData);
      toast.success("Quiz added successfully");
    }

    setQuizForm({
      title: '',
      description: '',
      questionCount: 10,
      duration: '15 min',
      passingScore: 70,
      lessonId: ''
    });
    setIsQuizDialogOpen(false);
  };

  const handleAssignmentSubmit = () => {
    if (!assignmentForm.title || !assignmentForm.description || !assignmentForm.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const assignmentData = {
      ...assignmentForm,
      moduleId,
      status: 'not-started' as const,
      fileCount: 0
    };

    if (editingAssignment) {
      onAssignmentEdit(editingAssignment.id, assignmentData);
      toast.success("Assignment updated successfully");
      setEditingAssignment(null);
    } else {
      onAssignmentAdd(assignmentData);
      toast.success("Assignment added successfully");
    }

    setAssignmentForm({
      title: '',
      description: '',
      estimatedTime: '2 hours',
      maxScore: 100,
      dueDate: '',
      lessonId: ''
    });
    setIsAssignmentDialogOpen(false);
  };

  const openQuizEdit = (quiz: QuizData) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.questionCount,
      duration: quiz.duration,
      passingScore: quiz.passingScore,
      lessonId: quiz.lessonId
    });
    setIsQuizDialogOpen(true);
  };

  const openAssignmentEdit = (assignment: AssignmentData) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      estimatedTime: assignment.estimatedTime,
      maxScore: assignment.maxScore,
      dueDate: assignment.dueDate,
      lessonId: assignment.lessonId
    });
    setIsAssignmentDialogOpen(true);
  };

  const handleQuizDelete = (quizId: string) => {
    onQuizDelete(quizId);
    toast.success("Quiz deleted successfully");
  };

  const handleAssignmentDelete = (assignmentId: string) => {
    onAssignmentDelete(assignmentId);
    toast.success("Assignment deleted successfully");
  };

  return (
    <div className="space-y-6">
      {/* Management Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings size={24} />
            Module Management
          </h2>
          <p className="text-muted-foreground">Manage quizzes and assignments for this module</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus size={16} />
                Add Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}</DialogTitle>
                <DialogDescription>
                  {editingQuiz ? 'Update the quiz details below.' : 'Create a new quiz for this module.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quiz-title">Title *</Label>
                  <Input
                    id="quiz-title"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <Label htmlFor="quiz-description">Description *</Label>
                  <Textarea
                    id="quiz-description"
                    value={quizForm.description}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter quiz description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiz-questions">Question Count</Label>
                    <Input
                      id="quiz-questions"
                      type="number"
                      value={quizForm.questionCount}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiz-duration">Duration</Label>
                    <Input
                      id="quiz-duration"
                      value={quizForm.duration}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 15 min"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiz-passing">Passing Score (%)</Label>
                    <Input
                      id="quiz-passing"
                      type="number"
                      min="0"
                      max="100"
                      value={quizForm.passingScore}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiz-lesson">Lesson ID</Label>
                    <Input
                      id="quiz-lesson"
                      value={quizForm.lessonId}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, lessonId: e.target.value }))}
                      placeholder="Lesson ID"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsQuizDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleQuizSubmit}>
                  {editingQuiz ? 'Update Quiz' : 'Add Quiz'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Plus size={16} />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}</DialogTitle>
                <DialogDescription>
                  {editingAssignment ? 'Update the assignment details below.' : 'Create a new assignment for this module.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="assignment-title">Title *</Label>
                  <Input
                    id="assignment-title"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter assignment title"
                  />
                </div>
                <div>
                  <Label htmlFor="assignment-description">Description *</Label>
                  <Textarea
                    id="assignment-description"
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter assignment description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignment-time">Estimated Time</Label>
                    <Input
                      id="assignment-time"
                      value={assignmentForm.estimatedTime}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      placeholder="e.g., 2 hours"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignment-score">Max Score</Label>
                    <Input
                      id="assignment-score"
                      type="number"
                      value={assignmentForm.maxScore}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignment-due">Due Date *</Label>
                    <Input
                      id="assignment-due"
                      type="date"
                      value={assignmentForm.dueDate}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignment-lesson">Lesson ID</Label>
                    <Input
                      id="assignment-lesson"
                      value={assignmentForm.lessonId}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, lessonId: e.target.value }))}
                      placeholder="Lesson ID"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignmentSubmit}>
                  {editingAssignment ? 'Update Assignment' : 'Add Assignment'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quizzes Management */}
      <Card>
        <CardHeader>
          <CardTitle>Quizzes ({quizzes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No quizzes added yet. Click "Add Quiz" to create one.</p>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{quiz.title}</h4>
                    <p className="text-sm text-muted-foreground">{quiz.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{quiz.questionCount} questions</Badge>
                      <Badge variant="outline">{quiz.duration}</Badge>
                      <Badge variant="outline">{quiz.passingScore}% to pass</Badge>
                      <Badge 
                        variant={quiz.status === 'completed' ? 'default' : quiz.status === 'in-progress' ? 'secondary' : 'outline'}
                      >
                        {quiz.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={() => openQuizEdit(quiz)} className="flex-1 sm:flex-none">
                      <Edit size={14} />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{quiz.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleQuizDelete(quiz.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignments Management */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No assignments added yet. Click "Add Assignment" to create one.</p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{assignment.title}</h4>
                    <p className="text-sm text-muted-foreground">{assignment.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{assignment.estimatedTime}</Badge>
                      <Badge variant="outline">{assignment.maxScore} points</Badge>
                      <Badge variant="outline">Due: {assignment.dueDate}</Badge>
                      <Badge 
                        variant={assignment.status === 'submitted' || assignment.status === 'graded' ? 'default' : assignment.status === 'in-progress' ? 'secondary' : 'outline'}
                      >
                        {assignment.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={() => openAssignmentEdit(assignment)} className="flex-1 sm:flex-none">
                      <Edit size={14} />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{assignment.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAssignmentDelete(assignment.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
