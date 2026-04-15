import { api } from "@/api/api";
import { ApiResponse } from "@/types/apiResponse";
import {
  PARENT_ENDPOINTS,
  LEAVE_REQUEST_ENDPOINTS,
  STUDENT_ENDPOINTS,
  MEDIA_ENDPOINTS,
} from "@/constants/apiURL";
import {
  CreatePauseRequestPayload,
  GetPauseRequestsParams,
  PaginatedPauseRequests,
  ParentOverviewResponse,
  ParentHomeworkItem,
  ParentExamResult,
  ParentNotification,
  ParentLeaveRequest,
  ParentLeaveRequestsResponse,
  ParentAttendanceRecord,
  ParentSessionReport,
  PauseEnrollmentRequest,
  ParentMakeupCredit,
  ParentMakeupSuggestion,
  ParentUseMakeupCreditPayload,
  ParentMediaItem,
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
    
    for (const key of Object.keys(inner)) {
      if (inner[key]?.items && Array.isArray(inner[key].items)) {
        return inner[key].items;
      }
    }
  }

  if (res?.items && Array.isArray(res.items)) return res.items;
  return [];
}

export const parentService = {
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
  return extractItems<ParentHomeworkItem>(res);
},

  /** GET /api/parent/exam-results */
  getExamResults: async (params?: {
    examType?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ParentExamResult[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.EXAM_RESULTS, { params });
    return extractItems<ParentExamResult>(res);
  },

  /** GET /api/parent/notifications */
  getNotifications: async (params?: {
    unreadOnly?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ParentNotification[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.NOTIFICATIONS, { params });
    return extractItems<ParentNotification>(res);
  },

  /** GET /api/parent/attendance */
  getAttendance: async (params?: {
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ParentAttendanceRecord[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.ATTENDANCE, { params });
    return extractItems<ParentAttendanceRecord>(res);
  },

  /** GET /api/session-reports */
  getSessionReports: async (params?: {
    fromDate?: string;
    toDate?: string;
    classId?: string;
  }): Promise<ParentSessionReport[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.SESSION_REPORTS, { params });
    return extractItems<ParentSessionReport>(res);
  },

  /** GET /api/leave-requests — list leave requests */
  getLeaveRequests: async (params?: {
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ParentLeaveRequestsResponse[]> => {
    const res = await api.get<any>(LEAVE_REQUEST_ENDPOINTS.LIST, { params });
    return extractItems<ParentLeaveRequestsResponse>(res);
  },

  /** POST /api/leave-requests — create a leave request */
  createLeaveRequest: async (
    payload: ParentLeaveRequest
  ): Promise<ApiResponse<ParentLeaveRequest>> => {
    return await api.post<ApiResponse<ParentLeaveRequest>>(
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
    return {
      items: Array.isArray(data?.items) ? data.items : [],
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
    return extractItems<ParentMakeupCredit>(res);
  },

  /** GET /api/makeup-credits/{id}/suggestions */
  getMakeupSuggestions: async (
    makeupCreditId: string,
    params?: {
      makeupDate?: string;
      timeOfDay?: string;
    }
  ): Promise<ParentMakeupSuggestion[]> => {
    const res = await api.get<any>(PARENT_ENDPOINTS.MAKEUP_CREDIT_SUGGESTIONS(makeupCreditId), {
      params,
    });
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

  /** GET /api/media for parent gallery */
  getMedia: async (params?: {
    studentProfileId?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ParentMediaItem[]> => {
    const res = await api.get<any>(MEDIA_ENDPOINTS.LIST, { params });
    return extractItems<ParentMediaItem>(res);
  },

  /** GET /api/media/{id} */
  getMediaDetail: async (id: string): Promise<ParentMediaItem | null> => {
    const res = await api.get<any>(MEDIA_ENDPOINTS.DETAIL(id));
    const data = res?.data ?? res;
    if (!data || Array.isArray(data)) return null;
    return data as ParentMediaItem;
  },
};
