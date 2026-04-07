import React from "react";
import { MyHomeworkListItem } from "@/types/homework";

interface StudentHomeworkCardProps {
  item: MyHomeworkListItem;
  onClick: () => void;
}

function getStatusLabel(status?: string): string {
  const normalized = (status || "").toLowerCase();
  if (normalized === "assigned") return "Đã giao";
  if (normalized === "submitted") return "Đã nộp";
  if (normalized === "graded") return "Đã chấm";
  if (normalized === "late") return "Nộp muộn";
  if (normalized === "missing") return "Chưa nộp";
  return status || "Không xác định";
}

function getStatusClass(status?: string): string {
  const normalized = (status || "").toLowerCase();
  if (normalized === "graded") return "bg-emerald-100 text-emerald-700";
  if (normalized === "submitted") return "bg-blue-100 text-blue-700";
  if (normalized === "late") return "bg-amber-100 text-amber-700";
  if (normalized === "missing") return "bg-rose-100 text-rose-700";
  return "bg-indigo-100 text-indigo-700";
}

function formatDate(iso?: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const StudentHomeworkCard: React.FC<StudentHomeworkCardProps> = ({ item, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-gray-900">{item.classCode || item.className}</h3>
          <p className="truncate text-sm font-medium text-red-700">{item.homeworkTitle}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(item.status)}`}>
          {getStatusLabel(item.status)}
        </span>
      </div>

      {item.description && <p className="mb-2 line-clamp-2 text-xs text-gray-500">{item.description}</p>}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Hạn nộp: {formatDate(item.dueAt)}</span>
        {item.score != null && item.maxScore != null && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
            {item.score}/{item.maxScore}
          </span>
        )}
      </div>

      {item.teacherFeedback && (
        <p className="mt-2 line-clamp-2 rounded-lg bg-emerald-50 px-2.5 py-2 text-xs text-emerald-800">
          Nhận xét: {item.teacherFeedback}
        </p>
      )}
    </button>
  );
};

export default StudentHomeworkCard;
