import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import StudentHomeworkAiTools from "@/components/homework/student/StudentHomeworkAiTools";
import { fileService } from "@/services/fileService";
import { homeworkService } from "@/services/homeworkService";
import {
  HomeworkAiFeatureAvailability,
  MyHomeworkAttemptDetail,
  MyHomeworkSubmissionDetail,
  SubmissionType,
  SubmitHomeworkRequest,
  SubmitMultipleChoiceRequest,
} from "@/types/homework";
import { UploadFileApiResponse } from "@/types/file";

type UploadResponseLike =
  | UploadFileApiResponse
  | {
      url?: string;
      fileUrl?: string;
      secureUrl?: string;
      secure_url?: string;
      data?: {
        url?: string;
        fileUrl?: string;
        secureUrl?: string;
        secure_url?: string;
      };
    };

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

function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
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

const StudentHomeworkDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { homeworkStudentId } = useParams<{ homeworkStudentId: string }>();

  const [detail, setDetail] = useState<MyHomeworkSubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<MyHomeworkAttemptDetail[]>([]);
  const [mcqStarted, setMcqStarted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);

  const [textAnswer, setTextAnswer] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [attachmentInput, setAttachmentInput] = useState("");
  const attachmentList = useMemo(
    () =>
      attachmentInput
        .split(/\n|,/g)
        .map((v) => v.trim())
        .filter(Boolean),
    [attachmentInput]
  );

  const getVietnameseUploadError = (err: unknown): string => {
    const fallback = "Upload file thất bại. Vui lòng thử lại.";

    if (!err || typeof err !== "object") {
      return fallback;
    }

    const responseData = (err as { response?: { data?: unknown } }).response?.data;
    const errorTextFromResponse =
      (typeof responseData === "object" && responseData && "error" in responseData
        ? String((responseData as { error?: unknown }).error ?? "")
        : "") ||
      (typeof responseData === "object" && responseData && "message" in responseData
        ? String((responseData as { message?: unknown }).message ?? "")
        : "");

    const rawMessage = errorTextFromResponse || (err as { message?: string }).message || "";
    const normalized = rawMessage.toLowerCase();

    if (normalized.includes("file type is not allowed for document")) {
      return "Loại file không hợp lệ. Chỉ chấp nhận: PDF, DOC, DOCX, PPT, PPTX, TXT.";
    }
    if (normalized.includes("file too large")) {
      return "File quá lớn, vui lòng chọn file nhỏ hơn.";
    }
    if (normalized.includes("network") || normalized.includes("timeout")) {
      return "Mạng không ổn định, vui lòng thử upload lại.";
    }

    return rawMessage || fallback;
  };

  const extractUploadedFileUrl = (
    response: UploadResponseLike,
  ): string | null => {
    const payload =
      response && typeof response === "object" && "data" in response
        ? (response as { data?: unknown }).data ?? response
        : response;

    if (typeof payload === "string" && payload.trim()) {
      return payload;
    }

    if (payload && typeof payload === "object") {
      const filePayload = payload as {
        url?: string;
        fileUrl?: string;
        secureUrl?: string;
        secure_url?: string;
      };

      return (
        filePayload.fileUrl ||
        filePayload.secureUrl ||
        filePayload.secure_url ||
        filePayload.url ||
        null
      );
    }

    return null;
  };

  const handleUploadAttachment = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadRes = await fileService.uploadGeneralFile(file, "homework");
      const uploadedUrl = extractUploadedFileUrl(uploadRes);
      if (!uploadedUrl) {
        openSnackbar({
          text: "Upload thành công nhưng không lấy được đường dẫn file",
          type: "warning",
        });
        return;
      }

      setAttachmentInput((prev) => {
        if (!prev.trim()) return uploadedUrl;
        return `${prev}\n${uploadedUrl}`;
      });
      openSnackbar({
        text: "Đã upload file, bạn có thể nộp bài",
        type: "success",
      });
    } catch (err: unknown) {
      const message = getVietnameseUploadError(err);
      openSnackbar({ text: message, type: "error" });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});

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
          homeworkService.getMyHomeworkAttemptDetail(id, attemptNumber)
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
      const submission = data?.submission;
      setTextAnswer(data?.textAnswer ?? submission?.textAnswer ?? "");
      setLinkUrl(data?.linkUrl ?? (submission?.links?.[0] ?? ""));

      const attachmentUrls = [
        ...normalizeUrlList(data?.attachmentUrls),
        ...normalizeUrlList(submission?.attachmentUrls),
      ];
      setAttachmentInput(Array.from(new Set(attachmentUrls)).join("\n"));

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
      const message =
        err instanceof Error ? err.message : "Không thể tải chi tiết bài tập";
      setError(message);
      setAttemptHistory([]);
    } finally {
      setLoading(false);
    }
  }, [homeworkStudentId, loadAttemptHistory]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const normalizedStatus = (detail?.status || "").toLowerCase();
  const normalizedSubmissionType = normalizeSubmissionType(detail?.submissionType);
  const isMultipleChoice = normalizedSubmissionType === SubmissionType.MULTIPLE_CHOICE;
  const isTextSubmission = normalizedSubmissionType === normalizeSubmissionType(SubmissionType.TEXT);
  const isLinkSubmission = normalizedSubmissionType === normalizeSubmissionType(SubmissionType.LINK);
  const isFileSubmission =
    normalizedSubmissionType === normalizeSubmissionType(SubmissionType.FILE) ||
    normalizedSubmissionType === normalizeSubmissionType(SubmissionType.IMAGE);

  const canSubmit = useMemo(() => {
    if (!detail) return false;
    const alreadySubmitted =
      normalizedStatus === "submitted" || normalizedStatus === "graded";
    if (alreadySubmitted && !detail.allowResubmit) return false;
    return true;
  }, [detail, normalizedStatus]);

  const isGraded = normalizedStatus === "graded";
  const isSubmitted = normalizedStatus === "submitted";
  const hasMcqTimeLimit = isMultipleChoice && (detail?.timeLimitMinutes ?? 0) > 0;
  const requiresStartForMcq = hasMcqTimeLimit && canSubmit;
  const mcqAiLockedBeforeStart = isMultipleChoice && requiresStartForMcq && !mcqStarted && !timeExpired;

  const canSubmitMcq = !isMultipleChoice || !requiresStartForMcq || (mcqStarted && !timeExpired);
  const canSubmitNow = canSubmit && canSubmitMcq;

  const aiAnswerContext = useMemo(() => {
    if (isTextSubmission) {
      return textAnswer.trim();
    }
    if (isLinkSubmission) {
      return linkUrl.trim();
    }
    if (isMultipleChoice && detail?.questions?.length) {
      if (detail.review?.answerResults?.length) {
        return detail.review.answerResults
          .map(
            (result, index) =>
              `Câu ${index + 1}: ${result.selectedOptionText || result.selectedOptionId || "Chưa chọn"}`
          )
          .join("\n");
      }

      return detail.questions
        .map((question, index) => {
          const selectedOptionId = mcqAnswers[question.id];
          const selectedOption = question.options.find((option) => option.id === selectedOptionId);
          return `Câu ${index + 1}: ${selectedOption?.text || "Chưa chọn"}`;
        })
        .join("\n");
    }
    return "";
  }, [
    isTextSubmission,
    textAnswer,
    isLinkSubmission,
    linkUrl,
    isMultipleChoice,
    detail?.questions,
    detail?.review?.answerResults,
    mcqAnswers,
  ]);

  const aiAvailability = useMemo<HomeworkAiFeatureAvailability>(() => {
    const hintAllowedByStatus = canSubmit && !isSubmitted && !isGraded;
    const recommendationAllowedByStatus = isSubmitted || isGraded;

    const canUseHint = Boolean(detail?.aiHintEnabled) && hintAllowedByStatus && !mcqAiLockedBeforeStart;
    const canUseRecommendation =
      Boolean(detail?.aiRecommendEnabled) && recommendationAllowedByStatus && !mcqAiLockedBeforeStart;

    let hintMessage: string | undefined;
    let recommendationMessage: string | undefined;

    if (!detail?.aiHintEnabled) {
      hintMessage = "Bài này chưa bật tính năng gợi ý đáp án.";
    } else if (mcqAiLockedBeforeStart) {
      hintMessage = "Với trắc nghiệm, hãy bấm Bắt đầu làm bài để dùng AI.";
    } else if (!hintAllowedByStatus) {
      hintMessage = "Gợi ý chỉ dùng trong quá trình làm bài.";
    }

    if (!detail?.aiRecommendEnabled) {
      recommendationMessage = "Bài này chưa bật tính năng khuyên ôn luyện.";
    } else if (mcqAiLockedBeforeStart) {
      recommendationMessage = "Với trắc nghiệm, hãy bấm Bắt đầu làm bài để dùng AI.";
    } else if (!recommendationAllowedByStatus) {
      recommendationMessage = "Khuyên ôn luyện chỉ khả dụng sau khi đã nộp hoặc đã chấm.";
    }

    return {
      canUseHint,
      canUseRecommendation,
      hintMessage,
      recommendationMessage,
    };
  }, [canSubmit, isSubmitted, isGraded, detail?.aiHintEnabled, detail?.aiRecommendEnabled, mcqAiLockedBeforeStart]);

  useEffect(() => {
    if (!detail || !isMultipleChoice) {
      setMcqStarted(false);
      setRemainingSeconds(null);
      setTimeExpired(false);
      return;
    }

    const seconds = Number(detail.timeLimitMinutes ?? 0) * 60;
    setRemainingSeconds(seconds > 0 ? Math.floor(seconds) : null);
    setMcqStarted(false);
    setTimeExpired(false);
  }, [detail, isMultipleChoice]);

  useEffect(() => {
    if (!requiresStartForMcq || !mcqStarted || remainingSeconds == null || timeExpired) {
      return;
    }

    const timerId = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous == null) return previous;
        if (previous <= 1) {
          setMcqStarted(false);
          setTimeExpired(true);
          openSnackbar({ text: "Đã hết thời gian làm bài trắc nghiệm", type: "warning" });
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [requiresStartForMcq, mcqStarted, remainingSeconds, timeExpired, openSnackbar]);

  const handleSubmit = async () => {
    if (!detail || !homeworkStudentId || !canSubmitNow) return;
    setSubmitting(true);
    try {
      if (
        isMultipleChoice &&
        detail.questions?.length
      ) {
        const answers = detail.questions.map((q) => ({
          questionId: q.id,
          selectedOptionId: mcqAnswers[q.id] || null,
        }));

        const unanswered = answers.some((a) => !a.selectedOptionId);
        if (unanswered) {
          openSnackbar({
            text: "Vui lòng trả lời đầy đủ các câu hỏi",
            type: "warning",
          });
          setSubmitting(false);
          return;
        }

        const payload: SubmitMultipleChoiceRequest = {
          homeworkStudentId,
          answers,
        };
        await homeworkService.submitMultipleChoiceHomework(payload);
      } else {
        const attachments = normalizeUrlList(attachmentInput);
        const nextTextAnswer = textAnswer.trim();
        const nextLinkUrl = linkUrl.trim();

        const payload: SubmitHomeworkRequest = { homeworkStudentId };

        if (isTextSubmission) {
          payload.textAnswer = nextTextAnswer || undefined;
        } else if (isLinkSubmission) {
          payload.linkUrl = nextLinkUrl || undefined;
          payload.links = nextLinkUrl ? [nextLinkUrl] : undefined;
        } else if (isFileSubmission) {
          payload.attachmentUrls = attachments.length > 0 ? attachments : undefined;
        } else {
          payload.textAnswer = nextTextAnswer || undefined;
        }

        await homeworkService.submitHomework(payload);
      }

      openSnackbar({ text: "Nộp bài thành công", type: "success" });
      await loadDetail();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể nộp bài";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Chi tiết bài tập</h1>
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
                <p className="text-base font-bold text-gray-900">
                  Tiêu đề: {detail.assignmentTitle}
                </p>
                <h2 className="mt-0.5 text-sm text-red-700">
                  Lớp: {detail.classTitle}
                </h2>
                <p className="mt-0.5 text-sm text-gray-700">
                  Mô tả: {detail.description}
                </p>
              <p className="mt-2 text-xs text-gray-500 ">
                Hạn nộp: {formatDateTime(detail.dueAt)}
              </p>
            </div>
            

            {isGraded && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">
                  Điểm: {detail.score ?? 0}/{detail.maxScore ?? 0}
                </p>
                {detail.teacherFeedback && (
                  <p className="mt-2 text-sm text-emerald-900">
                    Nhận xét: {detail.teacherFeedback}
                  </p>
                )}
                {detail.gradedAt && (
                  <p className="mt-1 text-xs text-emerald-700">
                    Chấm lúc: {formatDateTime(detail.gradedAt)}
                  </p>
                )}
              </div>
            )}

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
              <p className="text-sm font-semibold text-gray-800">
                Nội dung làm bài
              </p>

              {isMultipleChoice && detail.questions?.length ? (
                <div className="mt-3 space-y-3">
                  {requiresStartForMcq && (
                    <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                      <p className="text-xs text-red-700">
                        Thời gian làm bài: {formatCountdown(remainingSeconds ?? 0)}
                      </p>
                      {!mcqStarted && !timeExpired && (
                        <button
                          type="button"
                          onClick={() => setMcqStarted(true)}
                          className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                          disabled={!canSubmit || submitting}
                        >
                          Bắt đầu làm bài
                        </button>
                      )}
                      {timeExpired && (
                        <p className="mt-2 text-xs font-semibold text-rose-600">
                          Đã hết thời gian làm bài.
                        </p>
                      )}
                    </div>
                  )}

                  {requiresStartForMcq && !mcqStarted && !timeExpired && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                      Nhấn "Bắt đầu làm bài" để mở câu hỏi và chạy đồng hồ đếm ngược.
                    </div>
                  )}

                  {(!requiresStartForMcq || mcqStarted || timeExpired) &&
                    detail.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="rounded-lg border border-gray-200 p-3"
                      >
                        <p className="text-sm font-medium text-gray-800">
                          Câu {index + 1}: {question.questionText}
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {question.options.map((option) => (
                            <label
                              key={option.id}
                              className="flex items-center gap-2 text-sm text-gray-700"
                            >
                              <input
                                type="radio"
                                name={`q-${question.id}`}
                                value={option.id}
                                checked={mcqAnswers[question.id] === option.id}
                                onChange={() =>
                                  setMcqAnswers((prev) => ({
                                    ...prev,
                                    [question.id]: option.id,
                                  }))
                                }
                                disabled={!canSubmit || submitting || (requiresStartForMcq && !mcqStarted) || timeExpired}
                              />
                              {option.text}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : isTextSubmission ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={textAnswer}
                    onChange={(event) => setTextAnswer(event.target.value)}
                    rows={5}
                    disabled={!canSubmit || submitting}
                    placeholder="Nhập câu trả lời của bạn"
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              ) : isLinkSubmission ? (
                <div className="mt-3 space-y-2">
                  <input
                    value={linkUrl}
                    onChange={(event) => setLinkUrl(event.target.value)}
                    disabled={!canSubmit || submitting}
                    placeholder="Nhập link bài làm"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              ) : isFileSubmission ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={attachmentInput}
                    onChange={(event) => setAttachmentInput(event.target.value)}
                    rows={3}
                    disabled={!canSubmit || submitting}
                    placeholder="Danh sách URL file, mỗi dòng 1 link"
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                    <p className="text-xs text-gray-600 mb-2">
                      Upload file bài làm
                    </p>
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600">
                      {uploading ? "Đang upload..." : "Chọn file để upload"}
                      <input
                        type="file"
                        onChange={handleUploadAttachment}
                        disabled={!canSubmit || submitting || uploading}
                        className="hidden"
                      />
                    </label>

                    {attachmentList.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {attachmentList.map((url, index) => (
                          <p key={`${url}-${index}`} className="truncate text-xs text-emerald-700">
                            {index + 1}. {url}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={textAnswer}
                    onChange={(event) => setTextAnswer(event.target.value)}
                    rows={5}
                    disabled={!canSubmit || submitting}
                    placeholder="Nhập câu trả lời của bạn"
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              )}
            </div>

            {detail.aiHintEnabled || detail.aiRecommendEnabled ? (
              <StudentHomeworkAiTools
                homeworkStudentId={homeworkStudentId || ""}
                currentAnswerText={aiAnswerContext}
                hintEnabled={detail.aiHintEnabled}
                recommendationEnabled={detail.aiRecommendEnabled}
                availability={aiAvailability}
              />
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmitNow || submitting || uploading}
              className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Đang nộp..."
                : uploading
                  ? "Đang upload file..."
                  : canSubmitNow
                    ? "Nộp bài"
                    : isMultipleChoice && requiresStartForMcq && !mcqStarted && !timeExpired
                      ? "Bắt đầu làm bài để nộp"
                    : "Đã nộp"}
            </button>
          </div>
        )}
      </div>
    </Page>
  );
};

export default StudentHomeworkDetailPage;
