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
