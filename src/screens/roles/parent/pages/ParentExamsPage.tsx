import React, { useCallback, useEffect, useState } from "react";
import { Page, Spinner } from "zmp-ui";
import { AlertCircle, CalendarDays, FileText, School } from "lucide-react";
import { parentService } from "@/services/parentService";
import { ParentExamResult } from "@/types/parent";

const EXAM_TYPES = [
  { value: "", label: "Tất cả" },
  { value: "Progress", label: "Kiểm tra thường xuyên" },
  { value: "Midterm", label: "Giữa kỳ" },
  { value: "Final", label: "Cuối kỳ" },
  { value: "Speaking", label: "Nói" },
  { value: "Placement", label: "Xếp lớp" },
];

function ParentExamsPage() {
  const [results, setResults] = useState<ParentExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examType, setExamType] = useState("");

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parentService.getExamResults({
        examType: examType || undefined,
        pageSize: 50,
      });
      setResults(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải kết quả kiểm tra");
    } finally {
      setLoading(false);
    }
  }, [examType]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const getExamTypeLabel = (type?: string) => {
    const found = EXAM_TYPES.find((t) => t.value === type);
    return found?.label || type || "Khác";
  };

  const getExamTypeBadge = (type?: string) => {
    switch (type) {
      case "Midterm":
        return "bg-blue-100 text-blue-700";
      case "Final":
        return "bg-purple-100 text-purple-700";
      case "Progress":
        return "bg-green-100 text-green-700";
      case "Speaking":
        return "bg-orange-100 text-orange-700";
      case "Placement":
        return "bg-cyan-100 text-cyan-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getScoreColor = (score?: number | null, maxScore?: number | null) => {
    if (score == null || maxScore == null || maxScore === 0) return "text-gray-600";
    const pct = (score / maxScore) * 100;
    if (pct >= 80) return "text-green-600";
    if (pct >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      {/* Header */}
      <div className="shrink-0 bg-[#BB0000] px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Kiểm tra</h1>
      </div>

      {/* Filter */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-24">
        <div className="px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {EXAM_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setExamType(t.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  examType === t.value
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <AlertCircle className="mb-3 h-16 w-16" strokeWidth={1.2} />
            <p className="text-sm mb-3">{error}</p>
            <button onClick={fetchResults} className="text-red-600 text-sm font-semibold">
              Thử lại
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <FileText className="mb-3 h-16 w-16" strokeWidth={1.2} />
            <p className="text-sm">Không có kết quả kiểm tra nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-800 text-sm flex-1 mr-2">
                    {item.examTitle || "Bài kiểm tra"}
                  </h3>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${getExamTypeBadge(item.examType)}`}>
                    {getExamTypeLabel(item.examType)}
                  </span>
                </div>

                {item.classTitle && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <School className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
                    <span className="text-xs text-gray-500">{item.classCode ? `${item.classCode} - ` : ""}{item.classTitle}</span>
                  </div>
                )}

                {item.date && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <CalendarDays className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
                    <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                  </div>
                )}

                {/* Score */}
                {item.score != null && (
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Điểm số</span>
                    <span className={`text-lg font-bold ${getScoreColor(item.score, item.maxScore)}`}>
                      {item.score}
                      {item.maxScore != null && (
                        <span className="text-sm text-gray-400 font-normal">/{item.maxScore}</span>
                      )}
                    </span>
                  </div>
                )}

                {item.comment && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-2">
                    <p className="text-[11px] text-gray-500 font-semibold mb-0.5">Nhận xét:</p>
                    <p className="text-xs text-gray-700">{item.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </Page>
  );
}

export default ParentExamsPage;
