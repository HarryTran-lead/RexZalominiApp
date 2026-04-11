import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
import { FileText } from "lucide-react";
import StudentHomeworkCard from "@/components/homework/student/StudentHomeworkCard";
import StudentHomeworkClassFilter from "@/components/homework/student/StudentHomeworkClassFilter";
import StudentHomeworkTabs, { HomeworkTab } from "@/components/homework/student/StudentHomeworkTabs";
import { homeworkService } from "@/services/homeworkService";
import { MyHomeworkListItem } from "@/types/homework";

function normalizeStatus(status?: string): string {
  return (status || "").toLowerCase();
}

function ParentHomeworkPage() {
  const navigate = useNavigate();
  const [homework, setHomework] = useState<MyHomeworkListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<HomeworkTab>("all");
  const [selectedClassName, setSelectedClassName] = useState("");

  const fetchHomework = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await homeworkService.getMyHomeworkList({
        pageNumber: 1,
        pageSize: 100,
      });
      setHomework(data);
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
          homework
            .map((item) => item.className || item.classTitle || item.classCode || "")
            .map((value) => value.trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, "vi")),
    [homework]
  );

  const classFilteredHomework = useMemo(() => {
    if (!selectedClassName) return homework;
    return homework.filter(
      (item) => (item.className || item.classTitle || item.classCode || "") === selectedClassName
    );
  }, [homework, selectedClassName]);

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
      <div className="sticky top-0 z-20 shrink-0 bg-[#BB0000] px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Bài tập</h1>
      </div>

      <StudentHomeworkTabs activeTab={activeTab} counts={counts} onChange={setActiveTab} />
      <StudentHomeworkClassFilter
        classes={classOptions}
        value={selectedClassName}
        onChange={setSelectedClassName}
      />

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
              onClick={fetchHomework}
              className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && filteredHomework.length === 0 && (
          <div className="pt-8 flex flex-col items-center text-gray-400">
            <FileText className="mb-3 h-16 w-16" strokeWidth={1.2} />
            <p className="text-sm">Không có bài tập nào</p>
          </div>
        )}

        {!loading && !error && filteredHomework.length > 0 && (
          <div className="space-y-2">
            {filteredHomework.map((item) => (
              <StudentHomeworkCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/parent/homework/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

export default ParentHomeworkPage;
