import { ApiResponse } from "@/types/apiResponse";
import { api } from "../api/api";
import {
  STUDENT_ENDPOINTS,
  TEACHER_ENDPOINTS,
  PARENT_ENDPOINTS,
} from "../constants/apiURL";
import { TimetableSession } from "../types/timetable";

export const timetableService = {
  // Student timetable
  getStudentTimetable: async (
    from: string,
    to: string
  ): Promise<ApiResponse<TimetableSession[]>> => {
    return await api.get<ApiResponse<TimetableSession[]>>(
      STUDENT_ENDPOINTS.TIMETABLE,
      { params: { from, to } }
    );
  },

  // Teacher timetable
  getTeacherTimetable: async (
    from: string,
    to: string
  ): Promise<ApiResponse<TimetableSession[]>> => {
    return await api.get<ApiResponse<TimetableSession[]>>(
      TEACHER_ENDPOINTS.TIMETABLE,
      { params: { from, to } }
    );
  },

  // Parent timetable
  getParentTimetable: async (
    from: string,
    to: string
  ): Promise<ApiResponse<TimetableSession[]>> => {
    return await api.get<ApiResponse<TimetableSession[]>>(
      PARENT_ENDPOINTS.TIMETABLE,
      { params: { from, to } }
    );
  },
};
