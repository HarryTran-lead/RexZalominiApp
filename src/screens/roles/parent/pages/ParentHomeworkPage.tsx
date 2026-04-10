import React, { useCallback, useEffect, useState } from "react";
import { Page, Spinner } from "zmp-ui";
import { AlertCircle, CalendarDays, FileText, School } from "lucide-react";
import { parentService } from "@/services/parentService";
import { ParentHomeworkItem } from "@/types/parent";

function ParentHomeworkPage() {
  const [homework, setHomework] = useState<ParentHomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomework = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parentService.getHomework();
      setHomework(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
      case "graded":
        return "bg-green-100 text-green-700";
      case "late":
      case "missing":
        return "bg-red-100 text-red-700";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "Đã nộp";
      case "graded":
        return "Đã chấm";
      case "late":
        return "Trễ hạn";
      case "missing":
        return "Thiếu";
      case "pending":
        return "Chưa nộp";
      default:
        return status || "Chưa nộp";
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Không có hạn";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      {/* Header */}
      <div className="shrink-0 bg-[#BB0000] px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Bài tập</h1>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <AlertCircle className="mb-3 h-16 w-16" strokeWidth={1.2} />
            <p className="text-sm mb-3">{error}</p>
            <button onClick={fetchHomework} className="text-red-600 text-sm font-semibold">
              Thử lại
            </button>
          </div>
        ) : homework.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <FileText className="mb-3 h-16 w-16" strokeWidth={1.2} />
            <p className="text-sm">Không có bài tập nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {homework.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-800 text-sm flex-1 mr-2">{item.title}</h3>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>

                {item.classTitle && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <School className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
                    <span className="text-xs text-gray-500">{item.classCode ? `${item.classCode} - ` : ""}{item.classTitle}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mb-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
                  <span className="text-xs text-gray-500">Hạn nộp: {formatDate(item.dueAt)}</span>
                </div>

                {item.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                )}

                {(item.book || item.pages || item.skills) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.book && (
                      <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        📖 {item.book}
                      </span>
                    )}
                    {item.pages && (
                      <span className="text-[11px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                        📄 Trang {item.pages}
                      </span>
                    )}
                    {item.skills && (
                      <span className="text-[11px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                        🎯 {item.skills}
                      </span>
                    )}
                  </div>
                )}

                {item.score != null && item.maxScore != null && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-red-600">
                      Điểm: {item.score}/{item.maxScore}
                    </span>
                  </div>
                )}

                {item.teacherFeedback && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-2">
                    <p className="text-[11px] text-gray-500 font-semibold mb-0.5">Nhận xét:</p>
                    <p className="text-xs text-gray-700">{item.teacherFeedback}</p>
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

export default ParentHomeworkPage;
