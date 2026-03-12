import { api } from "@/api/api";
import { ApiResponse } from "@/types/apiResponse";
import { TEACHER_ENDPOINTS } from "@/constants/apiURL";
import { MonthlyReport, MonthlySessionReport, SessionReport } from "@/types/teacher";

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
export const getMonthlyReports = async (): Promise<MonthlyReport[]> => {
  const res = await api.get<ApiResponse<MonthlyReport[]>>(
    TEACHER_ENDPOINTS.MONTHLY_REPORTS
  );
  return Array.isArray(res?.data) ? res.data : (res?.data as any)?.items ?? [];
};

/**
 * GET /api/monthly-reports/{reportId}
 * Returns a single monthly report by ID.
 */
export const getMonthlyReportById = async (
  reportId: string
): Promise<MonthlyReport | null> => {
  const res = await api.get<ApiResponse<MonthlyReport>>(
    TEACHER_ENDPOINTS.MONTHLY_REPORT_DETAIL(reportId)
  );
  return res?.data ?? null;
};

export const reportService = {
  getSessionReports,
  getSessionReportById,
  getTeacherMonthlySessionReports,
  getMonthlyReports,
  getMonthlyReportById,
};
