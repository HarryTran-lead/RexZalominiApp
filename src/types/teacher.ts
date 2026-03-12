export interface TeacherClass {
  id: string;
  code: string;
  title: string;
  branchId?: string;
  branchName?: string;
  programId?: string;
  programName?: string;
  mainTeacherId?: string;
  mainTeacherName?: string;
  assistantTeacherId?: string;
  assistantTeacherName?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  capacity?: number;
}

export interface ClassStudent {
  id: string;
  studentProfileId: string;
  studentName: string;
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  parentName?: string;
  parentPhone?: string;
  status?: string;
  enrolledAt?: string;
}

export interface SessionReport {
  id: string;
  sessionId?: string;
  sessionDate?: string;
  classId?: string;
  classCode?: string;
  classTitle?: string;
  studentProfileId?: string;
  studentName?: string;
  teacherUserId?: string;
  teacherName?: string;
  reportDate?: string;
  feedback?: string;
}

export interface MonthlySessionReport {
  month: number;
  year: number;
  totalSessions?: number;
  completedSessions?: number;
  cancelledSessions?: number;
  totalStudents?: number;
  averagePresence?: number;
  reports?: SessionReport[];
}

export interface MonthlyReport {
  id: string;
  reportId?: string;
  classId?: string;
  classCode?: string;
  className?: string;
  subjectName?: string;
  month?: number;
  year?: number;
  teacherName?: string;
  status?: string;
  summary?: string;
  totalSessions?: number;
  completedSessions?: number;
  averageGrade?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Homework {
  id: string;
  title: string;
  description?: string;
  classId?: string;
  classCode?: string;
  classTitle?: string;
  sessionId?: string;
  dueAt?: string;
  book?: string | null;
  pages?: string | null;
  skills?: string | null;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId?: string;
  homeworkTitle?: string;
  studentProfileId: string;
  studentName?: string;
  submittedAt?: string;
  grade?: number;
  maxGrade?: number;
  status?: string;
  feedback?: string;
  fileUrl?: string;
}
