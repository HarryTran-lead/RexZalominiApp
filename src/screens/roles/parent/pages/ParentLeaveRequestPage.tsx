import React, { useCallback, useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import { Listbox, ListboxOptions, Transition } from "@headlessui/react";
import { parentService } from "@/services/parentService";
import { authService } from "@/services/authService";
import { api } from "@/api/api";
import { ParentLeaveRequest, ParentLeaveRequestsResponse } from "@/types/parent";
import { UserProfile } from "@/types/auth";
import { StudentClass } from "@/services";
import { API_ENDPOINTS } from "@/constants/apiURL";
import { storage } from "@/utils/storage";

type ViewMode = "list" | "create";

function ParentLeaveRequestPage() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [requests, setRequests] = useState<ParentLeaveRequestsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New state for dropdown data
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Form state
  const [form, setForm] = useState<ParentLeaveRequest>({
    studentProfileId: "",
    classId: "",
    sessionDate: "",
    endDate: "",
    reason: "",
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parentService.getLeaveRequests({ pageSize: 50 });
      setRequests(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách đơn xin nghỉ");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch students list on component mount
  const fetchStudents = useCallback(async () => {
    try {
      const response = await authService.getProfiles();
      if (response.data) {
        const studentsList = response.data.filter((p) => p.profileType === "Student");
        setStudents(studentsList);
        // Pre-select first student if available
        if (studentsList.length > 0 && !form.studentProfileId) {
          setForm((prev) => ({ ...prev, studentProfileId: studentsList[0].id }));
        }
      }
    } catch (err: any) {
      console.error("Error fetching students:", err);
    }
  }, [form.studentProfileId]);

  // Fetch classes for selected student
  const fetchStudentClasses = useCallback(async (studentProfileId: string) => {
  try {
    setLoadingClasses(true);
    setClasses([]);

    // Lấy parent token hiện tại để restore sau
    const parentToken = await storage.getAccessToken();

    // Select student → lấy token tạm thời (KHÔNG lưu vào storage)
    const selectRes = await authService.selectStudent({ profileId: studentProfileId });
    const studentToken = selectRes?.data?.accessToken;
    if (!studentToken) throw new Error("Không lấy được student token");

    // Restore lại parent token ngay
    await storage.setAccessToken(parentToken || "");

    // Gọi API với student token qua header override
    const res = await api.get(API_ENDPOINTS.STUDENT.CLASSES, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    const classList: StudentClass[] =
      res?.data?.classes?.items ??
      res?.data?.items ??
      [];

    setClasses(classList);

    if (classList.length > 0) {
      setForm((prev) => ({ ...prev, classId: classList[0].id }));
    } else {
      setForm((prev) => ({ ...prev, classId: "" }));
    }
  } catch (err: any) {
    console.error("Error fetching classes:", err);
    openSnackbar({ text: "Không thể tải danh sách lớp", type: "error" });
  } finally {
    setLoadingClasses(false);
  }
}, [openSnackbar]);

  useEffect(() => {
    fetchRequests();
    fetchStudents();
  }, []);

  // Fetch classes when student selection changes
  useEffect(() => {
    if (form.studentProfileId) {
      fetchStudentClasses(form.studentProfileId);
    }
  }, [form.studentProfileId, fetchStudentClasses]);

  useEffect(() => {
    if (viewMode === "create" && !form.studentProfileId && students.length > 0) {
      setForm((prev) => ({ ...prev, studentProfileId: students[0].id }));
    }
  }, [viewMode, form.studentProfileId, students]);

  const handleSubmit = async () => {
    if (!form.sessionDate || !form.reason?.trim()) {
      openSnackbar({ text: "Vui lòng điền đầy đủ thông tin bắt buộc", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await parentService.createLeaveRequest(form);
      openSnackbar({ text: "Gửi đơn xin nghỉ thành công", type: "success" });
      setForm({ studentProfileId: "", classId: "", sessionDate: "", endDate: "", reason: "" });
      setViewMode("list");
      fetchRequests();
    } catch (err: any) {
      openSnackbar({ text: err?.message || "Gửi đơn thất bại", type: "error" });
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      {/* Header */}
      <div className="shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button
          onClick={() => (viewMode === "create" ? setViewMode("list") : navigate(-1))}
          className="text-white mr-3"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg flex-1">
          {viewMode === "create" ? "Tạo đơn xin nghỉ" : "Đơn xin nghỉ"}
        </h1>
        {viewMode === "list" && (
          <button
            onClick={() => setViewMode("create")}
            className="bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold"
          >
            + Tạo đơn
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-24">
      {viewMode === "create" ? (
        /* Create Form */
        <div className="px-4 pt-4 space-y-4">
          {/* Student Name Selector with Headless UI */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tên học sinh *</label>
            <Listbox
              value={form.studentProfileId}
              onChange={(value) => setForm({ ...form, studentProfileId: value })}
            >
              <div className="relative">
                <Listbox.Button className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center justify-between">
                  <span className="block truncate">
                    {form.studentProfileId
                      ? students.find((s) => s.id === form.studentProfileId)?.displayName || "-- Chọn học sinh --"
                      : "-- Chọn học sinh --"}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                    {students.map((student) => (
                      <Listbox.Option
                        key={student.id}
                        value={student.id}
                        className={({ active }) =>
                          `cursor-pointer select-none relative py-2.5 px-3 ${
                            active ? "bg-red-50 text-red-600" : "text-gray-900"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}>
                            {student.displayName}
                          </span>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* Class Selector with Headless UI */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Lớp học *</label>
            {loadingClasses ? (
              <div className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm flex items-center gap-2">
                <Spinner /> Đang tải lớp học...
              </div>
            ) : (
              <Listbox
                value={form.classId}
                onChange={(value) => setForm({ ...form, classId: value })}
                disabled={loadingClasses}
              >
                <div className="relative">
                  <Listbox.Button className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="block truncate">
                      {form.classId
                        ? (() => {
                            const selectedClass = classes.find((c) => c.id === form.classId);
                            return selectedClass?.title || "-- Chọn lớp --";
                          })()
                        : "-- Chọn lớp --"}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                      {classes.map((cls) => (
                        <Listbox.Option
                          key={cls.id}
                          value={cls.id}
                          className={({ active }) =>
                            `cursor-pointer select-none relative py-2.5 px-3 ${
                              active ? "bg-red-50 text-red-600" : "text-gray-900"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}>
                              {cls.title}
                            </span>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày bắt đầu nghỉ *</label>
            <input
              type="date"
              value={form.sessionDate}
              onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
              className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày kết thúc nghỉ</label>
            <input
              type="date"
              value={form.endDate || ""}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Lý do *</label>
            <textarea
              value={form.reason || ""}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Nhập lý do xin nghỉ..."
              rows={4}
              className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 active:bg-red-700 transition-colors"
          >
            {submitting ? "Đang gửi..." : "Gửi đơn xin nghỉ"}
          </button>
        </div>
      ) : (
        /* List View */
        <div className="px-4 pt-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm mb-3">{error}</p>
              <button onClick={fetchRequests} className="text-red-600 text-sm font-semibold">
                Thử lại
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm mb-3">Chưa có đơn xin nghỉ nào</p>
              <button
                onClick={() => setViewMode("create")}
                className="text-red-600 text-sm font-semibold"
              >
                Tạo đơn ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((item) => {
                const badge = getStatusBadge(item.status);
                // Find student name from the profile
                const studentName = students.find((s) => s.id === item.studentProfileId)?.displayName || "Học sinh";
                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 mr-2">
                        <h3 className="font-bold text-gray-800 text-sm">
                          {studentName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">ID: {item.classId}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
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
