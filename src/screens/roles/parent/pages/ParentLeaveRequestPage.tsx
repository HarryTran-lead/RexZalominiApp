import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { AlertCircle, CalendarDays, ChevronsUpDown, FileText } from "lucide-react";
import { parentService } from "@/services/parentService";
import { authService } from "@/services/authService";
import { studentService } from "@/services/studentService";
import { timetableService } from "@/services/timetableService";
import {
  CreatePauseRequestPayload,
  ParentLeaveRequest,
  ParentLeaveRequestsResponse,
  PauseEnrollmentRequest,
} from "@/types/parent";
import { UserProfile } from "@/types/auth";
import { StudentClass } from "@/services";
import { TimetableSession } from "@/types/timetable";
import {
  getSessionDisplayDatetime,
  parseTimetableDateTime,
  toLocalDateKey,
} from "@/utils/timetableHelper";
import { storage } from "@/utils/storage";

type ViewMode = "list" | "create";
type RequestKind = "leave" | "pause";

interface ParentLeaveRequestPageProps {
  initialRequestKind?: RequestKind;
  lockRequestKind?: boolean;
}

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function firstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toMonthLabel(date: Date): string {
  return date.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
}

function toMonthRange(monthStart: Date): { from: string; to: string } {
  const fromDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1, 0, 0, 0, 0);
  const toDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
  return {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  };
}

function buildCalendarDays(monthStart: Date): Date[] {
  const start = new Date(monthStart);
  const weekDay = start.getDay();
  const offsetToMonday = (weekDay + 6) % 7;
  start.setDate(start.getDate() - offsetToMonday);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatSessionTime(isoString: string, durationMinutes: number): string {
  const start = parseTimetableDateTime(isoString);
  const end = parseTimetableDateTime(isoString);
  end.setMinutes(end.getMinutes() + durationMinutes);

  const format = (d: Date) =>
    d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return `${format(start)} - ${format(end)}`;
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ParentLeaveRequestPage({
  initialRequestKind = "leave",
  lockRequestKind = true,
}: ParentLeaveRequestPageProps) {
  const { openSnackbar } = useSnackbar();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [requestKind, setRequestKind] = useState<RequestKind>(initialRequestKind);
  const [leaveRequests, setLeaveRequests] = useState<ParentLeaveRequestsResponse[]>([]);
  const [pauseRequests, setPauseRequests] = useState<PauseEnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => firstDayOfMonth(new Date()));
  const [timetableSessions, setTimetableSessions] = useState<TimetableSession[]>([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [timetableError, setTimetableError] = useState<string | null>(null);
  const [studentToken, setStudentToken] = useState<string>("");
  const loadingStudentDataRef = useRef(false);
  const loadedStudentProfileIdRef = useRef<string>("");

  const [form, setForm] = useState<ParentLeaveRequest>({
    studentProfileId: "",
    classId: "",
    sessionDate: "",
    endDate: "",
    reason: "",
  });

  const [pauseForm, setPauseForm] = useState<CreatePauseRequestPayload>({
    studentProfileId: "",
    pauseFrom: toDateInputValue(new Date()),
    pauseTo: toDateInputValue(new Date()),
    reason: "",
  });

  const fetchLeaveRequests = useCallback(async (studentProfileId: string) => {
    if (!studentProfileId) {
      setLeaveRequests([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await parentService.getLeaveRequests({
        studentProfileId,
        pageSize: 50,
      });
      setLeaveRequests(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách đơn xin nghỉ";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPauseRequests = useCallback(async (studentProfileId: string) => {
    if (!studentProfileId) {
      setPauseRequests([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await parentService.getPauseRequests({
        studentProfileId,
        pageNumber: 1,
        pageSize: 50,
      });
      setPauseRequests(data.items ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách đơn bảo lưu";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await authService.getProfiles();
      const studentsList = response.data?.filter((p) => p.profileType === "Student") ?? [];
      setStudents(studentsList);

      if (studentsList.length > 0) {
        const selectedProfileId = await storage.getItem("selectedProfileId");
        const preferredStudent = selectedProfileId
          ? studentsList.find((student) => student.id === selectedProfileId) ?? studentsList[0]
          : studentsList[0];

        setForm((prev) => ({
          ...prev,
          studentProfileId: prev.studentProfileId || preferredStudent.id,
        }));
        setPauseForm((prev) => ({
          ...prev,
          studentProfileId: prev.studentProfileId || preferredStudent.id,
        }));
      }
    } catch {
      openSnackbar({ text: "Không thể tải danh sách học sinh", type: "error" });
    }
  }, [openSnackbar]);

  const getStudentToken = useCallback(async (studentProfileId: string): Promise<string> => {
    const selectRes = await authService.selectStudent({ profileId: studentProfileId });
    const selectedToken = selectRes?.data?.accessToken;
    if (!selectedToken) {
      throw new Error("Không lấy được student token");
    }
    return selectedToken;
  }, []);

  const fetchStudentClasses = useCallback(
    async (token: string) => {
      setLoadingClasses(true);
      setClasses([]);
      try {
        const res = await studentService.getClasses(
          { pageNumber: 1, pageSize: 50 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const classData = res?.data as { items?: StudentClass[]; classes?: { items?: StudentClass[] } } | undefined;
        const classList = classData?.items ?? classData?.classes?.items ?? [];

        setClasses(classList);
        setForm((prev) => ({
          ...prev,
          classId: classList[0]?.id ?? "",
          sessionDate: "",
          endDate: "",
        }));
      } catch {
        openSnackbar({ text: "Không thể tải danh sách lớp", type: "error" });
      } finally {
        setLoadingClasses(false);
      }
    },
    [openSnackbar]
  );

  const fetchStudentTimetable = useCallback(
    async (token: string, monthStart: Date) => {
      setLoadingTimetable(true);
      setTimetableError(null);
      try {
        const { from, to } = toMonthRange(monthStart);
        const response = await timetableService.getStudentTimetable(from, to, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.isSuccess || response.success) {
          setTimetableSessions(response.data?.sessions ?? []);
        } else {
          setTimetableSessions([]);
          setTimetableError(response.message || "Không thể tải lịch học");
        }
      } catch (err: unknown) {
        setTimetableSessions([]);
        const message = err instanceof Error ? err.message : "Không thể tải lịch học";
        setTimetableError(message);
      } finally {
        setLoadingTimetable(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchStudents();
    // Run once on mount to avoid repeated bootstrap requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (viewMode !== "list") return;
    if (requestKind === "leave") {
      if (form.studentProfileId) {
        fetchLeaveRequests(form.studentProfileId);
      }
      return;
    }

    const targetStudentId = pauseForm.studentProfileId || form.studentProfileId;
    if (targetStudentId) {
      fetchPauseRequests(targetStudentId);
    }
  }, [
    requestKind,
    viewMode,
    pauseForm.studentProfileId,
    form.studentProfileId,
    fetchLeaveRequests,
    fetchPauseRequests,
  ]);

  useEffect(() => {
    if (viewMode !== "create" || !form.studentProfileId) return;
    if (loadingStudentDataRef.current) return;
    if (loadedStudentProfileIdRef.current === form.studentProfileId) return;

    let cancelled = false;
    const currentProfileId = form.studentProfileId;

    const loadStudentData = async () => {
      loadingStudentDataRef.current = true;
      try {
        const token = await getStudentToken(currentProfileId);
        if (cancelled) return;
        loadedStudentProfileIdRef.current = currentProfileId;
        setStudentToken((prev) => (prev === token ? prev : token));
        await fetchStudentClasses(token);
      } catch {
        if (!cancelled) {
          loadedStudentProfileIdRef.current = "";
          setStudentToken("");
          setClasses([]);
          setTimetableSessions([]);
          openSnackbar({ text: "Không thể lấy dữ liệu lịch học của học sinh", type: "error" });
        }
      } finally {
        loadingStudentDataRef.current = false;
      }
    };

    loadStudentData();

    return () => {
      cancelled = true;
    };
  }, [viewMode, form.studentProfileId, fetchStudentClasses, getStudentToken, openSnackbar]);

  useEffect(() => {
    if (viewMode !== "create" || !studentToken) return;
    fetchStudentTimetable(studentToken, calendarMonth);
  }, [viewMode, studentToken, calendarMonth, fetchStudentTimetable]);

  const classSessions = useMemo(() => {
    if (!form.classId) return [];
    return timetableSessions.filter((session) => session.classId === form.classId && session.status !== "Cancelled");
  }, [timetableSessions, form.classId]);

  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, TimetableSession[]> = {};

    classSessions.forEach((session) => {
      const sessionDatetime = getSessionDisplayDatetime(session);
      const key = toLocalDateKey(parseTimetableDateTime(sessionDatetime));
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(session);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort(
        (a, b) =>
          parseTimetableDateTime(getSessionDisplayDatetime(a)).getTime() -
          parseTimetableDateTime(getSessionDisplayDatetime(b)).getTime()
      );
    });

    return grouped;
  }, [classSessions]);

  useEffect(() => {
    if (!form.sessionDate) return;
    if (!sessionsByDate[form.sessionDate]?.length) {
      setForm((prev) => ({ ...prev, sessionDate: "", endDate: "" }));
    }
  }, [sessionsByDate, form.sessionDate]);

  const handleSubmit = async () => {
    if (!form.classId || !form.sessionDate) {
      openSnackbar({ text: "Vui lòng chọn lớp và ngày học hợp lệ", type: "error" });
      return;
    }

    if (!sessionsByDate[form.sessionDate]?.length) {
      openSnackbar({ text: "Ngày đã chọn không có buổi học của lớp này", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await parentService.createLeaveRequest({
        ...form,
        endDate: form.sessionDate,
        reason: form.reason?.trim() || undefined,
      });
      openSnackbar({ text: "Gửi đơn xin nghỉ thành công", type: "success" });
      setForm((prev) => ({
        studentProfileId: prev.studentProfileId,
        classId: prev.classId,
        sessionDate: "",
        endDate: "",
        reason: "",
      }));
      setViewMode("list");
      fetchLeaveRequests(form.studentProfileId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gửi đơn thất bại";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePauseSubmit = async () => {
    const pauseFrom = pauseForm.pauseFrom;
    const pauseTo = pauseForm.pauseTo;

    if (!pauseForm.studentProfileId || !pauseFrom || !pauseTo) {
      openSnackbar({ text: "Vui lòng chọn học sinh và khoảng thời gian bảo lưu", type: "error" });
      return;
    }

    if (pauseFrom > pauseTo) {
      openSnackbar({ text: "Ngày bắt đầu bảo lưu phải nhỏ hơn hoặc bằng ngày kết thúc", type: "error" });
      return;
    }

    const todayKey = toDateInputValue(new Date());
    if (pauseFrom < todayKey) {
      openSnackbar({ text: "Không thể tạo bảo lưu trong quá khứ", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await parentService.createPauseRequest({
        studentProfileId: pauseForm.studentProfileId,
        pauseFrom,
        pauseTo,
        reason: pauseForm.reason?.trim() || undefined,
      });
      openSnackbar({ text: "Gửi đơn bảo lưu thành công", type: "success" });

      setPauseForm((prev) => ({
        ...prev,
        pauseFrom: toDateInputValue(new Date()),
        pauseTo: toDateInputValue(new Date()),
        reason: "",
      }));
      setViewMode("list");
      if (!lockRequestKind) {
        setRequestKind("pause");
      }
      await fetchPauseRequests(pauseForm.studentProfileId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gửi đơn bảo lưu thất bại";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Pending":
        return { label: "Đang chờ", className: "bg-yellow-100 text-yellow-700" };
      case "Approved":
        return { label: "Đã duyệt", className: "bg-green-100 text-green-700" };
      case "Rejected":
        return { label: "Từ chối", className: "bg-red-100 text-red-700" };
      case "Cancelled":
        return { label: "Đã hủy", className: "bg-gray-100 text-gray-600" };
      default:
        return { label: status || "Không rõ", className: "bg-gray-100 text-gray-600" };
    }
  };

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);
  const todayKey = toLocalDateKey(new Date());
  const selectedDateSessions = form.sessionDate ? sessionsByDate[form.sessionDate] ?? [] : [];

  const openCreateView = () => {
    setCalendarMonth(firstDayOfMonth(new Date()));
    setTimetableError(null);
    loadingStudentDataRef.current = false;
    loadedStudentProfileIdRef.current = "";
    setViewMode("create");
  };

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-[#BB0000] px-4 py-4">
        <div className="relative">
          <h1 className="text-white font-bold text-lg text-center">
            {viewMode === "create"
              ? requestKind === "pause"
                ? "Tạo đơn bảo lưu"
                : "Tạo đơn xin nghỉ"
              : requestKind === "pause"
              ? "Đơn bảo lưu"
              : "Đơn xin nghỉ"}
          </h1>
          {viewMode === "list" && (
            <button
              onClick={openCreateView}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold"
            >
              + Tạo đơn
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-24">
        {!lockRequestKind && (
          <div className="px-4 pt-3">
            <div className="grid grid-cols-2 rounded-xl border border-red-100 bg-white p-1">
              <button
                type="button"
                onClick={() => setRequestKind("leave")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  requestKind === "leave" ? "bg-red-600 text-white" : "text-gray-600"
                }`}
              >
                Nghỉ buổi
              </button>
              <button
                type="button"
                onClick={() => setRequestKind("pause")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  requestKind === "pause" ? "bg-red-600 text-white" : "text-gray-600"
                }`}
              >
                Bảo lưu dài hạn
              </button>
            </div>
          </div>
        )}

        {viewMode === "create" ? (
          requestKind === "leave" ? (
          <div className="px-4 pt-4 space-y-4">
            <div className="rounded-2xl border border-red-100 bg-red-50/70 px-3.5 py-3 text-xs text-red-700">
              Chỉ chọn được ngày có buổi học từ hôm nay trở đi. Các buổi quá khứ sẽ bị khóa.
              <p className="mt-1 font-medium">
                Nếu báo trước 24h, đơn sẽ được tự động duyệt và cấp quyền học bù ngay.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tên học sinh *</label>
              <Listbox
                value={form.studentProfileId}
                onChange={(value) => {
                  loadedStudentProfileIdRef.current = "";
                  loadingStudentDataRef.current = false;
                  setStudentToken("");
                  setClasses([]);
                  setTimetableSessions([]);
                  setForm((prev) => ({
                    ...prev,
                    studentProfileId: value,
                    classId: "",
                    sessionDate: "",
                    endDate: "",
                  }));
                }}
              >
                <div className="relative">
                  <ListboxButton className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center justify-between">
                    <span className="block truncate text-gray-800">
                      {form.studentProfileId
                        ? students.find((s) => s.id === form.studentProfileId)?.displayName || "-- Chọn học sinh --"
                        : "-- Chọn học sinh --"}
                    </span>
                    <ChevronsUpDown className="h-5 w-5 shrink-0 text-gray-400" />
                  </ListboxButton>

                  <ListboxOptions
                    portal
                    anchor="bottom start"
                    className="z-[80] mt-2 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg focus:outline-none text-sm [--anchor-gap:8px] w-[var(--button-width)]"
                  >
                    {students.length === 0 ? (
                      <div className="px-3 py-2 text-gray-400">Không có học sinh</div>
                    ) : (
                      students.map((student) => (
                        <ListboxOption
                          key={student.id}
                          value={student.id}
                          className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[focus]:text-red-600 data-[selected]:font-semibold"
                        >
                          {student.displayName}
                        </ListboxOption>
                      ))
                    )}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Lớp học *</label>
              {loadingClasses ? (
                <div className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm flex items-center gap-2">
                  <Spinner /> Đang tải lớp học...
                </div>
              ) : (
                <Listbox
                  value={form.classId}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      classId: value,
                      sessionDate: "",
                      endDate: "",
                    }))
                  }
                  disabled={loadingClasses || classes.length === 0}
                >
                  <div className="relative">
                    <ListboxButton className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed">
                      <span className="block truncate text-gray-800">
                        {form.classId
                          ? classes.find((c) => c.id === form.classId)?.title || "-- Chọn lớp --"
                          : classes.length === 0
                          ? "-- Không có lớp --"
                          : "-- Chọn lớp --"}
                      </span>
                      <ChevronsUpDown className="h-5 w-5 shrink-0 text-gray-400" />
                    </ListboxButton>

                    <ListboxOptions
                      portal
                      anchor="bottom start"
                      className="z-[80] mt-2 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg focus:outline-none text-sm [--anchor-gap:8px] w-[var(--button-width)]"
                    >
                      {classes.length === 0 ? (
                        <div className="px-3 py-2 text-gray-400">Không có lớp</div>
                      ) : (
                        classes.map((cls) => (
                          <ListboxOption
                            key={cls.id}
                            value={cls.id}
                            className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[focus]:text-red-600 data-[selected]:font-semibold"
                          >
                            {cls.title}
                          </ListboxOption>
                        ))
                      )}
                    </ListboxOptions>
                  </div>
                </Listbox>
              )}
            </div>

            <div className="rounded-2xl border border-red-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-red-100 px-3 py-2.5 bg-red-50/70">
                <button
                  onClick={() =>
                    setCalendarMonth((prev) => firstDayOfMonth(new Date(prev.getFullYear(), prev.getMonth() - 1, 1)))
                  }
                  className="w-8 h-8 rounded-full text-red-600 text-lg font-semibold active:bg-red-100"
                  aria-label="Tháng trước"
                >
                  ‹
                </button>
                <p className="text-sm font-bold text-red-700 capitalize">{toMonthLabel(calendarMonth)}</p>
                <button
                  onClick={() =>
                    setCalendarMonth((prev) => firstDayOfMonth(new Date(prev.getFullYear(), prev.getMonth() + 1, 1)))
                  }
                  className="w-8 h-8 rounded-full text-red-600 text-lg font-semibold active:bg-red-100"
                  aria-label="Tháng sau"
                >
                  ›
                </button>
              </div>

              <div className="grid grid-cols-7 border-b border-red-100 bg-white px-2 pt-2 pb-1">
                {DAY_LABELS.map((label) => (
                  <div key={label} className="text-center text-[11px] font-semibold text-gray-500">
                    {label}
                  </div>
                ))}
              </div>

              <div className="px-2 pb-2">
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((day) => {
                    const dateKey = toLocalDateKey(day);
                    const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                    const daySessions = isCurrentMonth ? sessionsByDate[dateKey] ?? [] : [];
                    const hasClassSession = daySessions.length > 0;
                    const isPastDay = dateKey < todayKey;
                    const canSelectDay = isCurrentMonth && hasClassSession && !isPastDay;
                    const isSelected = form.sessionDate === dateKey;

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        disabled={!canSelectDay}
                        onClick={() => setForm((prev) => ({ ...prev, sessionDate: dateKey, endDate: dateKey }))}
                        className={`min-h-[78px] rounded-xl border px-1.5 py-1.5 text-left transition-colors ${
                          !isCurrentMonth
                            ? "border-transparent bg-transparent"
                            : canSelectDay
                            ? isSelected
                              ? "border-red-500 bg-red-50"
                              : "border-red-100 bg-white active:bg-red-50"
                            : isPastDay
                            ? "border-gray-200 bg-gray-100 text-gray-300"
                            : "border-gray-200 bg-gray-100 text-gray-400"
                        } disabled:cursor-not-allowed`}
                      >
                        <p
                          className={`text-lg font-bold leading-none ${
                            isSelected ? "text-red-600" : isPastDay ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          {day.getDate()}
                        </p>
                        {hasClassSession ? (
                          <div className="mt-1.5 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                            {daySessions.length} buổi
                          </div>
                        ) : (
                          isCurrentMonth && <p className="mt-1 text-[10px] text-gray-400">Không có buổi</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {loadingTimetable && (
              <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm flex items-center gap-2">
                <Spinner /> Đang tải lịch học...
              </div>
            )}

            {!loadingTimetable && timetableError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {timetableError}
              </div>
            )}

            {!loadingTimetable && !timetableError && form.classId && classSessions.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
                Không có buổi học của lớp này trong tháng đã chọn.
              </div>
            )}

            {form.sessionDate && selectedDateSessions.length > 0 && (
              <div className="rounded-2xl border border-red-100 bg-white p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Buổi học ngày {formatDate(form.sessionDate)}:</p>
                <div className="space-y-2">
                  {selectedDateSessions.map((session) => (
                    <div key={session.id} className="rounded-lg bg-red-50 px-2.5 py-2 text-xs text-gray-700">
                      <p className="font-semibold text-red-600">
                        {formatSessionTime(getSessionDisplayDatetime(session), session.durationMinutes)}
                      </p>
                      <p className="mt-0.5">{session.classTitle || "Lớp học"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Lý do</label>
              <textarea
                value={form.reason || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Nhập lý do xin nghỉ..."
                rows={4}
                className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !form.classId ||
                !form.sessionDate ||
                !sessionsByDate[form.sessionDate]?.length
              }
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 active:bg-red-700 transition-colors"
            >
              {submitting ? "Đang gửi..." : "Gửi đơn xin nghỉ"}
            </button>
          </div>
          ) : (
            <div className="px-4 pt-4 space-y-4">
              <div className="rounded-2xl border border-red-100 bg-red-50/70 px-3.5 py-3 text-xs text-red-700">
                Đơn bảo lưu áp dụng cho toàn bộ lớp học của bé trong khoảng thời gian đã chọn.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tên học sinh *</label>
                <Listbox
                  value={pauseForm.studentProfileId}
                  onChange={(value) => setPauseForm((prev) => ({ ...prev, studentProfileId: value }))}
                >
                  <div className="relative">
                    <ListboxButton className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center justify-between">
                      <span className="block truncate text-gray-800">
                        {pauseForm.studentProfileId
                          ? students.find((s) => s.id === pauseForm.studentProfileId)?.displayName || "-- Chọn học sinh --"
                          : "-- Chọn học sinh --"}
                      </span>
                      <ChevronsUpDown className="h-5 w-5 shrink-0 text-gray-400" />
                    </ListboxButton>

                    <ListboxOptions
                      portal
                      anchor="bottom start"
                      className="z-[80] mt-2 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg focus:outline-none text-sm [--anchor-gap:8px] w-[var(--button-width)]"
                    >
                      {students.length === 0 ? (
                        <div className="px-3 py-2 text-gray-400">Không có học sinh</div>
                      ) : (
                        students.map((student) => (
                          <ListboxOption
                            key={student.id}
                            value={student.id}
                            className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[focus]:text-red-600 data-[selected]:font-semibold"
                          >
                            {student.displayName}
                          </ListboxOption>
                        ))
                      )}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Từ ngày *</label>
                  <input
                    type="date"
                    min={toDateInputValue(new Date())}
                    value={pauseForm.pauseFrom}
                    onChange={(e) => setPauseForm((prev) => ({ ...prev, pauseFrom: e.target.value }))}
                    className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Đến ngày *</label>
                  <input
                    type="date"
                    min={pauseForm.pauseFrom || toDateInputValue(new Date())}
                    value={pauseForm.pauseTo}
                    onChange={(e) => setPauseForm((prev) => ({ ...prev, pauseTo: e.target.value }))}
                    className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Lý do</label>
                <textarea
                  value={pauseForm.reason || ""}
                  onChange={(e) => setPauseForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Nhập lý do bảo lưu..."
                  rows={4}
                  className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handlePauseSubmit}
                disabled={
                  submitting ||
                  !pauseForm.studentProfileId ||
                  !pauseForm.pauseFrom ||
                  !pauseForm.pauseTo
                }
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 active:bg-red-700 transition-colors"
              >
                {submitting ? "Đang gửi..." : "Gửi đơn bảo lưu"}
              </button>
            </div>
          )
        ) : (
          <div className="px-4 pt-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center py-16 text-gray-400">
                <AlertCircle className="mb-3 h-16 w-16" strokeWidth={1.2} />
                <p className="text-sm mb-3">{error}</p>
                <button
                  onClick={() => {
                    if (requestKind === "pause") {
                      const targetStudentId = pauseForm.studentProfileId || form.studentProfileId;
                      if (targetStudentId) {
                        fetchPauseRequests(targetStudentId);
                      }
                    } else {
                      if (form.studentProfileId) {
                        fetchLeaveRequests(form.studentProfileId);
                      }
                    }
                  }}
                  className="text-red-600 text-sm font-semibold"
                >
                  Thử lại
                </button>
              </div>
            ) : requestKind === "leave" && leaveRequests.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-400">
                <FileText className="mb-3 h-16 w-16" strokeWidth={1.2} />
                <p className="text-sm mb-3">Chưa có đơn xin nghỉ nào</p>
                <button onClick={openCreateView} className="text-red-600 text-sm font-semibold">
                  Tạo đơn ngay
                </button>
              </div>
            ) : requestKind === "pause" && pauseRequests.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-400">
                <FileText className="mb-3 h-16 w-16" strokeWidth={1.2} />
                <p className="text-sm mb-3">Chưa có đơn bảo lưu nào</p>
                <button onClick={openCreateView} className="text-red-600 text-sm font-semibold">
                  Tạo đơn ngay
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {requestKind === "leave"
                  ? leaveRequests.map((item) => {
                      const badge = getStatusBadge(item.status);
                      const studentName = students.find((s) => s.id === item.studentProfileId)?.displayName || "Học sinh";
                      return (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 mr-2">
                              <h3 className="font-bold text-gray-800 text-sm">{studentName}</h3>
                            </div>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mb-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatDate(item.sessionDate)}
                              {item.endDate && item.endDate !== item.sessionDate && ` - ${formatDate(item.endDate)}`}
                            </span>
                          </div>

                          {item.reason && (
                            <div className="bg-gray-50 rounded-lg p-2 mt-2">
                              <p className="text-[11px] text-gray-500 font-semibold mb-0.5">Lý do:</p>
                              <p className="text-xs text-gray-700">{item.reason}</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  : pauseRequests.map((item) => {
                      const badge = getStatusBadge(item.status);
                      const studentName = students.find((s) => s.id === item.studentProfileId)?.displayName || "Học sinh";
                      return (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 mr-2">
                              <h3 className="font-bold text-gray-800 text-sm">{studentName}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">Bảo lưu toàn bộ lớp</p>
                            </div>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mb-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatDate(item.pauseFrom)} - {formatDate(item.pauseTo)}
                            </span>
                          </div>

                          {item.reason && (
                            <div className="bg-gray-50 rounded-lg p-2 mt-2">
                              <p className="text-[11px] text-gray-500 font-semibold mb-0.5">Lý do:</p>
                              <p className="text-xs text-gray-700">{item.reason}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
              </div>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}

export default ParentLeaveRequestPage;
