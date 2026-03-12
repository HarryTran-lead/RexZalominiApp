// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL,
  TIMEOUT: 30000,
};

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REFRESH_TOKEN: "/auth/refresh-token",
  CHANGE_PASSWORD: "/auth/change-password",
  PROFILES: "/auth/profiles",
  FORGET_PASSWORD: "/auth/forget-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_PARENT_PIN: "/auth/profiles/verify-parent-pin",
  SELECT_STUDENT: "/auth/profiles/select-student",
  CHANGE_PIN: "/auth/change-pin",
  REQUEST_PIN_RESET: "/auth/profiles/request-pin-reset",
};

// Student Endpoints
export const STUDENT_ENDPOINTS = {
  TIMETABLE: "/students/timetable",
  CLASSES: "/students/classes",
  HOMEWORK_MY: "/students/homework/my",
};

// Teacher Endpoints
export const TEACHER_ENDPOINTS = {
  TIMETABLE: "/teacher/timetable",
  CLASSES: "/teacher/classes",
  TEACHER_CLASSES: "/teacher/classes",
  TEACHER_CLASS_STUDENTS: (classId: string) =>
    `/teacher/classes/${classId}/students`,
  HOMEWORK_LIST: "/homework",
  HOMEWORK_DETAIL: (id: string) => `/homework/${id}`,
  HOMEWORK_SUBMISSIONS: "/homework/submissions",
  HOMEWORK_SUBMISSION_DETAIL: (homeworkStudentId: string) =>
    `/homework/submissions/${homeworkStudentId}`,
  SESSION_REPORTS: "/session-reports",
  SESSION_REPORT_DETAIL: (id: string) => `/session-reports/${id}`,
  TEACHER_MONTHLY_SESSION_REPORT: (teacherUserId: string) =>
    `/session-reports/teachers/${teacherUserId}/monthly`,
  MONTHLY_REPORTS: "/monthly-reports",
  MONTHLY_REPORT_DETAIL: (reportId: string) =>
    `/monthly-reports/${reportId}`,
};

// Attendance Endpoints
export const ATTENDANCE_ENDPOINTS = {
  INIT: (sessionId: string) => `/attendance/${sessionId}`,
  GET: (sessionId: string) => `/attendance/${sessionId}`,
  GET_STUDENTS: "/attendance/students",
  UPDATE_STUDENT: (sessionId: string, studentProfileId: string) =>
    `/attendance/${sessionId}/students/${studentProfileId}`,
};

// Parent Endpoints
export const PARENT_ENDPOINTS = {
  TIMETABLE: "/parent/timetable",
  OVERVIEW: "/parent/overview",
  ATTENDANCE: "/parent/attendance",
  EXAM_RESULTS: "/parent/exam-results",
  NOTIFICATIONS: "/parent/notifications",
  STUDENTS_MAKEUP_OR_LEAVE: "/parent/students-with-makeup-or-leave",
  INVOICES: "/parent/invoices",
  MEDIA: "/parent/media",
};

// Leave Request Endpoints
export const LEAVE_REQUEST_ENDPOINTS = {
  LIST: "/leave-requests",
  DETAIL: (id: string) => `/leave-requests/${id}`,
};

// Homework Endpoints
export const HOMEWORK_ENDPOINTS = {
  LIST: "/homework",
  SUBMISSIONS: "/homework/submissions",
};

// Session Reports Endpoints
export const SESSION_REPORTS_ENDPOINTS = {
  LIST: "/session-reports",
  DETAIL: (id: string) => `/session-reports/${id}`,
};

// All API Endpoints
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  STUDENT: STUDENT_ENDPOINTS,
  TEACHER: TEACHER_ENDPOINTS,
  PARENT: PARENT_ENDPOINTS,
  LEAVE_REQUEST: LEAVE_REQUEST_ENDPOINTS,
};
