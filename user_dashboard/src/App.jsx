import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
// import ChatbotContainer from "@/components/layout/ChatbotContainer";

import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import ModulesList from "@/pages/ModulesList";
import ModuleDetail from "@/pages/ModuleDetail";
import LessonDetail from "@/pages/LessonDetail";
import LessonView from "@/pages/LessonView";
import QuizView from "@/pages/QuizView";
import QuizTypePage from "@/pages/QuizTypePage";
import QuizInstructionPage from "@/pages/QuizInstructionPage";
import QuizTakePage from "@/pages/QuizTakePage";
import QuizResultsPage from "@/pages/QuizResultsPage";
import AssignmentInstructionPage from "@/pages/AssignmentInstructionPage";
import AssignmentTakePage from "@/pages/AssignmentTakePage";
import AssignmentResultsPage from "@/pages/AssignmentResultsPage";
import EssayInstructionPage from "@/pages/EssayInstructionPage";
import EssayTakePage from "@/pages/EssayTakePage";
import EssayResultsPage from "@/pages/EssayResultsPage";
import Groups from "@/pages/Groups";
import Catalog from "@/pages/Catalog";
import CatelogCourses from "@/pages/CatelogCourses";
import Progress from "@/pages/Progress";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import CourseView from "@/pages/CourseView";
import ModuleLessonsView from "@/pages/ModuleLessonsView";
import ModuleAssessmentsView from "@/pages/ModuleAssessmentsView";
import CourseEnrollment from "@/pages/CourseEnrollment";
import GroupLayout from "@/layouts/GroupLayout";
import NewsPage from "@/pages/group/NewsPage";
import GroupCalendarPage from "@/pages/group/CalendarPage";
import AnnouncementPage from "@/pages/group/AnnouncementPage";
import ChatPage from "@/pages/group/ChatPage";
import SpeechifyReaderView from "@/pages/SpeechifyReaderView";
import AvatarPickerPage from "@/pages/AvatarPickerPage";
import FAQs from "@/pages/FAQs";
import Support from "@/pages/Support";
import Privacy from "@/pages/Privacy";
import Guides from "@/pages/Guides";
import SupportTicket from "@/pages/SupportTicket";
import Announcements from "@/pages/Announcements";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailed from "@/pages/PaymentFailed";
import AssignmentSubmit from "@/pages/AssignmentSubmit";
import AssignmentSubmissions from "@/pages/AssignmentSubmissions";
import DebateView from "@/pages/DebateView";
import SurveyView from "@/pages/SurveyView";
import DemoQuizPage from "@/pages/DemoQuizPage";
import CalendarPage from "@/pages/CalendarPage";
import TodoPage from "@/pages/TodoPage";
import ClassRecordings from "@/pages/ClassRecordings";
import CertificatePage from "../src/pages/CertificatePage";
import SurveyInstructionPage from "@/pages/SurveyInstructionPage";
import DebateInstructionPage from "@/pages/DebateInstructionPage";
import DebateTakePage from "@/pages/DebateTakePage";
import Games from "@/pages/Games";
import GameDetailView from "@/components/games/GameDetailView";
import MyTickets from "@/pages/MyTickets";
import ScormPage from "@/pages/ScormPage";
import { allowedScormUserIds } from "@/data/allowedScormUsers";
import { currentUserId } from "@/data/currentUser";
import Instructorpage from "@/pages/Instructorpage";
import LandingPage from "@/pages/LandingPage";
import AdminModal from "@/components/AdminModal";
import Scrompack from "@/pages/Scrompack";
import { CourseTimerProvider } from "@/components/courses/CourseTimerProvider";
import Sov from "./coursesL/Sov";
import Sophomore from "./coursesL/Sophomore";
import OperatePrivate from './coursesL/OperatePrivate'; 
import Senior from './coursesL/Senior';
import Remedy from './coursesL/Remedy';
import PrivateMerchant from './coursesL/PrivateMerchant' // adjust path if different
import { MasterClass } from '@/pages/MasterClass';
import LiveClass from './pages/LiveClass'; // adjust path if different
import { WebsiteCreation } from './pages/WebsiteCreation';
import MerchantProcessing from './pages/MerchantProcessing';
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "@/pages/Auth/Login";

function ProtectedScormRoute() {
  if (!allowedScormUserIds.includes(currentUserId)) {
    return <div style={{padding: 24}}><h2>Access Denied</h2><p>You do not have permission to view this page.</p></div>;
  }
  return <ScormPage />;
}

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/sov" element={<Sov />} />
        <Route path="/sophomore" element={<Sophomore />} />
        <Route path="/operateprivate" element={<OperatePrivate />} />
        <Route path="/unlimitedcredit" element={<Senior/>} />
        <Route path="/masterclass" element={<MasterClass />}/>
        <Route path="/liveclass" element={<LiveClass />} />
        <Route path="/website" element={<WebsiteCreation/>}/>
        <Route path="/remedy" element={<Remedy/>} />
        <Route path="/pmp" element={<MerchantProcessing/>} />
        <Route path="/privatemerchant" element={<PrivateMerchant/>} />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute>
              <Instructorpage />
            </ProtectedRoute>
          }
        />
        
        {/* Protected dashboard route */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          
          {/* Course related routes */}
          <Route path="courses">
            <Route index element={<Courses />} />
            <Route path=":courseId">
              <Route index element={
                <CourseTimerProvider>
                  <CourseView />
                </CourseTimerProvider>
              } />
              <Route path="module/:moduleId">
                <Route index element={<ModuleDetail />} />
                <Route path="lessons" element={<ModuleLessonsView />} />
                <Route path="assessments" element={<ModuleAssessmentsView />} />
                <Route path="lesson/:lessonId">
                  <Route index element={<LessonView />} />
                  <Route path="detail" element={<LessonDetail />} />
                </Route>
              </Route>
            </Route>
          </Route>

          {/* Assessment routes */}
          <Route path="quiz">
            <Route path=":quizType" element={<QuizTypePage />} />
            <Route path="instruction/:quizId" element={<QuizInstructionPage />} />
            <Route path="take/:quizId" element={<QuizTakePage />} />
            <Route path="results/:quizId" element={<QuizResultsPage />} />
          </Route>

          <Route path="assignment">
            <Route path="instruction/:assignmentId" element={<AssignmentInstructionPage />} />
            <Route path="take/:assignmentId" element={<AssignmentTakePage />} />
            <Route path="results/:assignmentId" element={<AssignmentResultsPage />} />
            <Route path=":assignmentId/submit" element={<AssignmentSubmit />} />
            <Route path=":assignmentId/submissions" element={<AssignmentSubmissions />} />
          </Route>

          <Route path="essay">
            <Route path="instruction/:essayId" element={<EssayInstructionPage />} />
            <Route path="take/:essayId" element={<EssayTakePage />} />
            <Route path="results/:essayId" element={<EssayResultsPage />} />
          </Route>

          <Route path="debate">
            <Route path="instruction/:debateId" element={<DebateInstructionPage />} />
            <Route path="take/:debateId" element={<DebateTakePage />} />
            <Route path=":debateId" element={<DebateView />} />
          </Route>

          <Route path="survey">
            <Route path="instruction/:surveyId" element={<SurveyInstructionPage />} />
            <Route path=":moduleId/:surveyId" element={<SurveyView />} />
          </Route>

          {/* Group routes */}
          <Route path="groups">
            <Route index element={<Groups />} />
            <Route path=":groupId/*" element={<GroupLayout />}>
              <Route path="news" element={<NewsPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="calendar" element={<GroupCalendarPage />} />
              <Route path="announcements" element={<AnnouncementPage />} />
              <Route path="*" element={<NewsPage />} />
            </Route>
          </Route>

          {/* Catalog and enrollment */}
          <Route path="catalog">
            <Route index element={<Catalog />} />
            <Route path="category/:categoryName" element={<CatelogCourses />} />
          </Route>
          <Route path="course-enrollment/:courseId" element={<CourseEnrollment />} />
          <Route path="payment-success/:courseId" element={<PaymentSuccess />} />
          <Route path="payment-failed/:courseId" element={<PaymentFailed />} />

          {/* User related routes */}
          <Route path="profile" element={<Profile />} />
          <Route path="avatar-picker" element={<AvatarPickerPage />} />
          <Route path="progress" element={<Progress />} />
          <Route path="messages" element={<Messages />} />

          {/* Other dashboard routes */}
          <Route path="certificate/:courseId" element={<CertificatePage />} />
          <Route path="demo-quiz/:assessmentTitle" element={<DemoQuizPage />} />
          <Route path="class-recordings" element={<ClassRecordings />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="todo" element={<TodoPage />} />
          <Route path="faqs" element={<FAQs />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="guides" element={<Guides />} />
          
          {/* Support routes */}
          <Route path="support">
            <Route index element={<Support />} />
            <Route path="ticket" element={<SupportTicket />} />
            <Route path="tickets" element={<MyTickets />} />
          </Route>

          {/* SCORM routes - inside dashboard to keep sidebar */}
          <Route path="scorm">
            <Route index element={<ProtectedScormRoute />} />
            <Route path=":courseId/:moduleId" element={<Scrompack />} />
          </Route>
        </Route>

        {/* Standalone routes */}
        <Route path="/speechify-reader" element={<SpeechifyReaderView />} />
        <Route path="/games" element={<Games />} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AdminModal />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;