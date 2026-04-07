import React from "react";
import { HomeworkStudentProgressItem } from "@/types/homework";

interface TeacherHomeworkStudentListProps {
  students: HomeworkStudentProgressItem[];
  onGradeStudent?: (student: HomeworkStudentProgressItem) => void;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeStatus(status?: string): string {
  return (status || "").toLowerCase();
}

function getStatusLabel(status?: string): string {
  const normalized = normalizeStatus(status);
  if (normalized === "assigned") return "Chưa làm";
  if (normalized === "missing") return "Chưa nộp";
  if (normalized === "submitted") return "Đã làm";
  if (normalized === "graded") return "Đã chấm";
  if (normalized === "late") return "Nộp muộn";
  return status || "Không xác định";
}

function getStatusClass(status?: string): string {
  const normalized = normalizeStatus(status);
  if (normalized === "assigned" || normalized === "missing") {
    return "bg-rose-100 text-rose-700";
  }
  if (normalized === "submitted") {
    return "bg-blue-100 text-blue-700";
  }
  if (normalized === "graded") {
    return "bg-emerald-100 text-emerald-700";
  }
  return "bg-gray-100 text-gray-700";
}

const TeacherHomeworkStudentList: React.FC<TeacherHomeworkStudentListProps> = ({
  students,
  onGradeStudent,
}) => {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
        Chưa có dữ liệu học viên cho bài tập này.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {students.map((student, index) => (
        <div key={student.id || student.studentProfileId} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {index + 1}. {student.studentName}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(student.status)}`}>
              {getStatusLabel(student.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-gray-600">
            <p>Submitted: {formatDateTime(student.submittedAt)}</p>
            <p>Graded: {formatDateTime(student.gradedAt)}</p>
          </div>

          {student.score != null && (
            <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              Điểm: {student.score}
            </p>
          )}

          {student.teacherFeedback && (
            <p className="mt-2 rounded-lg bg-emerald-50 px-2.5 py-2 text-xs text-emerald-800">
              Nhận xét: {student.teacherFeedback}
            </p>
          )}

          {(normalizeStatus(student.status) === "submitted" ||
            normalizeStatus(student.status) === "graded" ||
            normalizeStatus(student.status) === "late") &&
            onGradeStudent && (
              <div className="mt-2 border-t border-gray-100 pt-2">
                <button
                  type="button"
                  onClick={() => onGradeStudent(student)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                >
                  {normalizeStatus(student.status) === "graded" ? "Chỉnh sửa điểm" : "Chấm điểm"}
                </button>
              </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default TeacherHomeworkStudentList;
