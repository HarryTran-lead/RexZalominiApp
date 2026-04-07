import React from "react";

export type HomeworkTab = "all" | "missing" | "submitted" | "graded";

interface StudentHomeworkTabsProps {
  activeTab: HomeworkTab;
  counts: Record<HomeworkTab, number>;
  onChange: (tab: HomeworkTab) => void;
}

const tabs: Array<{ key: HomeworkTab; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "missing", label: "Chưa nộp" },
  { key: "submitted", label: "Đã nộp" },
  { key: "graded", label: "Đã chấm" },
];

const StudentHomeworkTabs: React.FC<StudentHomeworkTabsProps> = ({ activeTab, counts, onChange }) => {
  return (
    <div className="shrink-0 border-b border-gray-200 bg-white">
      <div className="flex">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`flex-1 border-b-2 px-2 py-3 text-sm font-semibold ${
                active ? "border-red-600 text-red-600" : "border-transparent text-gray-500"
              }`}
            >
              {tab.label}
              <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                {counts[tab.key] || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StudentHomeworkTabs;
