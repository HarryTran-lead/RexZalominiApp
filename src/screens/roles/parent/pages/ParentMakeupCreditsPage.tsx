import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { CalendarClock, ChevronsUpDown, RefreshCw } from "lucide-react";
import { authService } from "@/services/authService";
import { parentService } from "@/services/parentService";
import {
  ParentMakeupCredit,
  ParentMakeupSuggestion,
  ParentUseMakeupCreditPayload,
} from "@/types/parent";
import { UserProfile } from "@/types/auth";
import { storage } from "@/utils/storage";

type SuggestionMap = Record<string, ParentMakeupSuggestion[]>;
type LoadingMap = Record<string, boolean>;
type SelectedMap = Record<string, string>;
type DateFilterMap = Record<string, string>;
type TimeFilterMap = Record<string, string>;

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
    case "pending":
      return { text: "Chờ xếp lịch", className: "bg-yellow-100 text-yellow-700" };
    case "scheduled":
      return { text: "Đã xếp lịch", className: "bg-blue-100 text-blue-700" };
    case "used":
      return { text: "Đã học bù", className: "bg-green-100 text-green-700" };
    case "expired":
      return { text: "Hết hạn", className: "bg-gray-100 text-gray-600" };
    default:
      return { text: status || "Không rõ", className: "bg-gray-100 text-gray-600" };
  }
}

function normalizeUsePayload(
  studentProfileId: string,
  suggestion: ParentMakeupSuggestion
): ParentUseMakeupCreditPayload {
  const record = suggestion as Record<string, unknown>;
  const payload: ParentUseMakeupCreditPayload = {
    studentProfileId,
  };

  const suggestionId = record.suggestionId;
  const makeupSlotId = record.makeupSlotId;
  const sessionId = record.sessionId;
  const classSessionId = record.classSessionId;

  if (typeof suggestionId === "string" && suggestionId) payload.suggestionId = suggestionId;
  if (typeof makeupSlotId === "string" && makeupSlotId) payload.makeupSlotId = makeupSlotId;
  if (typeof sessionId === "string" && sessionId) payload.sessionId = sessionId;
  if (typeof classSessionId === "string" && classSessionId) payload.classSessionId = classSessionId;

  if (!payload.suggestionId && suggestion.id) {
    payload.suggestionId = suggestion.id;
  }

  return payload;
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
  const [dateFilterMap, setDateFilterMap] = useState<DateFilterMap>({});
  const [timeFilterMap, setTimeFilterMap] = useState<TimeFilterMap>({});
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
    setSuggestionsMap({});
    setSelectedSuggestionMap({});
    setDateFilterMap({});
    setTimeFilterMap({});
  }, [selectedStudentId, loadCredits]);

  const loadSuggestions = useCallback(
    async (creditId: string) => {
      setLoadingSuggestionsMap((prev) => ({ ...prev, [creditId]: true }));
      try {
        const dateFilter = dateFilterMap[creditId];
        const timeFilter = timeFilterMap[creditId];

        const suggestions = await parentService.getMakeupSuggestions(creditId, {
          makeupDate: dateFilter || undefined,
          timeOfDay: timeFilter || undefined,
        });

        setSuggestionsMap((prev) => ({ ...prev, [creditId]: suggestions }));
        if (suggestions.length > 0) {
          setSelectedSuggestionMap((prev) => ({ ...prev, [creditId]: suggestions[0].id }));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Không thể tải gợi ý lịch học bù";
        openSnackbar({ text: message, type: "error" });
      } finally {
        setLoadingSuggestionsMap((prev) => ({ ...prev, [creditId]: false }));
      }
    },
    [dateFilterMap, openSnackbar, timeFilterMap]
  );

  const submitUseCredit = useCallback(
    async (credit: ParentMakeupCredit) => {
      const selectedSuggestionId = selectedSuggestionMap[credit.id];
      const suggestions = suggestionsMap[credit.id] || [];
      const suggestion = suggestions.find((item) => item.id === selectedSuggestionId);

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
        const payload = normalizeUsePayload(selectedStudentId, suggestion);
        await parentService.useMakeupCredit(credit.id, payload);

        openSnackbar({
          text: credit.status?.toLowerCase() === "scheduled" ? "Đổi lịch học bù thành công" : "Đăng ký học bù thành công",
          type: "success",
        });

        await loadCredits();
        setSuggestionsMap((prev) => ({ ...prev, [credit.id]: [] }));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Không thể đăng ký lịch học bù";
        openSnackbar({ text: message, type: "error" });
      } finally {
        setSubmittingId("");
      }
    },
    [loadCredits, openSnackbar, selectedStudentId, selectedSuggestionMap, suggestionsMap]
  );

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-[#BB0000] px-4 py-4">
        <h1 className="text-center text-lg font-bold text-white">Học bù và đổi lịch</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24 pt-4">
        <div className="rounded-2xl border border-red-100 bg-white p-3">
          <label className="mb-1 block text-xs font-semibold text-gray-600">Học sinh</label>
          <Listbox value={selectedStudentId} onChange={setSelectedStudentId}>
            <div className="relative">
              <ListboxButton className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm">
                <span className="block truncate text-gray-800">
                  {selectedStudent?.displayName || "-- Chọn học sinh --"}
                </span>
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
                    className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[focus]:text-red-600 data-[selected]:font-semibold"
                  >
                    {student.displayName}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
          Chọn 1 lượt học bù để xem khung giờ gợi ý, sau đó đăng ký hoặc đổi lịch nếu đã xếp lịch trước đó.
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
              onClick={loadCredits}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && credits.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">Không có lượt học bù nào cho học sinh này.</div>
        )}

        {!loading && !error && credits.length > 0 && (
          <div className="mt-4 space-y-3">
            {credits.map((credit) => {
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
                      <p className="mt-0.5 text-xs text-gray-500">Nguồn vắng: {formatDate(credit.sourceSessionDate)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-gray-500">Lọc theo ngày</label>
                      <input
                        type="date"
                        value={dateFilterMap[credit.id] || ""}
                        min={toDateInputValue(new Date())}
                        onChange={(e) =>
                          setDateFilterMap((prev) => ({ ...prev, [credit.id]: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-gray-500">Buổi học</label>
                      <select
                        value={timeFilterMap[credit.id] || ""}
                        onChange={(e) =>
                          setTimeFilterMap((prev) => ({ ...prev, [credit.id]: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-xs"
                      >
                        <option value="">Tất cả</option>
                        <option value="Morning">Sáng</option>
                        <option value="Afternoon">Chiều</option>
                        <option value="Evening">Tối</option>
                      </select>
                    </div>
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
                        const selected = selectedSuggestionMap[credit.id] === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              setSelectedSuggestionMap((prev) => ({ ...prev, [credit.id]: item.id }))
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
                                  {formatDate(item.makeupDate || item.startTime)}
                                </p>
                                {item.branchName && (
                                  <p className="mt-0.5 text-[11px] text-gray-500">Chi nhánh: {item.branchName}</p>
                                )}
                              </div>
                              {selected && <RefreshCw className="h-4 w-4 text-red-600" />}
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
                        {submittingId === credit.id
                          ? "Đang xử lý..."
                          : credit.status?.toLowerCase() === "scheduled"
                          ? "Đổi lịch học bù"
                          : "Đăng ký học bù"}
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
      </div>
    </Page>
  );
}

export default ParentMakeupCreditsPage;
