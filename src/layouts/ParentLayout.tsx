import React from "react";

interface ParentLayoutProps {
  children: React.ReactNode;
}

const ParentLayout: React.FC<ParentLayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default ParentLayout;
