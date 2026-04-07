import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import { fileService } from "@/services/fileService";
import { homeworkService } from "@/services/homeworkService";
import {
  MyHomeworkSubmissionDetail,
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

const StudentHomeworkDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { homeworkStudentId } = useParams<{ homeworkStudentId: string }>();

  const [detail, setDetail] = useState<MyHomeworkSubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể tải chi tiết bài tập";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [homeworkStudentId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const normalizedStatus = (detail?.status || "").toLowerCase();
  const isGraded = normalizedStatus === "graded";
  const canSubmit = useMemo(() => {
    if (!detail) return false;
    const alreadySubmitted =
      normalizedStatus === "submitted" || normalizedStatus === "graded";
    if (alreadySubmitted && !detail.allowResubmit) return false;
    return true;
  }, [detail, normalizedStatus]);

  const handleSubmit = async () => {
    if (!detail || !homeworkStudentId || !canSubmit) return;
    setSubmitting(true);
    try {
      if (
        detail.submissionType === "MULTIPLE_CHOICE" &&
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
        const attachments = attachmentInput
          .split(/\n|,/g)
          .map((v) => v.trim())
          .filter(Boolean);

        const payload: SubmitHomeworkRequest = {
          homeworkStudentId,
          textAnswer: textAnswer.trim() || undefined,
          linkUrl: linkUrl.trim() || undefined,
          attachmentUrls: attachments.length > 0 ? attachments : undefined,
        };
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

            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-800">
                Nội dung làm bài
              </p>

              {detail.submissionType === "MULTIPLE_CHOICE" &&
              detail.questions?.length ? (
                <div className="mt-3 space-y-3">
                  {detail.questions.map((question, index) => (
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
                              disabled={!canSubmit || submitting}
                            />
                            {option.text}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
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
                  <input
                    value={linkUrl}
                    onChange={(event) => setLinkUrl(event.target.value)}
                    disabled={!canSubmit || submitting}
                    placeholder="Link bài làm (nếu có)"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
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
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting || uploading}
              className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Đang nộp..."
                : uploading
                  ? "Đang upload file..."
                  : canSubmit
                    ? "Nộp bài"
                    : "Đã nộp"}
            </button>
          </div>
        )}
      </div>
    </Page>
  );
};

export default StudentHomeworkDetailPage;
