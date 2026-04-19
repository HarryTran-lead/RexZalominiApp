import { api } from "@/api/api";
import { ApiResponse } from "@/types/apiResponse";
import {
  PARENT_ENDPOINTS,
  LEAVE_REQUEST_ENDPOINTS,
  STUDENT_ENDPOINTS,
  MEDIA_ENDPOINTS,
  MONTHLY_REPORT_ENDPOINTS,
  ATTENDANCE_ENDPOINTS,
} from "@/constants/apiURL";
import {
  AttendanceHistoryItem,
  CreateLeaveRequestPayload,
  CreatePauseRequestPayload,
  GetPauseRequestsParams,
  LeaveRequest,
  MakeupAllocation,
  PaginatedPauseRequests,
  ParentOverviewResponse,
  ParentHomeworkItem,
  ParentExamResult,
  ParentLeaveRequestsResponse,
  ParentNotification,
  ParentAttendanceRecord,
  ParentSessionReport,
  PauseEnrollmentRequest,
  ParentMakeupCredit,
  ParentMakeupSuggestion,
  ParentUseMakeupCreditPayload,
  ParentMediaItem,
  ParentMonthlyReport,
  StudentSummary,
} from "@/types/parent";

/**
 * Extracts an array of items from different API response shapes:
 * - Direct array: [item1, item2]
 * - Wrapped: { isSuccess, data: [items] } or { isSuccess, data: { items: [...] } }
 * - Direct paginated: { items: [...] }
 */
function extractItems<T>(res: any): T[] {
  if (Array.isArray(res)) return res;

  if (res?.data !== undefined) {
    const inner = res.data;
    if (Array.isArray(inner)) return inner;
    if (inner?.items && Array.isArray(inner.items)) return inner.items;

    if (inner && typeof inner === "object") {
      for (const key of Object.keys(inner)) {
        if (inner[key]?.items && Array.isArray(inner[key].items)) {
          return inner[key].items;
        }
      }
    }
  }

  if (res?.items && Array.isArray(res.items)) return res.items;
  return [];
}

function extractObject<T>(res: any): T | null {
  const data = res?.data ?? res;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  return data as T;
}

function toTimestamp(value: unknown): number {
  if (typeof value === "string" && value.trim()) {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return 0;
}

function toMonthYearTimestamp(month?: number, year?: number): number {
  if (!month || !year) return 0;
  return Date.UTC(year, month - 1, 1);
}

function sortByNewest<T extends Record<string, unknown>>(items: T[], dateKeys: string[]): T[] {
  return [...items].sort((a, b) => {
    const bTime = dateKeys.reduce((latest, key) => Math.max(latest, toTimestamp(b[key])), 0);
    const aTime = dateKeys.reduce((latest, key) => Math.max(latest, toTimestamp(a[key])), 0);
    return bTime - aTime;
  });
}

function sortMonthlyReportsByNewest(items: ParentMonthlyReport[]): ParentMonthlyReport[] {
  return [...items].sort((a, b) => {
    const bTime = Math.max(
      toTimestamp(b.publishedAt),
      toTimestamp(b.updatedAt),
      toTimestamp(b.createdAt),
      toMonthYearTimestamp(b.month, b.year)
    );
    const aTime = Math.max(
      toTimestamp(a.publishedAt),
      toTimestamp(a.updatedAt),
      toTimestamp(a.createdAt),
      toMonthYearTimestamp(a.month, a.year)
    );
    return bTime - aTime;
  });
}

export const parentService = {
  /** GET /api/parent/students-with-makeup-or-leave */
  getStudentsWithMakeupOrLeave: async (): Promise<StudentSummary[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.STUDENTS_MAKEUP_OR_LEAVE);
    return extractItems<StudentSummary>(res);
  },

  /** GET /api/parent/overview — dashboard stats, students, classes */
  getOverview: async (params?: {
    classId?: string;
    sessionId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<ParentOverviewResponse> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.OVERVIEW, { params });
    // Response: { isSuccess, data: { statistics, studentProfiles, classes, ... } }
    return res?.data ?? res ?? {};
  },

  /** GET /api/parent/overview — extract homework items from overview */
  getHomework: async (params?: {
  classId?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<ParentHomeworkItem[]> => {
  const res = await api.get<any>(STUDENT_ENDPOINTS.HOMEWORK_MY, { params });
  return sortByNewest(extractItems<ParentHomeworkItem>(res), ["submittedAt", "gradedAt", "dueAt"]);
},

  /** GET /api/parent/exam-results */
  getExamResults: async (params?: {
    examType?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ParentExamResult[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.EXAM_RESULTS, { params });
    return sortByNewest(extractItems<ParentExamResult>(res), ["date", "createdAt", "updatedAt"]);
  },

  /** GET /api/parent/notifications */
  getNotifications: async (params?: {
    unreadOnly?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ParentNotification[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.NOTIFICATIONS, { params });
    return sortByNewest(extractItems<ParentNotification>(res), ["createdAt", "sentAt"]);
  },

  /** GET /api/parent/attendance */
  getAttendance: async (params?: {
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ParentAttendanceRecord[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.ATTENDANCE, { params });
    return sortByNewest(extractItems<ParentAttendanceRecord>(res), ["sessionDate", "createdAt", "updatedAt"]);
  },

  /** GET /api/session-reports */
  getSessionReports: async (params?: {
    fromDate?: string;
    toDate?: string;
    classId?: string;
  }): Promise<ParentSessionReport[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.SESSION_REPORTS, { params });
    return sortByNewest(extractItems<ParentSessionReport>(res), ["updatedAt", "reportDate", "sessionDate", "createdAt"]);
  },

  /** GET /api/monthly-reports */
  getMonthlyReports: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    studentProfileId?: string;
  }): Promise<ParentMonthlyReport[]> => {
    const res = await api.get<any>(MONTHLY_REPORT_ENDPOINTS.LIST, { params });
    return sortMonthlyReportsByNewest(extractItems<ParentMonthlyReport>(res));
  },

  /** GET /api/monthly-reports/{reportId} */
  getMonthlyReportById: async (reportId: string): Promise<ParentMonthlyReport | null> => {
    const res = await api.get<any>(MONTHLY_REPORT_ENDPOINTS.DETAIL(reportId));
    const data = res?.data ?? res;

    if (!data || Array.isArray(data)) return null;

    if (data?.report && typeof data.report === "object" && !Array.isArray(data.report)) {
      return data.report as ParentMonthlyReport;
    }

    if (data?.monthlyReport && typeof data.monthlyReport === "object" && !Array.isArray(data.monthlyReport)) {
      return data.monthlyReport as ParentMonthlyReport;
    }

    return data as ParentMonthlyReport;
  },

  /** GET /api/leave-requests — list leave requests */
  getLeaveRequests: async (params?: {
    studentProfileId?: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<LeaveRequest[]> => {
    const res = await api.get<any>(LEAVE_REQUEST_ENDPOINTS.LIST, { params });
    return sortByNewest(extractItems<LeaveRequest>(res), ["requestedAt", "sessionDate", "approvedAt"]);
  },

  /** POST /api/leave-requests — create a leave request */
  createLeaveRequest: async (
    payload: CreateLeaveRequestPayload
  ): Promise<ApiResponse<ParentLeaveRequestsResponse>> => {
    return await api.post<ApiResponse<ParentLeaveRequestsResponse>>(
      LEAVE_REQUEST_ENDPOINTS.LIST,
      payload
    );
  },

  /** GET /api/pause-enrollment-requests — list pause requests */
  getPauseRequests: async (
    params: GetPauseRequestsParams
  ): Promise<PaginatedPauseRequests> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.PAUSE_ENROLLMENT_REQUESTS, {
      params,
    });

    const data = res?.data ?? res;
    const items = Array.isArray(data?.items)
      ? sortByNewest(data.items as PauseEnrollmentRequest[], ["requestedAt", "approvedAt", "cancelledAt", "outcomeAt"])
      : [];
    return {
      items,
      pageNumber: Number(data?.pageNumber ?? params.pageNumber ?? 1),
      totalPages: Number(data?.totalPages ?? 1),
      totalCount: Number(data?.totalCount ?? 0),
    };
  },

  /** POST /api/pause-enrollment-requests — create a long-term pause request */
  createPauseRequest: async (
    payload: CreatePauseRequestPayload
  ): Promise<ApiResponse<PauseEnrollmentRequest>> => {
    return await api.post<ApiResponse<PauseEnrollmentRequest>>(
      PARENT_ENDPOINTS.PAUSE_ENROLLMENT_REQUESTS,
      payload
    );
  },

  /** GET /api/makeup-credits?studentProfileId={id} */
  getMakeupCredits: async (params: {
    studentProfileId: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ParentMakeupCredit[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.MAKEUP_CREDITS, { params });
    return sortByNewest(extractItems<ParentMakeupCredit>(res), ["createdAt", "sourceSessionDate", "makeupDate", "usedAt"]);
  },

  /** GET /api/makeup-credits/{id}/parent/get-available-sessions */
  getMakeupSuggestions: async (
    makeupCreditId: string,
    params?: {
      makeupDate?: string;
      timeOfDay?: string;
    }
  ): Promise<ParentMakeupSuggestion[]> => {
    const res = await api.get<any>(
      PARENT_ENDPOINTS.MAKEUP_CREDIT_AVAILABLE_SESSIONS(makeupCreditId),
      { params }
    );
    return extractItems<ParentMakeupSuggestion>(res);
  },

  /** Alias for readability in new parent makeup flow */
  getAvailableMakeupSessions: async (makeupCreditId: string): Promise<ParentMakeupSuggestion[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.MAKEUP_CREDIT_AVAILABLE_SESSIONS(makeupCreditId));
    return extractItems<ParentMakeupSuggestion>(res);
  },

  /** POST /api/makeup-credits/{id}/use */
  useMakeupCredit: async (
    makeupCreditId: string,
    payload: ParentUseMakeupCreditPayload
  ): Promise<ApiResponse<unknown>> => {
    return await api.post<ApiResponse<unknown>>(
      PARENT_ENDPOINTS.MAKEUP_CREDIT_USE(makeupCreditId),
      payload
    );
  },

  /** GET /api/makeup-credits/allocations?studentProfileId=... */
  getMakeupAllocations: async (params: {
    studentProfileId: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<MakeupAllocation[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.MAKEUP_CREDIT_ALLOCATIONS, { params });
    return sortByNewest(extractItems<MakeupAllocation>(res), ["assignedAt"]);
  },

  /** GET /api/attendance/students?studentProfileId=... */
  getAttendanceHistory: async (params: {
    studentProfileId: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<AttendanceHistoryItem[]> => {
    const res = await api.get<any>(ATTENDANCE_ENDPOINTS.GET_STUDENTS, { params });
    return sortByNewest(extractItems<AttendanceHistoryItem>(res), ["markedAt"]);
  },

  /** GET /api/media for parent gallery */
  getMedia: async (params?: {
    studentProfileId?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ParentMediaItem[]> => {
    const res = await api.get<any>(MEDIA_ENDPOINTS.LIST, { params });
    return sortByNewest(extractItems<ParentMediaItem>(res), ["createdAt", "publishedAt", "updatedAt"]);
  },

  /** GET /api/media/{id} */
  getMediaDetail: async (id: string): Promise<ParentMediaItem | null> => {
    const res = await api.get<any>(MEDIA_ENDPOINTS.DETAIL(id));
    return extractObject<ParentMediaItem>(res);
  },
};
