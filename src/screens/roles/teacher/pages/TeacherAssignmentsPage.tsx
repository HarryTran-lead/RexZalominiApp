import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
import { homeworkService } from "@/services/homeworkService";
import { Homework } from "@/types/teacher";

function TeacherAssignmentsPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await homeworkService.getHomeworkList();
      setAssignments(list);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isDueSoon = (dueDate?: string) => {
    if (!dueDate) return false;
    const diff = new Date(dueDate).getTime() - Date.now();
    return diff > 0 && diff < 48 * 60 * 60 * 1000; // within 48 hours
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate).getTime() < Date.now();
  };

  const getDueBadge = (dueDate?: string) => {
    if (isOverdue(dueDate)) return { text: "Quá hạn", cls: "bg-red-100 text-red-700" };
    if (isDueSoon(dueDate)) return { text: "Sắp hết hạn", cls: "bg-amber-100 text-amber-700" };
    return null;
  };

  return (
    <Page className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Bài tập & nộp bài</h1>
      </div>

      {/* Summary bar */}
      {!loading && !error && assignments.length > 0 && (
        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Tổng: <span className="font-semibold text-gray-800">{assignments.length}</span> bài tập
          </span>
        </div>
      )}

      <div className="px-4 pt-4">
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
              onClick={fetchAssignments}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && assignments.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">Không có bài tập nào</p>
          </div>
        )}

        {/* Assignments Table/List */}
        {!loading && !error && assignments.length > 0 && (
          <div className="space-y-3">
            {assignments.map((hw) => {
              const badge = getDueBadge(hw.dueAt);
              return (
                <div
                  key={hw.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="font-bold text-gray-800 text-sm flex-1 mr-2 line-clamp-2">
                        {hw.title}
                      </h3>
                      {badge && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${badge.cls}`}>
                          {badge.text}
                        </span>
                      )}
                    </div>

                    {hw.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {hw.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-2">
                      {(hw.classCode || hw.classTitle) && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                          </svg>
                          {hw.classCode || hw.classTitle}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        {hw.dueAt && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(hw.dueAt)} {formatTime(hw.dueAt)}
                          </span>
                        )}
                      </div>
                    </div>
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

export default TeacherAssignmentsPage;
