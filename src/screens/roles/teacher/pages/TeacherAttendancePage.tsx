import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import { attendanceService } from "@/services/attendanceService";
import { AttendanceStudent, AttendanceRequest } from "@/types/attendance";

type AttendanceStatusValue = AttendanceRequest["attendanceStatus"];

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

function TeacherAttendancePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { openSnackbar } = useSnackbar();

  const sessionInfo = (location.state ?? {}) as SessionInfo;

  // Map: studentProfileId → status
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAttendance = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      // GET /attendance/{sessionId} returns data as AttendanceStudent[]
      const res = await attendanceService.getAttendance(sessionId);
      const list: AttendanceStudent[] = Array.isArray(res?.data)
        ? res.data
        : (res?.data as any)?.items ?? [];

      setStudents(list);
      const map: Record<string, string> = {};
      list.forEach((s) => {
        map[s.studentProfileId] = s.attendanceStatus ?? "NotMarked";
      });
      setStatusMap(map);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách điểm danh");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleStatusChange = async (student: AttendanceStudent, newStatus: AttendanceStatusValue) => {
    if (!sessionId) return;
    // Optimistic update
    setStatusMap((prev) => ({ ...prev, [student.studentProfileId]: newStatus }));
    setSavingId(student.studentProfileId);
    try {
      await attendanceService.updateStudentAttendance(
        sessionId,
        student.studentProfileId,
        newStatus
      );
    } catch (err: any) {
      // Revert on error
      setStatusMap((prev) => ({
        ...prev,
        [student.studentProfileId]: statusMap[student.studentProfileId] ?? "NotMarked",
      }));
      openSnackbar({ text: "Lưu thất bại, vui lòng thử lại", type: "error" });
    } finally {
      setSavingId(null);
    }
  };

  const totalPresent = Object.values(statusMap).filter((v) => v === "Present").length;
  const totalAbsent = Object.values(statusMap).filter((v) => v === "Absent").length;
  const totalMakeup = Object.values(statusMap).filter((v) => v === "Makeup").length;
  const totalNotMarked = students.length - totalPresent - totalAbsent - totalMakeup;

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      {/* Fixed header + summary */}
      <div className="shrink-0 z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg flex-1 text-center pr-6">Điểm danh</h1>
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

      <div className="flex-1 min-h-0 overflow-y-auto pb-24">
        {/* Content */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner />
            <p className="text-sm text-gray-400">Đang tải danh sách...</p>
          </div>
        )}

        {error && !loading && (
          <div className="mx-4 mt-6 bg-red-50 rounded-2xl p-5 text-center">
            <svg className="w-10 h-10 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
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
            <svg className="w-14 h-14 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">Không có học sinh trong buổi học này</p>
          </div>
        )}

        {!loading && !error && students.length > 0 && (
          <div className="px-4 pt-4 flex flex-col gap-3">
            {students.map((student, idx) => {
              const currentStatus = statusMap[student.studentProfileId] ?? "NotMarked";
              const isSaving = savingId === student.studentProfileId;

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
                    {isSaving && <Spinner />}
                  </div>

                  {/* Status buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_CONFIG.map((cfg) => (
                      <button
                        key={cfg.value}
                        disabled={isSaving}
                        onClick={() => handleStatusChange(student, cfg.value)}
                        className={`py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
                          currentStatus === cfg.value ? cfg.activeClass : cfg.inactiveClass
                        } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
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
    </Page>
  );
}

export default TeacherAttendancePage;

