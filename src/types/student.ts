// Student Types
export interface StudentClass {
  id: string;
  branchId: string;
  branchName: string;
  programId: string;
  programName: string;
  code: string;
  title: string;
  mainTeacherId?: string;
  mainTeacherName?: string;
  assistantTeacherId?: string;
  assistantTeacherName?: string;
  startDate: string;
  endDate?: string;
  status: string;
  capacity: number;
  currentEnrollmentCount: number;
  schedulePattern: string;
  enrollDate?: string;
  enrollmentStatus?: string;
}

// Homework Types
export interface HomeworkAssignment {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    assignmentDescription: string;
    classId: string;
    classCode: string;
    classTitle: string;
    dueAt?: string;
    book?: string;
    pages?: string;
    skills?: string[];
    submissionType: "File" | "Text" | "Link" | "MultipleChoice";
    maxScore?: number;
    status: "Assigned" | "Submitted" | "Graded" | "Late" | "Missing";
    submittedAt?: string;
    gradedAt?: string;
    score?: number;
    isLate: boolean;
    isOverdue: boolean;
}

export interface SubmitHomeworkRequest {
  homeworkStudentId: string;
  textAnswer?: string;
  attachmentUrls?: string[];
  linkUrl?: string;
}

export interface SubmitHomeworkResponse {
  id: string;
  assignmentId: string;
  status?: "Submitted";
  submittedAt?: string;
}

export interface SubmitMultipleChoiceHomeworkRequest {
  homeworkStudentId: string;
  answers: HomeworkAnswer[];
}

export interface HomeworkAnswer {
  questionId: string;
  answer: string;
}

export interface HomeworkFeedback {
  id: string;
  homeworkStudentId: string;
  teacherFeedback: string;
  score?: number;
  gradedAt: string;
  homework: HomeworkAssignment;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  starCost: number;
  category?: string;
  isActive: boolean;
  quantity?: number;
  availableQuantity?: number;
  validFrom?: string;
  validUntil?: string;
  imageUrl?: string;
}

// Gamification Types
export interface StarBalance {
  balance: number;
  studentProfileId: string;
  lastUpdated: string;
}

export interface StudentLevel {
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  levelName?: string;
  studentProfileId: string;
}

export interface AttendanceStreak {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn?: string;
  streakBonus: number;
  studentProfileId: string;
}

export interface RewardStoreItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  costStars: number;
  quantity: number;
  isActive: boolean;
}

export interface RewardRedemption {
  id: string;
  itemId: string;
  item: RewardStoreItem;
  studentProfileId: string;
  quantity: number;
  totalCostStars: number;
  status: "Pending" | "Approved" | "Delivered" | "Received" | "Cancelled";
  requestedAt: string;
  processedAt?: string;
}

export interface RequestRewardRedemptionRequest {
  itemId: string;
  quantity: number;
}

export interface StarTransaction {
  id: string;
  studentProfileId: string;
  amount: number;
  type: "Credit" | "Debit";
  reason?: string;
  transactionDate: string;
  relatedHomeworkId?: string;
  relatedMissionId?: string;
}

// Exam Types
export interface Exam {
  id: string;
  classId: string;
  className?: string;
  title: string;
  subject?: string;
  examType:
    | "Progress"
    | "Midterm"
    | "Final"
    | "Speaking"
    | "PlacementTest";
  date: string;
  startTime: string;
  endTime: string;
  maxScore?: number;
  description?: string;
  scheduledStartTime?: string;
  timeLimitMinutes?: number;
  durationMinutes: number;
  totalQuestions: number;
  allowLateStart: boolean;
  status: "Draft" | "Active" | "Completed" | "Cancelled";
  submitted?: boolean;
  attemptCount?: number;
  maxAttempts?: number;
  score?: number;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentProfileId: string;
  startedAt?: string;
  submittedAt?: string;
  finalScore?: number;
  status: "NotStarted" | "InProgress" | "Submitted" | "Graded";
  timeRemaining?: number;
  teacherComment?: string;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  orderIndex: number;
  questionText: string;
  questionType: "MultipleChoice" | "Essay" | "TrueFalse" | "ShortAnswer";
  options?: string;
  correctAnswer?: string;
  points: number;
  explanation?: string;
}

export interface ExamAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answer: string;
  pointsAwarded?: number;
  teacherFeedback?: string;
}

export interface StartExamSubmissionRequest {
  studentProfileId: string;
}

export interface SaveExamAnswerRequest {
  questionId: string;
  answer: string;
}

// Paginated Response Types
export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Query Parameters
export interface BaseQueryParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface HomeworkQueryParams extends BaseQueryParams {
  status?: string;
  classId?: string;
}

export interface TimetableQueryParams {
  from?: string;
  to?: string;
}

export interface RewardRedemptionQueryParams extends BaseQueryParams {
  status?: string;
}
