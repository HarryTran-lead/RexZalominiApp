import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
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
      {/* Header */}
      <div className="shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Lớp học của tôi</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-24">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner visible />
            <p className="text-gray-400 text-sm mt-3">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center py-16 text-center">
            <svg className="w-14 h-14 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-red-500 text-sm font-medium mb-3">{error}</p>
            <button
              onClick={fetchClasses}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && classes.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-sm">Không có lớp học nào</p>
          </div>
        )}

        {/* Class Cards */}
        {!loading && !error && classes.length > 0 && (
          <div className="space-y-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-base truncate">
                      {cls.title || cls.code}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{cls.code}</p>
                  </div>
                  {cls.status && (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ml-2 ${getStatusColor(cls.status)}`}
                    >
                      {cls.status}
                    </span>
                  )}
                </div>

                {cls.programName && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1.5">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>{cls.programName}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50">
                  {cls.capacity != null && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {cls.capacity} học sinh
                    </span>
                  )}
                  {(cls.startDate || cls.endDate) && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(cls.startDate)} – {formatDate(cls.endDate)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

export default TeacherMyClassesPage;
