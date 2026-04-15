import { api } from "@/api/api";
import { ApiResponse } from "@/types/apiResponse";
import { TEACHER_ENDPOINTS } from "@/constants/apiURL";
import {
  AIEnhanceFeedbackRequest,
  CreateSessionReportRequest,
  MonthlyReport,
  MonthlySessionReport,
  SessionReport,
  SessionReportAiEnhanceData,
  UpdateSessionReportRequest,
} from "@/types/teacher";

function extractItems<T>(payload: unknown, depth = 0): T[] {
  if (depth > 5) return [];

  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.items)) return record.items as T[];

  for (const value of Object.values(record)) {
    const nested = extractItems<T>(value, depth + 1);
    if (nested.length > 0) return nested;
  }

  return [];
}

function extractObject(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

  const record = payload as Record<string, unknown>;
  const data = record.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const dataRecord = data as Record<string, unknown>;
    if (dataRecord.report && typeof dataRecord.report === "object" && !Array.isArray(dataRecord.report)) {
      return dataRecord.report as Record<string, unknown>;
    }
    if (
      dataRecord.monthlyReport &&
      typeof dataRecord.monthlyReport === "object" &&
      !Array.isArray(dataRecord.monthlyReport)
    ) {
      return dataRecord.monthlyReport as Record<string, unknown>;
    }
    return dataRecord;
  }

  if (record.report && typeof record.report === "object" && !Array.isArray(record.report)) {
    return record.report as Record<string, unknown>;
  }
  if (record.monthlyReport && typeof record.monthlyReport === "object" && !Array.isArray(record.monthlyReport)) {
    return record.monthlyReport as Record<string, unknown>;
  }

  return record;
}

/**
 * GET /api/session-reports
 * Returns all session reports visible to the authenticated user.
 */
export const getSessionReports = async (): Promise<SessionReport[]> => {
  const res = await api.get<ApiResponse<SessionReport[]>>(
    TEACHER_ENDPOINTS.SESSION_REPORTS
  );
  return Array.isArray(res?.data) ? res.data : (res?.data as any)?.sessionReports?.items ?? [];
};

/**
 * POST /api/session-reports
 * Creates a new daily/session report.
 */
export const createSessionReport = async (
  payload: CreateSessionReportRequest
): Promise<SessionReport | null> => {
  const res = await api.post<ApiResponse<SessionReport>>(
    TEACHER_ENDPOINTS.SESSION_REPORTS,
    payload
  );
  return res?.data ?? null;
};

/**
 * GET /api/session-reports/{id}
 * Returns a single session report by ID.
 */
export const getSessionReportById = async (
  id: string
): Promise<SessionReport | null> => {
  const res = await api.get<ApiResponse<SessionReport>>(
    TEACHER_ENDPOINTS.SESSION_REPORT_DETAIL(id)
  );
  return res?.data ?? null;
};

/**
 * PUT /api/session-reports/{id}
 * Updates an existing report content.
 */
export const updateSessionReport = async (
  id: string,
  payload: UpdateSessionReportRequest
): Promise<SessionReport | null> => {
  const res = await api.put<ApiResponse<SessionReport>>(
    TEACHER_ENDPOINTS.SESSION_REPORT_DETAIL(id),
    payload
  );
  return res?.data ?? null;
};

/**
 * POST /api/session-reports/{id}/submit
 * Sends report for review/approval flow.
 */
export const submitSessionReport = async (id: string): Promise<SessionReport | null> => {
  const res = await api.post<ApiResponse<SessionReport>>(
    TEACHER_ENDPOINTS.SESSION_REPORT_SUBMIT(id)
  );
  return res?.data ?? null;
};

/**
 * POST /api/session-reports/ai/enhance-feedback
 * Enhances teacher draft feedback using AI.
 */
export const enhanceSessionReportFeedback = async (
  payload: AIEnhanceFeedbackRequest
): Promise<SessionReportAiEnhanceData | null> => {
  const res = await api.post<ApiResponse<SessionReportAiEnhanceData>>(
    TEACHER_ENDPOINTS.SESSION_REPORT_AI_ENHANCE,
    payload
  );

  if (!res?.data) return null;

  if ((res.data as SessionReportAiEnhanceData).enhancedFeedback) {
    return res.data as SessionReportAiEnhanceData;
  }

  return (res.data as { data?: SessionReportAiEnhanceData })?.data ?? null;
};

/**
 * GET /api/session-reports/teachers/{teacherUserId}/monthly
 * Returns aggregated monthly session reports for a specific teacher.
 */
export const getTeacherMonthlySessionReports = async (
  teacherUserId: string
): Promise<MonthlySessionReport[]> => {
  const res = await api.get<ApiResponse<MonthlySessionReport[]>>(
    TEACHER_ENDPOINTS.TEACHER_MONTHLY_SESSION_REPORT(teacherUserId)
  );
  return Array.isArray(res?.data) ? res.data : (res?.data as any)?.items ?? [];
};

/**
 * GET /api/monthly-reports
 * Returns all monthly reports visible to the authenticated user.
 */
export const getMonthlyReports = async (params?: {
  pageNumber?: number;
  pageSize?: number;
}): Promise<MonthlyReport[]> => {
  const res = await api.get<unknown>(TEACHER_ENDPOINTS.MONTHLY_REPORTS, { params });
  return extractItems<MonthlyReport>(res);
};

/**
 * GET /api/monthly-reports/{reportId}
 * Returns a single monthly report by ID.
 */
export const getMonthlyReportById = async (
  reportId: string
): Promise<MonthlyReport | null> => {
  const res = await api.get<unknown>(
    TEACHER_ENDPOINTS.MONTHLY_REPORT_DETAIL(reportId)
  );
  const data = extractObject(res);
  if (!data) return null;
  return data as MonthlyReport;
};

export const reportService = {
  getSessionReports,
  createSessionReport,
  getSessionReportById,
  updateSessionReport,
  submitSessionReport,
  enhanceSessionReportFeedback,
  getTeacherMonthlySessionReports,
  getMonthlyReports,
  getMonthlyReportById,
};
