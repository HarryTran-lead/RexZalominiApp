import React from "react";
import { ClassStudent } from "@/types/teacher";
import { TimetableSession } from "@/types/timetable";

interface SessionReportComposerProps {
  sessions?: TimetableSession[]; // Thêm ? nếu có thể undefined
  selectedSessionId: string;
  selectedStudentProfileId: string;
  students?: ClassStudent[];     // Thêm ? nếu có thể undefined
  feedback: string;
  saving: boolean;
  enhancing: boolean;
  studentsLoading: boolean;
  canSaveDraft: boolean;
  canSubmit: boolean;
  editingReportId: string | null;
  onChangeSession: (sessionId: string) => void;
  onChangeStudent: (studentProfileId: string) => void;
  onChangeFeedback: (feedback: string) => void;
  onEnhance: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTimeRange(iso?: string, durationMinutes?: number) {
  if (!iso) return "";
  const start = new Date(iso);
  const end = new Date(start);
  if (durationMinutes) end.setMinutes(end.getMinutes() + durationMinutes);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  return `${fmt(start)} - ${fmt(end)}`;
}

const SessionReportComposer: React.FC<SessionReportComposerProps> = ({
  sessions = [], // FIX 1: Cấp giá trị mặc định mảng rỗng
  selectedSessionId,
  selectedStudentProfileId,
  students = [], // FIX 2: Cấp giá trị mặc định mảng rỗng
  feedback,
  saving,
  enhancing,
  studentsLoading,
  canSaveDraft,
  canSubmit,
  editingReportId,
  onChangeSession,
  onChangeStudent,
  onChangeFeedback,
  onEnhance,
  onSaveDraft,
  onSubmit,
}) => {
  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;

  return (
    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-gray-800">Tạo báo cáo buổi học hôm nay</h2>
      <p className="mt-1 text-xs text-gray-500">
        Chọn buổi học, chọn học viên để đánh giá, nhập nội dung rồi lưu nháp và gửi staff duyệt.
      </p>

      <div className="mt-3">
        <label className="text-xs font-semibold text-gray-700">Lớp/Buổi trong lịch hôm nay</label>
        <select
          value={selectedSessionId}
          onChange={(event) => onChangeSession(event.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400"
        >
          <option value="">Chọn buổi học</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {(session.classCode || "Lớp") + " - " + formatTimeRange(session.plannedDatetime, session.durationMinutes)}
            </option>
          ))}
        </select>
      </div>

      {selectedSession && (
        <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-800">
          <p className="font-semibold">{selectedSession.classTitle || selectedSession.classCode || "Buổi học"}</p>
          <p className="mt-0.5">
            {formatDate(selectedSession.plannedDatetime)} • {formatTimeRange(selectedSession.plannedDatetime, selectedSession.durationMinutes)}
          </p>
        </div>
      )}

      <div className="mt-3">
        <label className="text-xs font-semibold text-gray-700">Học viên</label>
        <select
          value={selectedStudentProfileId}
          onChange={(event) => onChangeStudent(event.target.value)}
          disabled={!selectedSessionId || studentsLoading}
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value="">{studentsLoading ? "Đang tải học viên..." : "Chọn học viên"}</option>
          {students.map((student) => (
            <option key={student.studentProfileId} value={student.studentProfileId}>
              {student.studentName}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3">
        <label className="text-xs font-semibold text-gray-700">Nội dung báo cáo</label>
        <textarea
          value={feedback}
          onChange={(event) => onChangeFeedback(event.target.value)}
          rows={7}
          placeholder="Ví dụ: Hôm nay con tập trung tốt hơn, đọc đoạn văn rõ hơn..."
          className="mt-1 w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onEnhance}
          disabled={enhancing || saving || !feedback.trim()}
          className="rounded-xl border border-red-300 bg-white py-2.5 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enhancing ? "AI đang xử lý..." : "AI cải thiện"}
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={!canSaveDraft || saving || enhancing}
          className="rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : editingReportId ? "Cập nhật nháp" : "Lưu nháp"}
        </button>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || saving || enhancing}
        className="mt-2 w-full rounded-xl border border-red-600 bg-red-50 py-2.5 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Gửi báo cáo
      </button>
    </div>
  );
};

export default SessionReportComposer;