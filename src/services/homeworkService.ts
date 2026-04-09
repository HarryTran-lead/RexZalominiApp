import { api } from "@/api/api";
import { ApiResponse } from "@/types/apiResponse";
import { STUDENT_ENDPOINTS, TEACHER_ENDPOINTS } from "@/constants/apiURL";
import {
  AIHintRequest,
  AIHintResponse,
  AIRecommendationRequest,
  AIRecommendationResponse,
  GradeHomeworkPayload,
  HomeworkAssignmentDetail,
  HomeworkAssignmentListItem,
  HomeworkSubmissionListItem,
  MyHomeworkAttemptDetail,
  MyHomeworkListItem,
  MyHomeworkSubmissionDetail,
  SubmitHomeworkRequest,
  SubmitMultipleChoiceRequest,
} from "@/types/homework";

type TeacherHomeworkListPayload =
  | HomeworkAssignmentListItem[]
  | { items?: HomeworkAssignmentListItem[] }
  | { homeworkAssignments?: { items?: HomeworkAssignmentListItem[] } };

type StudentHomeworkListPayload =
  | MyHomeworkListItem[]
  | { items?: MyHomeworkListItem[] }
  | { homeworks?: { items?: MyHomeworkListItem[] } };

function extractItems<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (payload && typeof payload === "object") {
    const directItems = (payload as { items?: unknown }).items;
    if (Array.isArray(directItems)) {
      return directItems as T[];
    }
  }
  return [];
}

function normalizeTeacherHomeworkList(
  payload: TeacherHomeworkListPayload | undefined
): HomeworkAssignmentListItem[] {
  const direct = extractItems<HomeworkAssignmentListItem>(payload);
  if (direct.length > 0 || Array.isArray(payload)) {
    return direct;
  }

  if (payload && typeof payload === "object" && "homeworkAssignments" in payload) {
    const wrapped = payload as { homeworkAssignments?: unknown };
    return extractItems<HomeworkAssignmentListItem>(wrapped.homeworkAssignments);
  }

  return [];
}

function normalizeStudentHomeworkList(
  payload: StudentHomeworkListPayload | undefined
): MyHomeworkListItem[] {
  const direct = extractItems<MyHomeworkListItem>(payload);
  if (direct.length > 0 || Array.isArray(payload)) {
    return direct;
  }

  if (payload && typeof payload === "object" && "homeworks" in payload) {
    const wrapped = payload as { homeworks?: unknown };
    return extractItems<MyHomeworkListItem>(wrapped.homeworks);
  }

  return [];
}

function normalizeTeacherHomeworkDetail(payload: unknown): HomeworkAssignmentDetail | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("id" in payload) {
    return payload as HomeworkAssignmentDetail;
  }

  if ("data" in payload) {
    const wrapped = payload as { data?: unknown };
    if (wrapped.data && typeof wrapped.data === "object" && "id" in wrapped.data) {
      return wrapped.data as HomeworkAssignmentDetail;
    }
  }

  return null;
}

function normalizeHomeworkAttemptDetail(payload: unknown): MyHomeworkAttemptDetail | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("attemptNumber" in payload || "attemptId" in payload) {
    return payload as MyHomeworkAttemptDetail;
  }

  if ("data" in payload) {
    const wrapped = payload as { data?: unknown };
    if (wrapped.data && typeof wrapped.data === "object") {
      const candidate = wrapped.data as Record<string, unknown>;
      if ("attemptNumber" in candidate || "attemptId" in candidate) {
        return candidate as unknown as MyHomeworkAttemptDetail;
      }
    }
  }

  return null;
}

export interface TeacherHomeworkQuery {
  classId?: string;
  sessionId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface StudentHomeworkQuery {
  status?: string;
  classId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const homeworkService = {
  getTeacherHomeworkList: async (
    params?: TeacherHomeworkQuery
  ): Promise<HomeworkAssignmentListItem[]> => {
    const res = await api.get<ApiResponse<TeacherHomeworkListPayload>>(
      TEACHER_ENDPOINTS.HOMEWORK_LIST,
      { params }
    );
    return normalizeTeacherHomeworkList(res?.data);
  },

  getTeacherHomeworkDetail: async (id: string): Promise<HomeworkAssignmentDetail | null> => {
    const res = await api.get<ApiResponse<HomeworkAssignmentDetail> | HomeworkAssignmentDetail>(
      TEACHER_ENDPOINTS.HOMEWORK_DETAIL(id),
    );
    return normalizeTeacherHomeworkDetail(res);
  },

  getHomeworkSubmissions: async (): Promise<HomeworkSubmissionListItem[]> => {
    const res = await api.get<ApiResponse<HomeworkSubmissionListItem[]>>(
      TEACHER_ENDPOINTS.HOMEWORK_SUBMISSIONS,
    );
    return extractItems<HomeworkSubmissionListItem>(res?.data);
  },

  getHomeworkSubmissionDetail: async (
    homeworkStudentId: string,
  ): Promise<HomeworkSubmissionListItem | null> => {
    const res = await api.get<ApiResponse<HomeworkSubmissionListItem>>(
      TEACHER_ENDPOINTS.HOMEWORK_SUBMISSION_DETAIL(homeworkStudentId),
    );
    return res?.data ?? null;
  },

  getMyHomeworkList: async (params?: StudentHomeworkQuery): Promise<MyHomeworkListItem[]> => {
    const res = await api.get<ApiResponse<StudentHomeworkListPayload>>(
      STUDENT_ENDPOINTS.HOMEWORK_MY,
      { params }
    );
    return normalizeStudentHomeworkList(res?.data);
  },

  getMyHomeworkDetail: async (homeworkStudentId: string): Promise<MyHomeworkSubmissionDetail | null> => {
    const res = await api.get<ApiResponse<MyHomeworkSubmissionDetail>>(
      STUDENT_ENDPOINTS.HOMEWORK_DETAIL(homeworkStudentId)
    );
    return res?.data ?? null;
  },

  getMyHomeworkAttemptDetail: async (
    homeworkStudentId: string,
    attemptNumber: number
  ): Promise<MyHomeworkAttemptDetail | null> => {
    const res = await api.get<ApiResponse<MyHomeworkAttemptDetail> | MyHomeworkAttemptDetail>(
      STUDENT_ENDPOINTS.HOMEWORK_ATTEMPT_DETAIL(homeworkStudentId, attemptNumber)
    );
    return normalizeHomeworkAttemptDetail(res);
  },

  submitHomework: async (payload: SubmitHomeworkRequest): Promise<boolean> => {
    const res = await api.post<ApiResponse<unknown>>(STUDENT_ENDPOINTS.HOMEWORK_SUBMIT, payload);
    return Boolean(res?.isSuccess ?? res?.success ?? true);
  },

  submitMultipleChoiceHomework: async (payload: SubmitMultipleChoiceRequest): Promise<boolean> => {
    const res = await api.post<ApiResponse<unknown>>(
      STUDENT_ENDPOINTS.HOMEWORK_MULTIPLE_CHOICE_SUBMIT,
      payload
    );
    return Boolean(res?.isSuccess ?? res?.success ?? true);
  },

  getHomeworkHint: async (
    homeworkStudentId: string,
    payload: AIHintRequest
  ): Promise<AIHintResponse | null> => {
    const res = await api.post<ApiResponse<AIHintResponse>>(
      STUDENT_ENDPOINTS.HOMEWORK_HINT(homeworkStudentId),
      payload
    );
    return res?.data ?? null;
  },

  getHomeworkRecommendations: async (
    homeworkStudentId: string,
    payload: AIRecommendationRequest
  ): Promise<AIRecommendationResponse | null> => {
    const res = await api.post<ApiResponse<AIRecommendationResponse>>(
      STUDENT_ENDPOINTS.HOMEWORK_RECOMMENDATIONS(homeworkStudentId),
      payload
    );
    return res?.data ?? null;
  },

  gradeHomeworkSubmission: async (
    homeworkStudentId: string,
    payload: GradeHomeworkPayload
  ): Promise<boolean> => {
    const res = await api.post<ApiResponse<unknown>>(
      TEACHER_ENDPOINTS.HOMEWORK_SUBMISSION_GRADE(homeworkStudentId),
      payload
    );
    return Boolean(res?.isSuccess ?? res?.success ?? true);
  },

  // Backward compatibility for existing usages
  getHomeworkList: async (): Promise<HomeworkAssignmentListItem[]> => {
    return homeworkService.getTeacherHomeworkList();
  },

  getHomeworkById: async (id: string): Promise<HomeworkAssignmentDetail | null> => {
    return homeworkService.getTeacherHomeworkDetail(id);
  },
};
