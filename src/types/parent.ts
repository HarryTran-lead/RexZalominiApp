// Parent types - matches BE API response structure

// ====== Overview ======

export interface ParentOverviewStatistics {
  totalStudents?: number;
  totalClasses?: number;
  upcomingSessions?: number;
  availableMakeupCredits?: number;
  pendingHomeworks?: number;
  pendingInvoices?: number;
  activeMissions?: number;
  totalStars?: number;
}

export interface ParentStudentProfile {
  id: string;
  displayName?: string;
  level?: string | null;
  totalStars?: number;
}

export interface ParentClassInfo {
  id: string;
  classCode?: string;
  className?: string;
  level?: string | null;
  teacherName?: string;
  schedule?: string;
  status?: string;
}

export interface ParentOverviewResponse {
  statistics?: ParentOverviewStatistics;
  studentProfiles?: ParentStudentProfile[];
  classes?: ParentClassInfo[];
  homeworkAssignments?: ParentHomeworkItem[];
  upcomingSessions?: any[];
}

// ====== Homework ======

export interface ParentHomeworkItem {
  id: string;
  title: string;
  description?: string | null;
  classId?: string;
  classCode?: string;
  classTitle?: string;
  sessionId?: string | null;
  dueAt?: string | null;
  book?: string | null;
  pages?: string | null;
  skills?: string | null;
  submissionType?: string;
  maxScore?: number | null;
  rewardStars?: number | null;
  status?: string;
  studentName?: string;
  studentProfileId?: string;
  submittedAt?: string | null;
  score?: number | null;
  teacherFeedback?: string | null;
}

// ====== Exam Results ======

export interface ParentExamResult {
  id: string;
  examId?: string;
  examTitle?: string;
  examType?: "Placement" | "Progress" | "Midterm" | "Final" | "Speaking";
  classId?: string;
  classCode?: string;
  classTitle?: string;
  studentProfileId?: string;
  studentName?: string;
  date?: string;
  score?: number | null;
  maxScore?: number | null;
  comment?: string | null;
  attachmentUrls?: string[] | null;
}

export interface ParentExamResultsResponse {
  items: ParentExamResult[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}

// ====== Notifications ======

export interface ParentNotification {
  id: string;
  recipientUserId?: string;
  recipientProfileId?: string;
  channel?: number;
  title?: string;
  content?: string;
  deeplink?: string | null;
  type?: string;
  isRead?: boolean;
  sentAt?: string;
  createdAt?: string;
  status?: number;
}

export interface ParentNotificationsResponse {
  items: ParentNotification[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}

// ====== Leave Request ======

export interface ParentLeaveRequest {
  studentProfileId: string;
  classId?: string;
  sessionDate?: string;
  endDate?: string | null;
  reason?: string | null;
}

export interface ParentLeaveRequestsResponse {
    id: string;
    studentProfileId: string;
    classId: string;
    sessionDate: string;
    endDate: string | null;
    reason: string;
    noticeHours: number;
    status: string;
    requestedAt: string;
    approvedAt: string | null;
}


// ====== Students with Makeup or Leave ======

export interface StudentWithMakeupOrLeave {
  id: string;
  studentProfileId: string;
  studentName: string;
  classId?: string;
  classCode?: string;
  classTitle?: string;
  type?: string;
  status?: string;
  sessionDate?: string;
}

export interface StudentsWithMakeupOrLeaveResponse {
  items: StudentWithMakeupOrLeave[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}

// ====== Attendance ======

export interface ParentAttendanceRecord {
  id: string;
  sessionId?: string;
  classCode?: string;
  classTitle?: string;
  sessionDate?: string;
  studentName?: string;
  studentProfileId?: string;
  attendanceStatus?: "Present" | "Absent" | "Makeup" | "NotMarked";
  note?: string | null;
}

export interface ParentAttendanceResponse {
  items: ParentAttendanceRecord[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}

// ====== Session Reports ======

export interface ParentSessionReport {
  id: string;
  sessionId?: string;
  classId?: string;
  classCode?: string;
  classTitle?: string;
  studentProfileId?: string;
  studentName?: string;
  feedback?: string;
  status?: string;
  reportDate?: string;
  sessionDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum PauseEnrollmentRequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
}

export enum PauseEnrollmentOutcome {
  CONTINUE_SAME_CLASS = 'ContinueSameClass',
  REASSIGN_EQUIVALENT_CLASS = 'ReassignEquivalentClass',
  CONTINUE_WITH_TUTORING = 'ContinueWithTutoring',
}

export interface PauseClassInfo {
  id: string;
  code: string;
  title: string;
  programId: string;
  programName: string;
  branchId: string;
  branchName: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface PauseEnrollmentRequest {
  id: string; 
  studentProfileId: string;
  classId: string | null; 
  pauseFrom: string;
  pauseTo: string;
  reason: string | null;
  status: PauseEnrollmentRequestStatus;
  requestedAt: string;
  approvedBy?: string | null; 
  approvedAt?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  outcome?: PauseEnrollmentOutcome | null;
  outcomeNote?: string | null;
  outcomeBy?: string | null;
  outcomeAt?: string | null;
  classes: PauseClassInfo[];
}

export interface PaginatedPauseRequests {
  items: PauseEnrollmentRequest[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
}

export interface CreatePauseRequestPayload {
  studentProfileId: string;
  pauseFrom: string;
  pauseTo: string;
  reason?: string | null;
}

export interface GetPauseRequestsParams {
  studentProfileId: string;
  status?: PauseEnrollmentRequestStatus;
  pageNumber?: number;
  pageSize?: number;
}

// ====== Makeup Credits ======

export type MakeupCreditStatus = "Pending" | "Scheduled" | "Used" | "Expired" | string;

export interface ParentMakeupCredit {
  id: string;
  studentProfileId?: string;
  studentName?: string;
  classId?: string;
  classCode?: string;
  classTitle?: string;
  status?: MakeupCreditStatus;
  sourceSessionDate?: string;
  makeupDate?: string;
  reason?: string | null;
  expiresAt?: string | null;
  usedAt?: string | null;
}

export interface ParentMakeupSuggestion {
  id: string;
  classId?: string;
  classCode?: string;
  classTitle?: string;
  teacherName?: string;
  branchName?: string;
  level?: string;
  makeupDate?: string;
  startTime?: string;
  endTime?: string;
  timeOfDay?: string;
  availableSlots?: number;
  [key: string]: unknown;
}

export interface ParentUseMakeupCreditPayload {
  studentProfileId: string;
  suggestionId?: string;
  makeupSlotId?: string;
  sessionId?: string;
  classSessionId?: string;
}

// ====== Parent Media ======

export interface ParentMediaItem {
  id: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  mediaType?: string;
  classId?: string;
  classCode?: string;
  classTitle?: string;
  studentProfileId?: string;
  studentName?: string;
  createdAt?: string;
}