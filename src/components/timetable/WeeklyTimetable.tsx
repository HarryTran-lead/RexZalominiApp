import React, { useMemo } from "react";
import { Box, Text, Spinner } from "zmp-ui";
import {
  TimetableSession,
} from "@/types/timetable";
import { groupSessionsByDay } from "@/utils/timetableHelper";

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
  0: "CN",
};

const STATUS_COLORS: Record<string, string> = {
  Scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  Completed: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  Scheduled: "Sắp diễn ra",
  Completed: "Đã hoàn thành",
  Cancelled: "Đã hủy",
};

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatEndTime(isoString: string, durationMinutes: number): string {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() + durationMinutes);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

interface SessionCardProps {
  session: TimetableSession;
  role: "student" | "teacher" | "parent";
}

const SessionCard: React.FC<SessionCardProps> = ({ session, role }) => {
  const statusClass =
    STATUS_COLORS[session.status] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 mb-2 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-800 truncate">
              {session.className}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusClass}`}
            >
              {STATUS_LABELS[session.status] || session.status}
            </span>
          </div>

          <div className="flex items-center gap-1 mb-1">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-slate-500">
              {formatTime(session.plannedDatetime)} -{" "}
              {formatEndTime(session.plannedDatetime, session.durationMinutes)}
              <span className="text-slate-400 ml-1">
                ({session.durationMinutes} phút)
              </span>
            </span>
          </div>

          {session.programName && (
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xs text-slate-500">{session.programName}</span>
            </div>
          )}

          {(role === "student" || role === "parent") && session.teacherName && (
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs text-slate-500">
                GV: {session.teacherName}
              </span>
            </div>
          )}

          {role === "parent" && session.studentName && (
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-purple-600">
                HS: {session.studentName}
              </span>
            </div>
          )}

          {session.roomName && (
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-slate-500">
                Phòng: {session.roomName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface WeeklyTimetableProps {
  sessions: TimetableSession[];
  loading: boolean;
  error: string | null;
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  role: "student" | "teacher" | "parent";
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
}) => {
  // Generate all 7 days of the week
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
    <div className="flex flex-col h-full">
      {/* Week Navigation Header */}
      <div className="bg-white sticky top-0 z-10 px-4 pt-3 pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onPrevWeek}
            className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <button
              onClick={onToday}
              className="text-xs text-blue-600 font-medium mb-0.5 block"
            >
              Hôm nay
            </button>
            <span className="text-sm font-semibold text-slate-800">
              {formatDate(weekStart.toISOString())} -{" "}
              {formatDate(weekEnd.toISOString())}
            </span>
          </div>

          <button
            onClick={onNextWeek}
            className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {weekDays.map((day) => {
            const dateKey = day.toISOString().split("T")[0];
            const hasSessions = sessionsByDay[dateKey] && sessionsByDay[dateKey].length > 0;
            const isToday = day.getTime() === today.getTime();

            return (
              <div
                key={dateKey}
                className={`flex flex-col items-center min-w-[40px] px-1.5 py-1 rounded-lg text-center ${
                  isToday
                    ? "bg-blue-600 text-white"
                    : hasSessions
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-400"
                }`}
              >
                <span className="text-[10px] font-medium">
                  {WEEKDAY_LABELS[day.getDay()]}
                </span>
                <span className={`text-sm font-bold ${isToday ? "" : ""}`}>
                  {day.getDate()}
                </span>
                {hasSessions && !isToday && (
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-20">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner />
            <span className="ml-2 text-sm text-slate-500">Đang tải...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <Text className="text-sm text-red-600">{error}</Text>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <Text className="text-sm text-slate-400">
              Không có buổi học nào trong tuần này
            </Text>
          </div>
        )}

        {!loading &&
          !error &&
          weekDays.map((day) => {
            const dateKey = day.toISOString().split("T")[0];
            const daySessions = sessionsByDay[dateKey] || [];
            const isToday = day.getTime() === today.getTime();

            if (daySessions.length === 0) return null;

            return (
              <div key={dateKey} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {WEEKDAY_LABELS[day.getDay()]}
                  </div>
                  <span className="text-xs text-slate-400">
                    {day.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-slate-300">
                    ({daySessions.length} buổi)
                  </span>
                </div>

                {daySessions.map((session) => (
                  <SessionCard
                    key={session.sessionId}
                    session={session}
                    role={role}
                  />
                ))}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default WeeklyTimetable;
