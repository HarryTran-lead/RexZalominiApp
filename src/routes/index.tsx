import React from "react";
import { Routes as WebRoutes, Route as WebRoute, Navigate } from "react-router-dom";
import { AnimationRoutes as ZMPRoutes, Route as ZMPRoute } from "zmp-ui";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import ParentLayout from "../layouts/ParentLayout";

import LoginPage from "../features/auth/LoginPage";
import AccountChooserPage from "../features/auth/AccountChooserPage";
import ParentChildSelectorPage from "../features/auth/ParentChildSelectorPage";
import StudentPage from "@/screens/roles/student/pages/StudentPage";
import TeacherPage from "@/screens/roles/teacher/pages/TeacherPage";
import ParentPage from "@/screens/roles/parent/pages/ParentPage";

import StudentTimetablePage from "@/screens/roles/student/pages/StudentTimetablePage";
import TeacherTimetablePage from "@/screens/roles/teacher/pages/TeacherTimetablePage";
import ParentTimetablePage from "@/screens/roles/parent/pages/ParentTimetablePage";

// Student pages
import StudentHomeworkPage from "../screens/roles/student/pages/StudentHomeworkPage";
import StudentHomeworkDetailPage from "../screens/roles/student/pages/StudentHomeworkDetailPage";
import StudentGamificationPage from "@/screens/roles/student/pages/StudentGamificationPage";
import StudentApplicationPage from "@/screens/roles/student/pages/StudentApplicationPage";
import StudentRewardsPage from "@/screens/roles/student/pages/StudentRewardsPage";
import StudentDocumentsPage from "@/screens/roles/student/pages/StudentDocumentsPage";
import StudentExamsPage from "@/screens/roles/student/pages/StudentExamsPage";
import StudentNotificationsPage from "@/screens/roles/student/pages/StudentNotificationsPage";

// Parent pages
import ParentHomeworkPage from "@/screens/roles/parent/pages/ParentHomeworkPage";
import ParentHomeworkDetailPage from "@/screens/roles/parent/pages/ParentHomeworkDetailPage";
import ParentExamsPage from "@/screens/roles/parent/pages/ParentExamsPage";
import ParentSessionReportsPage from "@/screens/roles/parent/pages/ParentSessionReportsPage";
import ParentMonthlyReportsPage from "@/screens/roles/parent/pages/ParentMonthlyReportsPage";
import ParentNotificationsPage from "@/screens/roles/parent/pages/ParentNotificationsPage";
import ParentLeaveRequestPage from "@/screens/roles/parent/pages/ParentLeaveRequestPage";
import ParentPauseRequestPage from "@/screens/roles/parent/pages/ParentPauseRequestPage";
import ParentMakeupCreditsPage from "@/screens/roles/parent/pages/ParentMakeupCreditsPage";
import ParentMediaPage from "@/screens/roles/parent/pages/ParentMediaPage";
import LandingPage from "@/features/landing/LandingPage";

// Teacher pages
import TeacherMyClassesPage from "@/screens/roles/teacher/pages/TeacherMyClassesPage";
import TeacherClassStudentsPage from "@/screens/roles/teacher/pages/TeacherClassStudentsPage";
import TeacherSubjectsPage from "@/screens/roles/teacher/pages/TeacherSubjectsPage";
import TeacherAssignmentsPage from "@/screens/roles/teacher/pages/TeacherAssignmentsPage";
import TeacherHomeworkDetailPage from "@/screens/roles/teacher/pages/TeacherHomeworkDetailPage";
import TeacherAttendancePage from "@/screens/roles/teacher/pages/TeacherAttendancePage";
import TeacherReportCreatePage from "@/screens/roles/teacher/pages/TeacherReportCreatePage";
import TeacherReportListPage from "@/screens/roles/teacher/pages/TeacherReportListPage";
import TeacherMonthlyReportsPage from "@/screens/roles/teacher/pages/TeacherMonthlyReportsPage";
import TeacherReportsPage from "../screens/roles/teacher/pages/TeacherReportsPage";
import TeacherNotificationsPage from "@/screens/roles/teacher/pages/TeacherNotificationsPage";
import ProfilePage from "@/screens/ProfilePage";

const isWeb = window.location.hostname.includes("vercel.app") || window.location.hostname === "localhost";

const RouteContainer: any = isWeb ? WebRoutes : ZMPRoutes;
const AppRoute: any = isWeb ? WebRoute : ZMPRoute;

const MainRoutes: React.FC = () => {
  return (
    <RouteContainer>
      <AppRoute path="/" element={<LandingPage />} />
      <AppRoute path="/faq" element={<LandingPage />} />
      <AppRoute path="/news" element={<LandingPage />} />
      <AppRoute path="/contact" element={<LandingPage />} />

      <AppRoute 
        path="/login"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />
      <AppRoute
        path="/account-chooser"
        element={
          <AuthLayout>
            <AccountChooserPage />
          </AuthLayout>
        }
      />
      <AppRoute
        path="/parent/select-child"
        element={
          <AuthLayout>
            <ParentChildSelectorPage />
          </AuthLayout>
        }
      />

      {/* Student Routes */}
      <AppRoute
        path="/student"
        element={
          <StudentLayout>
            <StudentPage />
          </StudentLayout>
        }
      />
      <WebRoute
        path="/student/dashboard"
        element={
          <StudentLayout>
            <StudentPage />
          </StudentLayout>
        }
      />
      <AppRoute
        path="/student/timetable"
        element={
          <StudentLayout>
            <StudentTimetablePage />
          </StudentLayout>
        }
      />
      <AppRoute
        path="/student/homework"
        element={
          <StudentLayout>
            <StudentHomeworkPage />
          </StudentLayout>
        }
      />
      <AppRoute
        path="/student/homework/:homeworkStudentId"
        element={
          <StudentLayout>
            <StudentHomeworkDetailPage />
          </StudentLayout>
        }
      />
      <AppRoute
        path="/student/gamification"
        element={
          <StudentLayout>
            <StudentGamificationPage />
          </StudentLayout>
        }
      />
      <AppRoute
        path="/student/application"
        element={
          <StudentLayout>
            <StudentApplicationPage />
          </StudentLayout>
        }
      />
      <AppRoute
        path="/student/rewards"
        element={
          <StudentLayout>
            <StudentRewardsPage />
          </StudentLayout>
        }
      />
      <AppRoute
        path="/student/documents"
        element={
          <StudentLayout>
            <StudentDocumentsPage />
          </StudentLayout>
        }
      />
      <AppRoute
        path="/student/exams"
        element={
          <StudentLayout>
            <StudentExamsPage />
          </StudentLayout>
        }
      />
      <AppRoute
        path="/student/profile"
        element={
          <StudentLayout>
            <ProfilePage />
          </StudentLayout>
        }
      />
      <AppRoute
        path="/student/notifications"
        element={
          <StudentLayout>
            <StudentNotificationsPage />
          </StudentLayout>
        }
      />

      {/* Teacher AppRoutes */}
      <AppRoute
        path="/teacher"
        element={
          <TeacherLayout>
            <TeacherPage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/dashboard"
        element={
          <TeacherLayout>
            <TeacherPage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/timetable"
        element={
          <TeacherLayout>
            <TeacherTimetablePage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/my-classes"
        element={
          <TeacherLayout>
            <TeacherMyClassesPage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/my-classes/:classId/students"
        element={
          <TeacherLayout>
            <TeacherClassStudentsPage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/subjects"
        element={
          <TeacherLayout>
            <TeacherSubjectsPage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/assignments"
        element={
          <TeacherLayout>
            <TeacherAssignmentsPage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/assignments/:homeworkId"
        element={
          <TeacherLayout>
            <TeacherHomeworkDetailPage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/attendance/:sessionId"
        element={
          <TeacherLayout>
            <TeacherAttendancePage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/reports"
        element={
          <TeacherLayout>
            <TeacherReportsPage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/reports/create"
        element={
          <TeacherLayout>
            <TeacherReportCreatePage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/reports/list"
        element={
          <TeacherLayout>
            <TeacherReportListPage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/reports/monthly"
        element={
          <TeacherLayout>
            <TeacherMonthlyReportsPage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/monthly-reports"
        element={
          <TeacherLayout>
            <TeacherMonthlyReportsPage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/profile"
        element={
          <TeacherLayout>
            <ProfilePage />
          </TeacherLayout>
        }
      />
      <AppRoute
        path="/teacher/notifications"
        element={
          <TeacherLayout>
            <TeacherNotificationsPage />
          </TeacherLayout>
        }
      />

      {/* Parent AppRoutes */}
      <AppRoute
        path="/parent"
        element={
          <ParentLayout>
            <ParentPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/dashboard"
        element={
          <ParentLayout>
            <ParentPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/timetable"
        element={
          <ParentLayout>
            <ParentTimetablePage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/homework"
        element={
          <ParentLayout>
            <ParentHomeworkPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/homework/:homeworkStudentId"
        element={
          <ParentLayout>
            <ParentHomeworkDetailPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/exams"
        element={
          <ParentLayout>
            <ParentExamsPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/session-reports"
        element={
          <ParentLayout>
            <ParentSessionReportsPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/monthly-reports"
        element={
          <ParentLayout>
            <ParentMonthlyReportsPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/notifications"
        element={
          <ParentLayout>
            <ParentNotificationsPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/leave-request"
        element={
          <ParentLayout>
            <ParentLeaveRequestPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/pause-request"
        element={
          <ParentLayout>
            <ParentPauseRequestPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/makeup-credits"
        element={
          <ParentLayout>
            <ParentMakeupCreditsPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/media"
        element={
          <ParentLayout>
            <ParentMediaPage />
          </ParentLayout>
        }
      />
      <AppRoute
        path="/parent/profile"
        element={
          <ParentLayout>
            <ProfilePage />
          </ParentLayout>
        }
      />

      {/* Catch-all AppRoute */}
      <AppRoute path="*" element={<Navigate to="/" replace />} />
    </RouteContainer>
  );
};

export default MainRoutes;
