import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import {
  Bell,
  BookOpenText,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Images,
  Repeat,
  WalletCards,
} from "lucide-react";
import { Spinner, useSnackbar } from "zmp-ui";
import RoleDashboardScaffold, {
  RoleDashboardSection,
} from "@/components/role/RoleDashboardScaffold";
import UserAvatar from "@/components/common/UserAvatar";
import { authService } from "@/services/authService";
import { parentService } from "@/services/parentService";
import { storage } from "@/utils/storage";
import { UserProfile } from "@/types/auth";
import { StudentSummary } from "@/types/parent";
import img from "../../../../assets/images/LogoRex.png";

function ParentPage() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [children, setChildren] = useState<UserProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [studentSummaries, setStudentSummaries] = useState<StudentSummary[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadStudentSummaries = async () => {
    try {
      setLoadingSummaries(true);
      const summaries = await parentService.getStudentsWithMakeupOrLeave();
      setStudentSummaries(summaries);
    } catch {
      setStudentSummaries([]);
    } finally {
      setLoadingSummaries(false);
    }
  };

  const loadChildren = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfiles();
      if (response.data) {
        const students = response.data.filter((p) => p.profileType === "Student");
        setChildren(students);
        if (students.length > 0) {
          // Try to restore previously selected profile from storage
          const savedProfileId = await storage.getItem("selectedProfileId");
          const profileToSelect = savedProfileId
            ? students.find((s) => s.id === savedProfileId) || students[0]
            : students[0];
          await selectChild(profileToSelect, true);
        }

        await loadStudentSummaries();
      }
    } catch (err) {
      console.error("Error loading profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectChild = async (profile: UserProfile, silent = false) => {
    try {
      if (!silent) setSwitching(true);
      const response = await authService.selectStudent({ profileId: profile.id });
      if (response?.data?.accessToken) {
        await storage.setAccessToken(response.data.accessToken);
      }
      await storage.setItem("selectedProfileId", profile.id);
      setSelectedChild(profile);
      if (!silent) {
        openSnackbar({ text: `Đã chọn ${profile.displayName}`, type: "success" });
      }
    } catch (error: any) {
      const msg = error?.response?.data?.detail ?? "Không thể chọn con";
      openSnackbar({ text: msg, type: "error" });
    } finally {
      setSwitching(false);
    }
  };

  const selectedChildSummary = useMemo(() => {
    if (!selectedChild) return null;
    return (
      studentSummaries.find(
        (summary) => summary.id === selectedChild.id || summary.userId === selectedChild.userId
      ) ?? null
    );
  }, [selectedChild, studentSummaries]);

  const totalLeaveRequests = useMemo(
    () => studentSummaries.reduce((sum, item) => sum + (item.leaveRequestCount || 0), 0),
    [studentSummaries]
  );

  const totalMakeupCredits = useMemo(
    () => studentSummaries.reduce((sum, item) => sum + (item.makeupCreditCount || 0), 0),
    [studentSummaries]
  );

  const sections: RoleDashboardSection[] = [
    {
      title: "Theo dõi học tập",
      description: "Nắm nhanh tiến độ của con theo từng ngày",
      items: [
        {
          icon: <CalendarDays className="w-10 h-10" strokeWidth={1.5} />,
          label: "Lịch học",
          path: "/parent/timetable",
          helper: "Xem buổi học tuần này",
        },
        {
          icon: <BookOpenText className="w-10 h-10" strokeWidth={1.5} />,
          label: "Bài tập",
          path: "/parent/homework",
          helper: "Theo dõi hạn nộp và điểm",
        },
        {
          icon: <ClipboardCheck className="w-10 h-10" strokeWidth={1.5} />,
          label: "Kiểm tra",
          path: "/parent/exams",
          helper: "Kết quả kiểm tra gần đây",
        },
        {
          icon: <FileText className="w-10 h-10" strokeWidth={1.5} />,
          label: "Báo cáo buổi học",
          path: "/parent/session-reports",
          helper: "Nhận xét giáo viên theo từng buổi học",
        },
        {
          icon: <FileText className="w-10 h-10" strokeWidth={1.5} />,
          label: "Báo cáo tháng",
          path: "/parent/monthly-reports",
          helper: "Tổng hợp tiến độ học tập theo tháng",
        },
      ],
    },
    {
      title: "Khác",
      description: "Các tiện ích hỗ trợ phụ huynh",
      items: [
        {
          icon: <Bell className="w-10 h-10" strokeWidth={1.5} />,
          label: "Thông báo",
          path: "/parent/notifications",
          helper: "Tin nhắn mới từ trung tâm",
        },
        {
          icon: <FileText className="w-10 h-10" strokeWidth={1.5} />,
          label: "Đơn hỗ trợ",
          path: "/parent/application",
          helper: "Gửi yêu cầu hỗ trợ nhanh",
        },
        {
          icon: <FileText className="w-10 h-10" strokeWidth={1.5} />,
          label: "Đơn xin nghỉ",
          path: "/parent/leave-request",
          helper: "Gửi và theo dõi trạng thái",
        },
        {
          icon: <WalletCards className="w-10 h-10" strokeWidth={1.5} />,
          label: "Đơn bảo lưu",
          path: "/parent/pause-request",
          helper: "Quản lý bảo lưu dài hạn",
        },
        {
          icon: <Repeat className="w-10 h-10" strokeWidth={1.5} />,
          label: "Quyền học bù",
          path: "/parent/makeup-credits",
          helper: "Dùng credit học bù và xem lịch sử",
        },
        {
          icon: <Images className="w-10 h-10" strokeWidth={1.5} />,
          label: "Media",
          path: "/parent/media",
          helper: "Xem hình ảnh và video lớp học",
        },
      ],
    },
  ];

  const childSelector = (
    <div className="space-y-2">
      <div className="rounded-2xl border border-red-100 bg-white p-2 shadow-sm">
        <Listbox
          value={selectedChild}
          onChange={(profile) => {
            if (profile) {
              void selectChild(profile);
            }
          }}
          disabled={switching}
        >
          <div className="relative">
            <ListboxButton className="w-full rounded-xl px-2 py-1 text-left active:bg-gray-50">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={selectedChild?.displayName}
                  avatarUrl={selectedChild?.avatarUrl}
                  containerClassName="h-11 w-11 shrink-0"
                  textClassName="text-base font-bold"
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold leading-tight text-gray-800">
                    {selectedChild?.displayName ?? "Chọn con"}
                  </p>
                  <span className="mt-0.5 inline-block rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                    Hồ sơ đang theo dõi
                  </span>
                </div>
                {switching ? <Spinner /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>
            </ListboxButton>

            <ListboxOptions className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
              {children.map((child) => (
                <ListboxOption
                  key={child.id}
                  value={child}
                  className="cursor-pointer px-2 py-1"
                >
                  {({ selected, active }) => (
                    <div
                      className={`flex items-center gap-3 rounded-lg px-2 py-2 transition ${
                        active || selected ? "bg-red-50" : ""
                      }`}
                    >
                      <UserAvatar
                        name={child.displayName}
                        avatarUrl={child.avatarUrl}
                        containerClassName="h-10 w-10 shrink-0"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-800">{child.displayName}</p>
                      </div>
                      {selected && <Check className="h-4 w-4 text-red-600" />}
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-yellow-700">Đơn nghỉ đang chờ</p>
          <p className="mt-1 text-lg font-bold text-yellow-900">
            {loadingSummaries ? "..." : selectedChildSummary?.leaveRequestCount ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-emerald-700">Credit chưa dùng</p>
          <p className="mt-1 text-lg font-bold text-emerald-900">
            {loadingSummaries ? "..." : selectedChildSummary?.makeupCreditCount ?? 0}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-white p-2">
        <button
          type="button"
          onClick={() => navigate("/parent/leave-request")}
          className="flex-1 rounded-xl border border-red-200 bg-red-50 px-2 py-2 text-xs font-semibold text-red-700"
        >
          Xin nghỉ học
        </button>
        <button
          type="button"
          onClick={() => navigate("/parent/makeup-credits")}
          className="flex-1 rounded-xl border border-red-200 bg-red-50 px-2 py-2 text-xs font-semibold text-red-700"
        >
          Quyền học bù
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50/40 pb-20">
        <Spinner />
      </div>
    );
  }

  return (
    <RoleDashboardScaffold
      logoSrc={img}
      title="Phụ huynh"
      subtitle="Đồng hành cùng con trên hành trình học tiếng Anh"
      stats={[
        { label: "Hồ sơ", value: `${children.length} con` },
        { label: "Đơn nghỉ", value: `${totalLeaveRequests}` },
        { label: "Credit", value: `${totalMakeupCredits}` },
      ]}
      sections={sections}
      onNavigate={(path) => navigate(path)}
      topSlot={childSelector}
    />
  );
}

export default ParentPage;
