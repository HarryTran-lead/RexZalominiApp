import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
import { parentService } from "@/services/parentService";
import { ParentSessionReport } from "@/types/parent";

function formatDate(iso?: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusMeta(status?: string): { label: string; className: string } {
  const normalized = (status || "").toLowerCase();
  if (normalized === "published") return { label: "Đã publish", className: "bg-blue-100 text-blue-700" };
  if (normalized === "approved") return { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700" };
  if (normalized === "review") return { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" };
  if (normalized === "rejected") return { label: "Từ chối", className: "bg-rose-100 text-rose-700" };
  if (normalized === "draft") return { label: "Nháp", className: "bg-gray-100 text-gray-700" };
  return { label: status || "Không xác định", className: "bg-gray-100 text-gray-700" };
}

const ParentSessionReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ParentSessionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ParentSessionReport | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await parentService.getSessionReports();
      setReports(list);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải báo cáo buổi học";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Báo cáo buổi học</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner visible />
            <p className="mt-3 text-sm text-gray-400">Đang tải dữ liệu...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadReports}
              className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <svg className="w-14 h-14 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Chưa có báo cáo buổi học</p>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((report) => {
              const status = getStatusMeta(report.status);
              return (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => setSelectedReport(report)}
                  className="w-full rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-gray-900">
                        {report.classTitle || report.classCode || "Báo cáo buổi học"}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {report.studentName || "Học viên"} • {formatDate(report.sessionDate || report.reportDate)}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  {report.feedback && (
                    <p className="line-clamp-2 text-xs text-gray-700">{report.feedback}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900">Chi tiết báo cáo</h3>
            </div>

            <p className="text-sm font-semibold text-gray-900">
              {selectedReport.classTitle || selectedReport.classCode || "Báo cáo buổi học"}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {selectedReport.studentName || "Học viên"} • {formatDate(selectedReport.sessionDate || selectedReport.reportDate)}
            </p>

            <div className="mt-3 max-h-[50vh] overflow-y-auto rounded-lg bg-gray-50 p-3">
              <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {selectedReport.feedback || "Không có nội dung nhận xét."}
              </p>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

export default ParentSessionReportsPage;
