import React from "react";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default TeacherLayout;
