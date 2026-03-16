import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, useSnackbar } from "zmp-ui";
import RoleDashboardScaffold, {
  RoleDashboardSection,
} from "@/components/role/RoleDashboardScaffold";
import { authService } from "@/services/authService";
import { storage } from "@/utils/storage";
import { UserProfile } from "@/types/auth";
import img from "../../../../assets/images/LogoRex.png";

function ParentPage() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [children, setChildren] = useState<UserProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<UserProfile | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

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
      setSelectorOpen(false);
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

  const sections: RoleDashboardSection[] = [
    {
      title: "Theo dõi học tập",
      description: "Nắm nhanh tiến độ của con theo từng ngày",
      items: [
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          label: "Lịch học",
          path: "/parent/timetable",
          helper: "Xem buổi học tuần này",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
          label: "Bài tập",
          path: "/parent/homework",
          helper: "Theo dõi hạn nộp và điểm",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          label: "Kiểm tra",
          path: "/parent/exams",
          helper: "Kết quả kiểm tra gần đây",
        },
      ],
    },
    {
      title: "Khác",
      description: "Các tiện ích hỗ trợ phụ huynh",
      items: [
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          label: "Thông báo",
          path: "/parent/notifications",
          helper: "Tin nhắn mới từ trung tâm",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          label: "Đơn xin nghỉ",
          path: "/parent/leave-request",
          helper: "Gửi và theo dõi trạng thái",
        },
      ],
    },
  ];

  const childSelector = (
    <div className="rounded-2xl border border-red-100 bg-white shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 active:bg-gray-50"
        onClick={() => setSelectorOpen((v) => !v)}
        disabled={switching}
      >
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-base shrink-0">
          {selectedChild ? selectedChild.displayName.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-gray-800 text-sm leading-tight">{selectedChild?.displayName ?? "Chọn con"}</p>
          <span className="inline-block mt-0.5 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
            Hồ sơ đang theo dõi
          </span>
        </div>
        {switching ? (
          <Spinner />
        ) : (
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${selectorOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {selectorOpen && (
        <div className="border-t border-gray-100 bg-red-50/40">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => selectChild(child)}
              className={`w-full flex items-center gap-3 px-4 py-3 active:bg-red-50 transition ${
                selectedChild?.id === child.id ? "bg-red-50" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold shrink-0">
                {child.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-800 text-sm">{child.displayName}</p>
              </div>
              {selectedChild?.id === child.id && (
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
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
        { label: "Vai trò", value: "Parent" },
        { label: "Ưu tiên", value: "Tiến độ học" },
      ]}
      sections={sections}
      onNavigate={(path) => navigate(path)}
      topSlot={childSelector}
    />
  );
}

export default ParentPage;
