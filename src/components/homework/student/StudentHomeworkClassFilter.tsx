import React from "react";

interface StudentHomeworkClassFilterProps {
  classes: string[];
  value: string;
  onChange: (value: string) => void;
}

const StudentHomeworkClassFilter: React.FC<StudentHomeworkClassFilterProps> = ({
  classes,
  value,
  onChange,
}) => {
  return (
    <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
      <label className="mb-1 block text-xs font-semibold text-gray-500">Lọc theo lớp</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
      >
        <option value="">Tất cả lớp</option>
        {classes.map((className) => (
          <option key={className} value={className}>
            {className}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StudentHomeworkClassFilter;
