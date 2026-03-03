import React from "react";
import ParentBottomNav from "@/navigation/ParentBottomNav";

interface ParentLayoutProps {
  children: React.ReactNode;
}

const ParentLayout: React.FC<ParentLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex-1 pb-16">{children}</div>
      <ParentBottomNav />
    </div>
  );
};

export default ParentLayout;
