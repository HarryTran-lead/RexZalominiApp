import React from "react";
import { AnimationRoutes, Route } from "zmp-ui";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import ParentLayout from "../layouts/ParentLayout";

import LoginPage from "../features/auth/LoginPage";
import AccountChooserPage from "../features/auth/AccountChooserPage";
import StudentPage from "@/screens/roles/student/pages/StudentPage";
import TeacherPage from "@/screens/roles/teacher/pages/TeacherPage";
import ParentPage from "@/screens/roles/parent/pages/ParentPage";

// Timetable pages
import StudentTimetablePage from "@/screens/roles/student/pages/StudentTimetablePage";
import TeacherTimetablePage from "@/screens/roles/teacher/pages/TeacherTimetablePage";
import ParentTimetablePage from "@/screens/roles/parent/pages/ParentTimetablePage";

// Public pages
import HomePage from "@/screens/public/HomePage";
import FAQPage from "@/screens/public/FAQPage";
import BlogsPage from "@/screens/public/BlogsPage";
import ContactPage from "@/screens/public/ContactPage";


const MainRoutes: React.FC = () => {
  return (
    <AnimationRoutes>
      {/* Public Routes - không cần đăng nhập */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Auth Routes */}
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
      <Route
        path="/student/timetable"
        element={
          <StudentLayout>
            <StudentTimetablePage />
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
      <Route
        path="/teacher/timetable"
        element={
          <TeacherLayout>
            <TeacherTimetablePage />
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
