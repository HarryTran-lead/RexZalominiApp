// Timetable types - matches actual BE API response

export interface TimetableSession {
  id: string;
  classId: string;
  classCode: string;
  classTitle: string;
  plannedDatetime: string;
  actualDatetime?: string | null;
  durationMinutes: number;
  participationType?: number;
  // 0 = Scheduled, 1 = Completed, 2 = Cancelled
  status: number;
  plannedRoomId?: string | null;
  plannedRoomName?: string | null;
  actualRoomId?: string | null;
  actualRoomName?: string | null;
  plannedTeacherId?: string | null;
  plannedTeacherName?: string | null;
  actualTeacherId?: string | null;
  actualTeacherName?: string | null;
  plannedAssistantId?: string | null;
  plannedAssistantName?: string | null;
  lessonPlanId?: string | null;
  lessonPlanLink?: string | null;
  // Optional extended fields
  slotNumber?: number | null;
  sessionNo?: number | null;
  meetUrl?: string | null;
  // Parent-specific
  studentName?: string;
  studentProfileId?: string;
}

export interface TimetableResponse {
  sessions: TimetableSession[];
}
