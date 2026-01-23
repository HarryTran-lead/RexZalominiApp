import React from "react";
import { AnimationRoutes, Route } from "zmp-ui";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import ParentLayout from "../layouts/ParentLayout";

import LoginPage from "../features/auth/pages/LoginPage";
import AccountChooserPage from "../features/auth/pages/AccountChooserPage";
import StudentPage from "../features/roles/student/pages/StudentPage";
import TeacherPage from "../features/roles/teacher/pages/TeacherPage";
import ParentPage from "../features/roles/parent/pages/ParentPage";

const MainRoutes: React.FC = () => {
  return (
    <AnimationRoutes>
      {/* Auth Routes - không cần đăng nhập */}
      <Route
        path="/"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />
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

      {/* Student Routes - cần đăng nhập với role Student */}
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

      {/* Teacher Routes - cần đăng nhập với role Teacher */}
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

      {/* Parent Routes - cần đăng nhập với role Parent */}
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
    </AnimationRoutes>
  );
};

export default MainRoutes;
