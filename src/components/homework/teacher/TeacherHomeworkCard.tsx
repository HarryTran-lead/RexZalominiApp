import React from "react";
import { HomeworkAssignmentListItem } from "@/types/homework";

interface TeacherHomeworkCardProps {
  item: HomeworkAssignmentListItem;
  onViewDetail?: () => void;
}

function formatDateTime(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TeacherHomeworkCard: React.FC<TeacherHomeworkCardProps> = ({ item, onViewDetail }) => {
  return (
    <button
      type="button"
      onClick={onViewDetail}
      className="w-full rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-gray-800">Tiêu đề: {item.title}</h1>
          <h2 className="mt-0.5 text-xs text-red-700">Lớp: {item.classTitle || "Lớp chưa xác định"}</h2>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
          {item.submissionType}
        </span>
      </div>

      {item.description && <p className="mb-2 line-clamp-2 text-xs text-gray-600"> Mô tả: {item.description}</p>}

      <div className="mb-2 flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
          Nộp: {item.submissionCount ?? 0}
        </span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
          Đã chấm: {item.gradedCount ?? 0}
        </span>
      </div>

      <div className="border-t border-gray-100 pt-2 text-xs text-gray-500">
        <p>Hạn nộp: {formatDateTime(item.dueAt)}</p>
      </div>
    </button>
  );
};

export default TeacherHomeworkCard;
