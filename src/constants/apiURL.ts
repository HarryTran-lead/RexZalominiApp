// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL,
  TIMEOUT: 30000,
};

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGIN_PHONE: "/auth/login-phone",
  SEND_PHONE_OTP: "/auth/phone-otp/send",
  VERIFY_PHONE_OTP: "/auth/phone-otp/verify",
  REFRESH_TOKEN: "/auth/refresh-token",
  CHANGE_PASSWORD: "/auth/change-password",
  PROFILES: "/auth/profiles",
  FORGET_PASSWORD: "/auth/forget-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_PARENT_PIN: "/auth/profiles/verify-parent-pin",
  SELECT_STUDENT: "/auth/profiles/select-student",
  CHANGE_PIN: "/auth/change-pin",
  REQUEST_PIN_RESET: "/auth/profiles/request-pin-reset",
  REQUEST_PIN_RESET_ZALO_OTP: "/auth/profiles/request-pin-reset-zalo-otp",
  VERIFY_PIN_RESET_ZALO_OTP: "/auth/profiles/verify-pin-reset-zalo-otp",
  RESET_PIN: "/auth/reset-pin",
};

export const ME_ENDPOINTS = {
  GET: "/me",
  UPDATE: "/me",
};

export const FILE_ENDPOINTS = {
  AVATAR: "/files/avatar",
  UPLOAD: "/files/upload",
};

export const BLOG_ENDPOINTS = {
  PUBLISHED: "/blogs/published",
  DETAIL: (id: string) => `/blogs/${id}`,
};

export const MEDIA_ENDPOINTS = {
  LIST: "/media",
  DETAIL: (id: string) => `/media/${id}`,
};

export const MONTHLY_REPORT_ENDPOINTS = {
  LIST: "/monthly-reports",
  DETAIL: (reportId: string) => `/monthly-reports/${reportId}`,
};

// Student Endpoints
export const STUDENT_ENDPOINTS = {
  TIMETABLE: "/students/timetable",
  CLASSES: "/students/classes",
  HOMEWORK_MY: "/students/homework/my",
  HOMEWORK_SUBMITTED: "/students/homework/submitted",
  HOMEWORK_DETAIL: (homeworkStudentId: string) => `/students/homework/${homeworkStudentId}`,
  HOMEWORK_ATTEMPT_DETAIL: (homeworkStudentId: string, attemptNumber: number) =>
    `/students/homework/${homeworkStudentId}/attempts/${attemptNumber}`,
  HOMEWORK_SUBMIT: "/students/homework/submit",
  HOMEWORK_MULTIPLE_CHOICE_SUBMIT: "/students/homework/multiple-choice/submit",
  HOMEWORK_HINT: (homeworkStudentId: string) => `/students/homework/${homeworkStudentId}/hint`,
  HOMEWORK_RECOMMENDATIONS: (homeworkStudentId: string) => `/students/homework/${homeworkStudentId}/recommendations`,
  HOMEWORK_FEEDBACK_MY: "/students/homework/feedback/my",
};

// Teacher Endpoints
export const TEACHER_ENDPOINTS = {
  TIMETABLE: "/teacher/timetable",
  CLASSES: "/teacher/classes",
  TEACHER_CLASSES: "/teacher/classes",
  CLASS_STUDENTS: (classId: string) => `/classes/${classId}/students`,
  TEACHER_CLASS_STUDENTS: (classId: string) =>
    `/teacher/classes/${classId}/students`,
  HOMEWORK_LIST: "/homework",
  HOMEWORK_DETAIL: (id: string) => `/homework/${id}`,
  HOMEWORK_SUBMISSIONS: "/homework/submissions",
  HOMEWORK_SUBMISSION_DETAIL: (homeworkStudentId: string) =>
    `/homework/submissions/${homeworkStudentId}`,
  HOMEWORK_SUBMISSION_GRADE: (homeworkStudentId: string) =>
    `/homework/submissions/${homeworkStudentId}/grade`,
  SESSION_REPORTS: "/session-reports",
  SESSION_REPORT_DETAIL: (id: string) => `/session-reports/${id}`,
  SESSION_REPORT_SUBMIT: (id: string) => `/session-reports/${id}/submit`,
  SESSION_REPORT_AI_ENHANCE: "/session-reports/ai/enhance-feedback",
  TEACHER_MONTHLY_SESSION_REPORT: (teacherUserId: string) =>
    `/session-reports/teachers/${teacherUserId}/monthly`,
  MONTHLY_REPORTS: MONTHLY_REPORT_ENDPOINTS.LIST,
  MONTHLY_REPORT_DETAIL: (reportId: string) =>
    MONTHLY_REPORT_ENDPOINTS.DETAIL(reportId),
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
  SESSION_REPORTS: "/session-reports",
  ATTENDANCE: "/parent/attendance",
  EXAM_RESULTS: "/parent/exam-results",
  NOTIFICATIONS: "/parent/notifications",
  STUDENTS_MAKEUP_OR_LEAVE: "/parent/students-with-makeup-or-leave",
  INVOICES: "/parent/invoices",
  MEDIA: "/parent/media",
  PAUSE_ENROLLMENT_REQUESTS: "/pause-enrollment-requests",
  PAUSE_ENROLLMENT_REQUEST_DETAIL: (id: string) => `/pause-enrollment-requests/${id}`,
  MAKEUP_CREDITS: "/makeup-credits",
  MAKEUP_CREDIT_AVAILABLE_SESSIONS: (id: string) => `/makeup-credits/${id}/parent/get-available-sessions`,
  // Backward-compatible alias for old callsites.
  MAKEUP_CREDIT_SUGGESTIONS: (id: string) => `/makeup-credits/${id}/parent/get-available-sessions`,
  MAKEUP_CREDIT_USE: (id: string) => `/makeup-credits/${id}/use`,
  MAKEUP_CREDIT_ALLOCATIONS: "/makeup-credits/allocations",
};

export const NOTIFICATION_ENDPOINTS = {
  LIST: "/notifications",
  MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_AS_READ: "/notifications/read",
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

// Gamification Endpoints
export const GAMIFICATION_ENDPOINTS = {
  STARS_BALANCE_ME: "/gamification/stars/balance/me",
  LEVEL_ME: "/gamification/level/me",
  ATTENDANCE_STREAK_ME: "/gamification/attendance-streak/me",
  ATTENDANCE_CHECKIN: "/gamification/attendance-streak/check-in",
  MISSIONS_ME_PROGRESS: "/missions/me/progress",
  REWARD_STORE_ITEMS: "/gamification/reward-store/items/active",
  AVAILABLE_REWARDS: "/gamification/rewards/available",
  REWARD_REDEMPTIONS: "/gamification/reward-redemptions",
  REWARD_REDEMPTIONS_ME: "/gamification/reward-redemptions/me",
  REWARD_REDEMPTION_APPROVE: (id: string) => `/gamification/reward-redemptions/${id}/approve`,
  REWARD_REDEMPTION_CANCEL: (id: string) => `/gamification/reward-redemptions/${id}/cancel`,
  REWARD_REDEMPTION_CONFIRM: (id: string) => `/gamification/reward-redemptions/${id}/confirm-received`,
  REDEEM_REWARD: (rewardId: string) => `/gamification/rewards/${rewardId}/redeem`,
  STARS_TRANSACTIONS: "/gamification/stars/transactions",
};

// Exam Endpoints
export const EXAM_ENDPOINTS = {
  STUDENTS: "/exams/students",
  LIST: "/exams",
  DETAIL: (examId: string) => `/exams/${examId}`,
  START_SUBMISSION: (examId: string) => `/exams/${examId}/submissions/start`,
  SAVE_ANSWERS: (examId: string, submissionId: string) => `/exams/${examId}/submissions/${submissionId}/answers`,
  SUBMIT: (examId: string, submissionId: string) => `/exams/${examId}/submissions/${submissionId}/submit`,
  SUBMISSIONS: (examId: string) => `/exams/${examId}/submissions`,
  RESULTS: "/exams/results",
  RESULT_DETAIL: (id: string) => `/exams/results/${id}`,
};

// Session Reports Endpoints
export const SESSION_REPORTS_ENDPOINTS = {
  LIST: "/session-reports",
  DETAIL: (id: string) => `/session-reports/${id}`,
};

// Ticket Endpoints
export const TICKET_ENDPOINTS = {
  LIST: "/tickets",
  CREATE: "/tickets",
  DETAIL: (id: string) => `/tickets/${id}`,
};

// All API Endpoints
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  ME: ME_ENDPOINTS,
  FILE: FILE_ENDPOINTS,
  BLOG: BLOG_ENDPOINTS,
  MEDIA: MEDIA_ENDPOINTS,
  MONTHLY_REPORT: MONTHLY_REPORT_ENDPOINTS,
  STUDENT: STUDENT_ENDPOINTS,
  TEACHER: TEACHER_ENDPOINTS,
  PARENT: PARENT_ENDPOINTS,
  LEAVE_REQUEST: LEAVE_REQUEST_ENDPOINTS,
  GAMIFICATION: GAMIFICATION_ENDPOINTS,
  EXAM: EXAM_ENDPOINTS,
  HOMEWORK: HOMEWORK_ENDPOINTS,
  NOTIFICATION: NOTIFICATION_ENDPOINTS,
  TICKET: TICKET_ENDPOINTS,
};
