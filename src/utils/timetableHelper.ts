import { TimetableSession } from "@/types/timetable";

/**
 * Backend currently returns some timetable datetimes with trailing Z while the
 * clock value is already intended for local display. Keep the HH:mm as-is.
 */
export function parseTimetableDateTime(value?: string | null): Date {
  if (!value) return new Date(NaN);
  if (/z$/i.test(value)) {
    return new Date(value.replace(/z$/i, ""));
  }
  return new Date(value);
}

export function getSessionDisplayDatetime(session: TimetableSession): string {
  return session.actualDatetime || session.plannedDatetime;
}

/** Returns a YYYY-MM-DD key based on the **local** date (avoids UTC offset shift). */
export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getWeekRange(date: Date): { from: string; to: string } {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    from: monday.toISOString(),
    to: sunday.toISOString(),
  };
}

// Group sessions by day of week
export function groupSessionsByDay(
  sessions: TimetableSession[]
): Record<string, TimetableSession[]> {
  const groups: Record<string, TimetableSession[]> = {};

  sessions.forEach((session) => {
    const date = parseTimetableDateTime(getSessionDisplayDatetime(session));
    const key = toLocalDateKey(date);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(session);
  });

  // Sort sessions within each day by time
  Object.keys(groups).forEach((key) => {
    groups[key].sort(
      (a, b) =>
        parseTimetableDateTime(getSessionDisplayDatetime(a)).getTime() -
        parseTimetableDateTime(getSessionDisplayDatetime(b)).getTime()
    );
  });

  return groups;
}
