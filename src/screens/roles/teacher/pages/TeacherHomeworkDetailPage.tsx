import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import ConfirmModal from "@/components/common/ConfirmModal";
import TeacherHomeworkStudentList from "@/components/homework/teacher/TeacherHomeworkStudentList";
import { homeworkService } from "@/services/homeworkService";
import { HomeworkAssignmentDetail, HomeworkStudentProgressItem } from "@/types/homework";

function formatDateTime(value?: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TeacherHomeworkDetailPage: React.FC = () => {
  const { openSnackbar } = useSnackbar();
  const { homeworkId } = useParams<{ homeworkId: string }>();

  const [detail, setDetail] = useState<HomeworkAssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gradingStudent, setGradingStudent] = useState<HomeworkStudentProgressItem | null>(null);
  const [gradingOpen, setGradingOpen] = useState(false);
  const [gradingScore, setGradingScore] = useState<string>("");
  const [gradingFeedback, setGradingFeedback] = useState<string>("");
  const [gradingSubmitting, setGradingSubmitting] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!homeworkId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await homeworkService.getTeacherHomeworkDetail(homeworkId);
      setDetail(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải chi tiết bài tập";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [homeworkId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const students = useMemo<HomeworkStudentProgressItem[]>(() => {
    if (!detail) return [];
    return Array.isArray(detail.students) ? detail.students : [];
  }, [detail]);

  const doneCount = students.filter((s) => {
    const status = (s.status || "").toLowerCase();
    return status === "submitted" || status === "graded";
  }).length;
  const pendingCount = Math.max(students.length - doneCount, 0);

  const handleOpenGrade = (student: HomeworkStudentProgressItem) => {
    setGradingStudent(student);
    setGradingScore(student.score != null ? String(student.score) : "");
    setGradingFeedback(student.teacherFeedback ?? "");
    setGradingOpen(true);
  };

  const handleSubmitGrade = async () => {
    if (!gradingStudent) return;

    const scoreNumber = Number(gradingScore);
    if (!Number.isFinite(scoreNumber)) {
      openSnackbar({ text: "Vui lòng nhập điểm hợp lệ", type: "warning" });
      return;
    }

    setGradingSubmitting(true);
    try {
      await homeworkService.gradeHomeworkSubmission(gradingStudent.id, {
        score: scoreNumber,
        teacherFeedback: gradingFeedback.trim() || undefined,
      });
      openSnackbar({ text: "Đã chấm điểm thành công", type: "success" });
      setGradingOpen(false);
      setGradingStudent(null);
      await loadDetail();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể chấm điểm";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setGradingSubmitting(false);
    }
  };

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Chi tiết bài tập</h1>
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
              onClick={loadDetail}
              className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && detail && (
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold text-gray-900">{detail.title}</h2>
              <p className="mt-1 text-sm text-red-700">{detail.classTitle}</p>
              {detail.description && <p className="mt-2 text-sm text-gray-600">{detail.description}</p>}
              <p className="mt-2 text-xs text-gray-500">Hạn nộp: {formatDateTime(detail.dueAt)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-emerald-600">{doneCount}</p>
                <p className="text-xs text-gray-500">Đã làm</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                <p className="text-xl font-bold text-rose-600">{pendingCount}</p>
                <p className="text-xs text-gray-500">Chưa làm</p>
              </div>
            </div>

            <TeacherHomeworkStudentList students={students} onGradeStudent={handleOpenGrade} />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={gradingOpen}
        title="Chấm điểm học viên"
        message={gradingStudent ? `Học viên: ${gradingStudent.studentName}` : undefined}
        confirmText="Lưu điểm"
        isLoading={gradingSubmitting}
        onCancel={() => {
          if (gradingSubmitting) return;
          setGradingOpen(false);
          setGradingStudent(null);
        }}
        onConfirm={handleSubmitGrade}
      >
        <div className="space-y-2">
          <input
            type="number"
            value={gradingScore}
            onChange={(event) => setGradingScore(event.target.value)}
            placeholder="Nhập điểm"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400"
          />
          <textarea
            value={gradingFeedback}
            onChange={(event) => setGradingFeedback(event.target.value)}
            rows={3}
            placeholder="Nhận xét của giáo viên"
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400"
          />
        </div>
      </ConfirmModal>
    </Page>
  );
};

export default TeacherHomeworkDetailPage;
