import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
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
  const navigate = useNavigate();
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
    <Page className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Kiểm tra</h1>
      </div>

      {/* Filter */}
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
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm mb-3">{error}</p>
            <button onClick={fetchResults} className="text-red-600 text-sm font-semibold">
              Thử lại
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
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
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-xs text-gray-500">{item.classCode ? `${item.classCode} - ` : ""}{item.classTitle}</span>
                  </div>
                )}

                {item.date && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
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
    </Page>
  );
}

export default ParentExamsPage;
