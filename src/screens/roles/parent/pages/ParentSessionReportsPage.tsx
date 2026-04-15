import React, { useCallback, useEffect, useState } from "react";
import { Page, Spinner } from "zmp-ui";
import { FileText } from "lucide-react";
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

const ParentSessionReportsPage: React.FC = () => {
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
      <div className="sticky top-0 z-20 shrink-0 bg-[#BB0000] px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Báo cáo buổi học</h1>
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
            <FileText className="mb-2 h-14 w-14" strokeWidth={1.2} />
            <p className="text-sm">Chưa có báo cáo buổi học</p>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((report) => {
              return (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => setSelectedReport(report)}
                  className="w-full rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm"
                >
                  <div className="mb-2 min-w-0">
                    <h3 className="truncate text-sm font-bold text-gray-900">
                      {report.classTitle || report.classCode || "Báo cáo buổi học"}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {report.studentName || "Học viên"} • {formatDate(report.sessionDate || report.reportDate)}
                    </p>
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
