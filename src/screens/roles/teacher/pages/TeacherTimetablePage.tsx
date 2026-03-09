import React, { useCallback, useEffect, useState } from "react";
import { Page } from "zmp-ui";
import WeeklyTimetable from "@/components/timetable/WeeklyTimetable";
import { TimetableSession } from "@/types/timetable";
import { timetableService } from "@/services/timetableService";
import { getWeekRange } from "@/utils/timetableHelper";

const TeacherTimetablePage: React.FC = () => {
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = getWeekRange(weekStart);
      const response = await timetableService.getTeacherTimetable(from, to);
      if (response.isSuccess || response.success) {
        setSessions(response.data?.sessions ?? []);
      } else {
        setError(response.message || "Không thể tải lịch dạy");
      }
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi tải lịch dạy");
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const handlePrevWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    setWeekStart(monday);
  };

  return (
    <Page className="flex flex-col h-screen bg-slate-50">
      <div className="top-0 z-20 bg-red-600 text-white px-4 py-3">
        <h1 className="text-lg font-bold text-center">Lịch dạy</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <WeeklyTimetable
          sessions={sessions}
          loading={loading}
          error={error}
          weekStart={weekStart}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onToday={handleToday}
          role="teacher"
        />
      </div>
    </Page>
  );
};

export default TeacherTimetablePage;
