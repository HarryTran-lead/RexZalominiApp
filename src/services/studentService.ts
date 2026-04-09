import { ApiResponse } from "@/types/apiResponse";
import { api } from "../api/api";
import { AxiosRequestConfig } from "axios";
import { API_ENDPOINTS } from "../constants/apiURL";
import {
  AttendanceCheckInResult,
  StudentClass,
  SubmitHomeworkRequest,
  SubmitMultipleChoiceHomeworkRequest,
  HomeworkFeedback,
  StarBalance,
  StudentLevel,
  AttendanceStreak,
  RewardStoreItem,
  Reward,
  RewardRedemption,
  RequestRewardRedemptionRequest,
  StarTransaction,
  MissionProgressItem,
  Exam,
  ExamSubmission,
  StartExamSubmissionRequest,
  SaveExamAnswerRequest,
  PaginatedResponse,
  BaseQueryParams,
  HomeworkQueryParams,
  RewardRedemptionQueryParams,
  HomeworkAssignment,
  Ticket,
  CreateTicket,
} from "../types/student";

type TicketQueryParams = BaseQueryParams & {
  mine?: boolean;
  openedByProfileId?: string;
};

type StudentClassListPayload =
  | PaginatedResponse<StudentClass>
  | StudentClass[]
  | {
      classes?: PaginatedResponse<StudentClass>;
      items?: StudentClass[];
    };

const normalizeClassList = (
  payload: StudentClassListPayload | undefined
): PaginatedResponse<StudentClass> => {
  if (!payload) {
    return {
      items: [],
      pageNumber: 1,
      pageSize: 0,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pageNumber: 1,
      pageSize: payload.length,
      totalCount: payload.length,
      totalPages: payload.length ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  if (typeof payload === "object" && payload !== null && "items" in payload && Array.isArray(payload.items)) {
    const data = payload as PaginatedResponse<StudentClass>;
    return {
      items: data.items,
      pageNumber: data.pageNumber ?? 1,
      pageSize: data.pageSize ?? data.items.length,
      totalCount: data.totalCount ?? data.items.length,
      totalPages: data.totalPages ?? (data.items.length ? 1 : 0),
      hasNextPage: data.hasNextPage ?? false,
      hasPreviousPage: data.hasPreviousPage ?? false,
    };
  }

  if (typeof payload === "object" && payload !== null && "classes" in payload) {
    const wrapped = payload as { classes?: PaginatedResponse<StudentClass> };
    if (wrapped.classes && Array.isArray(wrapped.classes.items)) {
      return wrapped.classes;
    }
  }

  return {
    items: [],
    pageNumber: 1,
    pageSize: 0,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
};

type StudentExamListPayload =
  | Exam[]
  | PaginatedResponse<Exam>
  | {
      examResults?: PaginatedResponse<Exam>;
      items?: Exam[];
    };

type StudentHomeworkListPayload =
  | HomeworkAssignment[]
  | PaginatedResponse<HomeworkAssignment>
  | {
      homeworks?: PaginatedResponse<HomeworkAssignment>;
      items?: HomeworkAssignment[];
    };

const normalizeHomeworkList = (
  payload: StudentHomeworkListPayload | undefined
): PaginatedResponse<HomeworkAssignment> => {
  if (!payload) {
    return {
      items: [],
      pageNumber: 1,
      pageSize: 0,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pageNumber: 1,
      pageSize: payload.length,
      totalCount: payload.length,
      totalPages: payload.length ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  if (Array.isArray(payload.items)) {
    const data = payload as PaginatedResponse<HomeworkAssignment>;
    return {
      items: data.items,
      pageNumber: data.pageNumber ?? 1,
      pageSize: data.pageSize ?? data.items.length,
      totalCount: data.totalCount ?? data.items.length,
      totalPages: data.totalPages ?? (data.items.length ? 1 : 0),
      hasNextPage: data.hasNextPage ?? false,
      hasPreviousPage: data.hasPreviousPage ?? false,
    };
  }

  if (typeof payload === "object" && payload !== null && "homeworks" in payload) {
    const wrapped = payload as { homeworks?: PaginatedResponse<HomeworkAssignment> };
    if (wrapped.homeworks && Array.isArray(wrapped.homeworks.items)) {
      const data = wrapped.homeworks;
      return {
        items: data.items,
        pageNumber: data.pageNumber ?? 1,
        pageSize: data.pageSize ?? data.items.length,
        totalCount: data.totalCount ?? data.items.length,
        totalPages: data.totalPages ?? (data.items.length ? 1 : 0),
        hasNextPage: data.hasNextPage ?? false,
        hasPreviousPage: data.hasPreviousPage ?? false,
      };
    }
  }

  return {
    items: [],
    pageNumber: 1,
    pageSize: 0,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
};

const normalizeExamList = (payload: StudentExamListPayload | undefined): Exam[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

export const studentService = {
  // Student Classes
  getClasses: async (
    params?: BaseQueryParams,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<PaginatedResponse<StudentClass>>> => {
    const response = await api.get<ApiResponse<StudentClassListPayload>>(
      API_ENDPOINTS.STUDENT.CLASSES,
      {
        ...config,
        params,
      }
    );

    return {
      ...response,
      data: normalizeClassList(response.data),
    };
  },

  // Homework - My homework assignments
  getMyHomework: async (
    params?: HomeworkQueryParams
  ): Promise<ApiResponse<PaginatedResponse<HomeworkAssignment>>> => {
    const response = await api.get<ApiResponse<StudentHomeworkListPayload>>(
      API_ENDPOINTS.STUDENT.HOMEWORK_MY,
      { params }
    );

    return {
      ...response,
      data: normalizeHomeworkList(response.data),
    };
  },

  // Homework - Submitted homework
  getSubmittedHomework: async (
    params?: BaseQueryParams
  ): Promise<ApiResponse<PaginatedResponse<HomeworkAssignment>>> => {
    return await api.get<ApiResponse<PaginatedResponse<HomeworkAssignment>>>(
      API_ENDPOINTS.STUDENT.HOMEWORK_SUBMITTED,
      { params }
    );
  },

  // Homework - Get homework detail
  getHomeworkDetail: async (
    homeworkStudentId: string
  ): Promise<ApiResponse<HomeworkAssignment>> => {
    return await api.get<ApiResponse<HomeworkAssignment>>(
      API_ENDPOINTS.STUDENT.HOMEWORK_DETAIL(homeworkStudentId)
    );
  },

  // Homework - Submit homework
  submitHomework: async (
    data: SubmitHomeworkRequest
  ): Promise<ApiResponse<void>> => {
    return await api.post<ApiResponse<void>>(
      API_ENDPOINTS.STUDENT.HOMEWORK_SUBMIT,
      data
    );
  },

  // Homework - Submit multiple choice homework
  submitMultipleChoiceHomework: async (
    data: SubmitMultipleChoiceHomeworkRequest
  ): Promise<ApiResponse<void>> => {
    return await api.post<ApiResponse<void>>(
      API_ENDPOINTS.STUDENT.HOMEWORK_MULTIPLE_CHOICE_SUBMIT,
      data
    );
  },

  // Homework - Get my feedback
  getMyHomeworkFeedback: async (
    params?: BaseQueryParams
  ): Promise<ApiResponse<PaginatedResponse<HomeworkFeedback>>> => {
    return await api.get<ApiResponse<PaginatedResponse<HomeworkFeedback>>>(
      API_ENDPOINTS.STUDENT.HOMEWORK_FEEDBACK_MY,
      { params }
    );
  },

  // Ticket - Get my support tickets
  getMyTickets: async (
    params?: TicketQueryParams
  ): Promise<ApiResponse<Ticket[]>> => {
    const response = await api.get<ApiResponse<unknown>>(
      API_ENDPOINTS.TICKET.LIST,
      { params }
    );

    const payload = response.data;
    const items =
      Array.isArray(payload)
        ? payload
        : payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown[] }).items)
          ? (payload as { items: unknown[] }).items
          : payload && typeof payload === "object" && (payload as { tickets?: unknown }).tickets &&
              typeof (payload as { tickets?: unknown }).tickets === "object" &&
              Array.isArray(((payload as { tickets: { items?: unknown[] } }).tickets.items))
            ? ((payload as { tickets: { items: unknown[] } }).tickets.items)
            : [];

    return {
      ...response,
      data: items as Ticket[],
    };
  },

  // Ticket - Create support ticket
  createTicket: async (payload: CreateTicket): Promise<ApiResponse<Ticket>> => {
    return await api.post<ApiResponse<Ticket>>(API_ENDPOINTS.TICKET.CREATE, payload);
  },

  // Ticket - Get ticket detail
  getTicketDetail: async (ticketId: string): Promise<ApiResponse<Ticket>> => {
    return await api.get<ApiResponse<Ticket>>(API_ENDPOINTS.TICKET.DETAIL(ticketId));
  },
};

// Gamification Service
export const gamificationService = {
  // Get my star balance
  getMyStarBalance: async (): Promise<ApiResponse<StarBalance>> => {
    return await api.get<ApiResponse<StarBalance>>(
      API_ENDPOINTS.GAMIFICATION.STARS_BALANCE_ME
    );
  },

  // Get my level
  getMyLevel: async (): Promise<ApiResponse<StudentLevel>> => {
    return await api.get<ApiResponse<StudentLevel>>(
      API_ENDPOINTS.GAMIFICATION.LEVEL_ME
    );
  },

  // Get my attendance streak
  getMyAttendanceStreak: async (): Promise<ApiResponse<AttendanceStreak>> => {
    return await api.get<ApiResponse<AttendanceStreak>>(
      API_ENDPOINTS.GAMIFICATION.ATTENDANCE_STREAK_ME
    );
  },

  // Check in attendance
  checkInAttendance: async (): Promise<ApiResponse<AttendanceCheckInResult>> => {
    return await api.post<ApiResponse<AttendanceCheckInResult>>(
      API_ENDPOINTS.GAMIFICATION.ATTENDANCE_CHECKIN
    );
  },

  // Get my mission progress list
  getMyMissionProgress: async (
    params?: BaseQueryParams
  ): Promise<ApiResponse<PaginatedResponse<MissionProgressItem>>> => {
    return await api.get<ApiResponse<PaginatedResponse<MissionProgressItem>>>(
      API_ENDPOINTS.GAMIFICATION.MISSIONS_ME_PROGRESS,
      { params }
    );
  },

  // Get active reward store items
  getActiveRewardItems: async (
    params?: BaseQueryParams
  ): Promise<ApiResponse<PaginatedResponse<RewardStoreItem>>> => {
    return await api.get<ApiResponse<PaginatedResponse<RewardStoreItem>>>(
      API_ENDPOINTS.GAMIFICATION.REWARD_STORE_ITEMS,
      { params }
    );
  },

  // Request reward redemption
  requestRewardRedemption: async (
    data: RequestRewardRedemptionRequest
  ): Promise<ApiResponse<void>> => {
    return await api.post<ApiResponse<void>>(
      API_ENDPOINTS.GAMIFICATION.REWARD_REDEMPTIONS,
      data
    );
  },

  // Get my reward redemptions
  getMyRewardRedemptions: async (
    params?: RewardRedemptionQueryParams
  ): Promise<ApiResponse<PaginatedResponse<RewardRedemption>>> => {
    return await api.get<ApiResponse<PaginatedResponse<RewardRedemption>>>(
      API_ENDPOINTS.GAMIFICATION.REWARD_REDEMPTIONS_ME,
      { params }
    );
  },

  // Confirm reward received
  confirmRewardReceived: async (redemptionId: string): Promise<ApiResponse<void>> => {
    return await api.patch<ApiResponse<void>>(
      API_ENDPOINTS.GAMIFICATION.REWARD_REDEMPTION_CONFIRM(redemptionId)
    );
  },

  // Get star transactions
  getStarTransactions: async (
    params?: BaseQueryParams
  ): Promise<ApiResponse<PaginatedResponse<StarTransaction>>> => {
    return await api.get<ApiResponse<PaginatedResponse<StarTransaction>>>(
      API_ENDPOINTS.GAMIFICATION.STARS_TRANSACTIONS,
      { params }
    );
  },

  // Get available rewards
  getAvailableRewards: async (): Promise<ApiResponse<Reward[]>> => {
    return await api.get<ApiResponse<Reward[]>>(
      API_ENDPOINTS.GAMIFICATION.AVAILABLE_REWARDS
    );
  },

  // Get my redemptions
  getMyRedemptions: async (
    params?: BaseQueryParams
  ): Promise<ApiResponse<PaginatedResponse<RewardRedemption>>> => {
    return await api.get<ApiResponse<PaginatedResponse<RewardRedemption>>>(
      API_ENDPOINTS.GAMIFICATION.REWARD_REDEMPTIONS_ME,
      { params }
    );
  },

  // Redeem reward
  redeemReward: async (rewardId: string): Promise<ApiResponse<RewardRedemption>> => {
    return await api.post<ApiResponse<RewardRedemption>>(
      API_ENDPOINTS.GAMIFICATION.REDEEM_REWARD(rewardId)
    );
  },
};

// Exam Service
export const examService = {
  // Get my exams
  getMyExams: async (
    params?: BaseQueryParams
  ): Promise<ApiResponse<Exam[]>> => {
    const response = await api.get<ApiResponse<StudentExamListPayload>>(
      API_ENDPOINTS.EXAM.STUDENTS,
      { params }
    );

    return {
      ...response,
      data: normalizeExamList(response.data),
    };
  },

  // Get student exams
  getStudentExams: async (
    params?: BaseQueryParams
  ): Promise<ApiResponse<PaginatedResponse<Exam>>> => {
    return await api.get<ApiResponse<PaginatedResponse<Exam>>>(
      API_ENDPOINTS.EXAM.STUDENTS,
      { params }
    );
  },

  // Start exam submission
  startExamSubmission: async (
    examId: string,
    data: StartExamSubmissionRequest
  ): Promise<ApiResponse<ExamSubmission>> => {
    return await api.post<ApiResponse<ExamSubmission>>(
      API_ENDPOINTS.EXAM.START_SUBMISSION(examId),
      data
    );
  },

  // Save exam answers
  saveExamAnswers: async (
    examId: string,
    submissionId: string,
    data: SaveExamAnswerRequest
  ): Promise<ApiResponse<void>> => {
    return await api.put<ApiResponse<void>>(
      API_ENDPOINTS.EXAM.SAVE_ANSWERS(examId, submissionId),
      data
    );
  },

  // Submit exam
  submitExam: async (
    examId: string,
    submissionId: string
  ): Promise<ApiResponse<void>> => {
    return await api.post<ApiResponse<void>>(
      API_ENDPOINTS.EXAM.SUBMIT(examId, submissionId)
    );
  },

  // Get exam submissions
  getExamSubmissions: async (
    examId: string,
    params?: BaseQueryParams
  ): Promise<ApiResponse<PaginatedResponse<ExamSubmission>>> => {
    return await api.get<ApiResponse<PaginatedResponse<ExamSubmission>>>(
      API_ENDPOINTS.EXAM.SUBMISSIONS(examId),
      { params }
    );
  },
};