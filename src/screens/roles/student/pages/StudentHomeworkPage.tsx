import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
import StudentHomeworkCard from "@/components/homework/student/StudentHomeworkCard";
import StudentHomeworkClassFilter from "@/components/homework/student/StudentHomeworkClassFilter";
import StudentHomeworkTabs, { HomeworkTab } from "@/components/homework/student/StudentHomeworkTabs";
import { homeworkService } from "@/services/homeworkService";
import { MyHomeworkListItem } from "@/types/homework";

function normalizeStatus(status?: string): string {
  return (status || "").toLowerCase();
}

const StudentHomeworkPage: React.FC = () => {
  const navigate = useNavigate();
  const [allHomework, setAllHomework] = useState<MyHomeworkListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<HomeworkTab>("all");
  const [selectedClassName, setSelectedClassName] = useState("");

  const fetchHomework = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await homeworkService.getMyHomeworkList({
        pageNumber: 1,
        pageSize: 100,
      });

      const needDetail = list.filter((item) => {
        const graded = normalizeStatus(item.status) === "graded";
        return graded && (item.score == null || !item.teacherFeedback);
      });

      if (needDetail.length === 0) {
        setAllHomework(list);
      } else {
        const detailPairs = await Promise.all(
          needDetail.map(async (item) => {
            try {
              const detail = await homeworkService.getMyHomeworkDetail(item.id);
              return [item.id, detail] as const;
            } catch {
              return [item.id, null] as const;
            }
          })
        );

        const detailMap = new Map(detailPairs);
        const merged = list.map((item) => {
          const detail = detailMap.get(item.id);
          if (!detail) return item;
          return {
            ...item,
            score: item.score ?? detail.score,
            maxScore: item.maxScore ?? detail.maxScore,
            teacherFeedback: item.teacherFeedback ?? detail.teacherFeedback,
            gradedAt: item.gradedAt ?? detail.gradedAt,
          };
        });

        setAllHomework(merged);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách bài tập";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  const classOptions = useMemo(
    () =>
      Array.from(
        new Set(
          allHomework
            .map((item) => item.className || item.classTitle || item.classCode || "")
            .map((value) => value.trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, "vi")),
    [allHomework]
  );

  const classFilteredHomework = useMemo(() => {
    if (!selectedClassName) return allHomework;
    return allHomework.filter(
      (item) => (item.className || item.classTitle || item.classCode || "") === selectedClassName
    );
  }, [allHomework, selectedClassName]);

  const counts = useMemo(() => {
    const missing = classFilteredHomework.filter((item) => {
      const status = normalizeStatus(item.status);
      return status === "missing" || status === "assigned" || status === "late";
    }).length;

    const submitted = classFilteredHomework.filter((item) => normalizeStatus(item.status) === "submitted").length;
    const graded = classFilteredHomework.filter((item) => normalizeStatus(item.status) === "graded").length;

    return {
      all: classFilteredHomework.length,
      missing,
      submitted,
      graded,
    };
  }, [classFilteredHomework]);

  const filteredHomework = useMemo(() => {
    if (activeTab === "all") return classFilteredHomework;

    return classFilteredHomework.filter((item) => {
      const status = normalizeStatus(item.status);
      if (activeTab === "missing") {
        return status === "missing" || status === "assigned" || status === "late";
      }
      if (activeTab === "submitted") {
        return status === "submitted";
      }
      return status === "graded";
    });
  }, [classFilteredHomework, activeTab]);

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Bài tập</h1>
      </div>

      <StudentHomeworkTabs activeTab={activeTab} counts={counts} onChange={setActiveTab} />
      <StudentHomeworkClassFilter
        classes={classOptions}
        value={selectedClassName}
        onChange={setSelectedClassName}
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-24">
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
              onClick={fetchHomework}
              className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && filteredHomework.length === 0 && (
          <div className="pt-8 flex flex-col items-center text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">Không có bài tập nào</p>
          </div>
        )}

        {!loading && !error && filteredHomework.length > 0 && (
          <div className="space-y-2">
            {filteredHomework.map((item) => (
              <StudentHomeworkCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/student/homework/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
};

export default StudentHomeworkPage;
