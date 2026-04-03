import { useMemo, useState, useCallback } from "react";
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

// ── ENV VARS ──────────────────────────────────────────────────
const ZALO_OA_ID = import.meta.env.VITE_ZALO_OA_ID ?? "";
const ZALO_OA_FALLBACK_URL = ZALO_OA_ID ? `https://zalo.me/${ZALO_OA_ID}` : "";

const normalizePhone = (raw: string) => raw.replace(/[^0-9]/g, "");

const detectCurrentTab = (pathname: string): LandingTab => {
  if (pathname === "/faq") return "faq";
  if (pathname === "/news") return "news";
  if (pathname === "/contact") return "contact";
  return "home";
};

// ── RUNTIME DETECTION ─────────────────────────────────────────
const isMiniAppRuntime = (): boolean => {
  try {
    return typeof (window as any)?.ZaloJavaScriptInterface !== "undefined";
  } catch {
    return false;
  }
};

// ── SAFE ZMP-SDK IMPORT ───────────────────────────────────────
// We wrap zmp-sdk imports in try-catch to prevent crashes on non-Zalo environments
const getZmpApis = async () => {
  try {
    const apis = await import("zmp-sdk/apis");
    return apis;
  } catch (error) {
    console.warn("[v0] zmp-sdk/apis not available:", error);
    return null;
  }
};

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

  const handleLoginSuccess = useCallback(async (payload: any) => {
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
  }, [navigate]);

  const handleQuickZaloLinkLogin = useCallback(async () => {
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
      const apis = await getZmpApis();
      if (!apis) {
        throw new Error("Không thể tải Zalo SDK.");
      }

      const { authorize, getPhoneNumber } = apis;
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
  }, [isLinking, navigate, openSnackbar, handleLoginSuccess]);

  // ─── CONTACT → ZALO OA trực tiếp ────────────────────────────
  const handleContactByZalo = useCallback(async () => {
    console.log("[v0] handleContactByZalo called");
    console.log("[v0] ZALO_OA_ID:", ZALO_OA_ID);
    console.log("[v0] isMiniAppRuntime:", isMiniAppRuntime());

    try {
      // Option 1: In Zalo Mini App environment
      if (isMiniAppRuntime() && ZALO_OA_ID) {
        console.log("[v0] Attempting to open Zalo OA chat in Mini App...");
        
        const apis = await getZmpApis();
        if (apis) {
          try {
            // Try openChat first (direct message)
            if (apis.openChat) {
              console.log("[v0] Using openChat API...");
              await apis.openChat({ id: ZALO_OA_ID, type: "oa" });
              return;
            }
          } catch (chatError) {
            console.warn("[v0] openChat failed:", chatError);
          }

          try {
            // Fallback to interactOA
            if (apis.interactOA) {
              console.log("[v0] Using interactOA API...");
              await apis.interactOA({ oaId: ZALO_OA_ID });
              return;
            }
          } catch (interactError) {
            console.warn("[v0] interactOA failed:", interactError);
          }
        }
      }

      // Option 3: Construct URL from OA ID
      if (ZALO_OA_ID) {
        const constructedUrl = `https://zalo.me/${ZALO_OA_ID}`;
        console.log("[v0] Opening constructed Zalo URL:", constructedUrl);
        window.open(constructedUrl, "_blank");
        return;
      }

      // No config available
      openSnackbar({
        text: "Vui lòng cấu hình VITE_ZALO_OA_ID hoặc VITE_ZALO_OA_URL trong .env",
        type: "warning",
      });
    } catch (error) {
      console.error("[v0] handleContactByZalo error:", error);
      openSnackbar({
        text: "Không thể mở Zalo OA lúc này. Vui lòng thử lại.",
        type: "error",
      });
    }
  }, [openSnackbar]);

  const handleTabChange = useCallback((tab: LandingTab) => {
    navigate(TAB_PATHS[tab]);
  }, [navigate]);

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
          <span className="rounded-full bg-gradient-to-r from-red-600 to-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
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
          {/* contact tab content */}
          {activeTab === "contact" && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-600 to-red-500 shadow-lg animate-bounce-subtle">
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
                className="mt-6 flex h-12 items-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-8 text-sm font-bold text-white shadow-md active:scale-95 transition-transform"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                </svg>
                Mở Zalo OA Rex
              </button>
              <div className="mt-6 space-y-2.5 w-full">
                {[
                  { icon: "location", label: "Địa chỉ", value: "Rex English Centre, TP.HCM" },
                  { icon: "phone", label: "Hotline", value: "0901 234 567" },
                  { icon: "clock", label: "Giờ làm việc", value: "7:30 – 21:30 · Thứ 2–CN" },
                ].map((info) => (
                  <div key={info.label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm transition-all hover:shadow-md">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      {info.icon === "location" && (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                      {info.icon === "phone" && (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      )}
                      {info.icon === "clock" && (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </span>
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
