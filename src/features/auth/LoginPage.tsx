import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Page, Text, useSnackbar } from "zmp-ui";
import logoRex from "../../assets/images/LogoRex.png";
import { authService } from "../../services/authService";
import { storage } from "../../utils/storage";

function LoginPage() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Call login API
      const response = await authService.login({
        email: email.trim(),
        password: password.trim(),
      });

      // Check response success
      if (response.success || response.isSuccess) {
        const { accessToken, refreshToken, role, userId } = response.data;

        // Store tokens first
        await storage.setMultiple({
          "@access_token": accessToken,
          "@refresh_token": refreshToken,
        });

        openSnackbar({
          text: "Đăng nhập thành công!",
          type: "success",
        });

        // Get profiles after login
        try {
          const profilesResponse = await authService.getProfiles();
          
          if (profilesResponse.success || profilesResponse.isSuccess) {
            const profiles = profilesResponse.data;
            
            if (profiles && profiles.length > 0) {
              // Has profiles -> go to account chooser
              navigate("/account-chooser");
              return;
            }
          }
        } catch (profileError) {
          console.error("Error fetching profiles:", profileError);
        }

        // No profiles - navigate based on role
        if (role === 3) { // Teacher role
          navigate("/teacher");
        } else {
          navigate("/");
        }
      } else {
        setErrorMessage(response.message || "Đăng nhập thất bại!");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle error response
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.";
      
      setErrorMessage(errorMsg);
      
      openSnackbar({
        text: errorMsg,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && !isLoading;

  return (
    <Page className="min-h-screen bg-gradient-to-b from-rose-100 via-white to-rose-200 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-6 lg:px-6">
        {/* Top bar */}
        <header className="flex items-center justify-between rounded-full bg-white/85 px-4 py-3 shadow-sm ring-1 ring-red-100/70 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-red-100">
              <img
                src={logoRex}
                alt="Rex"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="leading-tight">
              <Text.Title size="small">Rex</Text.Title>
              <Text className="text-xs text-slate-500">
                Learn better, grow faster
              </Text>
            </div>
          </div>

        </header>

        {/* Content */}
        <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-2 lg:items-stretch">
          {/* LEFT HERO: hidden on phone, show on desktop */}
         

          {/* RIGHT: on phone -> only this card is visible */}
          <div className="flex w-full items-start justify-center lg:justify-end">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white/90 shadow-sm ring-1 ring-red-100/70 backdrop-blur">
              {/* top accent line like screenshot */}
              <div className="h-1 w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600" />

              <div className="p-6">
                {/* Logo + title (mobile look like screenshot) */}
                <div className="flex flex-col items-center gap-3 pb-4">
                  <div className="flex h-24 w-44 items-center justify-center overflow-hidden rounded-2xl bg-black/95 ring-1 ring-red-100">
                    <img
                      src={logoRex}
                      alt="Rex"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <Text.Title>Rex</Text.Title>
                  <Text className="text-sm text-slate-500">
                    Đăng nhập để tiếp tục
                  </Text>
                </div>

                <div className="space-y-4">
                  <label className="block space-y-2">
                    <Text className="text-sm font-semibold text-slate-700">
                      Email
                    </Text>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Nhập email"
                      autoComplete="email"
                      className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    />
                  </label>

                  <label className="block space-y-2">
                    <Text className="text-sm font-semibold text-slate-700">
                      Mật khẩu
                    </Text>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    />
                  </label>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" className="h-4 w-4" />
                      Ghi nhớ đăng nhập
                    </label>
                    <button className="font-semibold text-red-600" type="button">
                      Quên mật khẩu?
                    </button>
                  </div>

                  <Button
                    fullWidth
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    loading={isLoading}
                    className="rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white disabled:opacity-50"
                  >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>

                  {errorMessage ? (
                    <Text className="rounded-2xl bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-600">
                      {errorMessage}
                    </Text>
                  ) : null}

                  {/* helper note like screenshot */}
                  <Text className="pt-2 text-center text-xs text-slate-500">
                    Phụ huynh &amp; học viên sẽ chọn hồ sơ sau khi đăng nhập.
                    <span className="font-semibold text-red-600">
                      {" "}
                      Giáo viên vào thẳng trang giáo viên.
                    </span>
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* footer hidden on phone to keep “only login” feel */}
        <footer className="mt-6 hidden pb-2 text-center text-xs text-slate-500 lg:block">
          © {new Date().getFullYear()} Rex. All rights reserved.
        </footer>
      </div>
    </Page>
  );
}

export default LoginPage;
