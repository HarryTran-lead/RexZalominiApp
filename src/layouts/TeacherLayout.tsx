import React from "react";
import TeacherBottomNav from "@/navigation/TeacherBottomNav";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50">
      <div className="mx-auto flex h-screen w-full max-w-[430px] flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto pb-24">{children}</div>
      </div>
      <TeacherBottomNav />
    </div>
  );
};

export default TeacherLayout;
