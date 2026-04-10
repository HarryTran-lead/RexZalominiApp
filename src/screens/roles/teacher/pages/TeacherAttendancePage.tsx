import React, { useCallback, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import { AlertTriangle, Users } from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";
import { attendanceService } from "@/services/attendanceService";
import {
  AttendanceListPayload,
  AttendanceMarkStatus,
  AttendanceStudent,
} from "@/types/attendance";

type AttendanceStatusValue = AttendanceMarkStatus;

const STATUS_CONFIG: {
  value: AttendanceStatusValue;
  label: string;
  shortLabel: string;
  activeClass: string;
  inactiveClass: string;
}[] = [
  {
    value: "Present",
    label: "Có mặt",
    shortLabel: "Có mặt",
    activeClass: "bg-green-600 text-white border-green-600",
    inactiveClass: "bg-white text-green-600 border-green-400",
  },
  {
    value: "Absent",
    label: "Vắng mặt",
    shortLabel: "Vắng",
    activeClass: "bg-red-600 text-white border-red-600",
    inactiveClass: "bg-white text-red-600 border-red-400",
  },
  {
    value: "Makeup",
    label: "Học bù",
    shortLabel: "Học bù",
    activeClass: "bg-amber-500 text-white border-amber-500",
    inactiveClass: "bg-white text-amber-500 border-amber-400",
  },
];

interface SessionInfo {
  classCode?: string;
  classTitle?: string;
  plannedDatetime?: string;
  durationMinutes?: number;
}

function formatSessionTime(isoString?: string, durationMinutes?: number): string {
  if (!isoString) return "";
  const start = new Date(isoString);
  const end = new Date(start);
  if (durationMinutes) end.setMinutes(end.getMinutes() + durationMinutes);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatDate(isoString?: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function extractAttendanceList(payload: AttendanceListPayload | undefined): AttendanceStudent[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if ("attendances" in payload && Array.isArray(payload.attendances)) {
    return payload.attendances;
  }
  if ("items" in payload && Array.isArray(payload.items)) {
    return payload.items;
  }
  return [];
}

function isSubmitStatus(
  value: AttendanceStudent["attendanceStatus"]
): value is AttendanceMarkStatus {
  return value !== "NotMarked";
}

function TeacherAttendancePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const { openSnackbar } = useSnackbar();

  const sessionInfo = (location.state ?? {}) as SessionInfo;

  // Map: studentProfileId -> local selected status
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStudent["attendanceStatus"]>>({});
  const [initialStatusMap, setInitialStatusMap] = useState<
    Record<string, AttendanceStudent["attendanceStatus"]>
  >({});
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAttendance = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceService.getAttendance(sessionId);
      const list = extractAttendanceList(res?.data);

      setStudents(list);
      const map: Record<string, AttendanceStudent["attendanceStatus"]> = {};
      list.forEach((s) => {
        map[s.studentProfileId] = s.attendanceStatus ?? "NotMarked";
      });
      setStatusMap(map);
      setInitialStatusMap(map);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách điểm danh";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleStatusChange = (student: AttendanceStudent, newStatus: AttendanceStatusValue) => {
    setStatusMap((prev) => ({ ...prev, [student.studentProfileId]: newStatus }));
  };

  const changedCount = students.filter((student) => {
    const current = statusMap[student.studentProfileId] ?? "NotMarked";
    const initial = initialStatusMap[student.studentProfileId] ?? "NotMarked";
    return current !== initial;
  }).length;

  const hasUnmarked = students.some(
    (student) => (statusMap[student.studentProfileId] ?? "NotMarked") === "NotMarked"
  );

  const handleOpenConfirm = () => {
    if (students.length === 0) return;
    if (changedCount === 0) {
      openSnackbar({ text: "Bạn chưa thay đổi dữ liệu điểm danh", type: "warning" });
      return;
    }
    if (hasUnmarked) {
      openSnackbar({ text: "Vui lòng điểm danh đầy đủ cho tất cả học sinh", type: "warning" });
      return;
    }
    setConfirmOpen(true);
  };

  const handleSubmitAttendance = async () => {
    if (!sessionId || submitting) return;

    const attendances = students
      .map((student) => {
        const currentStatus = statusMap[student.studentProfileId] ?? "NotMarked";
        if (!isSubmitStatus(currentStatus)) return null;
        return {
          studentProfileId: student.studentProfileId,
          attendanceStatus: currentStatus,
        };
      })
      .filter((item): item is { studentProfileId: string; attendanceStatus: AttendanceMarkStatus } => Boolean(item));

    if (attendances.length !== students.length) {
      openSnackbar({ text: "Vui lòng điểm danh đầy đủ cho tất cả học sinh", type: "warning" });
      return;
    }

    setSubmitting(true);
    try {
      await attendanceService.submitAttendanceList(sessionId, attendances);
      setConfirmOpen(false);
      openSnackbar({ text: "Đã gửi điểm danh thành công", type: "success" });
      await loadAttendance();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gửi điểm danh thất bại";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const totalPresent = Object.values(statusMap).filter((v) => v === "Present").length;
  const totalAbsent = Object.values(statusMap).filter((v) => v === "Absent").length;
  const totalMakeup = Object.values(statusMap).filter((v) => v === "Makeup").length;
  const totalNotMarked = students.length - totalPresent - totalAbsent - totalMakeup;

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      {/* Sticky header + summary */}
      <div className="sticky top-0 shrink-0 z-20">
        {/* Header */}
        <div className="bg-[#BB0000] px-4 py-4">
        <div className="flex items-center mb-2">
          <h1 className="text-white font-bold text-lg w-full text-center">Điểm danh</h1>
        </div>
        {/* Session info */}
        {sessionInfo.classCode && (
          <div className="bg-white/20 rounded-xl px-4 py-3 mt-1">
            <p className="text-white font-bold text-sm">{sessionInfo.classCode}</p>
            {sessionInfo.classTitle && (
              <p className="text-white/90 text-xs mt-0.5">{sessionInfo.classTitle}</p>
            )}
            <p className="text-white/80 text-xs mt-1">
              {formatDate(sessionInfo.plannedDatetime)}
            </p>
            <p className="text-white/80 text-xs">
              {formatSessionTime(sessionInfo.plannedDatetime, sessionInfo.durationMinutes)}
            </p>
          </div>
        )}
        </div>
        {/* Summary bar */}
        {!loading && students.length > 0 && (
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-around text-center">
            <div>
              <p className="text-xl font-bold text-green-600">{totalPresent}</p>
              <p className="text-[11px] text-gray-500">Có mặt</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-xl font-bold text-red-600">{totalAbsent}</p>
              <p className="text-[11px] text-gray-500">Vắng</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-xl font-bold text-amber-500">{totalMakeup}</p>
              <p className="text-[11px] text-gray-500">Học bù</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-xl font-bold text-gray-400">{totalNotMarked}</p>
              <p className="text-[11px] text-gray-500">Chưa</p>
            </div>
          </div>
        )}
      </div> {/* end fixed wrapper */}

      <div className="flex-1 min-h-0 overflow-y-auto pb-6">
        {/* Content */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner />
            <p className="text-sm text-gray-400">Đang tải danh sách...</p>
          </div>
        )}

        {error && !loading && (
          <div className="mx-4 mt-6 bg-red-50 rounded-2xl p-5 text-center">
            <AlertTriangle className="mx-auto mb-2 h-10 w-10 text-red-400" strokeWidth={1.7} />
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadAttendance}
              className="mt-3 text-sm text-red-600 font-semibold underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && students.length === 0 && (
          <div className="mx-4 mt-8 flex flex-col items-center text-gray-400">
            <Users className="mb-3 h-14 w-14" strokeWidth={1.2} />
            <p className="text-sm">Không có học sinh trong buổi học này</p>
          </div>
        )}

        {!loading && !error && students.length > 0 && (
          <div className="px-4 pt-4 flex flex-col gap-3">
            {students.map((student, idx) => {
              const currentStatus = statusMap[student.studentProfileId] ?? "NotMarked";

              return (
                <div
                  key={student.studentProfileId}
                  className="bg-white rounded-2xl shadow-sm px-4 py-3"
                >
                  {/* Student info row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm leading-tight truncate">
                        {student.studentName}
                      </p>
                    </div>
                  </div>

                  {/* Status buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_CONFIG.map((cfg) => (
                      <button
                        key={cfg.value}
                        disabled={submitting}
                        onClick={() => handleStatusChange(student, cfg.value)}
                        className={`py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
                          currentStatus === cfg.value ? cfg.activeClass : cfg.inactiveClass
                        } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {cfg.shortLabel}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && !error && students.length > 0 && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
          <p className="mb-2 text-center text-xs text-gray-500">
            Đã thay đổi {changedCount}/{students.length} học sinh
          </p>
          <button
            type="button"
            onClick={handleOpenConfirm}
            disabled={submitting || changedCount === 0}
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Đang gửi điểm danh..." : "Xác nhận gửi điểm danh"}
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title="Xác nhận gửi điểm danh"
        message="Bạn có chắc chắn muốn gửi điểm danh cho cả lớp không?"
        confirmText="Gửi điểm danh"
        isLoading={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleSubmitAttendance}
      >
        <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <p>Tổng học sinh: {students.length}</p>
          <p>Có mặt: {totalPresent}</p>
          <p>Vắng: {totalAbsent}</p>
          <p>Học bù: {totalMakeup}</p>
          <p>Chưa điểm danh: {totalNotMarked}</p>
        </div>
      </ConfirmModal>
    </Page>
  );
}

export default TeacherAttendancePage;

