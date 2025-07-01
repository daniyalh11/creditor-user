import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Search, 
  FileText,
  Video,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function Guides() {
  const guideCategories = [
    { id: "getting-started", name: "Getting Started", count: 8 },
    { id: "courses", name: "Courses & Learning", count: 12 },
    { id: "account", name: "Account Settings", count: 5 },
    { id: "billing", name: "Billing & Payments", count: 6 },
    { id: "technical", name: "Technical Support", count: 7 },
  ];

  const popularGuides = [
    { 
      id: "1", 
      title: "Account Setup and Profile Customization", 
      description: "Learn how to set up your account and customize your profile settings.", 
      category: "Getting Started",
      timeToRead: "5 min read",
      type: "article"
    },
    { 
      id: "2", 
      title: "Navigating the Learning Dashboard", 
      description: "A complete tour of all dashboard features and how to use them effectively.", 
      category: "Getting Started",
      timeToRead: "8 min read",
      type: "video"
    },
    { 
      id: "3", 
      title: "Course Enrollment and Progress Tracking", 
      description: "Step-by-step guide to enrolling in courses and tracking your learning progress.", 
      category: "Courses & Learning",
      timeToRead: "6 min read",
      type: "article"
    },
    { 
      id: "4", 
      title: "Downloading Course Materials for Offline Access", 
      description: "How to download and access course content when you're offline.", 
      category: "Courses & Learning",
      timeToRead: "4 min read",
      type: "article"
    },
    { 
      id: "5", 
      title: "Managing Your Billing Information", 
      description: "Learn how to update payment methods and manage billing preferences.", 
      category: "Billing & Payments",
      timeToRead: "7 min read",
      type: "video"
    },
    { 
      id: "6", 
      title: "Accessibility Features for All Users", 
      description: "Discover the accessibility features available throughout the platform.", 
      category: "Technical Support",
      timeToRead: "10 min read",
      type: "article"
    },
  ];

  const recentGuides = [
    { 
      id: "7", 
      title: "Using the New AI Study Assistant", 
      description: "A guide to using our newly launched AI-powered study tools effectively.", 
      category: "Courses & Learning",
      timeToRead: "12 min read",
      type: "article",
      isNew: true
    },
    { 
      id: "8", 
      title: "Mobile App Setup and Synchronization", 
      description: "How to set up the mobile app and keep your progress in sync across devices.", 
      category: "Technical Support",
      timeToRead: "9 min read",
      type: "article",
      isNew: true
    },
    { 
      id: "9", 
      title: "Group Study Features and Collaboration", 
      description: "Make the most of our group learning and collaboration features.", 
      category: "Courses & Learning",
      timeToRead: "8 min read",
      type: "video",
      isNew: true
    },
  ];

  const renderGuideCard = (guide) => (
    <Link to={`/guides/${guide.id}`} key={guide.id}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <div className="p-5 flex flex-col h-full">
          <div className="flex items-center mb-3">
            {guide.type === "article" ? (
              <FileText size={16} className="text-primary mr-2" />
            ) : (
              <Video size={16} className="text-primary mr-2" />
            )}
            <span className="text-xs text-muted-foreground">{guide.type}</span>
            {guide.isNew && (
              <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
            )}
          </div>
          
          <h3 className="font-medium mb-2">{guide.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 flex-1">{guide.description}</p>
          
          <div className="flex items-center justify-between mt-auto">
            <Badge variant="outline">{guide.category}</Badge>
            <span className="text-xs text-muted-foreground">{guide.timeToRead}</span>
          </div>
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Guides</h1>
        <p className="text-muted-foreground">
          Explore our comprehensive guides to help you make the most of our platform.
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder="Search guides and tutorials..." 
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Button variant="outline" size="sm" className="rounded-full">
          All Guides
        </Button>
        {guideCategories.map(category => (
          <Button key={category.id} variant="outline" size="sm" className="rounded-full">
            {category.name} <span className="ml-1 text-xs text-muted-foreground">({category.count})</span>
          </Button>
        ))}
      </div>

      <Tabs defaultValue="popular" className="mb-8">
        <TabsList>
          <TabsTrigger value="popular">Popular Guides</TabsTrigger>
          <TabsTrigger value="recent">Recently Added</TabsTrigger>
          <TabsTrigger value="quick">Quick Tips</TabsTrigger>
        </TabsList>
        <TabsContent value="popular" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularGuides.map(guide => renderGuideCard(guide))}
          </div>
        </TabsContent>
        <TabsContent value="recent" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentGuides.map(guide => renderGuideCard(guide))}
          </div>
        </TabsContent>
        <TabsContent value="quick" className="pt-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Quick Tips</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 size={18} className="text-primary mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Keyboard Shortcuts</p>
                  <p className="text-sm text-muted-foreground">Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+F</kbd> or <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘+F</kbd> to search within any course content.</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 size={18} className="text-primary mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Save for Later</p>
                  <p className="text-sm text-muted-foreground">Click the bookmark icon on any course to save it to your favorites for quick access.</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 size={18} className="text-primary mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark mode using the switch in your profile settings.</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle2 size={18} className="text-primary mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Course Progress</p>
                  <p className="text-sm text-muted-foreground">Resume any course exactly where you left off by clicking on the course card in your dashboard.</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-primary/5 border-primary/10 overflow-hidden">
        <div className="md:flex">
          <div className="p-6 md:w-3/4">
            <h3 className="text-lg font-medium mb-2">Can't find what you're looking for?</h3>
            <p className="text-sm mb-4">Our support team is always ready to help with any questions you might have.</p>
            <Button asChild>
              <Link to="/support">
                Contact Support
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </Button>
          </div>
          <div className="bg-primary/10 p-6 flex items-center justify-center md:w-1/4">
            <BookOpen size={48} className="text-primary" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Guides;