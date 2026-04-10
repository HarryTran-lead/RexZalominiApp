import React from "react";

interface Option {
  value: string;
  label: string;
}

interface TeacherHomeworkFiltersProps {
  classOptions: Option[];
  sessionOptions: Option[];
  selectedClassId: string;
  selectedSessionId: string;
  onClassChange: (classId: string) => void;
  onSessionChange: (sessionId: string) => void;
}

const TeacherHomeworkFilters: React.FC<TeacherHomeworkFiltersProps> = ({
  classOptions,
  sessionOptions,
  selectedClassId,
  selectedSessionId,
  onClassChange,
  onSessionChange,
}) => {
  return (
    <div className="mb-4  rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div>
        <label className="text-xs font-semibold text-gray-600">Lớp</label>
        <select
          value={selectedClassId}
          onChange={(event) => onClassChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-xs outline-none focus:border-red-400"
        >
          <option value="">Tất cả lớp</option>
          {classOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* <div>
        <label className="text-xs grid grid-cols-2 gap-2 font-semibold text-gray-600">Buổi học</label>
        <select
          value={selectedSessionId}
          onChange={(event) => onSessionChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-xs outline-none focus:border-red-400"
        >
          <option value="">Tất cả buổi</option>
          {sessionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div> */}
    </div>
  );
};

export default TeacherHomeworkFilters;
