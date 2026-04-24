import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner } from "zmp-ui";
import { CheckCircle2, ChevronRight, X } from "lucide-react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { ChevronsUpDown } from "lucide-react";
import { parentService } from "@/services/parentService";
import { ParentMakeupCredit, ParentMakeupSuggestion } from "@/types/parent";

/** Parse a datetime string ending with Z without applying UTC offset (backend sends local time) */
function parseLocalDatetime(value?: string | null): Date {
  if (!value) return new Date(NaN);
  const clean = value.replace(/Z$/i, "");
  return new Date(clean);
}

function formatDateTime(value?: string): string {
  if (!value) return "--";
  const d = parseLocalDatetime(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(value?: string): string {
  if (!value) return "--";
  const d = parseLocalDatetime(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDateOnly(value?: string): string {
  if (!value) return "--";
  const d = parseLocalDatetime(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatCreatedReason(reason?: string): string {
  if (!reason) return "Không rõ";
  const map: Record<string, string> = {
    approvedleave24h: "Nghỉ phép được duyệt (trước 24h)",
    approvedleave: "Nghỉ phép được duyệt",
    manualcredit: "Cấp thủ công",
    systemcredit: "Hệ thống tự cấp",
  };
  return map[reason.toLowerCase()] ?? reason;
}

type Step = 1 | 2 | 3;

interface MakeupScheduleModalProps {
  /** The makeup credit being used */
  credit: ParentMakeupCredit;
  studentProfileId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ClassOption {
  classId: string;
  classCode: string;
  classTitle: string;
  programName: string;
}

export default function MakeupScheduleModal({
  credit,
  studentProfileId,
  onClose,
  onSuccess,
}: MakeupScheduleModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessions, setSessions] = useState<ParentMakeupSuggestion[]>([]);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load available sessions when modal opens
  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    setSessionsError(null);
    try {
      const result = await parentService.getAvailableMakeupSessions(credit.id);
      setSessions(result);
      // Auto-select first class
      if (result.length > 0) {
        setSelectedClassId(result[0].classId);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách buổi học bù";
      setSessionsError(message);
    } finally {
      setLoadingSessions(false);
    }
  }, [credit.id]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  // Build unique class list
  const classOptions: ClassOption[] = useMemo(() => {
    const seen = new Set<string>();
    const result: ClassOption[] = [];
    sessions.forEach((s) => {
      if (!seen.has(s.classId)) {
        seen.add(s.classId);
        result.push({
          classId: s.classId,
          classCode: s.classCode,
          classTitle: s.classTitle,
          programName: s.programName,
        });
      }
    });
    return result;
  }, [sessions]);

  // Sessions for selected class
  const filteredSessions = useMemo(
    () => sessions.filter((s) => s.classId === selectedClassId),
    [sessions, selectedClassId]
  );

  const selectedClass = useMemo(
    () => classOptions.find((c) => c.classId === selectedClassId) ?? null,
    [classOptions, selectedClassId]
  );

  const selectedSession = useMemo(
    () => filteredSessions.find((s) => s.sessionId === selectedSessionId) ?? null,
    [filteredSessions, selectedSessionId]
  );

  // Reset session when class changes
  useEffect(() => {
    setSelectedSessionId("");
  }, [selectedClassId]);

  const handleSubmit = async () => {
    if (!selectedSession || !selectedClassId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await parentService.useMakeupCredit(credit.id, {
        studentProfileId,
        classId: selectedClassId,
        targetSessionId: selectedSession.sessionId,
      });
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng ký học bù thất bại";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ["Chọn buổi nghỉ", "Chọn buổi bù", "Xác nhận"];
  const canProceedStep2 = Boolean(selectedClassId && selectedSessionId);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="w-full max-h-[92vh] flex flex-col rounded-t-3xl bg-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 rounded-t-3xl bg-[#BB0000] px-4 pt-4 pb-5 text-white">
          {/* Handle */}
          <div className="flex justify-center mb-3">
            <div className="h-1 w-10 rounded-full bg-white/40" />
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold">Thay đổi lịch xếp học bù</h2>
              <p className="mt-0.5 text-xs text-white/75">
                Bước {step}/3 •{" "}
                {stepLabels.map((label, i) => (
                  <span
                    key={label}
                    className={i + 1 === step ? "font-semibold text-white" : "text-white/60"}
                  >
                    {i > 0 && " • "}
                    {label}
                  </span>
                ))}
              </p>
            </div>
            <button onClick={onClose} className="rounded-full p-1 active:bg-white/10 mt-0.5">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Step progress bar */}
          <div className="mt-3 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-6">
          {/* ── STEP 1: Review absent session ── */}
          {step === 1 && (
            <>
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-semibold text-red-600 mb-2.5">① Buổi học đã nghỉ</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs text-gray-500 shrink-0">Lớp học</span>
                    <span className="text-xs font-semibold text-gray-800 text-right">
                      {credit.classTitle || credit.classCode || "—"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs text-gray-500 shrink-0">Ngày nghỉ</span>
                    <span className="text-xs font-medium text-gray-800 text-right">
                      {formatDateOnly(credit.sourceSessionDate || credit.createdAt)}
                    </span>
                  </div>
                  {credit.createdReason && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs text-gray-500 shrink-0">Lý do</span>
                      <span className="text-xs text-gray-700 text-right">
                        {formatCreatedReason(credit.createdReason)}
                      </span>
                    </div>
                  )}
                  {credit.expiresAt && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs text-gray-500 shrink-0">Hết hạn</span>
                      <span className="text-xs font-medium text-orange-600 text-right">
                        {formatDateOnly(credit.expiresAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                Hệ thống sẽ lọc các buổi học bù ở <strong>cuối tuần</strong>, thuộc <strong>tuần sau</strong> buổi nghỉ, cùng chi nhánh nhưng khác lớp cũ.
              </div>
            </>
          )}

          {/* ── STEP 2: Choose class + session ── */}
          {step === 2 && (
            <>
              {loadingSessions && (
                <div className="flex items-center justify-center py-12">
                  <Spinner />
                </div>
              )}

              {!loadingSessions && sessionsError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
                  <p className="text-sm text-red-600 mb-3">{sessionsError}</p>
                  <button
                    type="button"
                    onClick={() => void loadSessions()}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {!loadingSessions && !sessionsError && sessions.length === 0 && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
                  <p className="text-sm text-gray-500">Không tìm thấy buổi học bù phù hợp.</p>
                  <p className="mt-1 text-xs text-gray-400">Vui lòng liên hệ trung tâm để được hỗ trợ.</p>
                </div>
              )}

              {!loadingSessions && !sessionsError && sessions.length > 0 && (
                <div className="space-y-4">
                  {/* Class selector (step 3 in web) */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shrink-0">3</span>
                      <p className="text-xs font-semibold text-gray-700">Chọn lớp bù</p>
                    </div>
                    <Listbox value={selectedClassId} onChange={setSelectedClassId}>
                      <div className="relative">
                        <ListboxButton className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm focus:outline-none">
                          <span className="block truncate text-gray-800">
                            {selectedClass
                              ? `${selectedClass.classCode} – ${selectedClass.classTitle}`
                              : "Chọn lớp bù"}
                          </span>
                          <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" />
                        </ListboxButton>
                        <ListboxOptions
                          portal
                          anchor="bottom start"
                          className="z-[80] mt-1 max-h-52 w-[var(--button-width)] overflow-auto rounded-xl border border-gray-200 bg-white p-1 text-sm shadow-lg [--anchor-gap:4px]"
                        >
                          {classOptions.map((cls) => (
                            <ListboxOption
                              key={cls.classId}
                              value={cls.classId}
                              className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[selected]:font-semibold"
                            >
                              <p className="text-sm font-medium">{cls.classCode} – {cls.classTitle}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{cls.programName}</p>
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                    {selectedClass && (
                      <p className="mt-1.5 text-[11px] text-gray-500">
                        Chỉ hiện thị các lớp và buổi khác còn chỗ trong cùng chương trình bù này.
                      </p>
                    )}
                  </div>

                  {/* Session selector (step 4 in web) */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shrink-0">4</span>
                      <p className="text-xs font-semibold text-gray-700">Chọn buổi bù</p>
                    </div>
                    <Listbox
                      value={selectedSessionId}
                      onChange={setSelectedSessionId}
                      disabled={!selectedClassId || filteredSessions.length === 0}
                    >
                      <div className="relative">
                        <ListboxButton className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm focus:outline-none disabled:opacity-60">
                          <span className="block truncate text-gray-800">
                            {selectedSession
                              ? `${selectedSession.classCode} • ${selectedSession.classTitle} • ${formatTime(selectedSession.plannedDatetime)} ${formatDateOnly(selectedSession.plannedDatetime)}`
                              : filteredSessions.length === 0 && selectedClassId
                              ? "Không có buổi học phù hợp"
                              : "Chọn buổi học bù"}
                          </span>
                          <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" />
                        </ListboxButton>
                        <ListboxOptions
                          portal
                          anchor="bottom start"
                          className="z-[80] mt-1 max-h-52 w-[var(--button-width)] overflow-auto rounded-xl border border-gray-200 bg-white p-1 text-sm shadow-lg [--anchor-gap:4px]"
                        >
                          {filteredSessions.map((s) => (
                            <ListboxOption
                              key={s.sessionId}
                              value={s.sessionId}
                              className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[selected]:font-semibold"
                            >
                              <p className="text-sm font-medium">
                                {s.classCode} • {s.classTitle} • {formatTime(s.plannedDatetime)}
                                {" "}
                                {parseLocalDatetime(s.plannedDatetime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                              </p>
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>

                  {/* Auto-fill display */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm">📅</span>
                        <p className="text-xs font-semibold text-gray-700">Ngày học bù</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 min-h-[42px]">
                        {selectedSession
                          ? parseLocalDatetime(selectedSession.plannedDatetime).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : <span className="text-gray-400 text-xs">Chọn buổi bù để xem ngày học</span>
                        }
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm">⏰</span>
                        <p className="text-xs font-semibold text-gray-700">Giờ học bù</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 min-h-[42px]">
                        {selectedSession
                          ? `${formatTime(selectedSession.plannedDatetime)} – ${formatTime(selectedSession.plannedEndDatetime)}`
                          : <span className="text-gray-400 text-xs">Chọn buổi bù để xem giờ học</span>
                        }
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
                    Chọn <strong>lớp bù</strong> trước, sau đó chọn <strong>buổi bù</strong>. Hệ thống sẽ tự điền <strong>ngày</strong> và <strong>giờ</strong> theo buổi bạn đã chọn.
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── STEP 3: Confirm ── */}
          {step === 3 && selectedSession && selectedClass && (
            <>
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 space-y-2">
                <p className="text-xs font-semibold text-red-600 mb-1">Xác nhận thông tin</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Buổi đã nghỉ</span>
                  <span className="font-medium text-gray-800 text-right">
                    {credit.classTitle || credit.classCode || "—"}
                  </span>
                </div>
                <div className="border-t border-red-100 pt-2 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Lớp học bù</span>
                    <span className="font-semibold text-gray-800 text-right">
                      {selectedClass.classCode} – {selectedClass.classTitle}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Chương trình</span>
                    <span className="font-medium text-gray-800 text-right">{selectedClass.programName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Ngày học bù</span>
                    <span className="font-semibold text-red-700 text-right">
                      {parseLocalDatetime(selectedSession.plannedDatetime).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Giờ học</span>
                    <span className="font-semibold text-gray-800">
                      {formatTime(selectedSession.plannedDatetime)} – {formatTime(selectedSession.plannedEndDatetime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
                Sau khi xác nhận, lịch học bù sẽ được đặt. Giáo viên sẽ điểm danh tại buổi đó.
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                  {submitError}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer buttons */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-4 flex items-center justify-end gap-3">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loadingSessions}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 active:bg-red-700"
              >
                Tiếp tục <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 active:bg-red-700"
              >
                Tiếp tục <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={submitting}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 active:bg-gray-50 disabled:opacity-60"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting || !selectedSession}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 active:bg-red-700"
              >
                {submitting ? (
                  <><Spinner /> Đang xử lý...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Xác nhận</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
