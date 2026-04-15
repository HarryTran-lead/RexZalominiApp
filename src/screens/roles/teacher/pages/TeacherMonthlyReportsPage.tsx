import { useCallback, useEffect, useMemo, useState } from "react";
import { Page, Spinner } from "zmp-ui";
import { CalendarRange } from "lucide-react";
import ReportPageHeader from "@/components/report/ReportPageHeader";
import { reportService } from "@/services/reportService";
import { MonthlyReport } from "@/types/teacher";

function formatDate(iso?: string): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function monthLabel(report: MonthlyReport): string {
  if (report.month && report.year) {
    return `Tháng ${report.month}/${report.year}`;
  }

  const fallbackDate = report.publishedAt || report.createdAt;
  if (fallbackDate) {
    const date = new Date(fallbackDate);
    if (!Number.isNaN(date.getTime())) {
      return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  }

  return "Báo cáo tháng";
}

function statusMeta(status?: string): { label: string; className: string } {
  const normalized = (status || "").toLowerCase();
  if (normalized === "published") return { label: "Đã publish", className: "bg-blue-100 text-blue-700" };
  if (normalized === "approved") return { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700" };
  if (normalized === "review") return { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" };
  if (normalized === "rejected") return { label: "Từ chối", className: "bg-rose-100 text-rose-700" };
  if (normalized === "draft") return { label: "Nháp", className: "bg-gray-100 text-gray-700" };
  return { label: status || "Không xác định", className: "bg-gray-100 text-gray-700" };
}

function detailContent(report: MonthlyReport): string {
  return report.feedback || report.summary || "Không có nội dung chi tiết.";
}

const TeacherMonthlyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<MonthlyReport | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const selectedFromList = useMemo(
    () => reports.find((item) => item.id === selectedReportId) || null,
    [reports, selectedReportId]
  );

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getMonthlyReports({
        pageNumber: 1,
        pageSize: 30,
      });
      setReports(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải báo cáo tháng";
      setError(message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const openDetail = useCallback(async (report: MonthlyReport) => {
    setSelectedReportId(report.id);
    setSelectedDetail(null);
    setLoadingDetail(true);

    try {
      const detail = await reportService.getMonthlyReportById(report.id);
      setSelectedDetail(detail || report);
    } catch {
      setSelectedDetail(report);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const closeDetail = () => {
    setSelectedReportId(null);
    setSelectedDetail(null);
    setLoadingDetail(false);
  };

  const detail = selectedDetail || selectedFromList;

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <ReportPageHeader
        title="Báo cáo tháng"
        subtitle="Danh sách báo cáo tháng đã phát hành để xem nhanh tiến độ lớp học."
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24 pt-4">
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
              type="button"
              onClick={loadReports}
              className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <CalendarRange className="mb-2 h-14 w-14" strokeWidth={1.2} />
            <p className="text-sm">Chưa có báo cáo tháng</p>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((report) => {
              const badge = statusMeta(report.status);
              return (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => openDetail(report)}
                  className="w-full rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-gray-900">{monthLabel(report)}</h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {report.studentName || "Học viên"}
                        {report.className || report.classTitle || report.classCode
                          ? ` • ${report.className || report.classTitle || report.classCode}`
                          : ""}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-xs text-gray-700">{detailContent(report)}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {(selectedReportId || loadingDetail) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeDetail}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900">Chi tiết báo cáo tháng</h3>
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
              >
                Đóng
              </button>
            </div>

            {loadingDetail && (
              <div className="flex items-center justify-center py-10">
                <Spinner visible />
              </div>
            )}

            {!loadingDetail && detail && (
              <div>
                <p className="text-sm font-semibold text-gray-900">{monthLabel(detail)}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {detail.studentName || "Học viên"}
                  {detail.className || detail.classTitle || detail.classCode
                    ? ` • ${detail.className || detail.classTitle || detail.classCode}`
                    : ""}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Cập nhật: {formatDate(detail.updatedAt || detail.publishedAt || detail.createdAt)}
                </p>

                <div className="mt-3 max-h-[50vh] overflow-y-auto rounded-lg bg-gray-50 p-3">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{detailContent(detail)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Page>
  );
};

export default TeacherMonthlyReportsPage;
