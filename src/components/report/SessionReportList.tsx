import React from "react";
import { SessionReport, SessionReportStatus } from "@/types/teacher";

const REPORT_STATUS_META: Record<SessionReportStatus, { label: string; className: string }> = {
  [SessionReportStatus.DRAFT]: {
    label: "Nháp",
    className: "bg-gray-100 text-gray-700",
  },
  [SessionReportStatus.REVIEW]: {
    label: "Chờ duyệt",
    className: "bg-amber-100 text-amber-700",
  },
  [SessionReportStatus.APPROVED]: {
    label: "Đã duyệt",
    className: "bg-emerald-100 text-emerald-700",
  },
  [SessionReportStatus.REJECTED]: {
    label: "Từ chối",
    className: "bg-rose-100 text-rose-700",
  },
  [SessionReportStatus.PUBLISHED]: {
    label: "Published",
    className: "bg-blue-100 text-blue-700",
  },
};

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

function formatDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface SessionReportListProps {
  reports?: SessionReport[]; // FIX 1: Thêm dấu ? để cho phép undefined
  onEditDraft: (report: SessionReport) => void;
  onSubmitDraft: (report: SessionReport) => void;
}

// FIX 2: Gán giá trị mặc định reports = []
const SessionReportList: React.FC<SessionReportListProps> = ({ reports = [], onEditDraft, onSubmitDraft }) => {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-gray-400">
        <svg className="mb-3 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">Chưa có báo cáo nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const normalizedStatus = normalizeReportStatus(report.status);
        const statusMeta =
          (normalizedStatus ? REPORT_STATUS_META[normalizedStatus] : undefined) ?? {
          label: report.status || "Không xác định",
          className: "bg-gray-100 text-gray-700",
        };
        const editable =
          normalizedStatus === SessionReportStatus.DRAFT || normalizedStatus === SessionReportStatus.REJECTED;

        return (
          <div key={report.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-gray-800">
                  {report.classTitle || report.classCode || `Báo cáo #${report.id.slice(0, 6)}`}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  {report.studentName || "Học viên"} • {formatDate(report.sessionDate || report.reportDate)}
                </p>
              </div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
            </div>

            {report.feedback && <p className="mb-2 line-clamp-3 text-xs text-gray-600">{report.feedback}</p>}

            {report.rejectReason && normalizedStatus === SessionReportStatus.REJECTED && (
              <p className="mb-2 rounded-lg bg-rose-50 px-2.5 py-2 text-xs text-rose-700">
                Lý do từ chối: {report.rejectReason}
              </p>
            )}

            {editable && (
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-2">
                <button
                  type="button"
                  onClick={() => onEditDraft(report)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600"
                >
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={() => onSubmitDraft(report)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Gửi duyệt
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SessionReportList;