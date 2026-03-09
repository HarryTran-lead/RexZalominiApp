import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";
import { authService } from "@/services/authService";
import { storage } from "@/utils/storage";
import { UserProfile } from "@/types/auth";

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
        // Auto-select first child and fetch their token
        if (students.length > 0) {
          await selectChild(students[0], true);
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

  const menuItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      label: "Thanh toán",
      onPress: () => {},
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: "Kho tài liệu",
      onPress: () => {},
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      label: "Thông báo",
      onPress: () => {},
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      label: "Hỗ trợ",
      onPress: () => {},
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: "Đơn xin nghỉ",
      onPress: () => {},
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: "Tài khoản",
      onPress: () => {},
    },
  ];

  return (
    <Page className="min-h-screen bg-gray-50 pb-24">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="px-4 pt-4">
          {/* Child selector */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
            {/* Current child row */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 active:bg-gray-50"
              onClick={() => setSelectorOpen((v) => !v)}
              disabled={switching}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {selectedChild
                  ? selectedChild.displayName.charAt(0).toUpperCase()
                  : "?"}
              </div>

              <div className="flex-1 text-left">
                <p className="font-bold text-gray-800 text-base leading-tight">
                  {selectedChild?.displayName ?? "Chọn con"}
                </p>
                <span className="inline-block mt-0.5 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                  Học viên
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

            {/* Dropdown children list */}
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                      {child.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800 text-sm">{child.displayName}</p>                    </div>
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

          {/* Menu items */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onPress}
                className="w-full flex items-center gap-4 px-4 py-4 active:bg-gray-50 text-left"
              >
                <span className="text-gray-500">{item.icon}</span>
                <span className="text-base text-gray-800 font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}

export default ParentPage;
