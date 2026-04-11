import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
import { homeworkService } from "@/services/homeworkService";
import { MyHomeworkAttemptDetail, MyHomeworkSubmissionDetail } from "@/types/homework";
import { translateTeacherFeedback } from "@/utils";

function formatDateTime(iso?: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status?: string): string {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "assigned") return "Đã giao";
  if (normalized === "submitted") return "Đã nộp";
  if (normalized === "graded") return "Đã chấm";
  if (normalized === "late") return "Nộp muộn";
  if (normalized === "missing") return "Chưa nộp";
  return status || "Không xác định";
}

function getStatusClass(status?: string): string {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "graded") return "bg-emerald-100 text-emerald-700";
  if (normalized === "submitted") return "bg-blue-100 text-blue-700";
  if (normalized === "late") return "bg-amber-100 text-amber-700";
  if (normalized === "missing") return "bg-rose-100 text-rose-700";
  return "bg-indigo-100 text-indigo-700";
}

function normalizeUrlList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|,/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeSubmissionType(value?: string | null): string {
  return String(value || "")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

const ParentHomeworkDetailPage: React.FC = () => {
  const { homeworkStudentId } = useParams<{ homeworkStudentId: string }>();

  const [detail, setDetail] = useState<MyHomeworkSubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<MyHomeworkAttemptDetail[]>([]);

  const loadAttemptHistory = useCallback(async (id: string, seedAttemptNumber?: number) => {
    const initialAttemptNumber =
      typeof seedAttemptNumber === "number" && seedAttemptNumber > 0 ? seedAttemptNumber : 1;

    setAttemptsLoading(true);
    try {
      const firstAttempt = await homeworkService.getMyHomeworkAttemptDetail(id, initialAttemptNumber);
      if (!firstAttempt) {
        setAttemptHistory([]);
        return;
      }

      const totalAttempts = Math.max(
        Number(firstAttempt.attemptCount ?? 0),
        Number(firstAttempt.attemptNumber ?? initialAttemptNumber),
        1
      );

      if (totalAttempts === 1) {
        setAttemptHistory([firstAttempt]);
        return;
      }

      const remainingNumbers = Array.from({ length: totalAttempts }, (_, index) => index + 1).filter(
        (attemptNumber) => attemptNumber !== initialAttemptNumber
      );

      const remainingResults = await Promise.all(
        remainingNumbers.map((attemptNumber) =>
          homeworkService
            .getMyHomeworkAttemptDetail(id, attemptNumber)
            .then((attempt) => attempt)
            .catch(() => null)
        )
      );

      const resolvedAttempts: MyHomeworkAttemptDetail[] = [firstAttempt];
      remainingResults.forEach((result) => {
        if (result) {
          resolvedAttempts.push(result);
        }
      });

      const uniqueAttempts = Array.from(
        new Map(resolvedAttempts.map((attempt) => [attempt.attemptNumber, attempt])).values()
      ).sort((a, b) => b.attemptNumber - a.attemptNumber);

      setAttemptHistory(uniqueAttempts);
    } catch {
      setAttemptHistory([]);
    } finally {
      setAttemptsLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async () => {
    if (!homeworkStudentId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await homeworkService.getMyHomeworkDetail(homeworkStudentId);
      setDetail(data);

      const statusNormalized = String(data?.status || "").toLowerCase();
      const attemptCount = Number(data?.attemptCount ?? 0);
      const attemptNumber = Number(data?.attemptNumber ?? 0);
      const shouldLoadAttempts =
        statusNormalized === "submitted" ||
        statusNormalized === "graded" ||
        attemptCount > 0 ||
        attemptNumber > 0;

      if (shouldLoadAttempts) {
        await loadAttemptHistory(homeworkStudentId, attemptNumber > 0 ? attemptNumber : undefined);
      } else {
        setAttemptHistory([]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải chi tiết bài tập";
      setError(message);
      setAttemptHistory([]);
    } finally {
      setLoading(false);
    }
  }, [homeworkStudentId, loadAttemptHistory]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const attachmentUrls = useMemo(() => {
    if (!detail) return [];
    return Array.from(
      new Set([
        ...normalizeUrlList(detail.attachmentUrls),
        ...normalizeUrlList(detail.submission?.attachmentUrls),
      ])
    );
  }, [detail]);

  const isMultipleChoice = normalizeSubmissionType(detail?.submissionType) === "MULTIPLE_CHOICE";
  const normalizedTextAnswer = useMemo(() => {
    const raw = String(detail?.textAnswer || "").trim();
    if (!raw) return "";
    if (isMultipleChoice || detail?.review?.answerResults?.length) return "";
    if (raw.startsWith("[") || raw.startsWith("{")) return "";
    return raw;
  }, [detail?.textAnswer, detail?.review?.answerResults, isMultipleChoice]);
  const translatedTeacherFeedback = translateTeacherFeedback(detail?.teacherFeedback);

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-[#BB0000] px-4 py-4 flex items-center">
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
              <p className="text-base font-bold text-gray-900">Tiêu đề: {detail.assignmentTitle}</p>
              <h2 className="mt-0.5 text-sm text-red-700">Lớp: {detail.classTitle}</h2>
              <p className="mt-0.5 text-sm text-gray-700">Mô tả: {detail.description || "-"}</p>
              <p className="mt-2 text-xs text-gray-500">Hạn nộp: {formatDateTime(detail.dueAt)}</p>
              {typeof detail.maxAttempts === "number" && detail.maxAttempts > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Số lần nộp tối đa: <span className="font-semibold text-gray-700">{detail.maxAttempts}</span>
                </p>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-800">Trạng thái hiện tại</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusClass(detail.status)}`}>
                  {getStatusLabel(detail.status)}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                <p>Nộp lúc: {formatDateTime(detail.submittedAt || detail.submission?.submittedAt || undefined)}</p>
                <p>Chấm lúc: {formatDateTime(detail.gradedAt)}</p>
                <p>
                  Điểm: {detail.score ?? 0}/{detail.maxScore ?? 0}
                </p>
                <p>Sao thưởng: {detail.rewardStars ?? 0}</p>
              </div>

              {translatedTeacherFeedback && (
                <p className="mt-2 rounded-lg bg-emerald-50 px-2.5 py-2 text-xs text-emerald-800">
                  Nhận xét: {translatedTeacherFeedback}
                </p>
              )}
            </div>

            {(attemptsLoading || attemptHistory.length > 0) && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-800">Lịch sử làm bài</p>
                  {!attemptsLoading && (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      {Math.max(
                        Number(attemptHistory[0]?.attemptCount ?? 0),
                        Number(detail.attemptCount ?? 0),
                        attemptHistory.length
                      )} lần
                    </span>
                  )}
                </div>

                {attemptsLoading ? (
                  <div className="py-2 text-xs text-gray-500">Đang tải lịch sử làm bài...</div>
                ) : (
                  <div className="space-y-2.5">
                    {attemptHistory.map((attempt) => (
                      <div key={attempt.id || attempt.attemptNumber} className="rounded-lg border border-gray-200 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800">Lần {attempt.attemptNumber}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusClass(
                              String(attempt.status)
                            )}`}
                          >
                            {getStatusLabel(String(attempt.status))}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                          <p>Nộp lúc: {formatDateTime(attempt.submittedAt)}</p>
                          <p>Chấm lúc: {formatDateTime(attempt.gradedAt)}</p>
                          <p>
                            Điểm: {attempt.score ?? 0}/{attempt.maxScore ?? detail.maxScore ?? 0}
                          </p>
                          <p>Sao thưởng: {attempt.rewardStars ?? 0}</p>
                        </div>

                        {typeof attempt.totalCount === "number" && (
                          <p className="mt-1.5 text-xs text-gray-600">
                            Đúng/Sai/Bỏ qua: {attempt.correctCount ?? 0}/{attempt.wrongCount ?? 0}/
                            {attempt.skippedCount ?? 0} trên {attempt.totalCount}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-800">Nội dung đã nộp</p>

              {normalizedTextAnswer && (
                <div className="mt-3 rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-500">Tự luận</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{normalizedTextAnswer}</p>
                </div>
              )}

              {detail.linkUrl && (
                <div className="mt-3 rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-500">Link bài làm</p>
                  <a
                    href={detail.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block truncate text-sm text-blue-600 underline"
                  >
                    {detail.linkUrl}
                  </a>
                </div>
              )}

              {attachmentUrls.length > 0 && (
                <div className="mt-3 rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-500">File đính kèm</p>
                  <div className="mt-1 space-y-1">
                    {attachmentUrls.map((url, index) => (
                      <a
                        key={`${url}-${index}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-sm text-blue-600 underline"
                      >
                        {index + 1}. {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {detail.review?.answerResults?.length ? (
                <div className="mt-3 space-y-2.5">
                  {detail.review.answerResults.map((result, index) => (
                    <div key={`${result.questionId}-${index}`} className="rounded-lg border border-gray-200 p-3">
                      <p className="text-sm font-semibold text-gray-800">
                        Câu {index + 1}: {result.questionText}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Bé chọn: {result.selectedOptionText || "Chưa chọn"}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600">
                        Đáp án đúng: {result.correctOptionText || "-"}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600">
                        Điểm: {result.earnedPoints}/{result.maxPoints}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                !normalizedTextAnswer && !detail.linkUrl && attachmentUrls.length === 0 && (
                  <p className="mt-3 text-xs text-gray-500">Chưa có nội dung nộp bài.</p>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default ParentHomeworkDetailPage;
