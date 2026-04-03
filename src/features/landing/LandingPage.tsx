import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Page, useSnackbar } from "zmp-ui";

import logoRex from "../../assets/images/LogoRex.png";
import { authService } from "../../services/authService";
import { storage } from "../../utils/storage";

import HomeTab from "./tabs/HomeTab";
import FAQTab from "./tabs/FAQTab";
import NewsTab from "./tabs/NewsTab";
import LandingBottomNav from "./components/LandingBottomNav";

export type LandingTab = "home" | "faq" | "news" | "contact";

const TAB_PATHS: Record<LandingTab, string> = {
  home: "/",
  faq: "/faq",
  news: "/news",
  contact: "/contact",
};

const ZALO_OA_ID = import.meta.env.VITE_ZALO_OA_ID ?? "";
const ZALO_OA_URL = import.meta.env.VITE_ZALO_OA_URL ?? "";

const normalizePhone = (raw: string) => raw.replace(/[^0-9]/g, "");

const detectCurrentTab = (pathname: string): LandingTab => {
  if (pathname === "/faq") return "faq";
  if (pathname === "/news") return "news";
  if (pathname === "/contact") return "contact";
  return "home";
};

const isMiniAppRuntime = () =>
  typeof (window as any)?.ZaloJavaScriptInterface !== "undefined";

function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [isLinking, setIsLinking] = useState(false);

  const activeTab = useMemo(
    () => detectCurrentTab(location.pathname),
    [location.pathname]
  );

  // ─── HELPERS ────────────────────────────────────────────────

  const handleLoginSuccess = async (payload: any) => {
    const accessToken = payload?.accessToken;
    const refreshToken = payload?.refreshToken;
    const role = payload?.role;

    if (!accessToken || !refreshToken) {
      throw new Error("Không nhận được token đăng nhập từ hệ thống.");
    }

    await storage.setMultiple({
      "@access_token": accessToken,
      "@refresh_token": refreshToken,
    });

    try {
      const profilesResponse = await authService.getProfiles();
      const isOk = profilesResponse.isSuccess ?? profilesResponse.success;
      if (isOk && profilesResponse.data?.length) {
        navigate("/account-chooser");
        return;
      }
    } catch {
      // fallback by role
    }

    if (role === 3) {
      navigate("/teacher");
      return;
    }
    navigate("/student");
  };

  const handleQuickZaloLinkLogin = async () => {
    if (isLinking) return;

    if (!isMiniAppRuntime()) {
      openSnackbar({
        text: "Đăng nhập liên kết Zalo chỉ dùng trong Mini App. Chuyển tới trang đăng nhập.",
        type: "info",
      });
      navigate("/login");
      return;
    }

    setIsLinking(true);
    try {
      const { authorize, getPhoneNumber } = await import("zmp-sdk/apis");
      await authorize({ scopes: ["scope.userPhonenumber"] });

      const phoneResult = (await getPhoneNumber()) as any;
      const rawPhone =
        phoneResult?.number ||
        phoneResult?.phoneNumber ||
        phoneResult?.data?.number ||
        phoneResult?.data?.phoneNumber ||
        "";

      const phoneNumber = normalizePhone(rawPhone);
      if (!phoneNumber) {
        throw new Error(
          "Không đọc được số điện thoại từ Zalo. Vui lòng mở quyền SĐT hoặc đăng nhập thủ công."
        );
      }

      const response = await authService.loginWithPhone({ phoneNumber });
      const isSuccess = response.isSuccess ?? response.success;
      if (!isSuccess) {
        throw new Error(response.message || "Liên kết Zalo thất bại. Vui lòng thử lại.");
      }

      openSnackbar({ text: "Liên kết thành công. Đang vào hệ thống...", type: "success" });
      await handleLoginSuccess(response.data);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể liên kết SĐT Zalo. Vui lòng đăng nhập bằng số điện thoại.";
      openSnackbar({ text: msg, type: "error" });
      navigate("/login");
    } finally {
      setIsLinking(false);
    }
  };

  // ─── CONTACT → ZALO OA trực tiếp ────────────────────────────
  const handleContactByZalo = async () => {
    try {
      if (isMiniAppRuntime() && ZALO_OA_ID) {
        const { interactOA, openChat } = await import("zmp-sdk/apis");
        await interactOA({ oaId: ZALO_OA_ID });
        await openChat({ id: ZALO_OA_ID, type: "oa" });
        return;
      }

      if (ZALO_OA_URL) {
        window.location.href = ZALO_OA_URL;
        return;
      }

      openSnackbar({
        text: "Thiếu cấu hình OA. Vui lòng thêm VITE_ZALO_OA_ID hoặc VITE_ZALO_OA_URL.",
        type: "warning",
      });
    } catch {
      openSnackbar({
        text: "Không thể mở Zalo OA lúc này. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  const handleTabChange = (tab: LandingTab) => {
    navigate(TAB_PATHS[tab]);
  };

  // ─── RENDER ──────────────────────────────────────────────────

  return (
    <Page className="!bg-[#F9FAFB] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col">
        {/* ── TOP HEADER ── */}
        <header className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 shadow-sm">
          <img src={logoRex} alt="Rex English" className="h-10 w-10 rounded-xl object-cover" />
          <div className="flex-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-500">
              Rex English Centre
            </p>
            <p className="text-sm font-extrabold leading-tight text-slate-900">
              {activeTab === "home" && "Trang chủ"}
              {activeTab === "faq" && "Câu hỏi thường gặp"}
              {activeTab === "news" && "Bản tin"}
              {activeTab === "contact" && "Liên hệ"}
            </p>
          </div>
          {/* Ưu đãi badge */}
          <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white">
            Ưu đãi
          </span>
        </header>

        {/* ── CONTENT ── */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-[80px]">
          {activeTab === "home" && (
            <HomeTab
              isLinking={isLinking}
              onQuickZaloLink={handleQuickZaloLinkLogin}
            />
          )}
          {activeTab === "faq" && <FAQTab />}
          {activeTab === "news" && <NewsTab />}
          {/* contact tab is handled by bottom nav directly */}
          {activeTab === "contact" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-600 shadow-lg">
                <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                </svg>
              </div>
              <h2 className="mt-5 text-lg font-extrabold text-slate-900">Nhắn tin qua Zalo</h2>
              <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-slate-500">
                Cần tư vấn lộ trình học, lớp phù hợp hoặc hỗ trợ tài khoản? Chúng tôi luôn sẵn sàng.
              </p>
              <button
                type="button"
                onClick={handleContactByZalo}
                className="mt-6 flex h-12 items-center gap-2.5 rounded-2xl bg-red-600 px-8 text-sm font-bold text-white shadow-md active:bg-red-700"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                </svg>
                Mở Zalo OA Rex
              </button>
              <div className="mt-6 space-y-2.5 w-full">
                {[
                  { icon: "📍", label: "Địa chỉ", value: "Rex English Centre, TP.HCM" },
                  { icon: "📞", label: "Hotline", value: "0901 234 567" },
                  { icon: "🕐", label: "Giờ làm việc", value: "7:30 – 21:30 · Thứ 2–CN" },
                ].map((info) => (
                  <div key={info.label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm">
                    <span className="text-xl">{info.icon}</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{info.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ── BOTTOM NAV ── */}
        <LandingBottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onContactPress={handleContactByZalo}
        />
      </div>
    </Page>
  );
}

export default LandingPage;
