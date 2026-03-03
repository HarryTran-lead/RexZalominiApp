import { TimetableSession } from "@/types/timetable";

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
    const date = new Date(session.plannedDatetime);
    const key = date.toISOString().split("T")[0]; // YYYY-MM-DD
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(session);
  });

  // Sort sessions within each day by time
  Object.keys(groups).forEach((key) => {
    groups[key].sort(
      (a, b) =>
        new Date(a.plannedDatetime).getTime() -
        new Date(b.plannedDatetime).getTime()
    );
  });

  return groups;
}
