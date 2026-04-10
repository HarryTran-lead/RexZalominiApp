import React, { useEffect, useMemo, useState } from "react";
import { Page, useSnackbar } from "zmp-ui";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { studentService } from "@/services";
import { storage } from "@/utils/storage";
import { formatDateTime } from "@/utils";
import { CreateTicket, StudentClass, Ticket, TicketCategory, TicketStatus } from "@/types/student";

type ApplicationTab = "create" | "history";

interface TeacherOption {
  id: string;
  name: string;
  classId: string;
}

interface TicketFormState {
  category: TicketCategory;
  type: "General" | "DirectToTeacher";
  classId: string;
  assignedToUserId: string;
  subject: string;
  message: string;
}

interface TicketResponseItem {
  id: string;
  authorName: string;
  message: string;
  createdAt: string | undefined;
}

const initialForm: TicketFormState = {
  category: "Homework",
  type: "General",
  classId: "",
  assignedToUserId: "",
  subject: "",
  message: "",
};

const categoryOptions: Array<{ value: TicketCategory; label: string }> = [
  { value: "Homework", label: "Bài tập" },
  { value: "Finance", label: "Học phí" },
  { value: "Schedule", label: "Lịch học" },
  { value: "Tech", label: "Kỹ thuật" },
];

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  Open: { label: "Mới tạo", className: "bg-amber-100 text-amber-700 border border-amber-200" },
  InProgress: { label: "Đang xử lý", className: "bg-red-100 text-red-700 border border-red-200" },
  Resolved: { label: "Đã xử lý", className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  Closed: { label: "Đã đóng", className: "bg-slate-100 text-slate-700 border border-slate-200" },
};

const getStatusMeta = (status: string) => {
  const normalized = status as TicketStatus;
  return statusConfig[normalized] ?? {
    label: status || "--",
    className: "bg-slate-100 text-slate-600 border border-slate-200",
  };
};

const getCategoryLabel = (category: TicketCategory | string) => {
  const match = categoryOptions.find((item) => item.value === category);
  return match?.label ?? category;
};

const supportTypeOptions: Array<{ value: "General" | "DirectToTeacher"; label: string }> = [
  { value: "General", label: "Gửi trung tâm" },
  { value: "DirectToTeacher", label: "Gửi trực tiếp giáo viên" },
];

const getSupportTypeLabel = (value: "General" | "DirectToTeacher") => {
  return value === "DirectToTeacher" ? "Gửi trực tiếp giáo viên" : "Gửi trung tâm";
};

const getObject = (value: unknown): Record<string, unknown> | null => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
};

const readTextFromObject = (obj: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
};

const extractTicketResponses = (payload: unknown): TicketResponseItem[] => {
  const root = getObject(payload);
  if (!root) return [];

  const comments = Array.isArray(root.comments) ? root.comments : [];

  return comments
    .map((item) => {
      const obj = getObject(item);
      if (!obj) return null;

      const message = readTextFromObject(obj, ["message", "content", "reply", "note", "text"]);
      if (!message) return null;

      return {
        id:
          (typeof obj.id === "string" && obj.id) ||
          `${typeof obj.commenterUserName === "string" ? obj.commenterUserName : "comment"}-${message}`,
        authorName:
          (typeof obj.commenterUserName === "string" && obj.commenterUserName) ||
          (typeof obj.commenterProfileName === "string" && obj.commenterProfileName) ||
          "Hệ thống",
        message,
        createdAt: typeof obj.createdAt === "string" ? obj.createdAt : undefined,
      };
    })
    .filter((item): item is TicketResponseItem => item !== null);
};

function StudentApplicationPage() {
  const { openSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState<ApplicationTab>("create");
  const [form, setForm] = useState<TicketFormState>(initialForm);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [userBranchId, setUserBranchId] = useState<string>("");

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketResponses, setTicketResponses] = useState<Record<string, TicketResponseItem[]>>({});
  const [loadingResponseIds, setLoadingResponseIds] = useState<Record<string, boolean>>({});

  const teacherOptions = useMemo<TeacherOption[]>(() => {
    const selectedClass = classes.find((item) => item.id === form.classId);
    const sourceClasses = selectedClass ? [selectedClass] : classes;
    const unique = new Map<string, TeacherOption>();

    sourceClasses.forEach((item) => {
      if (item.mainTeacherId && item.mainTeacherName && !unique.has(item.mainTeacherId)) {
        unique.set(item.mainTeacherId, {
          id: item.mainTeacherId,
          name: item.mainTeacherName,
          classId: item.id,
        });
      }
    });

    return Array.from(unique.values());
  }, [classes, form.classId]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        if (isMounted) {
          setLoadingInit(true);
        }

        const [classRes, profileId, user] = await Promise.all([
          studentService.getClasses({ pageNumber: 1, pageSize: 50 }),
          storage.getItem("selectedProfileId"),
          storage.getUser<{ branchId?: string }>(),
        ]);

        if (!isMounted) {
          return;
        }

        const classData = classRes.data;
        const classItems = Array.isArray(classData?.items)
          ? classData.items
          : Array.isArray(classData)
            ? classData
            : [];

        setClasses(classItems);
        setSelectedProfileId(profileId || "");
        setUserBranchId(user?.branchId || "");
      } catch (error) {
        if (isMounted) {
          openSnackbar({ text: "Không thể tải dữ liệu khởi tạo", type: "error" });
        }
      } finally {
        if (isMounted) {
          setLoadingInit(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchTickets = async (profileId?: string) => {
    try {
      setLoadingTickets(true);
      const response = await studentService.getMyTickets({
        pageNumber: 1,
        pageSize: 50,
        mine: true,
        openedByProfileId: profileId || undefined,
      });
      const items = response.data || [];
      setTickets(profileId ? items.filter((item) => item.openedByProfileId === profileId) : items);
    } catch (error) {
      openSnackbar({ text: "Không thể tải lịch sử đơn", type: "error" });
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    void fetchTickets(selectedProfileId || undefined);
  }, [selectedProfileId]);

  useEffect(() => {
    if (form.type !== "DirectToTeacher") {
      return;
    }

    const exists = teacherOptions.some((teacher) => teacher.id === form.assignedToUserId);
    if (!exists) {
      setForm((prev) => ({ ...prev, assignedToUserId: "" }));
    }
  }, [form.type, form.assignedToUserId, teacherOptions]);

  const handleSubmit = async () => {
    if (!form.subject.trim()) {
      openSnackbar({ text: "Vui lòng nhập tiêu đề", type: "warning" });
      return;
    }
    if (!form.message.trim()) {
      openSnackbar({ text: "Vui lòng nhập nội dung", type: "warning" });
      return;
    }
    if (!form.classId) {
      openSnackbar({ text: "Vui lòng chọn lớp", type: "warning" });
      return;
    }
    if (form.type === "DirectToTeacher" && !form.assignedToUserId) {
      openSnackbar({ text: "Vui lòng chọn giáo viên nhận đơn", type: "warning" });
      return;
    }

    const selectedClass = classes.find((item) => item.id === form.classId);
    const resolvedBranchId = selectedClass?.branchId || userBranchId;

    if (!resolvedBranchId) {
      openSnackbar({ text: "Không tìm thấy thông tin chi nhánh", type: "error" });
      return;
    }

    const payload: CreateTicket = {
      openedByProfileId: selectedProfileId || undefined,
      branchId: resolvedBranchId,
      classId: form.classId,
      category: form.category,
      subject: form.subject.trim(),
      message: form.message.trim(),
      type: form.type,
      assignedToUserId: form.type === "DirectToTeacher" ? form.assignedToUserId : undefined,
    };

    try {
      setSubmitting(true);
      const response = await studentService.createTicket(payload);
      const isSuccess = response.isSuccess ?? response.success;

      if (!isSuccess) {
        openSnackbar({ text: response.message || "Gửi đơn thất bại", type: "error" });
        return;
      }

      openSnackbar({ text: "Gửi đơn thành công", type: "success" });
      setForm((prev) => ({
        ...prev,
        type: "General",
        classId: "",
        assignedToUserId: "",
        subject: "",
        message: "",
      }));
      setActiveTab("history");
      await fetchTickets(selectedProfileId || undefined);
    } catch (error) {
      openSnackbar({ text: "Có lỗi xảy ra khi gửi đơn", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tickets]
  );

  useEffect(() => {
    if (activeTab !== "history" || sortedTickets.length === 0) {
      return;
    }

    const missingTicketIds = sortedTickets
      .map((ticket) => ticket.id)
      .filter((ticketId) => ticketResponses[ticketId] === undefined && !loadingResponseIds[ticketId]);

    if (missingTicketIds.length === 0) {
      return;
    }

    setLoadingResponseIds((prev) => {
      const next = { ...prev };
      missingTicketIds.forEach((ticketId) => {
        next[ticketId] = true;
      });
      return next;
    });

    void Promise.all(
      missingTicketIds.map(async (ticketId) => {
        try {
          const response = await studentService.getTicketDetail(ticketId);
          const replies = extractTicketResponses(response.data as unknown);
          setTicketResponses((prev) => ({ ...prev, [ticketId]: replies }));
        } catch {
          setTicketResponses((prev) => ({ ...prev, [ticketId]: [] }));
        } finally {
          setLoadingResponseIds((prev) => {
            const next = { ...prev };
            delete next[ticketId];
            return next;
          });
        }
      })
    );
  }, [activeTab, sortedTickets, ticketResponses, loadingResponseIds]);

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="sticky top-0 z-20 shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center shadow-md">
        <h1 className="text-white font-bold text-lg w-full text-center">Đơn yêu cầu hỗ trợ</h1>
      </div>

      <div className="shrink-0 bg-white border-b border-gray-200 px-3 pt-3 pb-2">
        <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              activeTab === "create" ? "bg-white text-red-700 shadow-sm" : "text-gray-600"
            }`}
          >
            + Gửi đơn mới
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              activeTab === "history" ? "bg-white text-red-700 shadow-sm" : "text-gray-600"
            }`}
          >
            Lịch sử đơn ({tickets.length})
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 pb-24">
        {loadingInit ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">Đang tải dữ liệu...</div>
        ) : activeTab === "create" ? (
          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <p className="mb-1 font-semibold">Lưu ý:</p>
              <ul className="space-y-1 list-disc pl-4">
                <li>Bộ phận xử lý sẽ phản hồi theo mức độ ưu tiên của yêu cầu.</li>
                <li>Vui lòng nhập thông tin đầy đủ để được hỗ trợ nhanh chóng.</li>
                <li>Bạn có thể theo dõi trạng thái xử lý tại tab Lịch sử đơn.</li>
              </ul>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <label className="text-xs font-semibold text-gray-600">
                  Danh mục <span className="text-red-500">*</span>
                  <Listbox
                    value={form.category}
                    onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                  >
                    <div className="relative mt-1">
                      <ListboxButton className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center justify-between">
                        <span className="block truncate">{getCategoryLabel(form.category)}</span>
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </ListboxButton>

                      <ListboxOptions
                        portal
                        anchor="bottom start"
                        className="z-[80] mt-2 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg focus:outline-none text-sm [--anchor-gap:8px] w-[var(--button-width)]"
                      >
                        {categoryOptions.map((option) => (
                          <ListboxOption
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[focus]:text-red-600 data-[selected]:font-semibold"
                          >
                            {option.label}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </label>

                <label className="text-xs font-semibold text-gray-600">
                  Loại hỗ trợ <span className="text-red-500">*</span>
                  <Listbox
                    value={form.type}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        type: value,
                        assignedToUserId: "",
                      }))
                    }
                  >
                    <div className="relative mt-1">
                      <ListboxButton className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center justify-between">
                        <span className="block truncate">{getSupportTypeLabel(form.type)}</span>
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </ListboxButton>

                      <ListboxOptions
                        portal
                        anchor="bottom start"
                        className="z-[80] mt-2 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg focus:outline-none text-sm [--anchor-gap:8px] w-[var(--button-width)]"
                      >
                        {supportTypeOptions.map((option) => (
                          <ListboxOption
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[focus]:text-red-600 data-[selected]:font-semibold"
                          >
                            {option.label}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </label>

                <label className="text-xs font-semibold text-gray-600">
                  Lớp học <span className="text-red-500">*</span>
                  <Listbox
                    value={form.classId}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        classId: value,
                        assignedToUserId: "",
                      }))
                    }
                  >
                    <div className="relative mt-1">
                      <ListboxButton className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center justify-between">
                        <span className="block truncate">
                          {form.classId
                            ? classes.find((item) => item.id === form.classId)?.title || "-- Chọn lớp học --"
                            : "-- Chọn lớp học --"}
                        </span>
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </ListboxButton>

                      <ListboxOptions
                        portal
                        anchor="bottom start"
                        className="z-[80] mt-2 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg focus:outline-none text-sm [--anchor-gap:8px] w-[var(--button-width)]"
                      >
                        {classes.length === 0 ? (
                          <div className="px-3 py-2 text-gray-400">Không có lớp học</div>
                        ) : (
                          classes.map((item) => (
                            <ListboxOption
                              key={item.id}
                              value={item.id}
                              className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[focus]:text-red-600 data-[selected]:font-semibold"
                            >
                              {item.title}
                            </ListboxOption>
                          ))
                        )}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </label>

                {form.type === "DirectToTeacher" && (
                  <label className="text-xs font-semibold text-gray-600">
                    Giáo viên nhận đơn <span className="text-red-500">*</span>
                    <Listbox
                      value={form.assignedToUserId}
                      onChange={(value) => setForm((prev) => ({ ...prev, assignedToUserId: value }))}
                    >
                      <div className="relative mt-1">
                        <ListboxButton className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center justify-between">
                          <span className="block truncate">
                            {form.assignedToUserId
                              ? teacherOptions.find((teacher) => teacher.id === form.assignedToUserId)?.name || "-- Chọn giáo viên --"
                              : "-- Chọn giáo viên --"}
                          </span>
                          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </ListboxButton>

                        <ListboxOptions
                          portal
                          anchor="bottom start"
                          className="z-[80] mt-2 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg focus:outline-none text-sm [--anchor-gap:8px] w-[var(--button-width)]"
                        >
                          {teacherOptions.length === 0 ? (
                            <div className="px-3 py-2 text-gray-400">Không có giáo viên</div>
                          ) : (
                            teacherOptions.map((teacher) => (
                              <ListboxOption
                                key={teacher.id}
                                value={teacher.id}
                                className="cursor-pointer select-none rounded-lg px-3 py-2.5 text-gray-800 data-[focus]:bg-red-50 data-[focus]:text-red-600 data-[selected]:font-semibold"
                              >
                                {teacher.name}
                              </ListboxOption>
                            ))
                          )}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </label>
                )}

                <label className="text-xs font-semibold text-gray-600">
                  Tiêu đề <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                    placeholder="Nhập tiêu đề..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </label>

                <label className="text-xs font-semibold text-gray-600">
                  Nội dung <span className="text-red-500">*</span>
                  <textarea
                    value={form.message}
                    onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                    placeholder="Nhập nội dung chi tiết..."
                    rows={5}
                    className="mt-1 w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Đang gửi..." : "Gửi đơn"}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(initialForm)}
                  disabled={submitting}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        ) : loadingTickets ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">Đang tải lịch sử đơn...</div>
        ) : sortedTickets.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            <p className="font-medium">Bạn chưa có đơn hỗ trợ nào</p>
            <p className="mt-1 text-sm">Hãy tạo đơn mới để được trung tâm hỗ trợ.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTickets.map((ticket) => {
              const statusMeta = getStatusMeta(ticket.status);
              return (
                <div key={ticket.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-red-700">Phân loại: {getCategoryLabel(ticket.category)}</p>
                      <h3 className="mt-0.5 text-base font-bold text-gray-900 leading-tight">{ticket.subject}</h3>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">{ticket.message}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <p className="text-gray-400">Lớp</p>
                      <p className="font-medium text-gray-700">{ticket.classCode || "--"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Loại xử lý</p>
                      <p className="font-medium text-gray-700">{ticket.type === "DirectToTeacher" ? "Giáo viên" : "Trung tâm"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Ngày tạo</p>
                      <p className="font-medium text-gray-700">{formatDateTime(ticket.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Bình luận</p>
                      <p className="font-medium text-gray-700">{ticket.commentCount}</p>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-gray-100 pt-2.5">
                    <p className="text-xs font-semibold text-gray-500">Phản hồi</p>
                    <div className="mt-2 rounded-lg bg-gray-50 p-2.5">
                      {loadingResponseIds[ticket.id] ? (
                        <p className="text-xs text-gray-500">Đang tải phản hồi...</p>
                      ) : (ticketResponses[ticket.id] || []).length === 0 ? (
                        <p className="text-xs text-gray-500">Hiện chưa có phản hồi từ trung tâm hoặc giáo viên.</p>
                      ) : (
                        <div className="space-y-2">
                          {(ticketResponses[ticket.id] || []).map((reply) => (
                            <div key={reply.id} className="rounded-md bg-white px-2.5 py-2 border border-gray-100">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-red-600">{reply.authorName}</p>
                                {reply.createdAt && (
                                  <p className="text-[11px] text-gray-400">{formatDateTime(reply.createdAt)}</p>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-gray-700 leading-relaxed">{reply.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}

export default StudentApplicationPage;
