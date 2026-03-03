import React from "react";
import StudentBottomNav from "@/navigation/StudentBottomNav";

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex-1 pb-16">{children}</div>
      <StudentBottomNav />
    </div>
  );
};

export default StudentLayout;
