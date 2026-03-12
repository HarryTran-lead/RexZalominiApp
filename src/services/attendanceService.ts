import { ApiResponse } from "@/types/apiResponse";
import { api } from "../api/api";
import { ATTENDANCE_ENDPOINTS } from "../constants/apiURL";
import { AttendanceRequest, AttendanceResponse, AttendanceStudent } from "@/types/attendance";

export const attendanceService = {
  /** Get current attendance state — returns array of students with their statuses */
  getAttendance: async (sessionId: string): Promise<ApiResponse<AttendanceStudent[]>> => {
    return await api.get<ApiResponse<AttendanceStudent[]>>(
      ATTENDANCE_ENDPOINTS.GET(sessionId)
    );
  },

  /** Get all students for a session */
  getStudents: async (sessionId: string): Promise<ApiResponse<AttendanceStudent[]>> => {
    return await api.get<ApiResponse<AttendanceStudent[]>>(
      ATTENDANCE_ENDPOINTS.GET_STUDENTS,
      { params: { sessionId } }
    );
  },

  /** Mark a single student's attendance — POST /attendance/{sessionId} */
  updateStudentAttendance: async (
    sessionId: string,
    studentProfileId: string,
    attendanceStatus: AttendanceRequest["attendanceStatus"],
    comment?: string
  ): Promise<ApiResponse<AttendanceResponse>> => {
    const body: AttendanceRequest = { sessionId, studentProfileId, attendanceStatus, ...(comment ? { comment } : {}) };
    return await api.post<ApiResponse<AttendanceResponse>>(
      ATTENDANCE_ENDPOINTS.INIT(sessionId),
      body
    );
  },
};
