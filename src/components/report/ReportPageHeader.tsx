import React from "react";

interface ReportPageHeaderProps {
  title: string;
  subtitle?: string;
}

const ReportPageHeader: React.FC<ReportPageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="sticky top-0 z-20 shrink-0 bg-[#BB0000] px-4 py-4">
      <h1 className="text-center text-lg font-bold text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-center text-xs text-red-100">{subtitle}</p>}
    </div>
  );
};

export default ReportPageHeader;
