export interface AttendanceStudent {
    id: string;
    studentProfileId: string;
    studentName: string;
    attendanceStatus: "NotMarked" | "Present" | "Absent" | "Makeup";
    absenceType: string | null;
    hasMakeupCredit: boolean;
    note: string | null;
}

export interface AttendanceRequest {
    sessionId: string;
    studentProfileId: string;
    attendanceStatus: "Present" | "Absent" | "Makeup";
    comment?: string;
}

export interface AttendanceResponse {
    id: string;
    sessionId: string;
    studentProfileId: string;
    attendanceStatus: "Present" | "Absent" | "Makeup";
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
