import React from "react";
import { AnimationRoutes, Route } from "zmp-ui";
import { Navigate } from "react-router-dom";
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
import StudentHomeworkPage from "@/screens/roles/student/pages/StudentHomeworkPage";
import StudentGamificationPage from "@/screens/roles/student/pages/StudentGamificationPage";
import StudentApplicationPage from "@/screens/roles/student/pages/StudentApplicationPage";
import StudentRewardsPage from "@/screens/roles/student/pages/StudentRewardsPage";
import StudentDocumentsPage from "@/screens/roles/student/pages/StudentDocumentsPage";
import StudentExamsPage from "@/screens/roles/student/pages/StudentExamsPage";

// Parent pages
import ParentHomeworkPage from "@/screens/roles/parent/pages/ParentHomeworkPage";
import ParentExamsPage from "@/screens/roles/parent/pages/ParentExamsPage";
import ParentNotificationsPage from "@/screens/roles/parent/pages/ParentNotificationsPage";
import ParentLeaveRequestPage from "@/screens/roles/parent/pages/ParentLeaveRequestPage";

// Teacher pages
import TeacherMyClassesPage from "@/screens/roles/teacher/pages/TeacherMyClassesPage";
import TeacherSubjectsPage from "@/screens/roles/teacher/pages/TeacherSubjectsPage";
import TeacherAssignmentsPage from "@/screens/roles/teacher/pages/TeacherAssignmentsPage";
import TeacherAttendancePage from "@/screens/roles/teacher/pages/TeacherAttendancePage";
import TeacherReportsPage from "@/screens/roles/teacher/pages/TeacherReportsPage";


const MainRoutes: React.FC = () => {
  return (
    <AnimationRoutes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />
      <Route
        path="/account-chooser"
        element={
          <AuthLayout>
            <AccountChooserPage />
          </AuthLayout>
        }
      />
      <Route
        path="/parent/select-child"
        element={
          <AuthLayout>
            <ParentChildSelectorPage />
          </AuthLayout>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <StudentLayout>
            <StudentPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/dashboard"
        element={
          <StudentLayout>
            <StudentPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/timetable"
        element={
          <StudentLayout>
            <StudentTimetablePage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/homework"
        element={
          <StudentLayout>
            <StudentHomeworkPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/gamification"
        element={
          <StudentLayout>
            <StudentGamificationPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/application"
        element={
          <StudentLayout>
            <StudentApplicationPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/rewards"
        element={
          <StudentLayout>
            <StudentRewardsPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/documents"
        element={
          <StudentLayout>
            <StudentDocumentsPage />
          </StudentLayout>
        }
      />
      <Route
        path="/student/exams"
        element={
          <StudentLayout>
            <StudentExamsPage />
          </StudentLayout>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <TeacherLayout>
            <TeacherPage />
          </TeacherLayout>
        }
      />
      <Route
        path="/teacher/dashboard"
        element={
          <TeacherLayout>
            <TeacherPage />
          </TeacherLayout>
        }
      />
      <Route
        path="/teacher/timetable"
        element={
          <TeacherLayout>
            <TeacherTimetablePage />
          </TeacherLayout>
        }
      />
      <Route
        path="/teacher/my-classes"
        element={
          <TeacherLayout>
            <TeacherMyClassesPage />
          </TeacherLayout>
        }
      />
      <Route
        path="/teacher/subjects"
        element={
          <TeacherLayout>
            <TeacherSubjectsPage />
          </TeacherLayout>
        }
      />
      <Route
        path="/teacher/assignments"
        element={
          <TeacherLayout>
            <TeacherAssignmentsPage />
          </TeacherLayout>
        }
      />
      <Route
        path="/teacher/attendance/:sessionId"
        element={
          <TeacherLayout>
            <TeacherAttendancePage />
          </TeacherLayout>
        }
      />
      <Route
        path="/teacher/reports"
        element={
          <TeacherLayout>
            <TeacherReportsPage />
          </TeacherLayout>
        }
      />

      {/* Parent Routes */}
      <Route
        path="/parent"
        element={
          <ParentLayout>
            <ParentPage />
          </ParentLayout>
        }
      />
      <Route
        path="/parent/dashboard"
        element={
          <ParentLayout>
            <ParentPage />
          </ParentLayout>
        }
      />
      <Route
        path="/parent/timetable"
        element={
          <ParentLayout>
            <ParentTimetablePage />
          </ParentLayout>
        }
      />
      <Route
        path="/parent/homework"
        element={
          <ParentLayout>
            <ParentHomeworkPage />
          </ParentLayout>
        }
      />
      <Route
        path="/parent/exams"
        element={
          <ParentLayout>
            <ParentExamsPage />
          </ParentLayout>
        }
      />
      <Route
        path="/parent/notifications"
        element={
          <ParentLayout>
            <ParentNotificationsPage />
          </ParentLayout>
        }
      />
      <Route
        path="/parent/leave-request"
        element={
          <ParentLayout>
            <ParentLeaveRequestPage />
          </ParentLayout>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </AnimationRoutes>
  );
};

export default MainRoutes;