// Timetable types - shared across student, teacher, parent

export interface TimetableSession {
  sessionId: string;
  classId: string;
  className: string;
  classCode: string;
  programName: string;
  plannedDatetime: string;
  durationMinutes: number;
  status: "Scheduled" | "Completed" | "Cancelled";
  roomName: string | null;
  teacherName: string | null;
  assistantTeacherName: string | null;
  // Parent-specific: may include student info
  studentName?: string;
  studentProfileId?: string;
}

export interface TimetableResponse {
  items: TimetableSession[];
  totalCount?: number;
}
