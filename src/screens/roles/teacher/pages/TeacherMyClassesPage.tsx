import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
import { AlertCircle, BookOpen, CalendarDays, School, Users } from "lucide-react";
import { teacherService } from "@/services/teacherService";
import { TeacherClass } from "@/types/teacher";

function TeacherMyClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await teacherService.getTeacherClasses();
      setClasses(list);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "ongoing":
        return "bg-green-100 text-green-700";
      case "completed":
      case "finished":
        return "bg-gray-100 text-gray-600";
      case "upcoming":
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "active":
      case "ongoing":
        return "Đang hoạt động";
      case "completed":
      case "finished":
        return "Đã kết thúc";
      case "upcoming":
      case "scheduled":
      case "planned":
        return "Sắp diễn ra";
      case "cancelled":
        return "Đã hủy";
      default:
        return status || "Không xác định";
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="shrink-0 bg-[#BB0000] px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Lớp học của tôi</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner visible />
            <p className="text-gray-400 text-sm mt-3">Đang tải dữ liệu...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-16 text-center">
            <AlertCircle className="mb-3 h-14 w-14 text-red-400" strokeWidth={1.5} />
            <p className="text-red-500 text-sm font-medium mb-3">{error}</p>
            <button
              onClick={fetchClasses}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && classes.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <School className="mb-3 h-16 w-16" strokeWidth={1.2} />
            <p className="text-sm">Không có lớp học nào</p>
          </div>
        )}

        {!loading && !error && classes.length > 0 && (
          <div className="space-y-3">
            {classes.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() =>
                  navigate(`/teacher/my-classes/${cls.id}/students`, {
                    state: {
                      classTitle: cls.title,
                      classCode: cls.code,
                    },
                  })
                }
                className="w-full text-left bg-white rounded-xl shadow-sm p-4 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-base truncate">{cls.title || cls.code}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{cls.code}</p>
                  </div>
                  {cls.status && (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ml-2 ${getStatusColor(
                        cls.status
                      )}`}
                    >
                      {getStatusLabel(cls.status)}
                    </span>
                  )}
                </div>

                {cls.programName && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1.5">
                    <BookOpen className="h-4 w-4 flex-shrink-0 text-red-400" />
                    <span>{cls.programName}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50">
                  {(cls.currentEnrollmentCount != null || cls.capacity != null) && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {cls.currentEnrollmentCount ?? cls.capacity ?? 0} học sinh
                    </span>
                  )}
                  {(cls.startDate || cls.endDate) && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(cls.startDate)} – {formatDate(cls.endDate)}
                    </span>
                  )}
                </div>
                <div className="mt-3 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600">
                  Xem danh sách học sinh
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

export default TeacherMyClassesPage;
