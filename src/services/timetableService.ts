import { ApiResponse } from "@/types/apiResponse";
import { api } from "../api/api";
import {
  STUDENT_ENDPOINTS,
  TEACHER_ENDPOINTS,
  PARENT_ENDPOINTS,
} from "../constants/apiURL";
import { TimetableSession } from "../types/timetable";

export interface TimetableData {
  sessions: TimetableSession[];
}

export const timetableService = {
  // Student timetable
  getStudentTimetable: async (
    from: string,
    to: string
  ): Promise<ApiResponse<TimetableData>> => {
    return await api.get<ApiResponse<TimetableData>>(
      STUDENT_ENDPOINTS.TIMETABLE,
      { params: { from, to } }
    );
  },

  // Teacher timetable
  getTeacherTimetable: async (
    from: string,
    to: string
  ): Promise<ApiResponse<TimetableData>> => {
    return await api.get<ApiResponse<TimetableData>>(
      TEACHER_ENDPOINTS.TIMETABLE,
      { params: { from, to } }
    );
  },

  // Parent timetable
  getParentTimetable: async (
    from: string,
    to: string
  ): Promise<ApiResponse<TimetableData>> => {
    return await api.get<ApiResponse<TimetableData>>(
      PARENT_ENDPOINTS.TIMETABLE,
      { params: { from, to } }
    );
  },
};
