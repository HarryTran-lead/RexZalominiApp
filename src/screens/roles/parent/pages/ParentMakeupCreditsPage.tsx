import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { CalendarClock, CheckCircle2, ChevronsUpDown } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import { authService } from "@/services/authService";
import { parentService } from "@/services/parentService";
import {
  AttendanceHistoryItem,
  MakeupAllocation,
  ParentMakeupCredit,
  ParentMakeupSuggestion,
} from "@/types/parent";
import { UserProfile } from "@/types/auth";
import { storage } from "@/utils/storage";

type SuggestionMap = Record<string, ParentMakeupSuggestion[]>;
type LoadingMap = Record<string, boolean>;
type SelectedMap = Record<string, string>;

function formatDate(value?: string): string {
  if (!value) return "--";
  const date = new Date(value);
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

function ParentMakeupCreditsPage() {
  const { openSnackbar } = useSnackbar();

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [credits, setCredits] = useState<ParentMakeupCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [suggestionsMap, setSuggestionsMap] = useState<SuggestionMap>({});
  const [loadingSuggestionsMap, setLoadingSuggestionsMap] = useState<LoadingMap>({});
  const [selectedSuggestionMap, setSelectedSuggestionMap] = useState<SelectedMap>({});
  const [makeupAllocations, setMakeupAllocations] = useState<MakeupAllocation[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState("");
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
    loadCredits();
    loadHistories();
    setSuggestionsMap({});
    setSelectedSuggestionMap({});
  }, [selectedStudentId, loadCredits, loadHistories]);

  const loadSuggestions = useCallback(
    async (creditId: string) => {
      setLoadingSuggestionsMap((prev) => ({ ...prev, [creditId]: true }));
      try {
        const suggestions = await parentService.getAvailableMakeupSessions(creditId);

        setSuggestionsMap((prev) => ({ ...prev, [creditId]: suggestions }));
        if (suggestions.length > 0) {
          setSelectedSuggestionMap((prev) => ({ ...prev, [creditId]: suggestions[0].sessionId }));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Không thể tải gợi ý lịch học bù";
        openSnackbar({ text: message, type: "error" });
      } finally {
        setLoadingSuggestionsMap((prev) => ({ ...prev, [creditId]: false }));
      }
    },
    [openSnackbar]
  );

  const submitUseCredit = useCallback(
    async (credit: ParentMakeupCredit) => {
      const selectedSuggestionId = selectedSuggestionMap[credit.id];
      const suggestions = suggestionsMap[credit.id] || [];
      const suggestion = suggestions.find((item) => item.sessionId === selectedSuggestionId);

      if (!selectedStudentId) {
        openSnackbar({ text: "Vui lòng chọn học sinh", type: "error" });
        return;
      }

      if (!suggestion) {
        openSnackbar({ text: "Vui lòng chọn 1 gợi ý lịch học bù", type: "error" });
        return;
      }

      setSubmittingId(credit.id);
      try {
        await parentService.useMakeupCredit(credit.id, {
          studentProfileId: selectedStudentId,
          classId: suggestion.classId,
          targetSessionId: suggestion.sessionId,
        });

        openSnackbar({
          text: "Đăng ký học bù thành công",
          type: "success",
        });

        await Promise.all([loadCredits(), loadHistories()]);
        setSuggestionsMap((prev) => ({ ...prev, [credit.id]: [] }));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Không thể đăng ký lịch học bù";
        openSnackbar({ text: message, type: "error" });
      } finally {
        setSubmittingId("");
      }
    },
    [loadCredits, loadHistories, openSnackbar, selectedStudentId, selectedSuggestionMap, suggestionsMap]
  );

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-[#BB0000] px-4 py-4">
        <h1 className="text-center text-lg font-bold text-white">Quyền học bù</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24 pt-4">
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

        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
          Chỉ các credit trạng thái Available mới có thể đăng ký học bù. Chọn 1 credit để xem danh sách buổi học bù gợi ý và xác nhận.
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        )}

        {!loading && error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => {
                void loadCredits();
                void loadHistories();
              }}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && availableCredits.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            Không có credit Available cho học sinh này.
          </div>
        )}

        {!loading && !error && availableCredits.length > 0 && (
          <div className="mt-4 space-y-3">
            {availableCredits.map((credit) => {
              const badge = statusBadge(credit.status);
              const suggestions = suggestionsMap[credit.id] || [];
              const loadingSuggestions = loadingSuggestionsMap[credit.id];

              return (
                <div key={credit.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        {credit.classTitle || credit.classCode || "Lượt học bù"}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Nguồn vắng: {formatDate(credit.sourceSessionDate || credit.createdAt)}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadSuggestions(credit.id)}
                    disabled={loadingSuggestions}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                  >
                    <CalendarClock className="h-4 w-4" />
                    {loadingSuggestions ? "Đang lấy gợi ý..." : "Xem gợi ý lịch học bù"}
                  </button>

                  {loadingSuggestions && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <Spinner /> Đang tải khung giờ...
                    </div>
                  )}

                  {!loadingSuggestions && suggestions.length > 0 && (
                    <div className="mt-3 space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-2.5">
                      {suggestions.map((item) => {
                        const selected = selectedSuggestionMap[credit.id] === item.sessionId;
                        return (
                          <button
                            key={item.sessionId}
                            type="button"
                            onClick={() =>
                              setSelectedSuggestionMap((prev) => ({ ...prev, [credit.id]: item.sessionId }))
                            }
                            className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                              selected
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold text-gray-800">
                                  {item.classTitle || item.classCode || "Buổi học gợi ý"}
                                </p>
                                <p className="mt-0.5 text-[11px] text-gray-500">
                                  {formatDate(item.plannedDatetime)} - {formatDate(item.plannedEndDatetime)}
                                </p>
                                {item.programName && (
                                  <p className="mt-0.5 text-[11px] text-gray-500">Chương trình: {item.programName}</p>
                                )}
                              </div>
                              {selected && <CheckCircle2 className="h-4 w-4 text-red-600" />}
                            </div>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => submitUseCredit(credit)}
                        disabled={submittingId === credit.id}
                        className="w-full rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {submittingId === credit.id ? "Đang xử lý..." : "Xác nhận dùng credit"}
                      </button>
                    </div>
                  )}

                  {!loadingSuggestions && suggestionsMap[credit.id] && suggestions.length === 0 && (
                    <p className="mt-3 text-xs text-gray-500">Không tìm thấy lịch học bù phù hợp.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-red-100 bg-white p-4">
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
                    Session đích: {allocation.targetSessionId}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Phân bổ lúc: {formatDate(allocation.assignedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-red-100 bg-white p-4">
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
              {attendanceHistory.map((item) => {
                const badge = attendanceStatusBadge(item.attendanceStatus);
                return (
                  <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-700">Session: {item.sessionId}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                        {badge.text}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-gray-500">Đánh dấu lúc: {formatDate(item.markedAt)}</p>
                    {item.note && <p className="mt-0.5 text-[11px] text-gray-500">Ghi chú: {item.note}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

export default ParentMakeupCreditsPage;
