import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import ConfirmModal from "@/components/common/ConfirmModal";
import ReportPageHeader from "@/components/report/ReportPageHeader";
import SessionReportComposer from "@/components/report/SessionReportComposer";
import { reportService } from "@/services/reportService";
import { teacherService } from "@/services/teacherService";
import { timetableService } from "@/services/timetableService";
import { ClassStudent, SessionReport, SessionReportStatus } from "@/types/teacher";
import { TimetableSession } from "@/types/timetable";

interface EditState {
  reportId?: string;
  sessionId?: string;
  studentProfileId?: string;
}

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

const makeTodayRangeIso = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
};

const TeacherReportCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSnackbar } = useSnackbar();

  const editState = (location.state ?? {}) as EditState;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<SessionReport[]>([]);
  const [todaySessions, setTodaySessions] = useState<TimetableSession[]>([]);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState<string>(editState.sessionId ?? "");
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState<string>(
    editState.studentProfileId ?? ""
  );
  const [feedback, setFeedback] = useState<string>("");
  const [editingReportId, setEditingReportId] = useState<string | null>(editState.reportId ?? null);

  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // 1. Fetch dữ liệu ban đầu
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = makeTodayRangeIso();
      const [sessionReports, timetable] = await Promise.all([
        reportService.getSessionReports(),
        timetableService.getTeacherTimetable(from, to),
      ]);

      // Fallback an toàn mảng rỗng để chống lỗi crash .map()
      setReports(sessionReports ?? []);
      setTodaySessions(timetable?.data?.sessions ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải dữ liệu báo cáo";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedSession = useMemo(
    () => todaySessions.find((session) => session.id === selectedSessionId) ?? null,
    [todaySessions, selectedSessionId]
  );

  // 2. Tải danh sách học sinh khi chọn Session
  useEffect(() => {
    const classId = selectedSession?.classId;
    if (!classId) {
      setStudents([]);
      setSelectedStudentProfileId("");
      return;
    }

    let mounted = true;
    setStudentsLoading(true);

    const fetchStudents = async () => {
      try {
        const list = await teacherService.getClassStudents(classId);
        if (mounted) {
          setStudents(list ?? []);
        }
      } catch (err: unknown) {
        if (mounted) {
          const message = err instanceof Error ? err.message : "Không thể tải danh sách học viên";
          openSnackbar({ text: message, type: "error" });
          setStudents([]);
        }
      } finally {
        if (mounted) {
          setStudentsLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      mounted = false;
    };
  }, [selectedSession?.classId]);

  // 3. Reset selectedStudentProfileId nếu học sinh đó không nằm trong lớp vừa chọn
  useEffect(() => {
    if (studentsLoading || !selectedStudentProfileId) return;
    const existed = students.some((student) => student.studentProfileId === selectedStudentProfileId);
    if (!existed) {
      setSelectedStudentProfileId("");
    }
  }, [students, selectedStudentProfileId, studentsLoading]);

  // 4. Tìm bản nháp (nếu có) tương ứng với session và student đang chọn
  const editableReport = useMemo(() => {
    if (!selectedSessionId || !selectedStudentProfileId) return null;
    return (
      reports.find(
        (report) => {
          const normalizedStatus = normalizeReportStatus(report.status);
          return (
            report.sessionId === selectedSessionId &&
            report.studentProfileId === selectedStudentProfileId &&
            (normalizedStatus === SessionReportStatus.DRAFT ||
              normalizedStatus === SessionReportStatus.REJECTED)
          );
        }
      ) ?? null
    );
  }, [reports, selectedSessionId, selectedStudentProfileId]);

  // 5. Tự động điền feedback nếu có bản nháp
  useEffect(() => {
    if (!selectedSessionId || !selectedStudentProfileId) {
      setFeedback("");
      setEditingReportId(null);
      return;
    }
    setFeedback(editableReport?.feedback ?? "");
    setEditingReportId(editableReport?.id ?? null);
  }, [selectedSessionId, selectedStudentProfileId, editableReport]);

  // 6. Xử lý logic fill dữ liệu khi truy cập từ trạng thái Edit
  useEffect(() => {
    if (!editState.reportId) return;
    const initialReport = reports.find((report) => report.id === editState.reportId);
    if (!initialReport) return;
    
    setSelectedSessionId(initialReport.sessionId);
    setSelectedStudentProfileId(initialReport.studentProfileId ?? "");
    setFeedback(initialReport.feedback ?? "");
    setEditingReportId(initialReport.id);
  }, [editState.reportId, reports]);

  const canSaveDraft =
    !!selectedSessionId && !!selectedStudentProfileId && feedback.trim().length > 0;

  const handleChangeSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setSelectedStudentProfileId("");
    setFeedback("");
    setEditingReportId(null);
  };

  const handleSaveDraft = async () => {
    if (!selectedSessionId) {
      openSnackbar({ text: "Vui lòng chọn buổi học", type: "warning" });
      return;
    }
    if (!selectedStudentProfileId) {
      openSnackbar({ text: "Vui lòng chọn học viên", type: "warning" });
      return;
    }

    const draft = feedback.trim();
    if (!draft) {
      openSnackbar({ text: "Vui lòng nhập nội dung báo cáo", type: "warning" });
      return;
    }

    setSaving(true);
    try {
      if (editingReportId) {
        await reportService.updateSessionReport(editingReportId, { feedback: draft });
      } else {
        const created = await reportService.createSessionReport({
          sessionId: selectedSessionId,
          studentProfileId: selectedStudentProfileId,
          reportDate: new Date().toISOString().slice(0, 10),
          feedback: draft,
        });
        setEditingReportId(created?.id ?? null);
      }

      openSnackbar({ text: "Đã lưu báo cáo nháp", type: "success" });
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể lưu báo cáo";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleEnhanceFeedback = async () => {
    const draft = feedback.trim();
    if (!draft) {
      openSnackbar({ text: "Vui lòng nhập nội dung trước khi dùng AI", type: "warning" });
      return;
    }

    setEnhancing(true);
    try {
      const aiData = await reportService.enhanceSessionReportFeedback({
        draft,
        sessionId: selectedSessionId || undefined,
        studentProfileId: selectedStudentProfileId || undefined,
      });
      if (!aiData?.enhancedFeedback) {
        openSnackbar({ text: "AI chưa trả về nội dung phù hợp", type: "warning" });
        return;
      }
      setFeedback(aiData.enhancedFeedback);
      openSnackbar({ text: "AI đã cải thiện nội dung báo cáo", type: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể gọi AI enhance";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!editingReportId) {
      openSnackbar({
        text: "Bạn cần lưu nháp trước khi gửi staff duyệt",
        type: "warning",
      });
      return;
    }

    setIsSubmittingReport(true);
    try {
      await reportService.submitSessionReport(editingReportId);
      openSnackbar({
        text: "Đã gửi báo cáo để staff duyệt. Khi duyệt xong sẽ publish cho parent.",
        type: "success",
      });
      setConfirmSubmitOpen(false);
      navigate("/teacher/reports/list");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể gửi báo cáo duyệt";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <ReportPageHeader title="Gửi báo cáo buổi học" />

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
              onClick={fetchData}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && (
          <SessionReportComposer
            sessions={todaySessions}
            selectedSessionId={selectedSessionId}
            selectedStudentProfileId={selectedStudentProfileId}
            students={students}
            feedback={feedback}
            saving={saving}
            enhancing={enhancing}
            studentsLoading={studentsLoading}
            canSaveDraft={canSaveDraft}
            canSubmit={Boolean(editingReportId)}
            editingReportId={editingReportId}
            onChangeSession={handleChangeSession}
            onChangeStudent={setSelectedStudentProfileId}
            onChangeFeedback={setFeedback}
            onEnhance={handleEnhanceFeedback}
            onSaveDraft={handleSaveDraft}
            onSubmit={() => setConfirmSubmitOpen(true)}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={confirmSubmitOpen}
        title="Xác nhận gửi duyệt"
        message="Báo cáo sẽ chuyển sang cho staff để duyệt."
        confirmText="Gửi duyệt"
        isLoading={isSubmittingReport}
        onCancel={() => {
          if (isSubmittingReport) return;
          setConfirmSubmitOpen(false);
        }}
        onConfirm={handleSubmitReport}
      />
    </Page>
  );
};

export default TeacherReportCreatePage;