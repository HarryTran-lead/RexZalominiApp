import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
import { reportService } from "@/services/reportService";
import { SessionReport } from "@/types/teacher";

function TeacherReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<SessionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await reportService.getSessionReports();
      setReports(list);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const totalReports = reports.length;
  const uniqueStudents = new Set(reports.map((r) => r.studentProfileId).filter(Boolean)).size;
  const uniqueClasses = new Set(reports.map((r) => r.classId).filter(Boolean)).size;

  return (
    <Page className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Báo cáo & feedback</h1>
      </div>

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
              onClick={fetchReports}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && reports.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Không có báo cáo nào</p>
          </div>
        )}

        {/* Summary Cards */}
        {!loading && !error && reports.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                <p className="text-2xl font-bold text-red-600">{totalReports}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Tổng báo cáo</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                <p className="text-2xl font-bold text-blue-600">{uniqueStudents}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Học sinh</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                <p className="text-2xl font-bold text-purple-600">{uniqueClasses}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Lớp học</p>
              </div>
            </div>

            {/* Report List */}
            <div className="space-y-3">
              {reports.map((report) => {
                return (
                  <div
                    key={report.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate">
                          {report.classTitle || report.classCode || `Báo cáo #${report.id.slice(0, 6)}`}
                        </h3>
                        {report.studentName && (
                          <p className="text-xs text-gray-500 mt-0.5">{report.studentName}</p>
                        )}
                      </div>
                    </div>

                    {report.feedback && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {report.feedback}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        {report.sessionDate && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(report.sessionDate)}
                          </span>
                        )}
                        {report.classCode && (
                          <span className="text-gray-400">{report.classCode}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Page>
  );
}

export default TeacherReportsPage;
