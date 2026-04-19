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

export enum LeaveRequestStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Cancelled = "Cancelled",
}

export interface ParentLeaveRequest {
  studentProfileId: string;
  classId: string;
  sessionDate: string;
  endDate?: string | null;
  reason?: string | null;
}

export interface CreateLeaveRequestPayload {
  studentProfileId: string;
  classId: string;
  sessionDate: string;
  endDate?: string | null;
  reason?: string;
}

export interface LeaveRequest {
  id: string;
  studentProfileId: string;
  classId: string;
  sessionDate: string;
  endDate: string | null;
  reason: string;
  noticeHours: number;
  status: LeaveRequestStatus;
  requestedAt: string;
  approvedAt: string | null;
}

export type ParentLeaveRequestsResponse = LeaveRequest;

// ====== Students with Makeup or Leave ======

export interface StudentSummary {
  id: string;
  userId: string;
  displayName: string;
  userEmail?: string;
  hasLeaveRequest: boolean;
  hasMakeupCredit: boolean;
  leaveRequestCount: number;
  makeupCreditCount: number;
}

export interface StudentsWithMakeupOrLeaveResponse {
  items: StudentSummary[];
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
  attendanceStatus?: AttendanceStatus;
  note?: string | null;
}

export enum AttendanceStatus {
  Present = "Present",
  Absent = "Absent",
  Makeup = "Makeup",
  NotMarked = "NotMarked",
}

export interface AttendanceHistoryItem {
  id: string;
  sessionId: string;
  studentProfileId: string;
  attendanceStatus: AttendanceStatus;
  absenceType?: string;
  markedAt: string;
  note?: string;
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

export interface ParentMonthlyReport {
  id: string;
  studentProfileId?: string;
  studentName?: string;
  classId?: string;
  classCode?: string;
  className?: string;
  classTitle?: string;
  programId?: string;
  programName?: string;
  jobId?: string;
  month?: number;
  year?: number;
  status?: string;
  summary?: string;
  feedback?: string;
  draftContent?: string;
  finalContent?: string;
  publishedAt?: string;
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

export enum MakeupCreditStatus {
  Available = "Available",
  Used = "Used",
  Expired = "Expired",
}

export type ParentMakeupCreditStatus = MakeupCreditStatus | "Pending" | "Scheduled" | string;

export interface ParentMakeupCredit {
  id: string;
  studentProfileId: string;
  sourceSessionId?: string;
  studentName?: string;
  classId?: string;
  classCode?: string;
  classTitle?: string;
  status?: ParentMakeupCreditStatus;
  createdReason?: string;
  sourceSessionDate?: string;
  makeupDate?: string;
  reason?: string | null;
  expiresAt?: string | null;
  usedSessionId?: string | null;
  usedAt?: string | null;
  createdAt?: string;
}

export interface ParentMakeupSuggestion {
  id?: string;
  sessionId: string;
  classId: string;
  classCode: string;
  classTitle: string;
  programName: string;
  programCode: string;
  branchId: string;
  plannedDatetime: string;
  plannedEndDatetime: string;
  [key: string]: unknown;
}

export interface ParentUseMakeupCreditPayload {
  studentProfileId: string;
  classId: string;
  targetSessionId: string;
}

export interface MakeupAllocation {
  id: string;
  makeupCreditId: string;
  targetSessionId: string;
  assignedBy: string;
  assignedAt: string;
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