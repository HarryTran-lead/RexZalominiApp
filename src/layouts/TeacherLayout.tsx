import React from "react";
import TeacherBottomNav from "@/navigation/TeacherBottomNav";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex-1 pb-16">{children}</div>
      <TeacherBottomNav />
    </div>
  );
};

export default TeacherLayout;
