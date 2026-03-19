import { api } from "@/api/api";
import { ApiResponse } from "@/types/apiResponse";
import { TEACHER_ENDPOINTS } from "@/constants/apiURL";
import { Homework, HomeworkSubmission } from "@/types/teacher";

export const homeworkService = {
  getHomeworkList: async (): Promise<Homework[]> => {
    const res = await api.get<ApiResponse<Homework[]>>(
      TEACHER_ENDPOINTS.HOMEWORK_LIST,
    );
    return Array.isArray(res?.data)
      ? res.data
      : ((res?.data as any)?.homeworkAssignments?.items ?? []);
  },

  getHomeworkById: async (id: string): Promise<Homework | null> => {
    const res = await api.get<ApiResponse<Homework>>(
      TEACHER_ENDPOINTS.HOMEWORK_DETAIL(id),
    );
    return res?.data ?? null;
  },

  getHomeworkSubmissions: async (): Promise<HomeworkSubmission[]> => {
    const res = await api.get<ApiResponse<HomeworkSubmission[]>>(
      TEACHER_ENDPOINTS.HOMEWORK_SUBMISSIONS,
    );
    return Array.isArray(res?.data)
      ? res.data
      : ((res?.data as any)?.items ?? []);
  },

  getHomeworkSubmissionDetail: async (
    homeworkStudentId: string,
  ): Promise<HomeworkSubmission | null> => {
    const res = await api.get<ApiResponse<HomeworkSubmission>>(
      TEACHER_ENDPOINTS.HOMEWORK_SUBMISSION_DETAIL(homeworkStudentId),
    );
    return res?.data ?? null;
  },
};
