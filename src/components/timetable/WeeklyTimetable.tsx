import React, { useMemo } from "react";
import { Spinner, Text } from "zmp-ui";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { TimetableSession } from "@/types/timetable";
import {
  getSessionDisplayDatetime,
  groupSessionsByDay,
  parseTimetableDateTime,
  toLocalDateKey,
} from "@/utils/timetableHelper";

const DAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_BADGE: Record<number | string, { label: string; cls: string }> = {
  0: { label: "not yet", cls: "bg-gray-700 text-white" },
  1: { label: "done", cls: "bg-green-600 text-white" },
  2: { label: "cancelled", cls: "bg-red-500 text-white" },
  // string fallbacks
  Scheduled: { label: "not yet", cls: "bg-gray-700 text-white" },
  Completed: { label: "done", cls: "bg-green-600 text-white" },
  Cancelled: { label: "cancelled", cls: "bg-red-500 text-white" },
};

const ATTENDANCE_STATUS_BADGE: Record<
  NonNullable<TimetableSession["attendanceStatus"]>,
  { label: string; cls: string }
> = {
  Present: { label: "Present", cls: "bg-emerald-600 text-white" },
  Absent: { label: "Absent", cls: "bg-red-600 text-white" },
  Late: { label: "Late", cls: "bg-amber-500 text-white" },
  Excused: { label: "Excused", cls: "bg-blue-600 text-white" },
  Unmarked: { label: "Unmarked", cls: "bg-slate-500 text-white" },
};

function formatTime(isoString: string): string {
  const d = parseTimetableDateTime(isoString);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatEndTime(isoString: string, durationMinutes: number): string {
  const d = parseTimetableDateTime(isoString);
  d.setMinutes(d.getMinutes() + durationMinutes);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function toDisplayDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function toMonthYear(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${m}/${date.getFullYear()}`;
}

interface WeeklyTimetableProps {
  sessions: TimetableSession[];
  loading: boolean;
  error: string | null;
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  role: "student" | "teacher" | "parent";
  /** Teacher only: called when pressing the attendance button on a today session */
  onSessionAttendance?: (session: TimetableSession) => void;
}

function isTodaySession(isoString: string): boolean {
  const d = parseTimetableDateTime(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({
  sessions,
  loading,
  error,
  weekStart,
  onPrevWeek,
  onNextWeek,
  onToday,
  role,
  onSessionAttendance,
}) => {
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [weekStart]);

  const sessionsByDay = useMemo(() => groupSessionsByDay(sessions), [sessions]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sticky header: current week label + month nav + calendar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        {/* Current week label */}
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-center text-red-600 font-semibold text-sm tracking-wide">
            Current week: {toDisplayDate(weekStart)} - {toDisplayDate(weekEnd)}
          </p>
        </div>
        {/* Month nav */}
        <div className="flex items-center justify-center gap-6 py-2 border-b border-gray-100">
          <button
            onClick={onPrevWeek}
            className="text-red-600 font-bold text-base leading-none px-1 active:opacity-60"
          >
            ◀
          </button>
          <button
            onClick={onToday}
            className="text-red-600 font-bold text-sm min-w-[70px] text-center active:opacity-60"
          >
            {toMonthYear(weekStart)}
          </button>
          <button
            onClick={onNextWeek}
            className="text-red-600 font-bold text-base leading-none px-1 active:opacity-60"
          >
            ▶
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 px-2 pt-1.5">
          {DAY_LABELS_EN.map((label, i) => (
            <span key={i} className="text-center text-[11px] text-gray-500 font-medium">
              {label}
            </span>
          ))}
        </div>

        {/* Date chips */}
        <div className="grid grid-cols-7 px-2 pb-2">
          {weekDays.map((day) => {
            const isToday = day.getTime() === today.getTime();
            const dateKey = toLocalDateKey(day);
            const hasSessions = !!sessionsByDay[dateKey]?.length;
            return (
              <div key={dateKey} className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                    isToday
                      ? "bg-red-600 text-white"
                      : hasSessions
                      ? "text-red-600"
                      : "text-gray-400"
                  }`}
                >
                  {day.getDate()}
                </div>
                {hasSessions && !isToday && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto pb-20">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner />
            <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 p-4 text-center">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-400" strokeWidth={1.8} />
            <Text className="text-sm text-red-600">{error}</Text>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="text-center py-12">
            <CalendarDays className="mx-auto mb-3 h-14 w-14 text-gray-200" strokeWidth={1.5} />
            <Text className="text-sm text-gray-400">Không có buổi học nào trong tuần này</Text>
          </div>
        )}

        {!loading && !error &&
          weekDays.map((day) => {
            const dateKey = toLocalDateKey(day);
            const daySessions = sessionsByDay[dateKey] || [];

            // Empty day placeholder
            if (daySessions.length === 0) {
              return (
                <div key={dateKey} className="flex border-b border-gray-200 min-h-[80px]">
                  {/* Date column */}
                  <div className="flex flex-col items-center justify-center w-[52px] shrink-0 border-r border-gray-200 py-3">
                    <span className="text-sm font-bold text-gray-800 leading-tight">
                      {day.getDate()}/{day.getMonth() + 1}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {DAY_LABELS_EN[day.getDay()]}
                    </span>
                  </div>
                  {/* Empty */}
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs text-gray-400 italic">Không có lịch học</span>
                  </div>
                </div>
              );
            }

            // Day with one or more sessions — date column spans all of them
            return (
              <div key={dateKey} className="flex border-b border-gray-200">
                {/* Date column — single cell spanning all sessions */}
                <div className="flex flex-col items-center justify-center w-[52px] shrink-0 border-r border-gray-200 py-3">
                  <span className="text-sm font-bold text-red-600 leading-tight">
                    {day.getDate()}/{day.getMonth() + 1}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {DAY_LABELS_EN[day.getDay()]}
                  </span>
                </div>

                {/* Stack of sessions for this day */}
                <div className="flex-1 min-w-0 flex flex-col divide-y divide-gray-100">
                  {daySessions.map((session, idx) => {
                    const sessionDatetime = getSessionDisplayDatetime(session);
                    const startTime = formatTime(sessionDatetime);
                    const endTime = formatEndTime(sessionDatetime, session.durationMinutes);
                    const badge = STATUS_BADGE[session.status] ?? { label: String(session.status), cls: "bg-gray-500 text-white" };
                    const roomDisplay = session.plannedRoomName ?? null;
                    const teacherDisplay = session.plannedTeacherName ?? null;
                    const sessionKey = session.id ?? `${dateKey}-${idx}`;
                    const attendanceBadge =
                      ATTENDANCE_STATUS_BADGE[session.attendanceStatus ?? "Unmarked"] ??
                      ATTENDANCE_STATUS_BADGE.Unmarked;

                    return (
                      <div key={`${dateKey}-${sessionKey}`} className="flex min-h-[100px]">
                        {/* Middle: slot / time / status / buttons */}
                        <div className="flex border-r border-gray-200 py-3 px-2 gap-1.5 shrink-0">
                          {session.slotNumber != null && (
                            <div className="flex items-center justify-center">
                              <span
                                className="text-[10px] font-bold text-red-500 whitespace-nowrap leading-none"
                                style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
                              >
                                Slot: {session.slotNumber}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col">
                            {/* Time */}
                            <div className="flex flex-col items-start mb-2">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                                <span className="text-xs font-semibold text-gray-700">{startTime}</span>
                              </div>
                              <div className="w-px h-3 bg-gray-400 ml-[3.5px] my-0.5" />
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                                <span className="text-xs font-semibold text-gray-700">{endTime}</span>
                              </div>
                            </div>

                            {/* Status badge */}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium w-fit mb-2 ${badge.cls}`}>
                              {badge.label}
                            </span>

                            {/* Action block */}
                            <div className="flex flex-col gap-1">
                              {(role === "student" || role === "parent") && (
                                <span
                                  className={`text-[10px] px-2 py-1 rounded-md font-semibold whitespace-nowrap text-center ${attendanceBadge.cls}`}
                                >
                                  {attendanceBadge.label}
                                </span>
                              )}
                              {/* <button
                                className="text-[10px] px-2 py-1 rounded-md bg-green-500 text-white font-semibold whitespace-nowrap active:opacity-70"
                                onClick={() => session.meetUrl && window.open(session.meetUrl, "_blank")}
                              >
                                Meet URL
                              </button> */}                              {role === "teacher" && isTodaySession(sessionDatetime) && onSessionAttendance && (
                                <button
                                  className="text-[10px] px-2 py-1 rounded-md bg-red-600 text-white font-semibold whitespace-nowrap active:opacity-70"
                                  onClick={() => onSessionAttendance(session)}
                                >
                                  Điểm danh
                                </button>
                              )}                            </div>
                          </div>
                        </div>

                        {/* Right: session details */}
                        <div className="flex-1 py-3 px-2.5 min-w-0">
                          {roomDisplay && (
                            <p className="text-xs font-bold text-red-500 mb-0.5">Room: {roomDisplay}</p>
                          )}
                          <p className="text-xs font-bold text-red-700 mb-1">
                            Subject Code: {session.classCode}
                          </p>
                          {session.classTitle && (
                            <p className="text-xs text-gray-600 mb-0.5">
                              Group class:{" "}
                              <span className="block pl-2 font-medium text-gray-800">{session.classTitle}</span>
                            </p>
                          )}
                          {teacherDisplay && (
                            <p className="text-xs text-gray-600">Lecturer: {teacherDisplay}</p>
                          )}
                          {role === "parent" && session.studentName && (
                            <p className="text-xs text-purple-600 mt-0.5">Student: {session.studentName}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

export default WeeklyTimetable;
