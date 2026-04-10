import React, { useEffect, useState, useCallback } from "react";
import { Page, Spinner } from "zmp-ui";
import { AlertCircle, BookOpen } from "lucide-react";
import { teacherService } from "@/services/teacherService";
import { TeacherClass } from "@/types/teacher";

interface SubjectGroup {
  subjectName: string;
  classes: TeacherClass[];
  totalStudents: number;
}

function TeacherSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await teacherService.getTeacherClasses();

      // Group classes by subjectName
      const groupMap = new Map<string, TeacherClass[]>();
      list.forEach((cls: TeacherClass) => {
        const subject = cls.programName || cls.title || "Khác";
        const existing = groupMap.get(subject) || [];
        existing.push(cls);
        groupMap.set(subject, existing);
      });

      const groups: SubjectGroup[] = Array.from(groupMap.entries()).map(
        ([name, classes]) => ({
          subjectName: name,
          classes,
          totalStudents: classes.reduce(
            (sum, cls) => sum + (cls.capacity ?? 0),
            0
          ),
        })
      );

      setSubjects(groups);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const COLORS = [
    "from-red-500 to-rose-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-purple-500 to-violet-600",
    "from-cyan-500 to-sky-600",
  ];

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      {/* Header */}
      <div className="shrink-0 bg-[#BB0000] px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Môn học & tài liệu</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-24">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner visible />
            <p className="text-gray-400 text-sm mt-3">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center py-16 text-center">
            <AlertCircle className="mb-3 h-14 w-14 text-red-400" strokeWidth={1.5} />
            <p className="text-red-500 text-sm font-medium mb-3">{error}</p>
            <button
              onClick={fetchSubjects}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && subjects.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <BookOpen className="mb-3 h-16 w-16" strokeWidth={1.2} />
            <p className="text-sm">Không có môn học nào</p>
          </div>
        )}

        {/* Subject Grid */}
        {!loading && !error && subjects.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((subject, idx) => (
              <div
                key={subject.subjectName}
                className={`rounded-xl p-4 text-white bg-gradient-to-br ${COLORS[idx % COLORS.length]} shadow-md`}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mb-3">
                  <BookOpen className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-sm leading-tight mb-2 line-clamp-2">
                  {subject.subjectName}
                </h3>
                <div className="space-y-1 text-xs text-white/80">
                  <p>{subject.classes.length} lớp</p>
                  {subject.totalStudents > 0 && (
                    <p>{subject.totalStudents} học sinh</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

export default TeacherSubjectsPage;
