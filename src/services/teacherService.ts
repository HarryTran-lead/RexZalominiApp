import { api } from "@/api/api";
import { ApiResponse } from "@/types/apiResponse";
import { TEACHER_ENDPOINTS } from "@/constants/apiURL";
import { ClassStudent, TeacherClass } from "@/types/teacher";

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
  const res = await api.get<ApiResponse<ClassStudent[]>>(
    TEACHER_ENDPOINTS.TEACHER_CLASS_STUDENTS(classId)
  );
  return Array.isArray(res?.data) ? res.data : (res?.data as any)?.items ?? [];
};

export const teacherService = {
  getTeacherClasses,
  getClassStudents,
};
