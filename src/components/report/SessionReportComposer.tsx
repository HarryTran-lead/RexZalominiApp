import React from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";
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
  const selectedSessionLabel = selectedSession
    ? `${selectedSession.classCode || "Lớp"} - ${formatTimeRange(selectedSession.plannedDatetime, selectedSession.durationMinutes)}`
    : "Chọn buổi học";
  const selectedStudentLabel = students.find((student) => student.studentProfileId === selectedStudentProfileId)?.studentName ??
    (studentsLoading ? "Đang tải học viên..." : "Chọn học viên");

  return (
    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-gray-800">Tạo báo cáo buổi học hôm nay</h2>
      <p className="mt-1 text-xs text-gray-500">
        Chọn buổi học, chọn học viên để đánh giá, nhập nội dung rồi lưu nháp và gửi staff duyệt.
      </p>

      <div className="mt-3">
        <label className="text-xs font-semibold text-gray-700">Lớp/Buổi trong lịch hôm nay</label>
        <Listbox value={selectedSessionId} onChange={onChangeSession}>
          <div className="relative mt-1">
            <ListboxButton className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700 outline-none focus:border-red-400">
              <span className="block truncate">{selectedSessionLabel}</span>
              <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </ListboxButton>
            <ListboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
              <ListboxOption value="" className={({ focus }) => `cursor-pointer px-3 py-2 text-sm ${focus ? "bg-red-50 text-red-700" : "text-gray-700"}`}>
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-2">
                    <span>Chọn buổi học</span>
                    {selected && <Check className="h-4 w-4 text-red-600" />}
                  </div>
                )}
              </ListboxOption>
              {sessions.map((session) => (
                <ListboxOption key={session.id} value={session.id} className={({ focus }) => `cursor-pointer px-3 py-2 text-sm ${focus ? "bg-red-50 text-red-700" : "text-gray-700"}`}>
                  {({ selected }) => (
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{(session.classCode || "Lớp") + " - " + formatTimeRange(session.plannedDatetime, session.durationMinutes)}</span>
                      {selected && <Check className="h-4 w-4 text-red-600" />}
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
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
        <Listbox value={selectedStudentProfileId} onChange={onChangeStudent} disabled={!selectedSessionId || studentsLoading}>
          <div className="relative mt-1">
            <ListboxButton className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700 outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:bg-gray-100">
              <span className="block truncate">{selectedStudentLabel}</span>
              <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </ListboxButton>
            <ListboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
              <ListboxOption value="" className={({ focus }) => `cursor-pointer px-3 py-2 text-sm ${focus ? "bg-red-50 text-red-700" : "text-gray-700"}`}>
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-2">
                    <span>{studentsLoading ? "Đang tải học viên..." : "Chọn học viên"}</span>
                    {selected && <Check className="h-4 w-4 text-red-600" />}
                  </div>
                )}
              </ListboxOption>
              {students.map((student) => (
                <ListboxOption key={student.studentProfileId} value={student.studentProfileId} className={({ focus }) => `cursor-pointer px-3 py-2 text-sm ${focus ? "bg-red-50 text-red-700" : "text-gray-700"}`}>
                  {({ selected }) => (
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{student.studentName}</span>
                      {selected && <Check className="h-4 w-4 text-red-600" />}
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
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