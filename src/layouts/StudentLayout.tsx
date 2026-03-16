import React from "react";
import StudentBottomNav from "@/navigation/StudentBottomNav";

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50">
      <div className="mx-auto flex h-screen w-full max-w-[430px] flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto pb-24">{children}</div>
      </div>
      <StudentBottomNav />
    </div>
  );
};

export default StudentLayout;
