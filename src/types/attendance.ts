export interface AttendanceStudent {
    id: string;
    studentProfileId: string;
    studentName: string;
    attendanceStatus: "NotMarked" | "Present" | "Absent" | "Makeup";
    absenceType: string | null;
    hasMakeupCredit: boolean;
    note: string | null;
}

export type AttendanceMarkStatus = "Present" | "Absent" | "Makeup";

export interface AttendanceSessionSummary {
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    makeupCount: number;
    notMarkedCount: number;
}

export interface AttendanceSessionData {
    sessionId: string;
    sessionName?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    attendances: AttendanceStudent[];
    summary?: AttendanceSessionSummary;
}

export type AttendanceListPayload =
    | AttendanceStudent[]
    | { items: AttendanceStudent[] }
    | AttendanceSessionData;

export interface AttendanceRequest {
    sessionId: string;
    studentProfileId: string;
    attendanceStatus: AttendanceMarkStatus;
    comment?: string;
}

export interface AttendanceSubmitItem {
    studentProfileId: string;
    attendanceStatus: AttendanceMarkStatus;
    note?: string;
}

export interface AttendanceBatchRequest {
    attendances: AttendanceSubmitItem[];
}

export interface AttendanceResponse {
    id: string;
    sessionId: string;
    studentProfileId: string;
    attendanceStatus: AttendanceMarkStatus;
    absenceType?: string | null;
    markedAt: string;
    note: string | null;
}

export interface AttendanceRecord {
  sessionId: string;
  classCode?: string;
  classTitle?: string;
  students: AttendanceStudent[];
}
