import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Page, Text, useSnackbar } from "zmp-ui";
import logoRex from "../../assets/images/LogoRex.png";
import { authService } from "../../services/authService";
import { storage } from "../../utils/storage";

type LoginMode = "phone" | "email";

function LoginPage() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [loginMode, setLoginMode] = useState<LoginMode>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const normalizePhone = (rawPhone: string) => rawPhone.replace(/[^0-9]/g, "");

  const isValidPhone = (rawPhone: string) => /^0\d{9,10}$/.test(normalizePhone(rawPhone));

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

    openSnackbar({
      text: "Đăng nhập thành công!",
      type: "success",
    });

    try {
      const profilesResponse = await authService.getProfiles();
      const isProfilesSuccess = profilesResponse.isSuccess ?? profilesResponse.success;

      if (isProfilesSuccess) {
        const profiles = profilesResponse.data;
        if (profiles && profiles.length > 0) {
          navigate("/account-chooser");
          return;
        }
      }
    } catch (profileError) {
      console.error("Error fetching profiles:", profileError);
    }

    if (role === 3) {
      navigate("/teacher");
    } else {
      navigate("/");
    }
  };

  const handlePhoneLogin = async () => {
    const normalizedPhone = normalizePhone(phone.trim());

    if (!isValidPhone(normalizedPhone)) {
      setErrorMessage("Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await authService.loginWithPhone({
        phoneNumber: normalizedPhone,
      });

      const isSuccess = response.isSuccess ?? response.success;
      if (!isSuccess) {
        throw new Error(response.message || "Đăng nhập bằng số điện thoại thất bại.");
      }

      await handleLoginSuccess(response.data);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể đăng nhập bằng số điện thoại. Vui lòng thử lại.";
      setErrorMessage(errorMsg);
      openSnackbar({ text: errorMsg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setErrorMessage("Vui lòng nhập email để đăng nhập.");
      return;
    }

    if (!trimmedPassword) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await authService.login({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      const isSuccess = response.isSuccess ?? response.success;
      if (!isSuccess) {
        throw new Error(response.message || "Đăng nhập thất bại!");
      }

      await handleLoginSuccess(response.data);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.";

      setErrorMessage(errorMsg);
      openSnackbar({ text: errorMsg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    if (loginMode === "phone") {
      await handlePhoneLogin();
      return;
    }

    await handlePasswordLogin();
  };

  const canSubmit =
    !isLoading &&
    (loginMode === "phone"
      ? isValidPhone(phone)
      : password.trim().length > 0 && email.trim().length > 0);

  return (
    <Page className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 pb-8 pt-10">
        <div className="mb-8 flex flex-col ">
          <div className="mb-5 h-16 w-20 self-center overflow-hidden rounded-2xl shadow-sm ">
            <img src={logoRex} alt="Rex" className="h-20 object-cover" />
          </div>
          <h1 className="text-[35px] font-extrabold leading-[1.1] text-slate-900 text-center">
            Chào mừng đến
            <br className="text-sm text-red-700" />
            Rex English
          </h1>
          <Text className="mt-3 text-sm text-slate-600 text-center">
            Đăng nhập để tiếp tục học tập và theo dõi tiến độ.
          </Text>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1 ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => {
              setLoginMode("phone");
              setErrorMessage("");
            }}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              loginMode === "phone"
                ? "bg-red-600 text-white"
                : "text-slate-600"
            }`}
          >
            Số điện thoại
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode("email");
              setErrorMessage("");
            }}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              loginMode === "email"
                ? "bg-red-600 text-white"
                : "text-slate-600"
            }`}
          >
            Email
          </button>
        </div>

        <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-red-100">
          {loginMode === "phone" ? (
            <label className="block space-y-2">
              <Text className="text-sm font-semibold text-slate-700">Số điện thoại</Text>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                inputMode="numeric"
                placeholder="Nhập số điện thoại của bạn"
                autoComplete="tel"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
              />
            </label>
          ) : (
            <label className="block space-y-2">
              <Text className="text-sm font-semibold text-slate-700">Email</Text>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Nhập email"
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
              />
            </label>
          )}

          {loginMode === "email" ? (
            <label className="block space-y-2">
              <Text className="text-sm font-semibold text-slate-700">Mật khẩu</Text>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
              />
            </label>
          ) : null}

          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={isLoading}
            className="h-12 rounded-2xl bg-red-600 text-lg font-bold text-white disabled:opacity-50"
          >
            {isLoading
              ? "Đang xử lý..."
              : loginMode === "phone"
                ? "Đăng nhập"
                : "Tiếp tục"}
          </Button>

          {errorMessage ? (
            <Text className="rounded-xl bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-600">
              {errorMessage}
            </Text>
          ) : null}

          <Text className="text-center text-xs text-slate-500">
            Phụ huynh và học viên sẽ chọn hồ sơ sau khi đăng nhập. Giáo viên vào trang giáo viên.
          </Text>
        </div>
      </div>
    </Page>
  );
}

export default LoginPage;
