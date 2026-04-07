import React, { useMemo, useState } from "react";
import { useSnackbar } from "zmp-ui";
import { homeworkService } from "@/services/homeworkService";
import {
  AIHintResponse,
  AIRecommendationResponse,
  HomeworkAiToolContext,
} from "@/types/homework";

type StudentHomeworkAiToolsProps = HomeworkAiToolContext;

const StudentHomeworkAiTools: React.FC<StudentHomeworkAiToolsProps> = ({
  homeworkStudentId,
  currentAnswerText,
  hintEnabled,
  recommendationEnabled,
  availability,
}) => {
  const { openSnackbar } = useSnackbar();
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [hintResult, setHintResult] = useState<AIHintResponse | null>(null);
  const [recommendationResult, setRecommendationResult] = useState<AIRecommendationResponse | null>(null);

  const answerText = useMemo(() => currentAnswerText.trim(), [currentAnswerText]);
  const hintDisabled = !hintEnabled || !availability.canUseHint || loadingHint;
  const recommendationDisabled =
    !recommendationEnabled || !availability.canUseRecommendation || loadingRecommendation;

  const handleGetHint = async () => {
    if (!homeworkStudentId) return;
    if (!answerText) {
      openSnackbar({ text: "Hãy nhập hoặc chọn đáp án trước khi xin gợi ý", type: "warning" });
      return;
    }

    try {
      setLoadingHint(true);
      const res = await homeworkService.getHomeworkHint(homeworkStudentId, {
        currentAnswerText: answerText,
        language: "vi",
      });
      setHintResult(res);
      if (!res) {
        openSnackbar({ text: "Chưa nhận được gợi ý từ AI", type: "warning" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể lấy gợi ý";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setLoadingHint(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!homeworkStudentId) return;
    if (!answerText) {
      openSnackbar({ text: "Hãy nhập hoặc chọn đáp án trước khi xin khuyến nghị", type: "warning" });
      return;
    }

    try {
      setLoadingRecommendation(true);
      const res = await homeworkService.getHomeworkRecommendations(homeworkStudentId, {
        currentAnswerText: answerText,
        language: "vi",
        maxItems: 3,
      });
      setRecommendationResult(res);
      if (!res) {
        openSnackbar({ text: "Chưa nhận được khuyến nghị ôn luyện", type: "warning" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể lấy khuyến nghị";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setLoadingRecommendation(false);
    }
  };

  if (!hintEnabled && !recommendationEnabled) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-gray-800">Trợ lý AI</p>
      <p className="mt-1 text-xs text-gray-500">
        AI sẽ gợi ý đáp án và đề xuất hướng ôn luyện dựa trên nội dung bạn đang làm.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleGetHint}
          disabled={hintDisabled}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingHint ? "Đang gợi ý..." : "Gợi ý đáp án"}
        </button>
        <button
          type="button"
          onClick={handleGetRecommendations}
          disabled={recommendationDisabled}
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingRecommendation ? "Đang phân tích..." : "Khuyên ôn luyện"}
        </button>
      </div>

      {availability.hintMessage && !availability.canUseHint && (
        <p className="mt-2 text-xs text-red-600">{availability.hintMessage}</p>
      )}

      {availability.recommendationMessage && !availability.canUseRecommendation && (
        <p className="mt-1 text-xs text-emerald-700">{availability.recommendationMessage}</p>
      )}

      {hintResult && (
        <div className="mt-3 rounded-lg bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-700">Gợi ý nhanh</p>
          <p className="mt-1 text-xs text-gray-700">{hintResult.summary}</p>
          {hintResult.hints?.length ? (
            <div className="mt-2 space-y-1">
              {hintResult.hints.map((hint, index) => (
                <p key={`${hint}-${index}`} className="text-xs text-gray-700">
                  {index + 1}. {hint}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {recommendationResult && (
        <div className="mt-3 rounded-lg bg-emerald-50 p-3">
          <p className="text-xs font-semibold text-emerald-700">Khuyến nghị ôn luyện</p>
          <p className="mt-1 text-xs text-gray-700">{recommendationResult.summary}</p>
          {recommendationResult.items?.length ? (
            <div className="mt-2 space-y-2">
              {recommendationResult.items.map((item, index) => (
                <div key={item.questionBankItemId || `${item.questionText}-${index}`} className="rounded-md bg-white p-2">
                  <p className="text-xs font-semibold text-gray-800">{item.questionText}</p>
                  {item.reason && <p className="mt-1 text-xs text-gray-600">Lý do: {item.reason}</p>}
                  <p className="mt-1 text-[11px] text-gray-500">
                    Kỹ năng: {item.skill || "-"} • Chủ đề: {item.topic || "-"}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StudentHomeworkAiTools;
