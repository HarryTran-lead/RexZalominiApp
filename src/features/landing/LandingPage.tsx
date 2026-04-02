import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Page, Text, useSnackbar } from "zmp-ui";
import logoRex from "../../assets/images/LogoRex.png";
import { authService } from "../../services/authService";
import { storage } from "../../utils/storage";

type LandingTab = "home" | "faq" | "news" | "contact";

const TAB_PATHS: Record<LandingTab, string> = {
  home: "/",
  faq: "/faq",
  news: "/news",
  contact: "/contact",
};

const ZALO_OA_ID = import.meta.env.VITE_ZALO_OA_ID ?? "";
const ZALO_OA_URL = import.meta.env.VITE_ZALO_OA_URL ?? "";

const normalizePhone = (rawPhone: string) => rawPhone.replace(/[^0-9]/g, "");

const detectCurrentTab = (pathname: string): LandingTab => {
  if (pathname === "/faq") return "faq";
  if (pathname === "/news") return "news";
  if (pathname === "/contact") return "contact";
  return "home";
};

const isMiniAppRuntime = () => typeof (window as any)?.ZaloJavaScriptInterface !== "undefined";

function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [isLinking, setIsLinking] = useState(false);

  const activeTab = useMemo(() => detectCurrentTab(location.pathname), [location.pathname]);

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
      const isProfilesSuccess = profilesResponse.isSuccess ?? profilesResponse.success;

      if (isProfilesSuccess && profilesResponse.data?.length) {
        navigate("/account-chooser");
        return;
      }
    } catch {
      // Ignore profile check failure and fallback by role.
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

      await authorize({
        scopes: ["scope.userPhonenumber"],
      });

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

      openSnackbar({
        text: "Liên kết thành công. Đang vào hệ thống...",
        type: "success",
      });

      await handleLoginSuccess(response.data);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể liên kết SĐT Zalo. Vui lòng đăng nhập bằng số điện thoại.";

      openSnackbar({ text: errorMessage, type: "error" });
      navigate("/login");
    } finally {
      setIsLinking(false);
    }
  };

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
      openSnackbar({ text: "Không thể mở Zalo OA lúc này. Vui lòng thử lại.", type: "error" });
    }
  };

  const renderHomeTab = () => (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-red-100">Rex English Centre</p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight">
            Học tiếng Anh bài bản,
            <br />
            theo sát từng học viên
          </h1>
          <p className="mt-2 text-sm text-red-50">
            Theo dõi lịch học, bài tập, điểm số và thông báo ngay trên Mini App.
          </p>
        </div>
        <div className="space-y-3 p-4">
          <Button
            fullWidth
            onClick={() => navigate("/login")}
            className="h-11 rounded-2xl bg-red-600 text-base font-bold text-white"
          >
            Đăng nhập vào hệ thống
          </Button>
          <Button
            fullWidth
            onClick={handleQuickZaloLinkLogin}
            loading={isLinking}
            className="h-11 rounded-2xl bg-slate-900 text-sm font-semibold text-white"
          >
            Liên kết SĐT Zalo và vào nhanh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-red-100 bg-white p-3">
          <p className="text-xs text-slate-500">Lộ trình</p>
          <p className="mt-1 text-sm font-bold text-slate-900">Cambridge + giao tiếp</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-white p-3">
          <p className="text-xs text-slate-500">Báo cáo</p>
          <p className="mt-1 text-sm font-bold text-slate-900">Theo buổi và theo tháng</p>
        </div>
      </div>
    </div>
  );

  const renderFaqTab = () => (
    <div className="space-y-3">
      {[
        {
          question: "Rex Mini App dùng để làm gì?",
          answer:
            "Phụ huynh, học viên, giáo viên theo dõi lịch học, điểm danh, bài tập và thông báo trên cùng một ứng dụng.",
        },
        {
          question: "Tôi có thể đăng nhập bằng số điện thoại không?",
          answer:
            "Có. Bạn có thể đăng nhập trực tiếp bằng số điện thoại đã được trung tâm cấp tài khoản.",
        },
        {
          question: "Liên kết Zalo để vào nhanh như thế nào?",
          answer:
            "Ở trang chủ, bấm nút Liên kết SĐT Zalo và vào nhanh để dùng thông tin SĐT đã liên kết với Zalo.",
        },
      ].map((item) => (
        <div key={item.question} className="rounded-2xl border border-red-100 bg-white p-4">
          <p className="text-sm font-bold text-slate-900">{item.question}</p>
          <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
        </div>
      ))}
    </div>
  );

  const renderNewsTab = () => (
    <div className="space-y-3">
      {[
        { title: "Khai giảng lớp Starter tháng 4", time: "02/04/2026" },
        { title: "Cập nhật chính sách điểm danh mới", time: "30/03/2026" },
        { title: "Lịch thi thử Cambridge quý II", time: "28/03/2026" },
      ].map((item) => (
        <div key={item.title} className="rounded-2xl border border-red-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Bản tin</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{item.title}</p>
          <p className="mt-2 text-xs text-slate-500">{item.time}</p>
        </div>
      ))}
    </div>
  );

  const renderContactTab = () => (
    <div className="space-y-4 rounded-2xl border border-red-100 bg-white p-4">
      <p className="text-sm text-slate-600">
        Cần tư vấn lộ trình học, lớp phù hợp hoặc hỗ trợ tài khoản? Nhấn nút bên dưới để nhắn tin trực tiếp với Zalo OA của Rex.
      </p>
      <Button
        fullWidth
        onClick={handleContactByZalo}
        className="h-11 rounded-2xl bg-red-600 text-base font-bold text-white"
      >
        Nhắn tin Zalo OA để tư vấn
      </Button>
    </div>
  );

  return (
    <Page className="min-h-screen bg-gradient-to-b from-red-50 via-white to-rose-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-4 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-auto w-auto overflow-hidden ">
            <img src={logoRex} alt="Rex" className="h-28 w-28 object-cover" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-red-500">Rex English</p>
            <Text className="text-base font-bold text-slate-900">Trung tâm tiếng Anh Rex</Text>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-28">
          {activeTab === "home" ? renderHomeTab() : null}
          {activeTab === "faq" ? renderFaqTab() : null}
          {activeTab === "news" ? renderNewsTab() : null}
          {activeTab === "contact" ? renderContactTab() : null}
        </div>

        <div
          className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-3 pb-2"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
        >
          <div className="grid h-16 grid-cols-4 rounded-2xl border border-red-100 bg-white/95 shadow-lg backdrop-blur">
            {([
              { key: "home", label: "Trang chủ" },
              { key: "faq", label: "FAQ" },
              { key: "news", label: "Bản tin" },
              { key: "contact", label: "Liên hệ" },
            ] as Array<{ key: LandingTab; label: string }>).map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(TAB_PATHS[item.key])}
                  className={`relative flex flex-col items-center justify-center text-[11px] font-semibold transition ${
                    isActive ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive ? <span className="absolute bottom-1 h-1 w-8 rounded-full bg-red-600" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Page>
  );
}

export default LandingPage;
