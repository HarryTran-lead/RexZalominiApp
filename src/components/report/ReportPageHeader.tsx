import React from "react";

interface ReportPageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

const ReportPageHeader: React.FC<ReportPageHeaderProps> = ({ title, subtitle, onBack }) => {
  return (
    <div className="sticky top-0 z-20 shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4">
      <div className="flex items-center">
        <button onClick={onBack} className="mr-3 text-white" aria-label="Quay lại">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white">{title}</h1>
      </div>
      {subtitle && <p className="mt-1 text-xs text-red-100">{subtitle}</p>}
    </div>
  );
};

export default ReportPageHeader;
