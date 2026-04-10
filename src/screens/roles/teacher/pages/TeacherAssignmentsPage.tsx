import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
import { homeworkService } from "@/services/homeworkService";
import { HomeworkAssignmentListItem } from "@/types/homework";
import TeacherHomeworkFilters from "@/components/homework/teacher/TeacherHomeworkFilters";
import TeacherHomeworkCard from "@/components/homework/teacher/TeacherHomeworkCard";

function TeacherAssignmentsPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<HomeworkAssignmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await homeworkService.getTeacherHomeworkList();
      setAssignments(list);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách bài tập";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const classOptions = Array.from(
    new Map(
      assignments
        .filter((item) => item.classId)
        .map((item) => [
          item.classId,
          {
            value: item.classId,
            label: item.classCode || item.classTitle,
          },
        ])
    ).values()
  );

  const sessionOptions = Array.from(
    new Map(
      assignments
        .filter((item) => item.sessionId)
        .map((item) => [
          item.sessionId as string,
          {
            value: item.sessionId as string,
            label: item.sessionName || (item.sessionId as string).slice(0, 8),
          },
        ])
    ).values()
  );

  const filteredAssignments = assignments.filter((item) => {
    if (selectedClassId && item.classId !== selectedClassId) {
      return false;
    }
    if (selectedSessionId && item.sessionId !== selectedSessionId) {
      return false;
    }
    return true;
  });

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Bài tập & nộp bài</h1>
      </div>

      {!loading && !error && assignments.length > 0 && (
        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Tổng: <span className="font-semibold text-gray-800">{filteredAssignments.length}</span>/<span className="font-semibold text-gray-800">{assignments.length}</span> bài tập
          </span>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner visible />
            <p className="text-gray-400 text-sm mt-3">Đang tải dữ liệu...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-16 text-center">
            <svg className="w-14 h-14 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-red-500 text-sm font-medium mb-3">{error}</p>
            <button
              onClick={fetchAssignments}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && (
          <TeacherHomeworkFilters
            classOptions={classOptions}
            sessionOptions={sessionOptions}
            selectedClassId={selectedClassId}
            selectedSessionId={selectedSessionId}
            onClassChange={setSelectedClassId}
            onSessionChange={setSelectedSessionId}
          />
        )}

        {!loading && !error && filteredAssignments.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">Không có bài tập phù hợp bộ lọc</p>
          </div>
        )}

        {!loading && !error && filteredAssignments.length > 0 && (
          <div className="space-y-3">
            {filteredAssignments.map((hw) => (
              <TeacherHomeworkCard
                key={hw.id}
                item={hw}
                onViewDetail={() => navigate(`/teacher/assignments/${hw.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

export default TeacherAssignmentsPage;
