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
    </AnimationRoutes>
  );
};

export default MainRoutes;