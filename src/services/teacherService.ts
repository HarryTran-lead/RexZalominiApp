import { api } from "@/api/api";
import { ApiResponse } from "@/types/apiResponse";
import { TEACHER_ENDPOINTS } from "@/constants/apiURL";
import { ClassStudent, TeacherClass } from "@/types/teacher";

function normalizeClassStudent(raw: unknown): ClassStudent | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  const studentProfileId =
    typeof item.studentProfileId === "string"
      ? item.studentProfileId
      : typeof item.id === "string"
        ? item.id
        : "";

  if (!studentProfileId) return null;

  const hiddenFields = new Set(["studentProfileId", "stars"]);
  const detailFields: Record<string, string | number | boolean | null> = {};

  Object.entries(item).forEach(([key, value]) => {
    if (hiddenFields.has(key)) return;

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      detailFields[key] = value;
    }
  });

  return {
    id: typeof item.id === "string" ? item.id : studentProfileId,
    studentProfileId,
    studentName:
      typeof item.studentName === "string"
        ? item.studentName
        : typeof item.fullName === "string"
          ? item.fullName
          : "Học viên",
    fullName:
      typeof item.fullName === "string"
        ? item.fullName
        : "Học viên",
    avatarUrl:
      typeof item.avatarUrl === "string"
        ? item.avatarUrl
        : typeof item.studentAvatarUrl === "string"
          ? item.studentAvatarUrl
          : undefined,
    email: typeof item.email === "string" ? item.email : undefined,
    phone: typeof item.phone === "string" ? item.phone : undefined,
    enrollmentDate: typeof item.enrollmentDate === "string" ? item.enrollmentDate : undefined,
    attendanceRate:
      typeof item.attendanceRate === "number" ? item.attendanceRate : undefined,
    progressPercent:
      typeof item.progressPercent === "number" ? item.progressPercent : undefined,
    lastActiveAt: typeof item.lastActiveAt === "string" ? item.lastActiveAt : undefined,
    status: typeof item.status === "string" ? item.status : undefined,
    detailFields,
  };
}

function extractStudentItems(payload: unknown): ClassStudent[] {
  if (Array.isArray(payload)) {
    return payload
      .map(normalizeClassStudent)
      .filter((student): student is ClassStudent => Boolean(student));
  }

  if (!payload || typeof payload !== "object") return [];
  const data = payload as Record<string, unknown>;

  if (Array.isArray(data.items)) {
    return extractStudentItems(data.items);
  }

  if (data.students && typeof data.students === "object") {
    return extractStudentItems(data.students);
  }

  if (data.data && typeof data.data === "object") {
    return extractStudentItems(data.data);
  }

  return [];
}

/**
 * GET /api/teacher/classes
 * Returns all classes assigned to the authenticated teacher.
 */
export const getTeacherClasses = async (): Promise<TeacherClass[]> => {
  const res = await api.get<ApiResponse<TeacherClass[]>>(
    TEACHER_ENDPOINTS.TEACHER_CLASSES
  );
  return Array.isArray(res?.data) ? res.data : (res?.data as any)?.classes?.items ?? [];
};

/**
 * GET /api/teacher/classes/{classId}/students
 * Returns the student list for a specific class.
 */
export const getClassStudents = async (classId: string): Promise<ClassStudent[]> => {
  const params = {
    pageNumber: 1,
    pageSize: 100,
  };

  try {
    const res = await api.get<ApiResponse<unknown>>(
      TEACHER_ENDPOINTS.CLASS_STUDENTS(classId),
      { params }
    );
    const normalized = extractStudentItems(res?.data ?? res);
    if (normalized.length > 0) {
      return normalized;
    }
  } catch {
    // Fallback to legacy endpoint for backward compatibility.
  }

  const fallback = await api.get<ApiResponse<unknown>>(
    TEACHER_ENDPOINTS.TEACHER_CLASS_STUDENTS(classId),
    { params }
  );
  return extractStudentItems(fallback?.data ?? fallback);
};

export const teacherService = {
  getTeacherClasses,
  getClassStudents,
};
