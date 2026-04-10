import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import ConfirmModal from "@/components/common/ConfirmModal";
import ReportPageHeader from "@/components/report/ReportPageHeader";
import SessionReportList from "@/components/report/SessionReportList";
import { reportService } from "@/services/reportService";
import { SessionReport, SessionReportStatus } from "@/types/teacher";

function normalizeReportStatus(status?: string): SessionReportStatus | undefined {
  if (!status) return undefined;
  const normalized = status.toUpperCase();
  if (normalized === SessionReportStatus.DRAFT) return SessionReportStatus.DRAFT;
  if (normalized === SessionReportStatus.REVIEW) return SessionReportStatus.REVIEW;
  if (normalized === SessionReportStatus.APPROVED) return SessionReportStatus.APPROVED;
  if (normalized === SessionReportStatus.REJECTED) return SessionReportStatus.REJECTED;
  if (normalized === SessionReportStatus.PUBLISHED) return SessionReportStatus.PUBLISHED;
  return undefined;
}

const TeacherReportListPage: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();

  const [reports, setReports] = useState<SessionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [pendingSubmitReportId, setPendingSubmitReportId] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await reportService.getSessionReports();
      setReports(list);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách báo cáo";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const totalReports = reports.length;
  const uniqueStudents = new Set(reports.map((r) => r.studentProfileId).filter(Boolean)).size;
  const uniqueClasses = new Set(reports.map((r) => r.classId || r.classCode).filter(Boolean)).size;
  const pendingReviewCount = reports.filter(
    (r) => normalizeReportStatus(r.status) === SessionReportStatus.REVIEW
  ).length;

  const pendingSubmitReport = useMemo(
    () => reports.find((report) => report.id === pendingSubmitReportId) ?? null,
    [reports, pendingSubmitReportId]
  );

  const handleConfirmSubmit = async () => {
    if (!pendingSubmitReportId) return;
    setIsSubmittingReport(true);
    try {
      await reportService.submitSessionReport(pendingSubmitReportId);
      openSnackbar({
        text: "Đã gửi báo cáo để staff duyệt.",
        type: "success",
      });
      setConfirmSubmitOpen(false);
      setPendingSubmitReportId(null);
      await fetchReports();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể gửi báo cáo duyệt";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <ReportPageHeader
        title="Danh sách báo cáo"
        subtitle="Theo dõi trạng thái duyệt và publish của báo cáo buổi học."
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner visible />
            <p className="mt-3 text-sm text-gray-400">Đang tải dữ liệu...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="mb-3 text-sm font-medium text-red-500">{error}</p>
            <button
              onClick={fetchReports}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-4 grid grid-cols-4 gap-2">
              <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-red-600">{totalReports}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">Báo cáo</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-blue-600">{uniqueStudents}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">Học viên</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-violet-600">{uniqueClasses}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">Lớp</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-amber-600">{pendingReviewCount}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">Chờ duyệt</p>
              </div>
            </div>

            <SessionReportList
              reports={reports}
              onEditDraft={(report) => {
                navigate("/teacher/reports/create", {
                  state: {
                    reportId: report.id,
                    sessionId: report.sessionId,
                    studentProfileId: report.studentProfileId,
                  },
                });
              }}
              onSubmitDraft={(report) => {
                setPendingSubmitReportId(report.id);
                setConfirmSubmitOpen(true);
              }}
            />
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmSubmitOpen}
        title="Xác nhận gửi duyệt"
        message={
          pendingSubmitReport
            ? `Gửi duyệt báo cáo cho ${pendingSubmitReport.studentName || "học viên"}?`
            : "Xác nhận gửi duyệt báo cáo"
        }
        confirmText="Gửi duyệt"
        isLoading={isSubmittingReport}
        onCancel={() => {
          if (isSubmittingReport) return;
          setConfirmSubmitOpen(false);
          setPendingSubmitReportId(null);
        }}
        onConfirm={handleConfirmSubmit}
      />
    </Page>
  );
};

export default TeacherReportListPage;
