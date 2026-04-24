import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { CalendarClock, ChevronsUpDown } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import { authService } from "@/services/authService";
import { parentService } from "@/services/parentService";
import {
  AttendanceHistoryItem,
  MakeupAllocation,
  ParentMakeupCredit,
} from "@/types/parent";
import { TimetableSession } from "@/types/timetable";
import { UserProfile } from "@/types/auth";
import { storage } from "@/utils/storage";
import MakeupScheduleModal from "@/components/parent/MakeupScheduleModal";

function formatDate(value?: string): string {
  if (!value) return "--";
  // Strip trailing Z to display backend local time without UTC offset shift
  const clean = value.replace(/Z$/i, "");
  const date = new Date(clean);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status?: string): { text: string; className: string } {
  switch ((status || "").toLowerCase()) {
    case "available":
      return { text: "Sẵn sàng", className: "bg-emerald-100 text-emerald-700" };
    case "used":
      return { text: "Đã học bù", className: "bg-green-100 text-green-700" };
    case "expired":
      return { text: "Hết hạn", className: "bg-gray-100 text-gray-600" };
    default:
      return { text: status || "Không rõ", className: "bg-gray-100 text-gray-600" };
  }
}

function attendanceStatusBadge(status?: string): { text: string; className: string } {
  switch ((status || "").toLowerCase()) {
    case "present":
      return { text: "Có mặt", className: "bg-green-100 text-green-700" };
    case "absent":
      return { text: "Vắng", className: "bg-red-100 text-red-700" };
    case "makeup":
      return { text: "Học bù", className: "bg-blue-100 text-blue-700" };
    case "notmarked":
      return { text: "Chưa điểm danh", className: "bg-gray-100 text-gray-600" };
    default:
      return { text: status || "Không rõ", className: "bg-gray-100 text-gray-600" };
  }
}

function formatCreatedReason(reason?: string): string {
  if (!reason) return "Không rõ";
  const map: Record<string, string> = {
    approvedleave24h: "Nghỉ phép đã duyệt (trước 24h)",
    approvedleave: "Nghỉ phép đã duyệt",
    manualcredit: "Cấp thủ công",
    systemcredit: "Hệ thống tự cấp",
  };
  return map[reason.toLowerCase()] ?? reason;
}

function ParentMakeupCreditsPage() {
  const { openSnackbar } = useSnackbar();

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [credits, setCredits] = useState<ParentMakeupCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [makeupAllocations, setMakeupAllocations] = useState<MakeupAllocation[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [sessionDetailsMap, setSessionDetailsMap] = useState<Record<string, TimetableSession>>({});
  const [loadingSessionDetails, setLoadingSessionDetails] = useState(false);
  const [wizardCredit, setWizardCredit] = useState<ParentMakeupCredit | null>(null);
  const loadedStudentsRef = useRef(false);

  const selectedStudent = useMemo(
    () => students.find((item) => item.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const loadCredits = useCallback(async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await parentService.getMakeupCredits({
        studentProfileId: selectedStudentId,
        pageNumber: 1,
        pageSize: 50,
      });
      setCredits(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách học bù";
      setError(message);
      setCredits([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  const loadHistories = useCallback(async () => {
    if (!selectedStudentId) return;

    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const [allocations, attendances] = await Promise.all([
        parentService.getMakeupAllocations({
          studentProfileId: selectedStudentId,
          pageNumber: 1,
          pageSize: 50,
        }),
        parentService.getAttendanceHistory({
          studentProfileId: selectedStudentId,
          pageNumber: 1,
          pageSize: 50,
        }),
      ]);

      setMakeupAllocations(allocations);
      setAttendanceHistory(attendances);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải dữ liệu lịch sử";
      setHistoryError(message);
      setMakeupAllocations([]);
      setAttendanceHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [selectedStudentId]);

  // Batch-fetch session details for attendance history items that have a sessionId
  const loadSessionDetails = useCallback(async (items: AttendanceHistoryItem[]) => {
    const ids = items.map((i) => i.sessionId).filter(Boolean);
    if (ids.length === 0) return;
    setLoadingSessionDetails(true);
    try {
      const results = await Promise.all(
        ids.map((id) => parentService.getSessionDetail(id).catch(() => null))
      );
      const map: Record<string, TimetableSession> = {};
      results.forEach((result, idx) => {
        if (result) {
          map[ids[idx]] = result;
        }
      });
      setSessionDetailsMap(map);
    } finally {
      setLoadingSessionDetails(false);
    }
  }, []);

  const availableCredits = useMemo(
    () => credits.filter((item) => (item.status || "").toLowerCase() === "available"),
    [credits]
  );

  useEffect(() => {
    if (loadedStudentsRef.current) return;
    loadedStudentsRef.current = true;

    const bootstrapStudents = async () => {
      try {
        const response = await authService.getProfiles();
        const studentProfiles = response.data?.filter((item) => item.profileType === "Student") ?? [];
        setStudents(studentProfiles);

        if (studentProfiles.length > 0) {
          const savedProfileId = await storage.getItem("selectedProfileId");
          const defaultId =
            studentProfiles.find((item) => item.id === savedProfileId)?.id || studentProfiles[0].id;
          setSelectedStudentId((prev) => prev || defaultId);
        }
      } catch {
        openSnackbar({ text: "Không tải được danh sách học sinh", type: "error" });
      }
    };

    void bootstrapStudents();
  }, [openSnackbar]);

  useEffect(() => {
    if (!selectedStudentId) return;
    void loadCredits();
    void loadHistories();
    setSessionDetailsMap({});
  }, [selectedStudentId, loadCredits, loadHistories]);

  // Load session details whenever attendance history changes
  useEffect(() => {
    if (attendanceHistory.length > 0) {
      void loadSessionDetails(attendanceHistory);
    }
  }, [attendanceHistory, loadSessionDetails]);

  const handleWizardSuccess = useCallback(async () => {
    setWizardCredit(null);
    openSnackbar({ text: "Đăng ký học bù thành công", type: "success" });
    await Promise.all([loadCredits(), loadHistories()]);
  }, [loadCredits, loadHistories, openSnackbar]);

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-[#BB0000] px-4 py-4">
        <h1 className="text-center text-lg font-bold text-white">Quyền học bù</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24 pt-4 space-y-4">
        <div className="rounded-2xl border border-red-100 bg-white p-3">
          <label className="mb-1 block text-xs font-semibold text-gray-600">Học sinh</label>
          <Listbox value={selectedStudentId} onChange={setSelectedStudentId}>
            <div className="relative">
              <ListboxButton className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <UserAvatar
                    name={selectedStudent?.displayName}
                    avatarUrl={selectedStudent?.avatarUrl}
                    containerClassName="h-8 w-8 shrink-0"
                    textClassName="text-xs font-bold"
                  />
                  <span className="block truncate text-gray-800">
                    {selectedStudent?.displayName || "-- Chọn học sinh --"}
                  </span>
                </div>
                <ChevronsUpDown className="h-5 w-5 shrink-0 text-gray-400" />
              </ListboxButton>
              <ListboxOptions
                portal
                anchor="bottom start"
                className="z-[80] mt-2 max-h-60 w-[var(--button-width)] overflow-auto rounded-xl border border-gray-200 bg-white p-1 text-sm shadow-lg [--anchor-gap:8px]"
              >
                {students.map((student) => (
                  <ListboxOption
                    key={student.id}
                    value={student.id}
                    className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[selected]:font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={student.displayName}
                        avatarUrl={student.avatarUrl}
                        containerClassName="h-8 w-8 shrink-0"
                        textClassName="text-xs font-bold"
                      />
                      <span className="truncate">{student.displayName}</span>
                    </div>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
          Chỉ các quyền học bù ở trạng thái <strong>Sẵn sàng</strong> mới có thể đăng ký. Nhấn <strong>Thay đổi lịch học bù</strong> để chọn buổi bù phù hợp.
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => { void loadCredits(); void loadHistories(); }}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && availableCredits.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center">
            <p className="text-sm text-gray-500">Không có quyền học bù nào đang sẵn sàng.</p>
          </div>
        )}

        {!loading && !error && availableCredits.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-600 px-1">
              Quyền học bù sẵn sàng ({availableCredits.length})
            </p>
            {availableCredits.map((credit) => {
              const badge = statusBadge(credit.status);

              return (
                <div key={credit.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-800">
                        {credit.classTitle || credit.classCode || "Lượt học bù"}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Buổi vắng: {formatDate(credit.sourceSessionDate || credit.createdAt)}
                      </p>
                      {credit.createdReason && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          Lý do: {formatCreatedReason(credit.createdReason)}
                        </p>
                      )}
                      {credit.expiresAt && (
                        <p className="mt-0.5 text-xs font-medium text-orange-600">
                          Hết hạn: {formatDate(credit.expiresAt)}
                        </p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWizardCredit(credit)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white active:bg-red-700"
                  >
                    <CalendarClock className="h-4 w-4" />
                    Thay đổi lịch học bù
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && (
          <div className="rounded-2xl border border-red-100 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-800">Lịch sử quyền học bù</h3>
            {credits.filter((c) => (c.status || "").toLowerCase() !== "available").length === 0 ? (
              <p className="text-xs text-gray-500">Chưa có lịch sử sử dụng quyền học bù.</p>
            ) : (
              <div className="space-y-2">
                {credits
                  .filter((c) => (c.status || "").toLowerCase() !== "available")
                  .map((credit) => {
                    const badge = statusBadge(credit.status);
                    return (
                      <div key={credit.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-800">
                              {credit.classTitle || credit.classCode || "Lớp học"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-gray-500">
                              Buổi vắng: {formatDate(credit.sourceSessionDate || credit.createdAt)}
                            </p>
                            {credit.usedAt && (
                              <p className="mt-0.5 text-[11px] text-gray-500">
                                Đã dùng lúc: {formatDate(credit.usedAt)}
                              </p>
                            )}
                            {credit.createdReason && (
                              <p className="mt-0.5 text-[11px] text-gray-500">
                                Lý do: {formatCreatedReason(credit.createdReason)}
                              </p>
                            )}
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                            {badge.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-red-100 bg-white p-4">
          <h3 className="text-sm font-bold text-gray-800">Lịch sử phân bổ học bù</h3>
          {loadingHistory ? (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <Spinner /> Đang tải lịch sử...
            </div>
          ) : historyError ? (
            <p className="mt-3 text-xs text-red-600">{historyError}</p>
          ) : makeupAllocations.length === 0 ? (
            <p className="mt-3 text-xs text-gray-500">Chưa có lịch sử phân bổ học bù.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {makeupAllocations.map((allocation) => (
                <div key={allocation.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-xs font-semibold text-gray-700">
                    {allocation.targetClassTitle || allocation.targetClassCode || "Buổi học bù đã đăng ký"}
                  </p>
                  {(allocation.targetSessionDate || allocation.targetPlannedDatetime) && (
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Ngày học bù: {formatDate(allocation.targetSessionDate || allocation.targetPlannedDatetime)}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Được phân bổ: {formatDate(allocation.assignedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-4">
          <h3 className="text-sm font-bold text-gray-800">Lịch sử điểm danh</h3>
          {loadingHistory ? (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <Spinner /> Đang tải lịch sử điểm danh...
            </div>
          ) : historyError ? (
            <p className="mt-3 text-xs text-red-600">{historyError}</p>
          ) : attendanceHistory.length === 0 ? (
            <p className="mt-3 text-xs text-gray-500">Chưa có lịch sử điểm danh.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {loadingSessionDetails && (
                <p className="text-[11px] text-gray-400 flex items-center gap-1"><Spinner /> Đang tải chi tiết buổi học...</p>
              )}
              {attendanceHistory.map((item) => {
                const badge = attendanceStatusBadge(item.attendanceStatus);
                const detail = sessionDetailsMap[item.sessionId];
                // Prefer enriched session detail over flat fields on the item
                const displayClass = detail?.classTitle ?? detail?.classCode ?? item.classTitle ?? item.classCode ?? "Buổi học";
                const plannedDt = detail?.plannedDatetime ?? detail?.actualDatetime;
                const branchName = detail?.branchName;
                const roomName = detail?.actualRoomName ?? detail?.plannedRoomName;
                const teacherName = detail?.actualTeacherName ?? detail?.plannedTeacherName;
                const duration = detail?.durationMinutes;
                return (
                  <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-800 flex-1 min-w-0">{displayClass}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                        {badge.text}
                      </span>
                    </div>
                    {plannedDt && (
                      <p className="mt-0.5 text-[11px] text-gray-600 font-medium">
                        {formatDate(plannedDt)}{duration ? ` • ${duration} phút` : ""}
                      </p>
                    )}
                    {branchName && (
                      <p className="mt-0.5 text-[11px] text-gray-500">Ðịa điểm: {branchName}{roomName ? ` • ${roomName}` : ""}</p>
                    )}
                    {teacherName && (
                      <p className="mt-0.5 text-[11px] text-gray-500">Giáo viên: {teacherName}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-gray-400">Điểm danh lúc: {formatDate(item.markedAt)}</p>
                    {item.note && <p className="mt-0.5 text-[11px] text-gray-500">Ghi chú: {item.note}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {wizardCredit && selectedStudentId && (
        <MakeupScheduleModal
          credit={wizardCredit}
          studentProfileId={selectedStudentId}
          onClose={() => setWizardCredit(null)}
          onSuccess={() => void handleWizardSuccess()}
        />
      )}
    </Page>
  );
}

export default ParentMakeupCreditsPage;
