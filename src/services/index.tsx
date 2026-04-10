
export { authService } from "./authService";
export { teacherService } from "./teacherService";
export { homeworkService } from "./homeworkService";
export { reportService } from "./reportService";
export { parentService } from "./parentService";
export { studentService, gamificationService, examService } from "./studentService";
export { meService } from "./meService";
export { fileService } from "./fileService";
export { notificationService } from "./notificationService";
export type { TeacherClass, ClassStudent } from "@/types/teacher";
export type { Homework, HomeworkSubmission } from "@/types/teacher";
export type {
  SessionReport,
  MonthlySessionReport,
  MonthlyReport,
} from "@/types/teacher";
export type {
  ParentHomeworkItem,
  ParentExamResult,
  ParentNotification,
  ParentLeaveRequest,
  ParentOverviewResponse,
  ParentOverviewStatistics,
  ParentStudentProfile,
  ParentClassInfo,
} from "@/types/parent";
export type {
  StudentClass,
  HomeworkAssignment,
  SubmitHomeworkRequest,
  SubmitMultipleChoiceHomeworkRequest,
  HomeworkFeedback,
  StarBalance,
  StudentLevel,
  AttendanceStreak,
  RewardStoreItem,
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
} from "@/types/student";
