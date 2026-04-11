import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";
import { AlertCircle, ArrowLeft, Users } from "lucide-react";
import { API_CONFIG } from "@/constants/apiURL";
import { teacherService } from "@/services/teacherService";
import { ClassStudent } from "@/types/teacher";

interface ClassStudentsPageState {
  classTitle?: string;
  classCode?: string;
}

function formatValue(value: string | number | boolean | null): string {
  if (value === null) return "Không có";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  return String(value);
}

function formatFieldValue(key: string, value: string | number | boolean | null): string {
  if (value == null) return "Không có";

  const text = String(value);
  const normalized = text.toLowerCase();

  if (key === "status") {
    if (normalized === "active") return "Đang hoạt động";
    if (normalized === "inactive") return "Không hoạt động";
  }

  if (key === "attendanceRate" || key === "progressPercent") {
    return `${text}%`;
  }

  return formatValue(value);
}

function formatKey(key: string): string {
  if (!key) return key;

  const labels: Record<string, string> = {
    fullName: "Họ và tên",
    email: "Email",
    phone: "Số điện thoại",
    enrollmentDate: "Ngày nhập học",
    status: "Trạng thái",
    attendanceRate: "Tỷ lệ điểm danh",
    progressPercent: "Tiến độ học tập",
  };

  return labels[key] || `Ngày vào lớp`;
}

function TeacherClassStudentsPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as ClassStudentsPageState;

  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return "";
    if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;

    const base = API_CONFIG.BASE_URL || "";
    if (!base) return avatarUrl;

    try {
      const origin = new URL(base).origin;
      return `${origin}${avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`}`;
    } catch {
      return avatarUrl;
    }
  };

  const loadStudents = useCallback(async () => {
    if (!classId) return;

    setLoading(true);
    setError(null);
    try {
      const list = await teacherService.getClassStudents(classId);
      setStudents(list);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách học sinh";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const classLabel = useMemo(() => {
    if (state.classTitle && state.classCode) {
      return `${state.classTitle} (${state.classCode})`;
    }
    return state.classTitle || state.classCode || "Danh sách học sinh";
  }, [state.classCode, state.classTitle]);

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-[#BB0000] px-4 py-4">
        <div className="relative flex items-center justify-center">
          <h1 className="text-center text-white font-bold text-lg">Danh sách học sinh</h1>
        </div>
        <p className="mt-1 truncate text-center text-xs text-red-100">{classLabel}</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner visible />
            <p className="mt-3 text-sm text-gray-400">Đang tải danh sách học sinh...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-16 text-center">
            <AlertCircle className="mb-3 h-14 w-14 text-red-400" strokeWidth={1.5} />
            <p className="text-red-500 text-sm font-medium mb-3">{error}</p>
            <button
              onClick={loadStudents}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && students.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <Users className="mb-3 h-16 w-16" strokeWidth={1.2} />
            <p className="text-sm">Lớp này chưa có học sinh.</p>
          </div>
        )}

        {!loading && !error && students.length > 0 && (
          <div className="space-y-3">
            {students.map((student) => {
              const avatarUrl = resolveAvatarUrl(student.avatarUrl);
              const fields = Object.entries(student.detailFields ?? {})
                .filter(
                  ([key]) =>
                    key !== "studentProfileId" &&
                    key !== "stars" &&
                    key !== "avatarUrl" &&
                    key !== "lastActiveAt"
                )
                .sort(([a], [b]) => a.localeCompare(b));

              return (
                <div key={student.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={student.fullName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                        {String(student.fullName || "?").trim().charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">{student.fullName}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    {fields.length === 0 ? (
                      <p className="text-xs text-gray-500">Không có dữ liệu chi tiết.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {fields.map(([key, value]) => (
                          <div key={key} className="flex items-start justify-between gap-2 text-xs">
                            <span className="text-gray-500">{formatKey(key)}</span>
                            <span className="max-w-[62%] text-right font-medium text-gray-800 break-all">
                              {formatFieldValue(key, value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}

export default TeacherClassStudentsPage;
