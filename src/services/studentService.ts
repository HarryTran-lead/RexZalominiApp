import { ApiResponse } from "@/types/apiResponse";
import { api } from "../api/api";
import { AxiosRequestConfig } from "axios";
import { API_ENDPOINTS } from "../constants/apiURL";
import {
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
  Exam,
  ExamSubmission,
  StartExamSubmissionRequest,
  SaveExamAnswerRequest,
  PaginatedResponse,
  BaseQueryParams,
  HomeworkQueryParams,
  TimetableQueryParams,
  RewardRedemptionQueryParams,
  HomeworkAssignment,
} from "../types/student";

export const studentService = {
  // Student Classes
  getClasses: async (
    params?: BaseQueryParams,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<PaginatedResponse<StudentClass>>> => {
    return await api.get<ApiResponse<PaginatedResponse<StudentClass>>>(
      API_ENDPOINTS.STUDENT.CLASSES,
      {
        ...config,
        params,
      }
    );
  },

  // Homework - My homework assignments
  getMyHomework: async (
    params?: HomeworkQueryParams
  ): Promise<ApiResponse<PaginatedResponse<HomeworkAssignment>>> => {
    return await api.get<ApiResponse<PaginatedResponse<HomeworkAssignment>>>(
      API_ENDPOINTS.STUDENT.HOMEWORK_MY,
      { params }
    );
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
  checkInAttendance: async (): Promise<ApiResponse<void>> => {
    return await api.post<ApiResponse<void>>(
      API_ENDPOINTS.GAMIFICATION.ATTENDANCE_CHECKIN
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
    return await api.get<ApiResponse<Exam[]>>(
      API_ENDPOINTS.EXAM.STUDENTS,
      { params }
    );
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